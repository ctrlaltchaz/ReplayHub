import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { AuditService } from '../../../common/audit/audit.service';
import { PrismaService } from '../../../database/prisma.service';
import {
    CreateGlobalDocCategoryDto,
    CreateGlobalDocDto,
    DocStatus,
    GlobalDocQueryDto,
    UpdateGlobalDocCategoryDto,
    UpdateGlobalDocDto,
} from '../dto';

@Injectable()
export class GlobalDocsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService
    ) { }

    // ============================================================================
    // CATEGORIES
    // ============================================================================

    async getCategories() {
        const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        dc.*,
        COUNT(d.id)::int as doc_count
      FROM doc_categories dc
      LEFT JOIN docs d ON d.category_id = dc.id AND d.status = 'published' AND d.organisation_id IS NULL
      WHERE dc.organisation_id IS NULL
        AND dc.is_active = true
      GROUP BY dc.id
      ORDER BY dc.sort_order ASC, dc.name ASC
    `);

        return result;
    }

    async createCategory(dto: CreateGlobalDocCategoryDto, userId: string) {
        const id = createId();

        try {
            const result = await this.prisma.$queryRawUnsafe<any[]>(`
          INSERT INTO doc_categories (id, organisation_id, name, description, slug, icon, sort_order, created_at, updated_at)
          VALUES ('${id}', NULL, '${dto.name}', ${dto.description ? `'${dto.description}'` : 'NULL'}, '${dto.slug}', ${dto.icon ? `'${dto.icon}'` : 'NULL'}, ${dto.sort_order || 0}, NOW(), NOW())
          RETURNING *
        `);

            const category = result[0];

            await this.auditService.log({
                globalUserId: userId,
                action: 'global_docs.category.create',
                resourceType: 'global_doc_category',
                resourceId: category.id,
                metadata: { category },
            });

            return category;
        } catch (error: any) {
            // Handle unique constraint violation for slug
            if (error.code === '23505' && error.message?.includes('organisation_id, slug')) {
                throw new ConflictException(
                    `A global category with the slug "${dto.slug}" already exists. Please use a different slug.`
                );
            }
            // Re-throw other errors
            throw error;
        }
    }

    async updateCategory(categoryId: string, dto: UpdateGlobalDocCategoryDto, globalUserId: string) {
        const existing = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM doc_categories WHERE id = '${categoryId}' AND organisation_id IS NULL
    `);

        if (existing.length === 0) {
            throw new NotFoundException('Global category not found');
        }

        const updates: string[] = [];
        if (dto.name !== undefined) updates.push(`name = '${dto.name}'`);
        if (dto.description !== undefined) updates.push(`description = ${dto.description ? `'${dto.description}'` : 'NULL'}`);
        if (dto.slug !== undefined) updates.push(`slug = '${dto.slug}'`);
        if (dto.icon !== undefined) updates.push(`icon = ${dto.icon ? `'${dto.icon}'` : 'NULL'}`);
        if (dto.sort_order !== undefined) updates.push(`sort_order = ${dto.sort_order}`);

        if (updates.length === 0) {
            return existing[0];
        }

        const result = await this.prisma.$queryRawUnsafe<any[]>(`
      UPDATE doc_categories SET ${updates.join(', ')} WHERE id = '${categoryId}' RETURNING *
    `);

        await this.auditService.log({
            globalUserId,
            action: 'global_docs.category.update',
            resourceType: 'global_doc_category',
            resourceId: categoryId,
            metadata: { changes: dto },
        });

        return result[0];
    }

    async deleteCategory(categoryId: string, globalUserId: string) {
        const existing = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM doc_categories WHERE id = '${categoryId}' AND organisation_id IS NULL
    `);

        if (existing.length === 0) {
            throw new NotFoundException('Global category not found');
        }

        // Check if category has docs
        const docsCount = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*)::int as count FROM docs WHERE category_id = '${categoryId}'
    `);

        if (docsCount[0].count > 0) {
            throw new NotFoundException('Cannot delete category with existing docs');
        }

        await this.prisma.$executeRawUnsafe(`
      DELETE FROM doc_categories WHERE id = '${categoryId}'
    `);

        await this.auditService.log({
            globalUserId,
            action: 'global_docs.category.delete',
            resourceType: 'global_doc_category',
            resourceId: categoryId,
            metadata: { category: existing[0] },
        });

        return { message: 'Category deleted successfully' };
    }

    // ============================================================================
    // DOCS
    // ============================================================================

    async getDocs(query: GlobalDocQueryDto) {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '20');
        const offset = (page - 1) * limit;

        let whereClauses = ['d.organisation_id IS NULL'];

        if (query.category_id) {
            whereClauses.push(`d.category_id = '${query.category_id}'`);
        }

        if (query.status) {
            whereClauses.push(`d.status = '${query.status}'`);
        }

        const whereClause = whereClauses.join(' AND ');

        const docs = await this.prisma.$queryRawUnsafe<any[]>(`
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
        gu.email as author_email
      FROM docs d
      LEFT JOIN doc_categories dc ON d.category_id = dc.id
      LEFT JOIN global_users gu ON d.author_id = gu.id
      WHERE ${whereClause}
      ORDER BY d.published_at DESC NULLS LAST, d.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

        const countResult = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*)::int as total FROM docs d WHERE ${whereClause}
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

    async getDoc(docId: string) {
        const result = await this.prisma.$queryRawUnsafe<any[]>(`
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
        gu.email as author_email
      FROM docs d
      LEFT JOIN doc_categories dc ON d.category_id = dc.id
      LEFT JOIN global_users gu ON d.author_id = gu.id
      WHERE d.id = '${docId}' AND d.organisation_id IS NULL
    `);

        if (result.length === 0) {
            throw new NotFoundException('Global doc not found');
        }

        return result[0];
    }

    async createDoc(dto: CreateGlobalDocDto, globalUserId: string) {
        const status = dto.status || DocStatus.DRAFT;
        const isPublished = status === DocStatus.PUBLISHED;
        const publishedAt = isPublished ? 'NOW()' : 'NULL';

        const escapedContent = dto.content.replace(/'/g, "''");
        const id = createId();
        const escapedSummary = dto.excerpt ? dto.excerpt.replace(/'/g, "''") : '';

        try {
            const result = await this.prisma.$queryRawUnsafe<any[]>(`
          INSERT INTO docs (
            id, organisation_id, category_id, title, slug, content, excerpt,
            status, estimated_read_time, author_type, author_id,
            published_at, created_at, updated_at
          ) VALUES (
            '${id}', NULL, '${dto.category_id}', '${dto.title}', '${dto.slug}', 
            '${escapedContent}', ${dto.excerpt ? `'${escapedSummary}'` : 'NULL'}, 
            '${status}', 
            ${dto.estimated_read_time || 5}, 'global_user', '${globalUserId}',
            ${publishedAt}, NOW(), NOW()
          )
          RETURNING *
        `);

            await this.auditService.log({
                globalUserId,
                action: 'global_docs.doc.create',
                resourceType: 'global_doc',
                resourceId: result[0].id,
                metadata: { doc: result[0] },
            });

            return result[0];
        } catch (error: any) {
            // Handle unique constraint violation for slug
            if (error.code === '23505' && error.message?.includes('organisation_id, slug')) {
                throw new ConflictException(
                    `A global document with the slug \"${dto.slug}\" already exists. Please use a different slug.`
                );
            }
            // Re-throw other errors
            throw error;
        }
    }

    async updateDoc(docId: string, dto: UpdateGlobalDocDto, globalUserId: string) {
        const existing = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM docs WHERE id = '${docId}' AND organisation_id IS NULL
    `);

        if (existing.length === 0) {
            throw new NotFoundException('Global doc not found');
        }

        const updates: string[] = [];

        if (dto.title !== undefined) updates.push(`title = '${dto.title}'`);
        if (dto.content !== undefined) updates.push(`content = '${dto.content.replace(/'/g, "''")}'`);
        if (dto.excerpt !== undefined) updates.push(`excerpt = ${dto.excerpt ? `'${dto.excerpt.replace(/'/g, "''")}'` : 'NULL'}`);
        if (dto.status !== undefined) {
            updates.push(`status = '${dto.status}'`);
            if (dto.status === DocStatus.PUBLISHED && !existing[0].published_at) {
                updates.push(`published_at = NOW()`);
            }
        }
        if (dto.estimated_read_time !== undefined) updates.push(`estimated_read_time = ${dto.estimated_read_time}`);

        if (updates.length === 0) {
            return existing[0];
        }

        const result = await this.prisma.$queryRawUnsafe<any[]>(`
      UPDATE docs SET ${updates.join(', ')} WHERE id = '${docId}' RETURNING *
    `);

        await this.auditService.log({
            globalUserId,
            action: 'global_docs.doc.update',
            resourceType: 'global_doc',
            resourceId: docId,
            metadata: { changes: dto },
        });

        return result[0];
    }

    async deleteDoc(docId: string, globalUserId: string) {
        const existing = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM docs WHERE id = '${docId}' AND organisation_id IS NULL
    `);

        if (existing.length === 0) {
            throw new NotFoundException('Global doc not found');
        }

        await this.prisma.$executeRawUnsafe(`
      DELETE FROM docs WHERE id = '${docId}'
    `);

        await this.auditService.log({
            globalUserId,
            action: 'global_docs.doc.delete',
            resourceType: 'global_doc',
            resourceId: docId,
            metadata: { doc: existing[0] },
        });

        return { message: 'Doc deleted successfully' };
    }

    // ============================================================================
    // ANALYTICS
    // ============================================================================

    async getDocStats(docId: string) {
        const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        COUNT(DISTINCT dc.org_user_id)::int as completion_count
      FROM docs d
      LEFT JOIN doc_completions dc ON d.id = dc.doc_id
      WHERE d.id = '${docId}' AND d.organisation_id IS NULL
      GROUP BY d.id
    `);

        return result[0] || { view_count: 0, org_count: 0, completion_count: 0 };
    }
}
