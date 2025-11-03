import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

// Define enums locally (matching Prisma schema)
export enum FeedbackType {
    BUG = 'BUG',
    SUGGESTION = 'SUGGESTION',
}

export enum FeedbackStatus {
    PENDING = 'PENDING',
    REVIEWING = 'REVIEWING',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    REJECTED = 'REJECTED',
}

export enum FeedbackPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export class CreateFeedbackDto {
    @IsEnum(FeedbackType)
    @IsNotEmpty()
    type: FeedbackType;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    category?: string;

    @IsObject()
    @IsOptional()
    metadata?: {
        browser?: string;
        os?: string;
        screenResolution?: string;
        url?: string;
        module?: string;
        [key: string]: any;
    };

    @IsOptional()
    attachments?: string[];
}

export class UpdateFeedbackDto {
    @IsEnum(FeedbackStatus)
    @IsOptional()
    status?: FeedbackStatus;

    @IsEnum(FeedbackPriority)
    @IsOptional()
    priority?: FeedbackPriority;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    category?: string;
}

export class FilterFeedbackDto {
    @IsEnum(FeedbackType)
    @IsOptional()
    type?: FeedbackType;

    @IsEnum(FeedbackStatus)
    @IsOptional()
    status?: FeedbackStatus;

    @IsEnum(FeedbackPriority)
    @IsOptional()
    priority?: FeedbackPriority;

    @IsString()
    @IsOptional()
    organizationId?: string;

    @IsString()
    @IsOptional()
    userId?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    search?: string;
}

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsBoolean()
    @IsOptional()
    isInternal?: boolean;
}
