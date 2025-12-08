import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateLiveGraphicDto } from './dto/create-live-graphic.dto';
import { UpdateLiveGraphicStateDto } from './dto/update-live-graphic-state.dto';
import { UpdateLiveGraphicDto } from './dto/update-live-graphic.dto';

const fsp = fs.promises;

// Minimal LiveGraphic shape to avoid depending on generated Prisma types
type LiveGraphic = {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  publicCode: string;
  controlCode: string;
  filePath: string | null;
  publicUrl?: string | null;
  state: Record<string, any>;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type LiveGraphicWithComputed = LiveGraphic & {
  publicUrl?: string | null;
  stateUrl?: string;
  filePath?: string;
  clientSnippet?: string;
};

@Injectable()
export class LiveGraphicsService {
  private readonly uploadBase = process.env.ASSET_UPLOAD_DIR || './data';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  private repo(client: PrismaService | Prisma.TransactionClient = this.prisma) {
    return (client as any).liveGraphic;
  }

  private async resolveOrgUserId(
    client: Prisma.TransactionClient,
    tenantId: string,
    orgUserId?: string | null
  ) {
    if (!orgUserId) return null;
    const record = await client.orgUser.findFirst({
      where: { id: orgUserId, tenantId },
      select: { id: true },
    });
    return record?.id ?? null;
  }

  private async withTenantContext<T>(
    tenantId: string,
    callback: (client: Prisma.TransactionClient) => Promise<T>
  ) {
    return this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      await (tx as any).$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
      return callback(tx);
    });
  }

  private buildPublicUrl(slug: string, publicCode: string) {
    return `/api/public/live-graphics/${slug}/${publicCode}`;
  }

  private buildStateUrl(slug: string, controlCode: string) {
    return `/api/public/live-graphics/${slug}/${controlCode}/state`;
  }

  private buildClientSnippet(slug: string, controlCode: string) {
    return `<!-- ReplayHub Live Graphic State Client -->
<script src="/api/public/live-graphics/client.js" data-replayhub-code="${controlCode}" data-replayhub-slug="${slug}"></script>`;
  }

  private mapResponse(graphic: LiveGraphic, slug?: string): LiveGraphicWithComputed {
    return {
      ...graphic,
      filePath: graphic.filePath,
      publicUrl: slug ? this.buildPublicUrl(slug, graphic.publicCode) : graphic.publicUrl,
      stateUrl: slug ? this.buildStateUrl(slug, graphic.controlCode) : undefined,
      clientSnippet: slug ? this.buildClientSnippet(slug, graphic.controlCode) : undefined,
    };
  }

  private resolveFilePath(graphic: LiveGraphic) {
    if (path.isAbsolute(graphic.filePath)) {
      return graphic.filePath;
    }
    return path.join(this.uploadBase, graphic.filePath);
  }

  async list(tenantId: string, slug: string) {
    return this.withTenantContext(tenantId, async client => {
      const graphics = await this.repo(client).findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });

      return graphics.map(g => this.mapResponse(g, slug));
    });
  }

  async getById(tenantId: string, slug: string, id: string) {
    return this.withTenantContext(tenantId, async client => {
      const graphic = await this.repo(client).findFirst({
        where: { id, tenantId },
      });

      if (!graphic) {
        throw new NotFoundException('Graphic not found');
      }

      return this.mapResponse(graphic, slug);
    });
  }

  async createDraft(
    tenantId: string,
    slug: string,
    dto: CreateLiveGraphicDto,
    orgUserId?: string | null,
    actorEmail?: string | null
  ) {
    const publicCode = createId();
    const controlCode = createId();

    return this.withTenantContext(tenantId, async client => {
      const actorOrgUserId = await this.resolveOrgUserId(client, tenantId, orgUserId);
      const created = await this.repo(client).create({
        data: {
          tenantId,
          name: dto.name,
          description: dto.description,
          publicCode,
          controlCode,
          filePath: null,
          publicUrl: this.buildPublicUrl(slug, publicCode),
          state: { title: dto.name },
          status: 'draft',
          createdBy: actorOrgUserId,
        },
      });

      await this.auditService.log(
        {
          tenantId,
          action: 'live-graphics.create',
          entity: 'live_graphic',
          entityId: created.id,
          description: 'Created live graphic overlay draft',
          orgUserId: orgUserId ?? undefined,
          actorEmail,
          metadata: {
            name: dto.name,
            description: dto.description,
            publicCode,
          },
        },
        client
      );

      return this.mapResponse(created, slug);
    });
  }

  async uploadHtml(
    tenantId: string,
    slug: string,
    id: string,
    file: Express.Multer.File,
    orgUserId?: string | null,
    actorEmail?: string | null
  ) {
    if (!file) {
      throw new BadRequestException('HTML file is required');
    }

    const mime = (file.mimetype || '').toLowerCase();
    const isHtml = mime.includes('html') || file.originalname.toLowerCase().endsWith('.html');
    if (!isHtml) {
      throw new BadRequestException('Only HTML overlay files are supported');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File is too large (2MB max)');
    }

    return this.withTenantContext(tenantId, async client => {
      const existing = await this.repo(client).findFirst({ where: { id, tenantId } });
      if (!existing) {
        throw new NotFoundException('Graphic not found');
      }

      const fileText = file.buffer.toString('utf8');
      // Verify the control code is embedded in the HTML so the client snippet is present
      if (!fileText.includes(existing.controlCode)) {
        throw new BadRequestException(
          'Uploaded HTML must include the provided ReplayHub client script/control code'
        );
      }

      const relativeDir = path.join('live-graphics', existing.publicCode);
      const filename = 'overlay.html';
      const relativePath = path.join(relativeDir, filename);
      const fullDir = path.join(this.uploadBase, relativeDir);
      const fullPath = path.join(this.uploadBase, relativePath);

      await fsp.mkdir(fullDir, { recursive: true });
      await fsp.writeFile(fullPath, file.buffer);
      const actorOrgUserId = await this.resolveOrgUserId(client, tenantId, orgUserId);

      const updated = await this.repo(client).update({
        where: { id: existing.id },
        data: {
          filePath: relativePath,
          status: 'active',
          updatedBy: actorOrgUserId,
        },
      });

      await this.auditService.log(
        {
          tenantId,
          action: 'live-graphics.upload',
          entity: 'live_graphic',
          entityId: updated.id,
          description: 'Uploaded verified live graphic HTML',
          orgUserId: orgUserId ?? undefined,
          actorEmail,
          metadata: {
            name: updated.name,
            publicCode: updated.publicCode,
            status: updated.status,
          },
        },
        client
      );

      return this.mapResponse(updated, slug);
    });
  }

  async updateMetadata(
    tenantId: string,
    slug: string,
    id: string,
    dto: UpdateLiveGraphicDto,
    orgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return this.withTenantContext(tenantId, async client => {
      const actorOrgUserId = await this.resolveOrgUserId(client, tenantId, orgUserId);
      const existing = await this.repo(client).findFirst({ where: { id, tenantId } });
      if (!existing) {
        throw new NotFoundException('Graphic not found');
      }

      const updated = await this.repo(client).update({
        where: { id },
        data: {
          name: dto.name ?? existing.name,
          description: dto.description ?? existing.description,
          updatedBy: actorOrgUserId,
        },
      });

      await this.auditService.log(
        {
          tenantId,
          action: 'live-graphics.update',
          entity: 'live_graphic',
          entityId: id,
          description: 'Updated live graphic metadata',
          orgUserId: orgUserId ?? undefined,
          actorEmail,
          metadata: {
            before: {
              name: existing.name,
              description: existing.description,
            },
            after: {
              name: updated.name,
              description: updated.description,
            },
          },
        },
        client
      );

      return this.mapResponse(updated, slug);
    });
  }

  async updateState(
    tenantId: string,
    slug: string,
    id: string,
    state: UpdateLiveGraphicStateDto,
    orgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return this.withTenantContext(tenantId, async client => {
      const actorOrgUserId = await this.resolveOrgUserId(client, tenantId, orgUserId);
      const existing = await this.repo(client).findFirst({ where: { id, tenantId } });
      if (!existing) {
        throw new NotFoundException('Graphic not found');
      }

      const currentState = (existing.state as Record<string, any>) || {};
      const nextState = {
        ...currentState,
        ...state,
        extra: state.extra ? { ...(currentState.extra || {}), ...state.extra } : currentState.extra,
      };

      const updated = await this.repo(client).update({
        where: { id },
        data: {
          state: nextState,
          updatedBy: actorOrgUserId,
        },
      });

      await this.auditService.log(
        {
          tenantId,
          action: 'live-graphics.state.update',
          entity: 'live_graphic',
          entityId: id,
          description: 'Updated live graphic state',
          orgUserId: orgUserId ?? undefined,
          actorEmail,
          metadata: {
            state: nextState,
          },
        },
        client
      );

      return this.mapResponse(updated, slug);
    });
  }

  async deleteGraphic(
    tenantId: string,
    id: string,
    orgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return this.withTenantContext(tenantId, async client => {
      const existing = await this.repo(client).findFirst({ where: { id, tenantId } });
      if (!existing) {
        throw new NotFoundException('Graphic not found');
      }

      if (existing.filePath) {
        const filePath = this.resolveFilePath(existing);
        if (fs.existsSync(filePath)) {
          try {
            await fsp.unlink(filePath);
          } catch (err) {
            console.warn('[LiveGraphics] Failed to delete file for graphic', id, err);
          }
        }
      }

      await this.repo(client).delete({ where: { id } });

      await this.auditService.log(
        {
          tenantId,
          action: 'live-graphics.delete',
          entity: 'live_graphic',
          entityId: id,
          description: 'Deleted live graphic',
          orgUserId: (await this.resolveOrgUserId(client, tenantId, orgUserId)) ?? undefined,
          actorEmail,
          metadata: {
            name: existing.name,
            publicCode: existing.publicCode,
          },
        },
        client
      );

      return { success: true };
    });
  }

  async getPublicGraphic(slug: string, publicCode: string) {
    const org = await this.prisma.organisation.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      throw new NotFoundException('Organisation not found');
    }

    return this.withTenantContext(org.id, async client => {
      const graphic = await this.repo(client).findFirst({
        where: { publicCode, tenantId: org.id },
      });

      if (!graphic) {
        throw new NotFoundException('Graphic not found');
      }

      if (!graphic.filePath) {
        throw new NotFoundException('Graphic HTML not uploaded yet');
      }

      const filePath = this.resolveFilePath(graphic);

      try {
        const html = await fsp.readFile(filePath, 'utf8');
        return html;
      } catch (error) {
        console.error('[LiveGraphics] Failed to read overlay file', error);
        throw new NotFoundException('Overlay file not found');
      }
    });
  }

  async getPublicState(slug: string, controlCode: string) {
    const org = await this.prisma.organisation.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      throw new NotFoundException('Organisation not found');
    }

    return this.withTenantContext(org.id, async client => {
      const graphic = await this.repo(client).findFirst({
        where: { controlCode, tenantId: org.id },
      });

      if (!graphic) {
        throw new NotFoundException('Graphic not found');
      }

      return {
        name: graphic.name,
        state: graphic.state || {},
        updatedAt: graphic.updatedAt,
      };
    });
  }
}

