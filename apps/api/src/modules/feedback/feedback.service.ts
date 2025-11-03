import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateCommentDto,
    CreateFeedbackDto,
    FeedbackStatus,
    FilterFeedbackDto,
    UpdateFeedbackDto,
} from './dto';

@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService) { }

    /**
     * Submit new feedback (bug report or suggestion)
     * Called by normal users with feedback.submit permission
     */
    async submitFeedback(
        userId: string,
        dto: CreateFeedbackDto,
        organizationId?: string,
        organizationName?: string,
    ) {
        return this.prisma.feedbackSubmission.create({
            data: {
                type: dto.type,
                title: dto.title,
                description: dto.description,
                category: dto.category,
                metadata: dto.metadata || {},
                attachments: dto.attachments || [],
                userId,
                organizationId,
                organizationName,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * List all feedback submissions
     * Only for global admins
     */
    async listFeedback(
        page = 1,
        limit = 20,
        filters?: FilterFeedbackDto,
    ) {
        const where: any = {};

        if (filters) {
            if (filters.type) where.type = filters.type;
            if (filters.status) where.status = filters.status;
            if (filters.priority) where.priority = filters.priority;
            if (filters.organizationId) where.organizationId = filters.organizationId;
            if (filters.userId) where.userId = filters.userId;
            if (filters.category) where.category = filters.category;
            if (filters.search) {
                where.OR = [
                    { title: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
        }

        const [submissions, total] = await Promise.all([
            this.prisma.feedbackSubmission.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [
                    { status: 'asc' }, // New items first
                    { priority: 'desc' }, // Higher priority first
                    { createdAt: 'desc' },
                ],
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    comments: {
                        include: {
                            admin: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'asc' },
                    },
                },
            }),
            this.prisma.feedbackSubmission.count({ where }),
        ]);

        return {
            submissions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get feedback submission by ID
     * Only for global admins
     */
    async getFeedback(id: string) {
        const submission = await this.prisma.feedbackSubmission.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                comments: {
                    include: {
                        admin: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!submission) {
            throw new NotFoundException('Feedback submission not found');
        }

        return submission;
    }

    /**
     * Update feedback submission (status, priority, category)
     * Only for global admins
     */
    async updateFeedback(id: string, dto: UpdateFeedbackDto) {
        const submission = await this.prisma.feedbackSubmission.findUnique({
            where: { id },
        });

        if (!submission) {
            throw new NotFoundException('Feedback submission not found');
        }

        return this.prisma.feedbackSubmission.update({
            where: { id },
            data: {
                status: dto.status as FeedbackStatus,
                priority: dto.priority,
                category: dto.category,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * Add comment to feedback submission
     * Only for global admins
     */
    async addComment(
        submissionId: string,
        adminId: string,
        dto: CreateCommentDto,
    ) {
        const submission = await this.prisma.feedbackSubmission.findUnique({
            where: { id: submissionId },
        });

        if (!submission) {
            throw new NotFoundException('Feedback submission not found');
        }

        return this.prisma.feedbackComment.create({
            data: {
                submissionId,
                adminId,
                content: dto.content,
                isInternal: dto.isInternal || false,
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * Get user's own feedback submissions
     * Users can only view their own submissions
     */
    async getUserFeedback(userId: string, page = 1, limit = 10) {
        const [submissions, total] = await Promise.all([
            this.prisma.feedbackSubmission.findMany({
                where: { userId },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    comments: {
                        where: { isInternal: false }, // Only show non-internal comments to users
                        include: {
                            admin: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'asc' },
                    },
                },
            }),
            this.prisma.feedbackSubmission.count({ where: { userId } }),
        ]);

        return {
            submissions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get statistics for admin overview
     */
    async getStatistics() {
        const [
            totalSubmissions,
            openBugs,
            pendingSuggestions,
            resolvedThisWeek,
        ] = await Promise.all([
            this.prisma.feedbackSubmission.count(),
            this.prisma.feedbackSubmission.count({
                where: {
                    type: 'BUG',
                    status: { in: [FeedbackStatus.PENDING, FeedbackStatus.REVIEWING, FeedbackStatus.IN_PROGRESS] },
                },
            }),
            this.prisma.feedbackSubmission.count({
                where: {
                    type: 'SUGGESTION',
                    status: { in: [FeedbackStatus.PENDING, FeedbackStatus.REVIEWING] },
                },
            }),
            this.prisma.feedbackSubmission.count({
                where: {
                    status: FeedbackStatus.RESOLVED,
                    updatedAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);

        return {
            totalSubmissions,
            openBugs,
            pendingSuggestions,
            resolvedThisWeek,
        };
    }
}
