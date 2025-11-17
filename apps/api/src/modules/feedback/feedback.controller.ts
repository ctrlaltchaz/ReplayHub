import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { SessionGuard } from '../global-auth/guards/session.guard';
import { CreateFeedbackDto } from './dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
@UseGuards(SessionGuard) // Require global user session
export class FeedbackController {
    constructor(
        private readonly feedbackService: FeedbackService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Submit new feedback (bug report or suggestion)
     * Accessible to all logged-in global users
     * Permission check: feedback.submit (checked at org level if user is in org context)
     */
    @Post('submit')
    @HttpCode(HttpStatus.CREATED)
    async submitFeedback(
        @Req() req: Request,
        @Body() dto: CreateFeedbackDto,
    ) {
        const userId = req.session.userId;

        if (!userId) {
            throw new Error('User not authenticated');
        }

        // Get user details
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Check if user has permission to submit feedback
        // This is a global permission that can be granted at org level
        // For now, we'll allow all authenticated users to submit
        // In the future, you can add permission checks here

        // Extract organization context if present in metadata
        const orgId = dto.metadata?.organizationId as string | undefined;
        let orgName: string | undefined;

        if (orgId) {
            const org = await this.prisma.organisation.findUnique({
                where: { id: orgId },
            });
            orgName = org?.name;
        }

        const submission = await this.feedbackService.submitFeedback(
            userId,
            dto,
            orgId,
            orgName,
        );

        return {
            message: 'Feedback submitted successfully',
            submission,
        };
    }

    /**
     * Get user's own feedback submissions
     * Users can only view their own submissions
     */
    @Get('my-submissions')
    @HttpCode(HttpStatus.OK)
    async getMySubmissions(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const userId = req.session.userId;

        if (!userId) {
            throw new Error('User not authenticated');
        }

        return this.feedbackService.getUserFeedback(
            userId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 10,
        );
    }
}
