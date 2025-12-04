import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface CrewGroupDto {
    name: string;
    description?: string;
    displayOrder: number;
    icon?: string;
}

@Injectable()
export class CrewGroupsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(organizationId: string) {
        const result = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT ON (name) 
        id,
        name,
        description,
        display_order as "displayOrder",
        icon
      FROM event_crew_template_groups
      WHERE template_id IN (
        SELECT id FROM event_crew_templates
        WHERE tenant_id = ${organizationId}::text
      )
      ORDER BY name, display_order
    `;

        return result;
    }

    async create(organizationId: string, dto: CrewGroupDto) {
        // For now, we'll create a "system" template to hold standalone groups
        // First, check if a system template exists
        let systemTemplate = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM event_crew_templates
      WHERE tenant_id = ${organizationId}::text
      AND name = '_system_groups'
      LIMIT 1
    `;

        let templateId: string;

        if (systemTemplate.length === 0) {
            // Create system template
            const result = await this.prisma.$queryRaw<any[]>`
        INSERT INTO event_crew_templates (tenant_id, name, description, is_default, created_by)
        VALUES (
          ${organizationId}::text,
          '_system_groups',
          'System template for standalone crew groups',
          false,
          NULL
        )
        RETURNING id
      `;
            templateId = result[0].id;
        } else {
            templateId = systemTemplate[0].id;
        }

        // Create the group
        const result = await this.prisma.$queryRaw<any[]>`
      INSERT INTO event_crew_template_groups (template_id, name, description, display_order, icon)
      VALUES (
        ${templateId}::text,
        ${dto.name},
        ${dto.description || null},
        ${dto.displayOrder},
        ${dto.icon || null}
      )
      RETURNING id, name, description, display_order as "displayOrder", icon
    `;

        return result[0];
    }

    async update(organizationId: string, groupId: string, dto: CrewGroupDto) {
        // Update all groups with the same name across all templates in this org
        const result = await this.prisma.$queryRaw<any[]>`
      UPDATE event_crew_template_groups
      SET 
        name = ${dto.name},
        description = ${dto.description || null},
        display_order = ${dto.displayOrder},
        icon = ${dto.icon || null}
      WHERE id = ${groupId}::text
      AND template_id IN (
        SELECT id FROM event_crew_templates
        WHERE tenant_id = ${organizationId}::text
      )
      RETURNING id, name, description, display_order as "displayOrder", icon
    `;

        if (result.length === 0) {
            throw new NotFoundException('Group not found');
        }

        return result[0];
    }

    async delete(organizationId: string, groupId: string) {
        // Check if group has members
        const members = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM event_crew_template_members
      WHERE group_id = ${groupId}::text
      LIMIT 1
    `;

        if (members.length > 0) {
            throw new Error('Cannot delete group with assigned members. Remove members first.');
        }

        // Delete the group
        const result = await this.prisma.$queryRaw<any[]>`
      DELETE FROM event_crew_template_groups
      WHERE id = ${groupId}::text
      AND template_id IN (
        SELECT id FROM event_crew_templates
        WHERE tenant_id = ${organizationId}::text
      )
      RETURNING id
    `;

        if (result.length === 0) {
            throw new NotFoundException('Group not found');
        }

        return { success: true };
    }
}
