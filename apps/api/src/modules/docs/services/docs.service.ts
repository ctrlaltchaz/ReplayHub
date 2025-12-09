import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { AuditService } from '../../../common/audit/audit.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  CompleteDocDto,
  CreateDocCategoryDto,
  CreateDocDto,
  DocQueryDto,
  DocStatus,
  UpdateDocDto
} from '../dto';

@Injectable()
export class DocsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) { }

  async getCategories(organizationId: string) {
    await this.prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${organizationId}'`);

    const result: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT 
        dc.*,
        COUNT(d.id)::int as doc_count
      FROM doc_categories dc
      LEFT JOIN docs d ON d.category_id = dc.id AND d.status = 'published' AND d.organisation_id = '${organizationId}'
      WHERE dc.organisation_id = '${organizationId}'
        AND dc.is_active = true
      GROUP BY dc.id
      ORDER BY dc.sort_order ASC, dc.name ASC
    `);

    return result;
  }

  async createCategory(organizationId: string, dto: CreateDocCategoryDto, userId: string) {
    await this.prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${organizationId}'`);

    const id = createId();

    try {
      const result: any[] = await this.prisma.$queryRawUnsafe(`
          INSERT INTO doc_categories (id, organisation_id, name, description, slug, icon, sort_order, created_at, updated_at)
          VALUES ('${id}', '${organizationId}', '${dto.name}', ${dto.description ? `'${dto.description}'` : 'NULL'}, '${dto.slug}', ${dto.icon ? `'${dto.icon}'` : 'NULL'}, ${dto.sort_order || 0}, NOW(), NOW())
          RETURNING *
        `);

      const category = result[0];

      await this.auditService.log({
        organizationId,
        orgUserId: userId,
        action: 'docs.category.create',
        resourceType: 'doc_category',
        resourceId: category.id,
        metadata: { category },
      });

      return category;
    } catch (error: any) {
      // Handle unique constraint violation for slug
      if (error.code === '23505' && error.message?.includes('organisation_id, slug')) {
        throw new ConflictException(
          `A category with the slug \"${dto.slug}\" already exists in this organization. Please use a different slug.`
        );
      }
      // Re-throw other errors
      throw error;
    }
  }

  async getDocs(organizationId: string, query: DocQueryDto) {
    await this.prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${organizationId}'`);

    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const offset = (page - 1) * limit;

    const docs: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT 
        d.*,
        CASE 
          WHEN dc.id IS NOT NULL THEN json_build_object(
            'id', dc.id,
            'name', dc.name,
            'slug', dc.slug,
            'icon', dc.icon,
            'organisationId', dc.organisation_id
          )
          ELSE NULL
        END as category,
        CASE 
          WHEN d.author_type = 'global' THEN json_build_object(
            'id', gu.id,
            'name', gu.name,
            'email', gu.email,
            'avatar', gu.avatar
          )
          WHEN d.author_type = 'org_user' THEN json_build_object(
            'id', ou.global_user_id,
            'name', ou.display_name,
            'email', ou.email,
            'avatar', gu2.avatar
          )
          ELSE NULL
        END as author,
        CASE WHEN d.organisation_id IS NULL THEN true ELSE false END as is_global
      FROM docs d
      LEFT JOIN doc_categories dc ON d.category_id = dc.id
      LEFT JOIN global_users gu ON d.author_type = 'global' AND d.author_id = gu.id
      LEFT JOIN org_users ou ON d.author_type = 'org_user' AND d.author_id = ou.id
      LEFT JOIN global_users gu2 ON d.author_type = 'org_user' AND ou.global_user_id = gu2.id
      WHERE (d.organisation_id IS NULL AND d.status = 'published') 
         OR d.organisation_id = '${organizationId}'
      ORDER BY 
        CASE WHEN d.organisation_id IS NULL THEN 0 ELSE 1 END,
        d.published_at DESC NULLS LAST,
        d.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const countResult: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::int as total 
      FROM docs d
      WHERE (d.organisation_id IS NULL AND d.status = 'published') 
         OR d.organisation_id = '${organizationId}'
    `);

    return {
      docs,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  async getDoc(organizationId: string, docId: string, userId?: string) {
    await this.prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${organizationId}'`);

    // Map membership ID to org_user ID if provided
    let orgUserId = userId;
    if (userId) {
      const userMapping: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT ou.id as org_user_id 
        FROM user_org_memberships uom
        JOIN org_users ou ON ou.email = uom.email AND ou.tenant_id = uom.tenant_id
        WHERE uom.id = '${userId}' AND uom.tenant_id = '${organizationId}'
      `);
      if (userMapping.length > 0) {
        orgUserId = userMapping[0].org_user_id;
      }
    }

    const result: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT 
        d.*,
        CASE 
          WHEN dc.id IS NOT NULL THEN json_build_object(
            'id', dc.id,
            'name', dc.name,
            'slug', dc.slug,
            'icon', dc.icon,
            'organisationId', dc.organisation_id
          )
          ELSE NULL
        END as category,
        CASE 
          WHEN d.author_type = 'global' THEN json_build_object(
            'id', gu.id,
            'name', gu.name,
            'email', gu.email,
            'avatar', gu.avatar
          )
          WHEN d.author_type = 'org_user' THEN json_build_object(
            'id', ou.global_user_id,
            'name', ou.display_name,
            'email', ou.email,
            'avatar', gu2.avatar
          )
          ELSE NULL
        END as author,
        CASE WHEN d.organisation_id IS NULL THEN true ELSE false END as is_global,
        CASE WHEN comp.id IS NOT NULL THEN true ELSE false END as is_completed,
        comp.completed_at as completed_at
      FROM docs d
      LEFT JOIN doc_categories dc ON d.category_id = dc.id
      LEFT JOIN global_users gu ON d.author_type = 'global' AND d.author_id = gu.id
      LEFT JOIN org_users ou ON d.author_type = 'org_user' AND d.author_id = ou.id
      LEFT JOIN global_users gu2 ON d.author_type = 'org_user' AND ou.global_user_id = gu2.id
      LEFT JOIN doc_completions comp ON d.id = comp.doc_id AND comp.user_id = ${orgUserId ? `'${orgUserId}'` : 'NULL'}
      WHERE d.id = '${docId}' 
        AND (d.organisation_id IS NULL OR d.organisation_id = '${organizationId}')
    `);

    if (result.length === 0) {
      throw new NotFoundException('Doc not found');
    }

    console.log('DEBUG - Doc result:', {
      author_type: result[0].debug_author_type,
      author_id: result[0].debug_author_id,
      ou_id: result[0].debug_ou_id,
      ou_display_name: result[0].debug_ou_display_name,
      ou_email: result[0].debug_ou_email,
      author: result[0].author
    });

    // Increment view count
    await this.prisma.$executeRawUnsafe(`
      UPDATE docs SET view_count = view_count + 1 WHERE id = '${docId}'
    `);

    return result[0];
  }

  async createDoc(organizationId: string, dto: CreateDocDto, userId: string) {
    await this.prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${organizationId}'`);

    const status = dto.status || DocStatus.DRAFT;
    const publishedAt = status === DocStatus.PUBLISHED ? 'NOW()' : 'NULL';

    const id = createId();
    const escapedContent = dto.content.replace(/'/g, "''");
    const escapedExcerpt = dto.excerpt ? dto.excerpt.replace(/'/g, "''") : '';

    try {
      const result: any[] = await this.prisma.$queryRawUnsafe(`
          INSERT INTO docs (
            id, organisation_id, category_id, title, slug, content, excerpt,
            status, estimated_read_time, author_type, author_id,
            published_at, created_at, updated_at
          ) VALUES (
            '${id}', '${organizationId}', '${dto.category_id}', '${dto.title}', '${dto.slug}', 
            '${escapedContent}', ${dto.excerpt ? `'${escapedExcerpt}'` : 'NULL'}, 
            '${status}', 
            ${dto.estimated_read_time || 5}, 'org_user', '${userId}',
            ${publishedAt}, NOW(), NOW()
          )
          RETURNING *
        `);

      await this.auditService.log({
        organizationId,
        orgUserId: userId,
        action: 'docs.doc.create',
        resourceType: 'doc',
        resourceId: result[0].id,
        metadata: { doc: result[0] },
      });

      return result[0];
    } catch (error: any) {
      // Handle unique constraint violation for slug
      if (error.code === '23505' && error.message?.includes('organisation_id, slug')) {
        throw new ConflictException(
          `A document with the slug "${dto.slug}" already exists in this organization. Please use a different slug.`
        );
      }
      // Re-throw other errors
      throw error;
    }
  }

  async updateDoc(organizationId: string, docId: string, dto: UpdateDocDto, userId: string) {
    await this.prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${organizationId}'`);

    // Check if doc exists and is org-owned
    const existing: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM docs WHERE id = '${docId}'
    `);

    if (existing.length === 0) {
      throw new NotFoundException('Doc not found');
    }

    if (existing[0].organisation_id === null) {
      throw new ForbiddenException('Cannot edit global documentation');
    }

    const updates: string[] = [];

    if (dto.title !== undefined) updates.push(`title = '${dto.title}'`);
    if (dto.content !== undefined) updates.push(`content = '${dto.content.replace(/'/g, "''")}'`);
    if (dto.status !== undefined) {
      updates.push(`status = '${dto.status}'`);
      if (dto.status === DocStatus.PUBLISHED && !existing[0].published_at) {
        updates.push(`published_at = NOW()`);
      }
    }

    if (updates.length === 0) {
      return existing[0];
    }

    const result: any[] = await this.prisma.$queryRawUnsafe(`
      UPDATE docs SET ${updates.join(', ')} WHERE id = '${docId}' RETURNING *
    `);

    await this.auditService.log({
      organizationId,
      orgUserId: userId,
      action: 'docs.doc.update',
      resourceType: 'doc',
      resourceId: docId,
      metadata: { changes: dto },
    });

    return result[0];
  }

  async deleteDoc(organizationId: string, docId: string, userId: string) {
    await this.prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${organizationId}'`);

    const existing: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM docs WHERE id = '${docId}'
    `);

    if (existing.length === 0) {
      throw new NotFoundException('Doc not found');
    }

    if (existing[0].organisation_id === null) {
      throw new ForbiddenException('Cannot delete global documentation');
    }

    await this.prisma.$executeRawUnsafe(`
      DELETE FROM docs WHERE id = '${docId}'
    `);

    await this.auditService.log({
      organizationId,
      orgUserId: userId,
      action: 'docs.doc.delete',
      resourceType: 'doc',
      resourceId: docId,
      metadata: { doc: existing[0] },
    });

    return { message: 'Doc deleted successfully' };
  }

  async completeDoc(organizationId: string, docId: string, userId: string, dto: CompleteDocDto) {
    await this.prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${organizationId}'`);

    // Map membership ID to org_user ID (for backward compatibility)
    const userMapping: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT ou.id as org_user_id 
      FROM user_org_memberships uom
      JOIN org_users ou ON ou.email = uom.email AND ou.tenant_id = uom.tenant_id
      WHERE uom.id = '${userId}' AND uom.tenant_id = '${organizationId}'
    `);

    const orgUserId = userMapping.length > 0 ? userMapping[0].org_user_id : userId;

    const id = createId();
    const result: any[] = await this.prisma.$queryRawUnsafe(`
      INSERT INTO doc_completions (id, organisation_id, doc_id, user_id, notes)
      VALUES ('${id}', '${organizationId}', '${docId}', '${orgUserId}', ${dto.notes ? `'${dto.notes}'` : 'NULL'})
      ON CONFLICT (organisation_id, doc_id, user_id)
      DO UPDATE SET completed_at = NOW(), notes = ${dto.notes ? `'${dto.notes}'` : 'NULL'}
      RETURNING *
    `);

    return result[0];
  }

  async getUserCompletions(organizationId: string, userId: string) {
    await this.prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${organizationId}'`);

    // Map membership ID to org_user ID
    const userMapping: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT ou.id as org_user_id 
      FROM user_org_memberships uom
      JOIN org_users ou ON ou.email = uom.email AND ou.tenant_id = uom.tenant_id
      WHERE uom.id = '${userId}' AND uom.tenant_id = '${organizationId}'
    `);

    const orgUserId = userMapping.length > 0 ? userMapping[0].org_user_id : userId;

    const result: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT 
        dc.id,
        dc.doc_id as "docId",
        dc.completed_at as "completedAt",
        dc.notes,
        json_build_object(
          'id', d.id,
          'title', d.title,
          'slug', d.slug,
          'excerpt', d.excerpt,
          'status', d.status,
          'estimatedReadTime', d.estimated_read_time,
          'category', CASE 
            WHEN cat.id IS NOT NULL THEN json_build_object(
              'id', cat.id,
              'name', cat.name,
              'slug', cat.slug,
              'icon', cat.icon
            )
            ELSE NULL
          END
        ) as doc
      FROM doc_completions dc
      JOIN docs d ON dc.doc_id = d.id
      LEFT JOIN doc_categories cat ON d.category_id = cat.id
      WHERE dc.user_id = '${orgUserId}'
      ORDER BY dc.completed_at DESC
    `);

    return result;
  }
}
