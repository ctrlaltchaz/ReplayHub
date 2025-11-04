/**
 * Phase 6 Verification - Runsheets & Checklists MVP
 * Comprehensive test suite for all functionality
 */
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

class Phase6Verifier {
    constructor() {
        this.baseURL = 'http://localhost:3001';
        this.session = null;
        this.prisma = new PrismaClient();
        this.testData = {
            runsheetId: null,
            templateId: null,
            checklistId: null,
            runId: null,
            currentUserId: null
        };
        this.results = {
            runsheetCreation: '❌',
            runsheetItems: '❌',
            runsheetApproval: '❌',
            runsheetLocking: '❌',
            lockedEditBlock: '❌',
            templateCreation: '❌',
            checklistCreation: '❌',
            checklistRunAssignee: '❌',
            checklistRunViewer: '❌',
            rlsPolicies: '❌',
            crossTenantTest: '❌',
            runsheetIntegrity: '❌',
            checklistRuns: '❌',
            timestamps: '❌'
        };
    }

    async login() {
        try {
            const loginResponse = await axios.post(`${this.baseURL}/api/global/auth/login`, {
                email: 'admin@testorg.com',
                password: 'TestPassword123!'
            }, {
                validateStatus: () => true
            });

            if (loginResponse.status !== 200) {
                throw new Error(`Login failed: ${loginResponse.status} - ${JSON.stringify(loginResponse.data)}`);
            }

            const cookies = loginResponse.headers['set-cookie'];
            this.session = axios.create({
                baseURL: `${this.baseURL}/api/org/testorg`,
                withCredentials: true,
                headers: {
                    Cookie: cookies ? cookies.join('; ') : ''
                },
                validateStatus: () => true
            });

            // Get current user ID
            const meResponse = await this.session.get('/auth/me');
            this.testData.currentUserId = meResponse.data.orgUser?.id || meResponse.data.id;

            console.log('🔧 Phase 6 Verification - Runsheets & Checklists MVP');
            console.log('✅ Logged in successfully\n');
            return true;
        } catch (error) {
            console.log('❌ Login failed:', error.message);
            return false;
        }
    }

    async testRunsheetWorkflow() {
        console.log('🧾 A) Runsheet Creation → Approval → Locking');

        try {
            // A.1: Create runsheet
            console.log('Step 1: POST /org/:slug/runsheets');
            const createResponse = await this.session.post('/runsheets', {
                title: 'Phase 6 Test Runsheet',
                eventId: 'event_phase6_test',
                scheduledAt: new Date(Date.now() + 86400000).toISOString()
            });

            if (createResponse.status === 201 && createResponse.data.id && createResponse.data.status === 'draft') {
                this.results.runsheetCreation = '✅';
                this.testData.runsheetId = createResponse.data.id;
                console.log(`✅ Runsheet created: ${createResponse.status}, {id: "${createResponse.data.id}", status: "${createResponse.data.status}"}`);
            } else {
                console.log(`❌ Runsheet creation failed: ${createResponse.status}, ${JSON.stringify(createResponse.data)}`);
                return false;
            }

            // A.2: Add 3 items
            console.log('Step 2: POST /org/:slug/runsheets/:id/items');
            const itemsResponse = await this.session.post(`/runsheets/${this.testData.runsheetId}/items`, {
                items: [
                    { idx: 0, title: 'Setup Stream', ownerId: this.testData.currentUserId, durationMs: 900000, notes: 'Configure OBS' },
                    { idx: 1, title: 'Player Check-in', durationMs: 600000, notes: 'Verify attendance' },
                    { idx: 2, title: 'Tournament Start', durationMs: 300000 }
                ]
            });

            if (itemsResponse.status === 201 && Array.isArray(itemsResponse.data) && itemsResponse.data.length === 3) {
                this.results.runsheetItems = '✅';
                console.log(`✅ Items added: ${itemsResponse.status}, count = ${itemsResponse.data.length}`);
            } else {
                console.log(`❌ Items creation failed: ${itemsResponse.status}, ${JSON.stringify(itemsResponse.data)}`);
                return false;
            }

            // A.3: Approve runsheet
            console.log('Step 3: POST /org/:slug/runsheets/:id/approve');
            const approveResponse = await this.session.post(`/runsheets/${this.testData.runsheetId}/approve`);

            if ([200, 201].includes(approveResponse.status) && approveResponse.data.status === 'approved' && approveResponse.data.revision === 2) {
                this.results.runsheetApproval = '✅';
                console.log(`✅ Runsheet approved: ${approveResponse.status}, status: "${approveResponse.data.status}", revision: ${approveResponse.data.revision}`);
            } else {
                console.log(`❌ Approval failed: ${approveResponse.status}, ${JSON.stringify(approveResponse.data)}`);
                return false;
            }

            // A.4: Lock runsheet
            console.log('Step 4: POST /org/:slug/runsheets/:id/lock');
            const lockResponse = await this.session.post(`/runsheets/${this.testData.runsheetId}/lock`);

            if ([200, 201].includes(lockResponse.status) && lockResponse.data.status === 'locked') {
                this.results.runsheetLocking = '✅';
                console.log(`✅ Runsheet locked: ${lockResponse.status}, status: "${lockResponse.data.status}"`);
            } else {
                console.log(`❌ Locking failed: ${lockResponse.status}, ${JSON.stringify(lockResponse.data)}`);
                return false;
            }

            // A.5: Attempt edit on locked runsheet (should get 409)
            console.log('Step 5: Attempt PUT on locked runsheet');
            const editResponse = await this.session.put(`/runsheets/${this.testData.runsheetId}/items/${itemsResponse.data[0].id}`, {
                title: 'Should not work'
            });

            if (editResponse.status === 409 && editResponse.data.error && editResponse.data.error.toLowerCase().includes('locked')) {
                this.results.lockedEditBlock = '✅';
                console.log(`✅ Locked edit blocked: ${editResponse.status}, error: "${editResponse.data.error}"`);
            } else {
                console.log(`❌ Locked edit not properly blocked: ${editResponse.status}, ${JSON.stringify(editResponse.data)}`);
                return false;
            }

            return true;

        } catch (error) {
            console.log('❌ Runsheet workflow error:', error.message);
            return false;
        }
    }

