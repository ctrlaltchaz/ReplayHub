import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNoteDto, NoteDto } from './dto';

@Injectable()
export class DemoService {
    constructor(private prisma: PrismaService) { }

    async createNote(createNoteDto: CreateNoteDto, tenantId: string, createdBy: string): Promise<NoteDto> {
        const note = await this.prisma.note.create({
            data: {
                title: createNoteDto.title,
                body: createNoteDto.body,
                tenantId: tenantId,
                createdBy: createdBy,
            },
        });

        return {
            id: note.id,
            tenantId: note.tenantId,
            title: note.title,
            body: note.body,
            createdBy: note.createdBy,
            createdAt: note.createdAt,
        };
    }

    async getNotes(tenantId?: string): Promise<NoteDto[]> {
        if (tenantId) {
            // Use explicit WHERE clause with tenant_id for now
            // RLS provides additional security layer but we ensure filtering here
            const notes = await this.prisma.$transaction(async (tx) => {
                // Set the app.tenant_id config for RLS (safety net)
                await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

                // Query notes with explicit tenant filtering + RLS as backup
                return await tx.$queryRaw<any[]>`
          SELECT id, tenant_id, title, body, created_by, created_at 
          FROM notes 
          WHERE tenant_id = ${tenantId}
          ORDER BY created_at DESC
        `;
            });

            return notes.map(note => ({
                id: note.id,
                tenantId: note.tenant_id,
                title: note.title,
                body: note.body,
                createdBy: note.created_by,
                createdAt: note.created_at,
            }));
        }

        // Fallback without tenant filtering (for debugging)
        const notes = await this.prisma.$queryRaw<any[]>`
      SELECT id, tenant_id, title, body, created_by, created_at 
      FROM notes 
      ORDER BY created_at DESC
    `;

        return notes.map(note => ({
            id: note.id,
            tenantId: note.tenant_id,
            title: note.title,
            body: note.body,
            createdBy: note.created_by,
            createdAt: note.created_at,
        }));
    }

    // Debug method to check current tenant context
    async debugContext(tenantId?: string): Promise<any> {
        if (tenantId) {
            // Test within transaction
            const result = await this.prisma.$transaction(async (tx) => {
                await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

                // Check context and test policy application
                const contextResult = await tx.$queryRaw<any[]>`
          SELECT current_setting('app.tenant_id', true) as tenant_id
        `;

                // Test actual query with RLS
                const rlsTest = await tx.$queryRaw<any[]>`
          SELECT COUNT(*)::text as total_notes,
                 COUNT(CASE WHEN tenant_id = current_setting('app.tenant_id') THEN 1 END)::text as matching_notes
          FROM notes
        `;

                return {
                    context: contextResult[0],
                    rls_test: rlsTest[0]
                };
            });
            return result;
        }

        // Check current context without setting
        const result = await this.prisma.$queryRaw<any[]>`
      SELECT current_setting('app.tenant_id', true) as tenant_id
    `;
        return { context: result[0] };
    }
}
