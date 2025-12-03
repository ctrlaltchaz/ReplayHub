import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../database/prisma.service';
import { QueryReportsDto } from '../dto/incidents.dto';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let mockTx: ReturnType<typeof createMockTransaction>;

  const createMockTransaction = () => ({
    $executeRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    incident: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    event: {
      findFirst: jest.fn(),
    },
  });

  const mockPrismaService = {
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    mockTx = createMockTransaction();
    mockPrismaService.$transaction.mockImplementation(async (callback) => callback(mockTx));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getIncidentReport', () => {
    const mockTenantId = 'tenant-123';
    const mockQueryDto: QueryReportsDto = {
      from: '2024-12-01',
      to: '2024-12-31',
    };

    it('should handle null/undefined dates with default values', async () => {
      const emptyQuery: QueryReportsDto = {};

      mockTx.$executeRaw.mockResolvedValue(undefined);
      mockTx.incident.count.mockResolvedValue(5);
      mockTx.incident.groupBy.mockResolvedValue([
        { category: 'tech', severity: 'high', status: 'open', _count: { _all: 2 } },
        { category: 'comms', severity: 'medium', status: 'resolved', _count: { _all: 3 } },
      ]);
      mockTx.$queryRawUnsafe.mockResolvedValue([
        { tag: 'urgent', count: BigInt(2) },
        { tag: 'network', count: BigInt(1) },
      ]);

      const result = await service.getIncidentReport(mockTenantId, emptyQuery);

      expect(result).toBeDefined();
      expect(result.totalIncidents).toBe(5);
      expect(result.dateRange.from).toBeDefined(); // Should have default dates
      expect(result.dateRange.to).toBeDefined();
      expect(mockTx.$executeRaw).toHaveBeenCalled(); // Sets tenant context
    });

    it('should validate date range and throw BadRequest for invalid ranges', async () => {
      const invalidQuery: QueryReportsDto = {
        from: '2024-12-31',
        to: '2024-12-01', // to date before from date
      };

      await expect(service.getIncidentReport(mockTenantId, invalidQuery))
        .rejects.toThrow(BadRequestException);
    });

    it('should validate event exists when eventId is provided', async () => {
      const queryWithEvent: QueryReportsDto = {
        from: '2024-12-01',
        to: '2024-12-31',
        eventId: 'non-existent-event',
      };

      mockTx.$executeRaw.mockResolvedValue(undefined);
      mockTx.event.findFirst.mockResolvedValue(null); // Event not found

      await expect(service.getIncidentReport(mockTenantId, queryWithEvent))
        .rejects.toThrow(NotFoundException);
    });

    it('should process grouped data correctly and convert bigint to number', async () => {
      mockTx.$executeRaw.mockResolvedValue(undefined);
      mockTx.incident.count.mockResolvedValue(10);
      mockTx.incident.groupBy.mockResolvedValue([
        { category: 'tech', severity: 'critical', status: 'open', _count: { _all: 5 } },
        { category: 'comms', severity: 'medium', status: 'resolved', _count: { _all: 3 } },
      ]);
      mockTx.$queryRawUnsafe.mockResolvedValue([
        { tag: 'priority', count: BigInt(4) },
        { tag: 'maintenance', count: BigInt(2) },
      ]);

      const result = await service.getIncidentReport(mockTenantId, mockQueryDto);

      expect(result.totalIncidents).toBe(10);
      expect(result.byCategory.tech).toBe(5);
      expect(result.byCategory.comms).toBe(3);
      expect(result.bySeverity.critical).toBe(5);
      expect(result.bySeverity.medium).toBe(3);
      expect(result.topTags).toHaveLength(2);
      expect(typeof result.topTags[0].count).toBe('number'); // Converted from bigint
      expect(result.topTags[0].count).toBe(4);
    });

    it('should use UTC timezone boundaries for date handling', async () => {
      mockTx.$executeRaw.mockResolvedValue(undefined);
      mockTx.incident.count.mockResolvedValue(0);
      mockTx.incident.groupBy.mockResolvedValue([]);
      mockTx.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.getIncidentReport(mockTenantId, mockQueryDto);

      // Check that returned dates are in ISO format (UTC)
      expect(result.dateRange.from).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/);
      expect(result.dateRange.to).toMatch(/^\d{4}-\d{2}-\d{2}T23:59:59\.999Z$/);
    });

    it('should handle SQL injection safely with parameterized queries', async () => {
      const maliciousQuery: QueryReportsDto = {
        from: '2024-12-01',
        to: '2024-12-31',
        category: "'; DROP TABLE incidents; --" as any,
      };

      mockTx.$executeRaw.mockResolvedValue(undefined);
      mockTx.incident.count.mockResolvedValue(0);
      mockTx.incident.groupBy.mockResolvedValue([]);
      mockTx.$queryRawUnsafe.mockResolvedValue([]);

      // Should not throw and should use parameterized query
      const result = await service.getIncidentReport(mockTenantId, maliciousQuery);

      // Verify parameterized query was used safely
      expect(mockTx.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('$1'), // First parameter placeholder
        expect.any(Date), // fromUtc
        expect.any(Date), // toUtc  
        maliciousQuery.category // category parameter
      );
    });
  });
});