    async testChecklistWorkflow() {
        console.log('\n✅ B) Checklist Templates → Checklist Run');

        try {
            // B.1: Create template
            console.log('Step 1: POST /org/:slug/checklist-templates');
            const templateResponse = await this.session.post('/checklist-templates', {
                title: 'Stream Setup',
                scope: 'event',
                itemsJson: [
                    { text: 'Check Audio', required: true },
                    { text: 'Check NDI', required: true },
                    { text: 'Check Lighting', required: false }
                ]
            });

            if (templateResponse.status === 201 && templateResponse.data.version === 1) {
                this.results.templateCreation = '✅';
                this.testData.templateId = templateResponse.data.id;
                console.log(`✅ Template created: ${templateResponse.status}, version: ${templateResponse.data.version}`);
            } else {
                console.log(`❌ Template creation failed: ${templateResponse.status}, ${JSON.stringify(templateResponse.data)}`);
                return false;
            }

            // B.2: Create checklist
            console.log('Step 2: POST /org/:slug/checklists');
            const checklistResponse = await this.session.post('/checklists', {
                templateId: this.testData.templateId,
                scopeRef: 'event_phase6_test',
                assigneeId: this.testData.currentUserId,
                dueAt: new Date(Date.now() + 86400000).toISOString()
            });

            if (checklistResponse.status === 201 && checklistResponse.data.templateId === this.testData.templateId && checklistResponse.data.assigneeId === this.testData.currentUserId) {
                this.results.checklistCreation = '✅';
                this.testData.checklistId = checklistResponse.data.id;
                console.log(`✅ Checklist created: ${checklistResponse.status}, links template + assigneeId`);
            } else {
                console.log(`❌ Checklist creation failed: ${checklistResponse.status}, ${JSON.stringify(checklistResponse.data)}`);
                return false;
            }

            // B.3: Run checklist as assignee
            console.log('Step 3: POST /org/:slug/checklists/:id/run (as assignee)');
            const runResponse = await this.session.post(`/checklists/${this.testData.checklistId}/run`, {
                resultJson: [
                    { idx: 0, pass: true, notes: 'ok' },
                    { idx: 1, pass: true },
                    { idx: 2, pass: false, notes: 'needs work' }
                ]
            });

            if (runResponse.status === 201 && runResponse.data.runnerId && runResponse.data.createdAt) {
                this.results.checklistRunAssignee = '✅';
                this.testData.runId = runResponse.data.id;
                console.log(`✅ Checklist run by assignee: ${runResponse.status}, includes runnerId and timestamp`);
            } else {
                console.log(`❌ Checklist run failed: ${runResponse.status}, ${JSON.stringify(runResponse.data)}`);
                return false;
            }

            // B.4: Create another checklist without assignee, try to run (should get 403)
            console.log('Step 4: POST checklist run as non-assignee (expect 403)');
            const checklist2Response = await this.session.post('/checklists', {
                templateId: this.testData.templateId,
                scopeRef: 'event_phase6_test_2'
                // No assigneeId - user not assigned
            });

            const unauthorizedRunResponse = await this.session.post(`/checklists/${checklist2Response.data.id}/run`, {
                resultJson: [
                    { idx: 0, pass: true },
                    { idx: 1, pass: true },
                    { idx: 2, pass: true }
                ]
            });

            if (unauthorizedRunResponse.status === 403) {
                this.results.checklistRunViewer = '✅';
                console.log(`✅ Unauthorized run blocked: ${unauthorizedRunResponse.status}`);
            } else {
                console.log(`❌ Unauthorized run not blocked: ${unauthorizedRunResponse.status}, ${JSON.stringify(unauthorizedRunResponse.data)}`);
                return false;
            }

            return true;

        } catch (error) {
            console.log('❌ Checklist workflow error:', error.message);
            return false;
        }
    }

