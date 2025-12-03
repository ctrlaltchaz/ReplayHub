import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    getHealth(): { status: string; timestamp: string; auth: boolean } {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            auth: true, // Indicates auth module is loaded
        };
    }
}
