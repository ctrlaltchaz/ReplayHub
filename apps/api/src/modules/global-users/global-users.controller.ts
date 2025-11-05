import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../global-auth/guards/session.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GlobalUsersService } from './global-users.service';

@Controller('global/users')
@UseGuards(SessionGuard)
export class GlobalUsersController {
    constructor(private globalUsersService: GlobalUsersService) { }

    @Get('profile')
    async getProfile(@Req() req: Request) {
        try {
            const user = await this.globalUsersService.getUserProfile(req.session.userId!);
            return { user };
        } catch (error) {
            console.error('Error in getUserProfile:', error);
            throw new Error(`Profile fetch failed: ${error.message}\n\nStack: ${error.stack}`);
        }
    }

    @Put('profile')
    async updateProfile(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
        const user = await this.globalUsersService.updateUserProfile(
            req.session.userId!,
            updateProfileDto
        );
        return { user };
    }
}