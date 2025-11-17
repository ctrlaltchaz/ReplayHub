import { AuditLogRecord, PaginatedAuditLogs } from '../../../common/audit/audit.service';

export interface AuditLogResponseDto extends AuditLogRecord { }

export interface PaginatedAuditLogResponseDto {
    data: AuditLogResponseDto[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AuditLogStatisticsResponse {
    total: number;
    since: Date;
    byAction: Array<{ action: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
}

export function toPaginatedResponse(result: PaginatedAuditLogs): PaginatedAuditLogResponseDto {
    return {
        data: result.logs,
        meta: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
    };
}
