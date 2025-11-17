import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DiscordService } from '../../discord/discord.service';
import { CalendarWeekQueryDto, CreateEventDto, EventFiltersDto, UpdateEventDto } from '../dto/scheduling.dto';
import { CalendarUtilsService } from './calendar-utils.service';

@Injectable()
export class EventsService {
    constructor(
        private prisma: PrismaService,
        private calendarUtils: CalendarUtilsService,
        private discordService: DiscordService,
    ) { }

    async createEvent(tenantId: string, createdByGlobalUserId: string, data: CreateEventDto) {
        return await this.prisma.$transaction(async (tx) => {
            try {
                // Set tenant context for RLS
                await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

                console.log('📝 Creating event with tenantId:', tenantId);
                console.log('📝 Event data:', data);

                // productionLead in DTO is expected to be globalUserId
                let productionLeadGlobalUserId = data.productionLead || null;

                // Validate that productionLead exists in global_users if provided
                if (productionLeadGlobalUserId) {
                    const globalUser = await tx.globalUser.findUnique({
                        where: { id: productionLeadGlobalUserId }
                    });
                    if (!globalUser) {
                        console.warn(`Production lead ID ${productionLeadGlobalUserId} not found in global_users, setting to null`);
                        productionLeadGlobalUserId = null;
                    }
                }

                // Create the event using Prisma client
                const event = await tx.event.create({
                    data: {
                        tenantId,
                        title: data.title,
                        eventType: data.eventType || 'Other',
                        gameTitle: data.gameTitle || null,
                        productionLeadGlobalUserId,
                        broadcastChannel: data.broadcastChannel || null,
                        startAt: new Date(data.startAt),
                        endAt: new Date(data.endAt),
                        callTime: data.callTime ? new Date(data.callTime) : null,
                        duration: data.duration || null,
                        location: data.location || null,
                        teamId: data.teamId || null,
                        lineupId: data.lineupId || null,
                        // Tournament fields
                        opponent: data.opponent || null,
                        tournamentName: data.tournamentName || null,
                        tournamentStage: data.tournamentStage || null,
                        bestOf: data.bestOf || null,
                        graphicsPackage: data.graphicsPackage || null,
                        checklistId: data.checklistId || null,
                        rosterId: data.rosterId || null,
                        notes: data.notes || null,
                        createdByGlobalUserId,
                        status: data.status || 'scheduled',
                    },
                    include: {
                        team: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });

                console.log('✅ Event created successfully:', event);

                // Send Discord notification
                try {
                    // Collect assigned user IDs (note: now using globalUserId fields)
                    const assignedUserIds: string[] = [];
                    // For Discord notification, we'll need to resolve OrgUser IDs from GlobalUser IDs
                    // This is a temporary workaround until Discord service is updated
                    // For now, skip adding specific users to notification

                    await this.discordService.notifyEvent(
                        tenantId,
                        {
                            name: event.title,
                            date: event.startAt,
                            location: event.location || undefined,
                            description: `${event.eventType}${event.gameTitle ? ` - ${event.gameTitle}` : ''}`,
                            // Tournament fields
                            opponent: event.opponent || undefined,
                            tournamentName: event.tournamentName || undefined,
                            tournamentStage: event.tournamentStage || undefined,
                            bestOf: event.bestOf || undefined,
                            teamName: event.team?.name || undefined,
                        },
                        'created',
                        assignedUserIds.length > 0 ? assignedUserIds : undefined,
                    );
                } catch (discordError) {
                    console.error('Failed to send Discord notification:', discordError);
                    // Don't fail the event creation if Discord fails
                }

                return { message: 'Event created successfully', event };
            } catch (error) {
                console.error('❌ Event creation error:', error);
                // Return detailed error for debugging
                const errorMessage = error?.message || 'Unknown error';
                const errorCode = error?.code || 'N/A';
                throw new ConflictException(`Failed to create event: ${errorMessage} (code: ${errorCode})`);
            }
        });
    }

    async findEvents(tenantId: string, filters?: EventFiltersDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            let query = `
      SELECT 
        e.id,
        e.title,
        e.event_type as "eventType",
        e.game_title as "gameTitle",
        e.production_lead_global_user_id as "productionLead",
        pl.name as "productionLeadName",
        e.broadcast_channel as "broadcastChannel",
        e.start_at as "startAt",
        e.call_time as "callTime",
        e.end_at as "endAt",
        e.duration,
        e.location,
        e.team_id as "teamId",
        e.lineup_id as "lineupId",
        e.opponent,
        e.tournament_name as "tournamentName",
        e.tournament_stage as "tournamentStage",
        e.best_of as "bestOf",
        e.graphics_package as "graphicsPackage",
        e.checklist_id as "checklistId",
        e.roster_id as "rosterId",
        e.notes,
        e.status,
        e.created_by_global_user_id as "createdBy",
        e.created_at as "createdAt",
        e.updated_at as "updatedAt",
        e.tenant_id as "tenantId",
        r.id as "runsheetId",
        r.title as "runsheetTitle"
      FROM events e
      LEFT JOIN global_users pl ON e.production_lead_global_user_id = pl.id
      LEFT JOIN runsheets r ON r.event_id = e.id AND r.tenant_id = e.tenant_id
      WHERE e.tenant_id = $1
    `;

            const params = [tenantId];
            let paramIndex = 2;

            if (filters?.from) {
                query += ` AND e.start_at >= $${paramIndex}::timestamp`;
                params.push(filters.from);
                paramIndex++;
            }

            if (filters?.to) {
                query += ` AND e.start_at <= $${paramIndex}::timestamp`;
                params.push(filters.to);
                paramIndex++;
            }

            if (filters?.teamId) {
                query += ` AND e.team_id = $${paramIndex}`;
                params.push(filters.teamId);
                paramIndex++;
            }

            if (filters?.eventType) {
                query += ` AND e.event_type = $${paramIndex}`;
                params.push(filters.eventType);
                paramIndex++;
            }

            if (filters?.gameTitle) {
                query += ` AND e.game_title ILIKE $${paramIndex}`;
                params.push(`%${filters.gameTitle}%`);
                paramIndex++;
            }

            if (filters?.productionLead) {
                query += ` AND e.production_lead_global_user_id = $${paramIndex}`;
                params.push(filters.productionLead);
                paramIndex++;
            }

            if (filters?.status) {
                query += ` AND e.status = $${paramIndex}`;
                params.push(filters.status);
                paramIndex++;
            }

            if (filters?.q) {
                query += ` AND (e.title ILIKE $${paramIndex} OR e.notes ILIKE $${paramIndex} OR e.game_title ILIKE $${paramIndex})`;
                params.push(`%${filters.q}%`);
                paramIndex++;
            }

            query += ` ORDER BY e.start_at ASC`;

            console.log('🔍 Finding events with query:', query);
            console.log('🔍 Params:', params);
            console.log('🔍 TenantId:', tenantId);

            const results = await tx.$queryRawUnsafe(query, ...params);
            console.log('✅ Query results:', results);
            console.log('✅ Result count:', Array.isArray(results) ? results.length : 0);

            return results;
        });
    }

    async findOneEvent(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const events = await tx.$queryRawUnsafe(`
      SELECT 
        e.id,
        e.title,
        e.event_type as "eventType",
        e.game_title as "gameTitle",
        e.production_lead_global_user_id as "productionLead",
        pl.name as "productionLeadName",
        e.broadcast_channel as "broadcastChannel",
        e.start_at as "startAt",
        e.call_time as "callTime",
        e.end_at as "endAt",
        e.duration,
        e.location,
        e.team_id as "teamId",
        e.lineup_id as "lineupId",
        e.opponent,
        e.tournament_name as "tournamentName",
        e.tournament_stage as "tournamentStage",
        e.best_of as "bestOf",
        e.graphics_package as "graphicsPackage",
        e.checklist_id as "checklistId",
        e.roster_id as "rosterId",
        e.notes,
        e.status,
        e.created_by_global_user_id as "createdBy",
        e.created_at as "createdAt",
        e.updated_at as "updatedAt",
        e.tenant_id as "tenantId",
        t.name as "teamName",
        l.title as "lineupName",
        ou.name as "creatorName",
        rs.id as "runsheetId",
        rs.title as "runsheetTitle",
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
              'name', r.name,
              'kind', r.kind,
              'location', r.location
            )
          ) FILTER (WHERE r.id IS NOT NULL), 
          '[]'::json
        ) as resources
      FROM events e
      LEFT JOIN global_users pl ON e.production_lead_global_user_id = pl.id
      LEFT JOIN teams t ON e.team_id = t.id AND t.tenant_id = e.tenant_id
      LEFT JOIN lineups l ON e.lineup_id = l.id AND l.tenant_id = e.tenant_id
      LEFT JOIN global_users ou ON e.created_by_global_user_id = ou.id
      LEFT JOIN runsheets rs ON rs.event_id = e.id AND rs.tenant_id = e.tenant_id
      LEFT JOIN bookings b ON e.id = b.event_id AND b.tenant_id = e.tenant_id
      LEFT JOIN resources r ON b.resource_id = r.id AND r.tenant_id = e.tenant_id
      WHERE e.tenant_id = $1 AND e.id = $2
      GROUP BY e.id, t.name, l.title, ou.name, pl.name, rs.id, rs.title
    `, tenantId, id) as any[];

            if (!events.length) {
                throw new Error('Event not found');
            }

            return events[0];
        });
    }

    async updateEvent(tenantId: string, id: string, data: UpdateEventDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            try {
                const setClause: string[] = [];
                const params: any[] = [tenantId, id];
                let paramIndex = 3;

                if (data.title !== undefined) {
                    setClause.push(`title = $${paramIndex}`);
                    params.push(data.title);
                    paramIndex++;
                }

                if (data.startAt !== undefined) {
                    setClause.push(`start_at = $${paramIndex}::timestamp`);
                    params.push(data.startAt);
                    paramIndex++;
                }

                if (data.endAt !== undefined) {
                    setClause.push(`end_at = $${paramIndex}::timestamp`);
                    params.push(data.endAt);
                    paramIndex++;
                }

                if (data.location !== undefined) {
                    setClause.push(`location = $${paramIndex}`);
                    params.push(data.location);
                    paramIndex++;
                }

                if (data.teamId !== undefined) {
                    setClause.push(`team_id = $${paramIndex}`);
                    params.push(data.teamId);
                    paramIndex++;
                }

                if (data.lineupId !== undefined) {
                    setClause.push(`lineup_id = $${paramIndex}`);
                    params.push(data.lineupId);
                    paramIndex++;
                }

                // Tournament fields
                if (data.opponent !== undefined) {
                    setClause.push(`opponent = $${paramIndex}`);
                    params.push(data.opponent);
                    paramIndex++;
                }

                if (data.tournamentName !== undefined) {
                    setClause.push(`tournament_name = $${paramIndex}`);
                    params.push(data.tournamentName);
                    paramIndex++;
                }

                if (data.tournamentStage !== undefined) {
                    setClause.push(`tournament_stage = $${paramIndex}`);
                    params.push(data.tournamentStage);
                    paramIndex++;
                }

                if (data.bestOf !== undefined) {
                    setClause.push(`best_of = $${paramIndex}`);
                    params.push(data.bestOf);
                    paramIndex++;
                }

                if (data.notes !== undefined) {
                    setClause.push(`notes = $${paramIndex}`);
                    params.push(data.notes);
                    paramIndex++;
                }

                if (data.status !== undefined) {
                    setClause.push(`status = $${paramIndex}`);
                    params.push(data.status);
                    paramIndex++;
                }

                // Production fields
                if (data.eventType !== undefined) {
                    setClause.push(`event_type = $${paramIndex}`);
                    params.push(data.eventType);
                    paramIndex++;
                }

                if (data.gameTitle !== undefined) {
                    setClause.push(`game_title = $${paramIndex}`);
                    params.push(data.gameTitle);
                    paramIndex++;
                }

                if (data.productionLead !== undefined) {
                    setClause.push(`production_lead_global_user_id = $${paramIndex}`);
                    params.push(data.productionLead);
                    paramIndex++;
                }

                if (data.broadcastChannel !== undefined) {
                    setClause.push(`broadcast_channel = $${paramIndex}`);
                    params.push(data.broadcastChannel);
                    paramIndex++;
                }

                if (data.callTime !== undefined) {
                    setClause.push(`call_time = $${paramIndex}::timestamp`);
                    params.push(data.callTime);
                    paramIndex++;
                }

                if (data.duration !== undefined) {
                    setClause.push(`duration = $${paramIndex}`);
                    params.push(data.duration);
                    paramIndex++;
                }

                if (data.graphicsPackage !== undefined) {
                    setClause.push(`graphics_package = $${paramIndex}`);
                    params.push(data.graphicsPackage);
                    paramIndex++;
                }

                if (data.checklistId !== undefined) {
                    setClause.push(`checklist_id = $${paramIndex}`);
                    params.push(data.checklistId);
                    paramIndex++;
                }

                if (data.rosterId !== undefined) {
                    setClause.push(`roster_id = $${paramIndex}`);
                    params.push(data.rosterId);
                    paramIndex++;
                }

                if (setClause.length === 0) {
                    return { message: 'No updates provided' };
                }

                setClause.push(`updated_at = NOW()`);

                const query = `
        UPDATE events 
        SET ${setClause.join(', ')} 
        WHERE tenant_id = $1 AND id = $2
      `;

                console.log('🔄 Update query:', query);
                console.log('🔄 Update params:', params);

                await tx.$executeRawUnsafe(query, ...params);

                // Send Discord notification for event update
                try {
                    const updatedEvent = await this.findOneEvent(tenantId, id);

                    // Collect assigned user IDs
                    // Note: productionLead and createdBy fields removed - using globalUserId fields now
                    // Discord service will need updating to handle GlobalUser IDs
                    const assignedUserIds: string[] = [];

                    await this.discordService.notifyEvent(
                        tenantId,
                        {
                            name: updatedEvent.title,
                            date: new Date(updatedEvent.startAt),
                            location: updatedEvent.location || undefined,
                            description: `${updatedEvent.eventType}${updatedEvent.gameTitle ? ` - ${updatedEvent.gameTitle}` : ''}`,
                            // Tournament fields
                            opponent: updatedEvent.opponent || undefined,
                            tournamentName: updatedEvent.tournamentName || undefined,
                            tournamentStage: updatedEvent.tournamentStage || undefined,
                            bestOf: updatedEvent.bestOf || undefined,
                            teamName: updatedEvent.teamName || undefined,
                        },
                        'updated',
                        assignedUserIds.length > 0 ? assignedUserIds : undefined,
                    );
                } catch (discordError) {
                    console.error('Failed to send Discord notification:', discordError);
                }

                return { message: 'Event updated successfully' };
            } catch (error) {
                console.error('❌ Update event error:', error);
                throw new ConflictException('Failed to update event');
            }
        });
    }

    async deleteEvent(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            try {
                await tx.$executeRawUnsafe(`
        DELETE FROM events 
        WHERE tenant_id = $1 AND id = $2
      `, tenantId, id);

                return { message: 'Event deleted successfully' };
            } catch (error) {
                throw new ConflictException('Failed to delete event');
            }
        });
    }

    async getWeekEvents(tenantId: string, startOfWeek: Date) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 7);

            return await tx.$queryRawUnsafe(`
      SELECT e.*, 
             t.name as team_name,
             l.name as lineup_name,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', r.id,
                   'name', r.name,
                   'kind', r.kind
                 )
               ) FILTER (WHERE r.id IS NOT NULL), 
               '[]'::json
             ) as resources
      FROM events e
      LEFT JOIN teams t ON e.team_id = t.id
      LEFT JOIN lineups l ON e.lineup_id = l.id
      LEFT JOIN bookings b ON e.id = b.event_id
      LEFT JOIN resources r ON b.resource_id = r.id
      WHERE e.tenant_id = $1 
        AND e.start_at >= $2 
        AND e.start_at < $3
      GROUP BY e.id, t.name, l.name
      ORDER BY e.start_at ASC
    `, tenantId, startOfWeek, endOfWeek);
        });
    }

    /**
     * Enhanced calendar week view with timezone support and flexible date ranges
     */
    async getCalendarWeek(tenantId: string, queryDto: CalendarWeekQueryDto) {
        return await this.prisma.$transaction(async (tx) => {
            try {
                // Set tenant context for RLS
                await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

                // Resolve timezone from params or tenant settings
                const timezone = await this.calendarUtils.resolveTimezone(tenantId, queryDto.tz);

                // Get Monday start of the week
                const mondayStart = this.calendarUtils.getMondayStartOfWeek(queryDto.start, timezone);

                // Convert to UTC range for database queries
                const days = queryDto.days || 7;
                const utcRange = this.calendarUtils.convertToUtcRange(mondayStart, days, timezone);

                console.log(`[CalendarService] Querying events from ${this.calendarUtils.formatDateForLog(utcRange.start)} to ${this.calendarUtils.formatDateForLog(utcRange.end)} (UTC)`);
                console.log(`[CalendarService] Original request: start=${queryDto.start}, days=${days}, timezone=${timezone}`);

                // Query events with overlap detection
                // An event overlaps the date range if:
                // - Event starts before range ends AND event ends after range starts
                const events = await tx.$queryRawUnsafe(`
                SELECT 
                    e.id,
                    e.title,
                    e.event_type as "eventType",
                    e.game_title as "gameTitle",
                    e.production_lead_global_user_id as "productionLead",
                    pl.name as "productionLeadName",
                    e.broadcast_channel as "broadcastChannel",
                    e.start_at as "startAt",
                    e.call_time as "callTime",
                    e.end_at as "endAt",
                    e.duration,
                    e.location,
                    e.team_id as "teamId",
                    e.lineup_id as "lineupId",
                    e.graphics_package as "graphicsPackage",
                    e.checklist_id as "checklistId",
                    e.roster_id as "rosterId",
                    e.notes,
                    e.status,
                    e.created_by_global_user_id as "createdBy",
                    e.created_at as "createdAt",
                    e.updated_at as "updatedAt",
                    e.tenant_id as "tenantId",
                    t.name as "teamName",
                    l.title as "lineupName",
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', r.id,
                                'name', r.name,
                                'kind', r.kind,
                                'location', r.location
                            )
                        ) FILTER (WHERE r.id IS NOT NULL), 
                        '[]'::json
                    ) as resources
                FROM events e
                LEFT JOIN global_users pl ON e.production_lead_global_user_id = pl.id
                LEFT JOIN teams t ON e.team_id = t.id AND t.tenant_id = e.tenant_id
                LEFT JOIN lineups l ON e.lineup_id = l.id AND l.tenant_id = e.tenant_id
                LEFT JOIN bookings b ON e.id = b.event_id AND b.tenant_id = e.tenant_id
                LEFT JOIN resources r ON b.resource_id = r.id AND r.tenant_id = e.tenant_id
                WHERE e.tenant_id = $1 
                  AND e.start_at < $3
                  AND e.end_at > $2
                GROUP BY e.id, t.name, l.title, pl.name
                ORDER BY e.start_at ASC
            `, tenantId, utcRange.start, utcRange.end);

                return {
                    events,
                    meta: {
                        timezone,
                        period: {
                            start: mondayStart.toISOString().split('T')[0],
                            days,
                            utcRange: {
                                start: utcRange.start.toISOString(),
                                end: utcRange.end.toISOString()
                            }
                        }
                    }
                };
            } catch (error) {
                console.error(`[CalendarService] Error fetching calendar week for tenant ${tenantId}:`, error);
                throw error;
            }
        });
    }

    async assignLineup(tenantId: string, eventId: string, lineupId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            try {
                // First verify the event exists
                const event = await tx.$queryRaw`
        SELECT id FROM events WHERE id = ${eventId} AND tenant_id = ${tenantId}
      `;

                if (!Array.isArray(event) || event.length === 0) {
                    return null;
                }

                // Update the event with the lineup
                await tx.$executeRaw`
        UPDATE events 
        SET lineup_id = ${lineupId}, updated_at = NOW()
        WHERE id = ${eventId} AND tenant_id = ${tenantId}
      `;

                // Return the updated event
                return this.findOneEvent(tenantId, eventId);
            } catch (error) {
                throw new ConflictException('Failed to assign lineup to event');
            }
        });
    }


    async countEvents(tenantId: string): Promise<number> {
        return await this.prisma.$transaction(async (tx) => {
            try {
                await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
                const result = await tx.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*) as count
                FROM events
                WHERE tenant_id = ${tenantId}
            `;
                return Number(result[0]?.count || 0);
            } catch (error) {
                console.error('Failed to count events:', error);
                return 0;
            }
        });
    }

    async countUpcomingEvents(tenantId: string): Promise<number> {
        return await this.prisma.$transaction(async (tx) => {
            try {
                await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
                const now = new Date();
                const result = await tx.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*) as count
                FROM events
                WHERE tenant_id = ${tenantId}
                AND start_at >= ${now}
            `;
                return Number(result[0]?.count || 0);
            } catch (error) {
                console.error('Failed to count upcoming events:', error);
                return 0;
            }
        });
    }
}
