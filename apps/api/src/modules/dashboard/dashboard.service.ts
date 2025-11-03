import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface BadgeCounts {
    incidents: number;
    events: number;
    checklists: number;
}

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getBadgeCounts(tenantId: string): Promise<BadgeCounts> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const now = new Date();

        // Count open incidents
        const incidentsCount = await this.prisma.incident.count({
            where: {
                status: {
                    in: ['OPEN', 'IN_PROGRESS']
                }
            }
        });

        // Count upcoming events (next 7 days)
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const eventsCount = await this.prisma.event.count({
            where: {
                startAt: {
                    gte: now,
                    lte: sevenDaysFromNow
                }
            }
        });

        // Count incomplete checklists
        const checklistsCount = await this.prisma.checklist.count({
            where: {
                status: {
                    notIn: ['COMPLETED', 'ARCHIVED']
                }
            }
        });

        return {
            incidents: incidentsCount,
            events: eventsCount,
            checklists: checklistsCount,
        };
    }
}
