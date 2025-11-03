import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) { }

  async setTenantContext(tenantId: string): Promise<void> {
    // For Phase 1, we'll store tenant context in memory or request context
    // In future phases, this will set RLS context in PostgreSQL
    // await this.prisma.$executeRaw`SET app.tenant_id = ${tenantId}`;
  }

  async getCurrentTenantId(): Promise<string | null> {
    // For Phase 1, return null - no tenant context yet
    return null;
  }

  async validateTenantExists(tenantSlug: string): Promise<boolean> {
    const organisation = await this.prisma.organisation.findUnique({
      where: { slug: tenantSlug },
    });
    return !!organisation;
  }

  async getTenantIdBySlug(tenantSlug: string): Promise<string | null> {
    const organisation = await this.prisma.organisation.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });
    return organisation?.id || null;
  }

  async getTenantBranding(tenantId: string): Promise<any> {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: tenantId },
      select: { branding: true },
    });
    return organisation?.branding || {};
  }
}
