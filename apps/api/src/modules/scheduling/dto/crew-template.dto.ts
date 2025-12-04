import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CrewTemplateGroupDto {
  @ApiProperty({ description: 'Group name', example: 'Production Team' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Group description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class CrewTemplateMemberDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  orgUserId: string;

  @ApiPropertyOptional({ description: 'Group ID (optional if adding to existing group)' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCrewTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Set as default template', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'List of crew groups', type: [CrewTemplateGroupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrewTemplateGroupDto)
  groups: CrewTemplateGroupDto[];

  @ApiProperty({ description: 'List of crew/talent members', type: [CrewTemplateMemberDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrewTemplateMemberDto)
  members: CrewTemplateMemberDto[];
}

export class UpdateCrewTemplateDto {
  @ApiPropertyOptional({ description: 'Template name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Set as default template' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'List of crew groups',
    type: [CrewTemplateGroupDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrewTemplateGroupDto)
  groups?: CrewTemplateGroupDto[];

  @ApiPropertyOptional({
    description: 'List of crew/talent members',
    type: [CrewTemplateMemberDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrewTemplateMemberDto)
  members?: CrewTemplateMemberDto[];
}

export class ApplyTemplateToEventDto {
  @ApiProperty({ description: 'Template ID to apply' })
  @IsString()
  @IsNotEmpty()
  templateId: string;
}

export class CrewTemplateGroupResponse {
  id: string;
  templateId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    id: string;
    orgUserId: string;
    notes: string | null;
    user?: {
      id: string;
      displayName: string;
      email: string;
    };
  }>;
}

export class CrewTemplateResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  groups: CrewTemplateGroupResponse[];
}
