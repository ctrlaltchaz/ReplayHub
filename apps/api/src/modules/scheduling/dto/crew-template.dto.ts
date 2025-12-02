import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CrewTemplateMemberDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  orgUserId: string;

  @ApiProperty({ description: 'Role in the crew/talent', example: 'host' })
  @IsString()
  @IsNotEmpty()
  role: string;

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

export class CrewTemplateResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    id: string;
    orgUserId: string;
    role: string;
    notes: string | null;
    user?: {
      id: string;
      displayName: string;
      email: string;
    };
  }>;
}
