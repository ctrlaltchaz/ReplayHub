import { Test } from '@nestjs/testing';
import { IncidentsModule } from './incidents.module';

async function testModuleLoad() {
    try {
        console.log('Testing IncidentsModule loading...');
        const moduleRef = await Test.createTestingModule({
            imports: [IncidentsModule],
        }).compile();

        console.log('✅ IncidentsModule loaded successfully');
        console.log('Controllers:', moduleRef.get(IncidentsModule));
    } catch (error) {
        console.error('❌ Failed to load IncidentsModule:', error.message);
        console.error('Stack:', error.stack);
    }
}

testModuleLoad();
