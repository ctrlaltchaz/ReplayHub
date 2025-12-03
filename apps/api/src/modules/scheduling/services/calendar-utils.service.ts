import { Injectable } from '@nestjs/common';
import { TenantService } from '../../../common/tenant/tenant.service';

@Injectable()
export class CalendarUtilsService {
    constructor(private readonly tenantService: TenantService) { }

    /**
     * Resolves timezone from parameters or tenant branding, with UTC fallback
     */
    async resolveTimezone(tenantId: string, tzParam?: string): Promise<string> {
        // Use parameter timezone if provided and valid
        if (tzParam && this.isValidTimezone(tzParam)) {
            return tzParam;
        }

        // Fall back to tenant branding timezone
        try {
            const branding = await this.tenantService.getTenantBranding(tenantId);
            const tenantTimezone = branding?.timezone;

            if (tenantTimezone && this.isValidTimezone(tenantTimezone)) {
                return tenantTimezone;
            }
        } catch (error) {
            console.warn(`[CalendarUtils] Could not fetch tenant branding for ${tenantId}:`, error.message);
        }

        // Default to UTC
        return 'UTC';
    }

    /**
     * Validates IANA timezone identifier
     */
    private isValidTimezone(timezone: string): boolean {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: timezone });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Calculates Monday start of week for a given date in specified timezone
     */
    getMondayStartOfWeek(dateStr?: string, timezone: string = 'UTC'): Date {
        let date: Date;

        if (dateStr) {
            // Parse YYYY-MM-DD format
            const parsed = new Date(dateStr + 'T00:00:00');
            if (isNaN(parsed.getTime())) {
                throw new Error('Invalid date format. Expected YYYY-MM-DD.');
            }
            date = parsed;
        } else {
            // Use current date in the specified timezone
            date = new Date();
        }

        // Convert to timezone-specific date components
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const parts = formatter.formatToParts(date);
        const year = parseInt(parts.find(p => p.type === 'year')!.value);
        const month = parseInt(parts.find(p => p.type === 'month')!.value) - 1; // 0-indexed
        const day = parseInt(parts.find(p => p.type === 'day')!.value);

        // Create date in the target timezone
        const localDate = new Date(year, month, day);

        // Calculate days to Monday (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = localDate.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday adjustment

        // Get Monday's date
        const monday = new Date(localDate);
        monday.setDate(localDate.getDate() + daysToMonday);

        return monday;
    }

    /**
     * Converts local timezone date range to UTC for database queries
     * Handles DST transitions properly
     */
    convertToUtcRange(startDate: Date, days: number, timezone: string): { start: Date; end: Date } {
        // Create start time at midnight in local timezone
        const startTime = this.createTimezoneDate(startDate, '00:00:00', timezone);

        // Calculate end date
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);

        // Create end time at midnight in local timezone
        const endTime = this.createTimezoneDate(endDate, '00:00:00', timezone);

        return {
            start: startTime,
            end: endTime
        };
    }

    /**
     * Creates a Date object for a specific time in a given timezone
     */
    private createTimezoneDate(date: Date, time: string, timezone: string): Date {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Create ISO string in local timezone format
        const isoString = `${year}-${month}-${day}T${time}`;

        // Parse as if it's in the specified timezone
        // Note: This is a simplified approach. For production, consider using a library like date-fns-tz
        const tempDate = new Date(isoString);

        // Get timezone offset for the date
        const utcDate = new Date(tempDate.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(tempDate.toLocaleString('en-US', { timeZone: timezone }));
        const offset = utcDate.getTime() - tzDate.getTime();

        return new Date(tempDate.getTime() + offset);
    }

    /**
     * Formats date for logging/debugging
     */
    formatDateForLog(date: Date, timezone?: string): string {
        if (timezone) {
            return date.toLocaleString('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });
        }
        return date.toISOString();
    }
}