    async testSecurity() {
        console.log('\n🔒 C) Security & RLS');

        try {
            // C.1: Check RLS policies
            console.log('Step 1: Check RLS policies on all 5 tables');
            const policies = await this.prisma.$queryRaw`
                SELECT tablename, polname, qual
                FROM pg_policies
                WHERE tablename IN ('Runsheet', 'RunsheetItem', 'ChecklistTemplate', 'Checklist', 'ChecklistRun')
                ORDER BY tablename, polname;
            `;

            const expectedTables = ['Runsheet', 'RunsheetItem', 'ChecklistTemplate', 'Checklist', 'ChecklistRun'];
            const tablesWithPolicies = [...new Set(policies.map(p => p.tablename))];
            const allTablesHavePolicies = expectedTables.every(table => tablesWithPolicies.includes(table));
            const allPoliciesHaveTenantFilter = policies.every(p => p.qual && p.qual.includes('tenant_id'));

            if (allTablesHavePolicies && allPoliciesHaveTenantFilter) {
                this.results.rlsPolicies = '✅';
                console.log(`✅ RLS policies active: ${tablesWithPolicies.length}/5 tables with tenant_id filtering`);
            } else {
                console.log(`❌ RLS policies incomplete: ${tablesWithPolicies.length}/5 tables, tenant filtering: ${allPoliciesHaveTenantFilter}`);
                console.log('Policies:', policies.map(p => `${p.tablename}: ${p.polname}`));
                return false;
            }

            // C.2: Cross-tenant test (try to access our checklist with wrong tenant context)
            console.log('Step 2: Cross-tenant isolation test');
            const wrongTenantSession = axios.create({
                baseURL: `${this.baseURL}/api/org/anothertenant`, // Different tenant
                withCredentials: true,
                headers: {
                    Cookie: this.session.defaults.headers.Cookie
                },
                validateStatus: () => true
            });

            const crossTenantResponse = await wrongTenantSession.get(`/checklists/${this.testData.checklistId}`);

            if ([404, 403].includes(crossTenantResponse.status)) {
                this.results.crossTenantTest = '✅';
                console.log(`✅ Cross-tenant blocked: ${crossTenantResponse.status} (no leakage)`);
            } else {
                console.log(`❌ Cross-tenant not blocked: ${crossTenantResponse.status}, ${JSON.stringify(crossTenantResponse.data)}`);
                return false;
            }

            return true;

        } catch (error) {
            console.log('❌ Security test error:', error.message);
            return false;
        }
    }

