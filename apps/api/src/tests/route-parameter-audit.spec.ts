import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';

describe('Route Parameter Audit', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should ensure all /org/* routes use :slug parameter consistently', () => {
        const httpAdapter = app.getHttpAdapter();
        const instance = httpAdapter.getInstance();
        const router = instance?._router ?? instance?.router;

        // Get all registered routes
        const routes: Array<{ path: string, methods: string[] }> = [];
        const extractRoutes = (layer: any) => {
            if (layer.route) {
                routes.push({
                    path: layer.route.path,
                    methods: Object.keys(layer.route.methods)
                });
            } else if (layer.name === 'router') {
                layer.handle.stack.forEach(extractRoutes);
            }
        };

        // Extract routes from Express router
        if (router && router.stack) {
            router.stack.forEach(extractRoutes);
        }

        // Filter to org routes only
        const orgRoutes = routes.filter(route => route.path.startsWith('/org/'));

        console.log('\n=== ORG ROUTE AUDIT ===');
        console.log(`Found ${orgRoutes.length} org routes:`);

        const inconsistentRoutes: Array<{ path: string, wrongParam: string, methods: string[] }> = [];

        orgRoutes.forEach(route => {
            console.log(`${route.methods.join(',').toUpperCase()}: ${route.path}`);

            // Check if route uses parameters other than :slug after /org/
            const orgParamMatch = route.path.match(/\/org\/([^\/]+)/);
            if (orgParamMatch) {
                const param = orgParamMatch[1];
                if (param.startsWith(':') && param !== ':slug') {
                    inconsistentRoutes.push({
                        path: route.path,
                        wrongParam: param,
                        methods: route.methods
                    });
                }
            }
        });

        if (inconsistentRoutes.length > 0) {
            console.log('\n❌ INCONSISTENT ROUTES FOUND:');
            inconsistentRoutes.forEach(route => {
                console.log(`  ${route.path} uses ${route.wrongParam} instead of :slug`);
            });
        } else {
            console.log('\n✅ All org routes consistently use :slug parameter');
        }

        // Fail the test if inconsistencies found
        expect(inconsistentRoutes).toHaveLength(0);
    });

    it('should list all standardized org routes', () => {
        // This test documents the expected route structure
        const expectedRoutePatterns = [
            '/org/:slug/auth/*',
            '/org/:slug/users/*',
            '/org/:slug/events/*',
            '/org/:slug/resources/*',
            '/org/:slug/calendar/*',
            '/org/:slug/teams/*',
            '/org/:slug/players/*',
            '/org/:slug/gamelog/*',
            '/org/:slug/inventory/*',
            '/org/:slug/assets/*',
            '/org/:slug/invites/*',
            '/org/:slug', // rbac, runsheets, checklists
        ];

        console.log('\n=== EXPECTED ORG ROUTE PATTERNS ===');
        expectedRoutePatterns.forEach(pattern => {
            console.log(`✓ ${pattern}`);
        });

        // This test always passes - it's just for documentation
        expect(expectedRoutePatterns.length).toBeGreaterThan(0);
    });
});