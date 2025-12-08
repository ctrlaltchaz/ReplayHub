import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { CreatePasswordDto, PasswordQueryDto, UpdatePasswordDto } from '../dto/password.dto';

type SanitizedPassword = {
  id: string;
  title: string;
  username?: string | null;
  url?: string | null;
  notes?: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt?: Date | null;
  createdBy: string;
  updatedBy?: string | null;
};

@Injectable()
export class PasswordsService {
  private readonly baseEncryptionKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private readonly auditService: AuditService
  ) {
    this.baseEncryptionKey = this.configService.get<string>('PASSWORD_ENCRYPTION_KEY') || '';
    if (!this.baseEncryptionKey) {
      throw new Error('PASSWORD_ENCRYPTION_KEY is not configured');
    }
  }

  private async setTenantContext(tx: Prisma.TransactionClient, tenantId: string) {
    await (tx as any).$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
    await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
  }

  private deriveKey(tenantId: string): Buffer {
    return crypto.createHash('sha256').update(`${this.baseEncryptionKey}:${tenantId}`).digest();
  }

  private encryptPassword(tenantId: string, value: string): string {
    const iv = crypto.randomBytes(12);
    const key = this.deriveKey(tenantId);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
  }

  private decryptPassword(tenantId: string, payload: string): string {
    const [ivHex, dataHex, authTagHex] = payload.split(':');
    if (!ivHex || !dataHex || !authTagHex) {
      throw new Error('Invalid encrypted payload');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const key = this.deriveKey(tenantId);
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  private sanitize(entry: any): SanitizedPassword {
    // Remove encrypted field before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordEncrypted, ...rest } = entry;
    return rest;
  }

  private async logPasswordAudit(
    tx: Prisma.TransactionClient,
    tenantId: string,
    passwordId: string,
    membershipId: string,
    action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE',
    req?: Request
  ) {
    await tx.passwordAuditLog.create({
      data: {
        tenantId,
        passwordId,
        action,
        ipAddress: req?.ip || null,
        userAgent: (req?.headers['user-agent'] as string) || null,
        membershipId,
      },
    });
    await this.auditService.log({
      tenantId,
      action: this.mapAction(action),
      entity: 'password',
      entityType: 'ORG_USER',
      entityId: passwordId,
      orgUserId: membershipId,
      description: `Password ${action.toLowerCase()}`,
      metadata: {
        membershipId,
        passwordId,
      },
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'] as string,
    });
  }

  private mapAction(action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE'): string {
    switch (action) {
      case 'VIEW':
        return 'password.view';
      case 'CREATE':
        return 'password.create';
      case 'UPDATE':
        return 'password.update';
      case 'DELETE':
        return 'password.delete';
      default:
        return 'password.unknown';
    }
  }

  async createPassword(tenantId: string, orgUserId: string, dto: CreatePasswordDto, req?: Request) {
    if (!dto.password.trim()) {
      throw new BadRequestException('Password is required');
    }

    return await this.prisma.$transaction(async tx => {
      await this.setTenantContext(tx, tenantId);
      // Ensure membership exists for this tenant (orgUserId represents membershipId)
      const membership = await tx.userOrganisationMembership.findFirst({
        where: { id: orgUserId, tenantId },
        select: { id: true },
      });
      if (!membership) {
        throw new BadRequestException(
          'Org membership not found for this organization. Please re-authenticate.'
        );
      }

      const encryptedPassword = this.encryptPassword(tenantId, dto.password);

      const entry = await tx.passwordEntry.create({
        data: {
          tenantId,
          title: dto.title,
          username: dto.username,
          passwordEncrypted: encryptedPassword,
          url: dto.url,
          notes: dto.notes,
          tags: dto.tags ?? [],
          createdByMembershipId: orgUserId,
          updatedByMembershipId: orgUserId,
        },
      });

      await this.logPasswordAudit(tx, tenantId, entry.id, orgUserId, 'CREATE', req);

      return this.sanitize(entry);
    });
  }

  async listPasswords(tenantId: string, query: PasswordQueryDto) {
    return await this.prisma.$transaction(async tx => {
      await this.setTenantContext(tx, tenantId);

      const where: Prisma.PasswordEntryWhereInput = { tenantId };
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { username: { contains: query.search, mode: 'insensitive' } },
          { tags: { has: query.search } },
        ];
      }

      const entries = await tx.passwordEntry.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          username: true,
          url: true,
          notes: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          lastViewedAt: true,
          createdByMembershipId: true,
          updatedByMembershipId: true,
        },
      });

      return entries.map(entry => this.sanitize(entry));
    });
  }

  async getPassword(tenantId: string, id: string, orgUserId: string, req?: Request) {
    return await this.prisma.$transaction(async tx => {
      await this.setTenantContext(tx, tenantId);

      const entry = await tx.passwordEntry.findFirst({
        where: { id, tenantId },
      });

      if (!entry) {
        throw new NotFoundException('Password entry not found');
      }

      // Audit before returning secret
      await this.logPasswordAudit(tx, tenantId, id, orgUserId, 'VIEW', req);

      const password = this.decryptPassword(tenantId, entry.passwordEncrypted);

      const now = new Date();
      await tx.passwordEntry.update({
        where: { id },
        data: { lastViewedAt: now },
      });

      const sanitized = this.sanitize(entry);
      return { ...sanitized, password, lastViewedAt: now };
    });
  }

  async updatePassword(
    tenantId: string,
    id: string,
    orgUserId: string,
    dto: UpdatePasswordDto,
    req?: Request
  ) {
    return await this.prisma.$transaction(async tx => {
      await this.setTenantContext(tx, tenantId);
      const membership = await tx.userOrganisationMembership.findFirst({
        where: { id: orgUserId, tenantId },
        select: { id: true },
      });
      if (!membership) {
        throw new BadRequestException(
          'Org membership not found for this organization. Please re-authenticate.'
        );
      }

      const existing = await tx.passwordEntry.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new NotFoundException('Password entry not found');
      }

      const data: Prisma.PasswordEntryUpdateInput = {
        title: dto.title ?? existing.title,
        username: dto.username ?? existing.username,
        url: dto.url ?? existing.url,
        notes: dto.notes ?? existing.notes,
        tags: dto.tags ?? existing.tags,
        updatedByMembership: { connect: { id: orgUserId } },
      };

      if (dto.password) {
        data.passwordEncrypted = this.encryptPassword(tenantId, dto.password);
      }

      const updated = await tx.passwordEntry.update({
        where: { id },
        data,
      });

      await this.logPasswordAudit(tx, tenantId, id, orgUserId, 'UPDATE', req);

      return this.sanitize(updated);
    });
  }

  async deletePassword(tenantId: string, id: string, orgUserId: string, req?: Request) {
    return await this.prisma.$transaction(async tx => {
      await this.setTenantContext(tx, tenantId);

      const existing = await tx.passwordEntry.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new NotFoundException('Password entry not found');
      }

      await this.logPasswordAudit(tx, tenantId, id, orgUserId, 'DELETE', req);

      await tx.passwordAuditLog.deleteMany({
        where: { tenantId, passwordId: id },
      });

      await tx.passwordEntry.delete({
        where: { id },
      });

      return { success: true };
    });
  }

  async getAuditLogs(tenantId: string, id: string) {
    return await this.prisma.$transaction(async tx => {
      await this.setTenantContext(tx, tenantId);

      const exists = await tx.passwordEntry.findFirst({
        where: { id, tenantId },
        select: { id: true },
      });

      if (!exists) {
        throw new NotFoundException('Password entry not found');
      }

      return tx.passwordAuditLog.findMany({
        where: { tenantId, passwordId: id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          createdAt: true,
          ipAddress: true,
          userAgent: true,
          membership: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
      });
    });
  }
}