    async testIntegrity() {
        console.log('\n📊 D) Integrity & Reports');

        try {
            // D.1: Check runsheet integrity
            console.log('Step 1: GET /org/:slug/runsheets/:id');
            const runsheetResponse = await this.session.get(`/runsheets/${this.testData.runsheetId}`);

            if (runsheetResponse.status === 200 &&
                Array.isArray(runsheetResponse.data.items) &&
                runsheetResponse.data.items.length === 3 &&
                runsheetResponse.data.status === 'locked') {
                this.results.runsheetIntegrity = '✅';
                console.log(`✅ Runsheet integrity: items array (len=${runsheetResponse.data.items.length}), status: "${runsheetResponse.data.status}"`);
            } else {
                console.log(`❌ Runsheet integrity failed: ${runsheetResponse.status}, items: ${runsheetResponse.data.items?.length}, status: ${runsheetResponse.data.status}`);
                return false;
            }

            // D.2: Check checklist runs
            console.log('Step 2: GET /org/:slug/checklists/:id/runs');
            const runsResponse = await this.session.get(`/checklists/${this.testData.checklistId}/runs`);

            if (runsResponse.status === 200 &&
                Array.isArray(runsResponse.data) &&
                runsResponse.data.length === 1 &&
                runsResponse.data[0].resultJson) {
                this.results.checklistRuns = '✅';
                console.log(`✅ Checklist runs: list shows ${runsResponse.data.length} entry with pass/fail breakdown`);
            } else {
                console.log(`❌ Checklist runs failed: ${runsResponse.status}, runs: ${runsResponse.data?.length}`);
                return false;
            }

            // D.3: Verify timestamps and tenantId consistency
            console.log('Step 3: Verify database consistency');
            const dbChecks = await Promise.all([
                this.prisma.runsheet.findFirst({
                    where: { id: this.testData.runsheetId },
                    select: { tenantId: true, createdAt: true, updatedAt: true }
                }),
                this.prisma.checklist.findFirst({
                    where: { id: this.testData.checklistId },
                    select: { tenantId: true, createdAt: true, updatedAt: true }
                }),
                this.prisma.checklistRun.findFirst({
                    where: { id: this.testData.runId },
                    select: { tenantId: true, createdAt: true }
                })
            ]);

            const allHaveTenantId = dbChecks.every(item => item && item.tenantId);
            const allHaveTimestamps = dbChecks.every(item => item && item.createdAt);

            if (allHaveTenantId && allHaveTimestamps) {
                this.results.timestamps = '✅';
                console.log(`✅ Database consistency: timestamps and tenantId consistent`);
            } else {
                console.log(`❌ Database consistency failed: tenantId: ${allHaveTenantId}, timestamps: ${allHaveTimestamps}`);
                return false;
            }

            return true;

        } catch (error) {
            console.log('❌ Integrity test error:', error.message);
            return false;
        }
    }

    async generateSummary() {
        console.log('\n🧩 E) Summary');
        console.log('\n| Test | Expected | Result |');
        console.log('|------|----------|---------|');
        console.log(`| Runsheet creation | 201 with draft status | ${this.results.runsheetCreation} |`);
        console.log(`| Add 3 items | 201 with count=3 | ${this.results.runsheetItems} |`);
        console.log(`| Runsheet approval | 200, status:approved, revision:2 | ${this.results.runsheetApproval} |`);
        console.log(`| Runsheet locking | 200, status:locked | ${this.results.runsheetLocking} |`);
        console.log(`| Runsheet lock edit block | 409 on edit | ${this.results.lockedEditBlock} |`);
        console.log(`| Template creation | 201, version:1 | ${this.results.templateCreation} |`);
        console.log(`| Checklist creation | 201, links template+assignee | ${this.results.checklistCreation} |`);
        console.log(`| Checklist run by assignee | 201 | ${this.results.checklistRunAssignee} |`);
        console.log(`| Checklist run by viewer | 403 | ${this.results.checklistRunViewer} |`);
        console.log(`| RLS policies | active on 5 tables | ${this.results.rlsPolicies} |`);
        console.log(`| Cross-tenant isolation | 404/403 | ${this.results.crossTenantTest} |`);
        console.log(`| Runsheet integrity | items array + locked status | ${this.results.runsheetIntegrity} |`);
        console.log(`| Checklist runs | 1 entry with breakdown | ${this.results.checklistRuns} |`);
        console.log(`| Database consistency | timestamps + tenantId | ${this.results.timestamps} |`);

        const passedTests = Object.values(this.results).filter(result => result === '✅').length;
        const totalTests = Object.keys(this.results).length;

        console.log(`\n**Test Results: ${passedTests}/${totalTests} passed**`);

        if (passedTests === totalTests) {
            console.log('\n🎉 **Phase 6 verified: runsheets + checklists fully functional with proper tenant isolation, permissions, and locking.**');
        } else {
            console.log('\n❌ **Phase 6 verification incomplete - some tests failed.**');
        }

        return passedTests === totalTests;
    }

    async cleanup() {
        await this.prisma.$disconnect();
    }
}

// Run the verification
async function runVerification() {
    const verifier = new Phase6Verifier();

    try {
        const loginSuccess = await verifier.login();
        if (!loginSuccess) return;

        await verifier.testRunsheetWorkflow();
        await verifier.testChecklistWorkflow();
        await verifier.testSecurity();
        await verifier.testIntegrity();
        await verifier.generateSummary();

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await verifier.cleanup();
    }
}

runVerification();