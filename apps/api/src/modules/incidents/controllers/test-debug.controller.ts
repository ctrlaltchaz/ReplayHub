import { Controller, Get } from '@nestjs/common';

@Controller('incidents-module-test')
export class TestDebugController {
    @Get('ping')
    ping() {
        console.log('[TestDebugController] Ping called successfully!');
        return { message: 'IncidentsModule is loaded and working', timestamp: new Date().toISOString() };
    }
}
