import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export interface BadgeCounts {
    incidents: number;
    events: number;
    checklists: number;
    tasks: number;
}

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getBadgeCounts(tenantId: string, orgUserId?: string): Promise<BadgeCounts> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const now = new Date();

            // Count open incidents
            const incidentsCount = await tx.incident.count({
                where: {
                    status: {
                        in: ['OPEN', 'IN_PROGRESS']
                    }
                }
            });

            // Count upcoming events (next 7 days)
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const eventsCount = await tx.event.count({
                where: {
                    startAt: {
                        gte: now,
                        lte: sevenDaysFromNow
                    }
                }
            });

            // Count incomplete checklists
            const checklistsCount = await tx.checklist.count({
                where: {
                    status: {
                        notIn: ['COMPLETED', 'ARCHIVED']
                    }
                }
            });

            let tasksCount = 0;
            if (orgUserId) {
                const [taskRow] = await tx.$queryRaw<{ count: number }[]>(Prisma.sql`
                    WITH checklist_items AS (
                        SELECT
                            c.id AS checklist_id,
                            c.tenant_id,
                            c.completed_items,
                            COALESCE(c.items_json, ct.items_json) AS items_json
                        FROM checklists c
                        LEFT JOIN checklist_templates ct ON ct.id = c.template_id
                        WHERE c.tenant_id = ${tenantId}
                    ),
                    expanded AS (
                        SELECT
                            ci.checklist_id,
                            ci.completed_items,
                            (item.elem ->> 'assignedTo') AS assigned_to,
                            (item.ordinality - 1) AS item_index
                        FROM checklist_items ci
                        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ci.items_json, '[]'::jsonb)) WITH ORDINALITY AS item(elem, ordinality)
                    )
                    SELECT COUNT(*)::int AS count
                    FROM expanded
                    LEFT JOIN LATERAL (
                        SELECT 1 AS match_found
                        FROM jsonb_array_elements(COALESCE(expanded.completed_items, '[]'::jsonb)) elem
                        WHERE (elem ->> 'idx')::int = expanded.item_index
                        LIMIT 1
                    ) completion ON true
                    WHERE expanded.assigned_to = ${orgUserId}
                      AND completion.match_found IS NULL
                `);

                tasksCount = taskRow?.count ?? 0;
            }

            return {
                incidents: incidentsCount,
                events: eventsCount,
                checklists: checklistsCount,
                tasks: tasksCount
            };
        });
    }
}
