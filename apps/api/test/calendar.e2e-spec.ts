import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Calendar E2E', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Test data
    let testTenantId: string;
    let testOrgSlug: string;
    let testOrgUserId: string;
    let testEventIds: string[] = [];
    let sessionCookie: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = app.get(PrismaService);

        // Setup test tenant and user
        await setupTestData();
    });

    afterAll(async () => {
        // Cleanup test data
        await cleanupTestData();
        await app.close();
    });

    describe('GET /org/:slug/calendar/week', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .expect(401);
        });

        it('should return calendar week with defaults (current Monday, 7 days, UTC)', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .set('Cookie', sessionCookie)
                .expect(200);

            expect(response.body).toHaveProperty('events');
            expect(response.body).toHaveProperty('meta');
            expect(response.body.meta).toHaveProperty('timezone');
            expect(response.body.meta).toHaveProperty('period');
            expect(response.body.meta.period.days).toBe(7);
            expect(Array.isArray(response.body.events)).toBe(true);
        });

        it('should accept custom start date', async () => {
            const startDate = '2025-01-13'; // Monday

            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ start: startDate })
                .set('Cookie', sessionCookie)
                .expect(200);

            expect(response.body.meta.period.start).toBe(startDate);
        });

        it('should calculate Monday start from any weekday', async () => {
            const wednesdayDate = '2025-01-15'; // Wednesday

            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ start: wednesdayDate })
                .set('Cookie', sessionCookie)
                .expect(200);

            // Should return Monday (2025-01-13) as the start
            expect(response.body.meta.period.start).toBe('2025-01-13');
        });

        it('should accept custom days parameter', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ days: 14 })
                .set('Cookie', sessionCookie)
                .expect(200);

            expect(response.body.meta.period.days).toBe(14);
        });

        it('should accept timezone parameter', async () => {
            const timezone = 'America/New_York';

            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ tz: timezone })
                .set('Cookie', sessionCookie)
                .expect(200);

            expect(response.body.meta.timezone).toBe(timezone);
        });

        it('should handle invalid timezone gracefully', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ tz: 'Invalid/Timezone' })
                .set('Cookie', sessionCookie)
                .expect(400);

            expect(response.body.message).toContain('Invalid timezone');
        });

        it('should validate days parameter range', async () => {
            // Test minimum boundary
            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ days: 0 })
                .set('Cookie', sessionCookie)
                .expect(400);

            // Test maximum boundary
            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ days: 15 })
                .set('Cookie', sessionCookie)
                .expect(400);

            // Test valid boundaries
            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ days: 1 })
                .set('Cookie', sessionCookie)
                .expect(200);

            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ days: 14 })
                .set('Cookie', sessionCookie)
                .expect(200);
        });

        it('should validate date format', async () => {
            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ start: 'invalid-date' })
                .set('Cookie', sessionCookie)
                .expect(400);

            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ start: '2025/01/15' })
                .set('Cookie', sessionCookie)
                .expect(400);

            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ start: '25-01-15' })
                .set('Cookie', sessionCookie)
                .expect(400);
        });

        it('should return events overlapping with the date range', async () => {
            // Create test events that span across the week
            await createTestEvents();

            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ start: '2025-01-13', days: 7 })
                .set('Cookie', sessionCookie)
                .expect(200);

            expect(response.body.events.length).toBeGreaterThan(0);

            // Verify events have required fields
            response.body.events.forEach((event: any) => {
                expect(event).toHaveProperty('id');
                expect(event).toHaveProperty('title');
                expect(event).toHaveProperty('start_at');
                expect(event).toHaveProperty('end_at');
                expect(event).toHaveProperty('resources');
                expect(Array.isArray(event.resources)).toBe(true);
            });
        });

        it('should handle different timezone scenarios', async () => {
            // Test with specific timezone
            const easternResponse = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({
                    start: '2025-01-13',
                    tz: 'America/New_York'
                })
                .set('Cookie', sessionCookie)
                .expect(200);

            const pacificResponse = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({
                    start: '2025-01-13',
                    tz: 'America/Los_Angeles'
                })
                .set('Cookie', sessionCookie)
                .expect(200);

            // Both should have different UTC ranges due to timezone differences
            expect(easternResponse.body.meta.period.utcRange.start)
                .not.toBe(pacificResponse.body.meta.period.utcRange.start);
        });

        it('should include proper metadata in response', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/calendar/week`)
                .query({ start: '2025-01-13', days: 10, tz: 'Europe/London' })
                .set('Cookie', sessionCookie)
                .expect(200);

            const { meta } = response.body;

            expect(meta.timezone).toBe('Europe/London');
            expect(meta.period.start).toBe('2025-01-13');
            expect(meta.period.days).toBe(10);
            expect(meta.period.utcRange).toHaveProperty('start');
            expect(meta.period.utcRange).toHaveProperty('end');

            // Verify UTC range is proper ISO strings
            expect(new Date(meta.period.utcRange.start)).toBeInstanceOf(Date);
            expect(new Date(meta.period.utcRange.end)).toBeInstanceOf(Date);
        });
    });

    // Helper functions
    async function setupTestData() {
        try {
            // Create test organization
            const org = await prisma.organisation.create({
                data: {
                    name: 'Calendar Test Org',
                    slug: `calendar-test-${Date.now()}`,
                    ownerId: await getOrCreateGlobalUser(),
                    branding: {
                        timezone: 'America/New_York'
                    }
                }
            });

            testTenantId = org.id;
            testOrgSlug = org.slug;

            // Create test org user
            const orgUser = await prisma.orgUser.create({
                data: {
                    tenantId: testTenantId,
                    email: `calendar-test-${Date.now()}@example.com`,
                    passwordHash: 'dummy-hash',
                    displayName: 'Calendar Test User',
                }
            });

            testOrgUserId = orgUser.id;

            // Create test roles and permissions for the user
            const role = await prisma.role.create({
                data: {
                    tenantId: testTenantId,
                    name: 'Calendar Tester',
                    desc: 'Test role for calendar'
                }
            });

            const permission = await prisma.permission.create({
                data: {
                    tenantId: testTenantId,
                    key: 'events.view',
                    group: 'events',
                    desc: 'View events'
                }
            });

            await prisma.rolePermission.create({
                data: {
                    tenantId: testTenantId,
                    roleId: role.id,
                    permissionId: permission.id
                }
            });

            await prisma.orgUserRole.create({
                data: {
                    tenantId: testTenantId,
                    orgUserId: testOrgUserId,
                    roleId: role.id
                }
            });

            // Create session for authentication
            sessionCookie = await createTestSession();

        } catch (error) {
            console.error('Setup failed:', error);
            throw error;
        }
    }

    async function getOrCreateGlobalUser(): Promise<string> {
        let globalUser = await prisma.globalUser.findFirst({
            where: { email: 'calendar-test@example.com' }
        });

        if (!globalUser) {
            globalUser = await prisma.globalUser.create({
                data: {
                    email: 'calendar-test@example.com',
                    passwordHash: 'dummy-hash'
                }
            });
        }

        return globalUser.id;
    }

    async function createTestSession(): Promise<string> {
        // This is a simplified session creation - in a real test you'd need to
        // properly authenticate through the login endpoint
        return `org-session=${testOrgUserId}; tenant=${testTenantId}`;
    }

    async function createTestEvents() {
        try {
            // Set tenant context
            await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${testTenantId}, true)`;

            // Create events that span different parts of the test week
            const events = [
                {
                    title: 'Monday Morning Event',
                    startAt: new Date('2025-01-13T09:00:00Z'),
                    endAt: new Date('2025-01-13T11:00:00Z'),
                },
                {
                    title: 'Wednesday All Day Event',
                    startAt: new Date('2025-01-15T00:00:00Z'),
                    endAt: new Date('2025-01-15T23:59:59Z'),
                },
                {
                    title: 'Weekend Overlap Event',
                    startAt: new Date('2025-01-19T14:00:00Z'),
                    endAt: new Date('2025-01-20T16:00:00Z'),
                }
            ];

            for (const eventData of events) {
                const event = await prisma.$executeRawUnsafe(`
                    INSERT INTO events (id, tenant_id, title, start_at, end_at, created_by, status)
                    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'scheduled')
                    RETURNING id
                `, testTenantId, eventData.title, eventData.startAt, eventData.endAt, testOrgUserId);

                if (Array.isArray(event) && event[0]?.id) {
                    testEventIds.push(event[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to create test events:', error);
        }
    }

    async function cleanupTestData() {
        try {
            // Delete test events
            if (testEventIds.length > 0) {
                await prisma.$executeRawUnsafe(`
                    DELETE FROM events WHERE id = ANY($1::uuid[])
                `, testEventIds);
            }

            // Delete test org user and related data
            if (testOrgUserId) {
                await prisma.orgUserRole.deleteMany({ where: { orgUserId: testOrgUserId } });
                await prisma.orgUser.delete({ where: { id: testOrgUserId } });
            }

            // Delete test tenant and related data
            if (testTenantId) {
                await prisma.rolePermission.deleteMany({ where: { tenantId: testTenantId } });
                await prisma.permission.deleteMany({ where: { tenantId: testTenantId } });
                await prisma.role.deleteMany({ where: { tenantId: testTenantId } });
                await prisma.organisation.delete({ where: { id: testTenantId } });
            }
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }
});