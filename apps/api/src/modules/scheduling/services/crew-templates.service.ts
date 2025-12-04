import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateCrewTemplateDto,
  CrewTemplateResponse,
  UpdateCrewTemplateDto,
} from '../dto/crew-template.dto';

@Injectable()
export class CrewTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(
    organizationId: string,
    userId: string,
    data: CreateCrewTemplateDto
  ): Promise<CrewTemplateResponse> {
    // Check if template name already exists for this org
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM event_crew_templates 
      WHERE tenant_id = ${organizationId} 
      AND name = ${data.name}
    `;

    if (existing.length > 0) {
      throw new ConflictException(`Template with name "${data.name}" already exists`);
    }

    // If this is being set as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.$executeRaw`
        UPDATE event_crew_templates 
        SET is_default = false 
        WHERE tenant_id = ${organizationId}
      `;
    }

    // Verify userId exists in org_users or set to null
    const validUser = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM org_users WHERE id = ${userId} AND tenant_id = ${organizationId}
    `;
    const createdBy = validUser.length > 0 ? userId : null;

    // Create template
    const template = await this.prisma.$queryRaw<any[]>`
      INSERT INTO event_crew_templates (tenant_id, name, description, is_default, created_by)
      VALUES (${organizationId}, ${data.name}, ${data.description || null}, ${data.isDefault || false}, ${createdBy})
      RETURNING id, tenant_id, name, description, is_default, created_by, created_at, updated_at
    `;

    const templateId = template[0].id;

    // Create groups and track their IDs
    const groupIdMap = new Map<number, string>(); // index -> groupId
    if (data.groups && data.groups.length > 0) {
      for (let i = 0; i < data.groups.length; i++) {
        const group = data.groups[i];
        const groupResult = await this.prisma.$queryRaw<any[]>`
          INSERT INTO event_crew_template_groups (template_id, name, description, display_order)
          VALUES (${templateId}, ${group.name}, ${group.description || null}, ${group.displayOrder || i})
          RETURNING id
        `;
        groupIdMap.set(i, groupResult[0].id);
      }
    }

    // Add members
    if (data.members && data.members.length > 0) {
      for (const member of data.members) {
        await this.prisma.$executeRaw`
          INSERT INTO event_crew_template_members (template_id, org_user_id, group_id, notes)
          VALUES (${templateId}, ${member.orgUserId}, ${member.groupId || null}, ${member.notes || null})
        `;
      }
    }

    return this.findOne(organizationId, templateId);
  }

  async findAll(organizationId: string): Promise<CrewTemplateResponse[]> {
    const templates = await this.prisma.$queryRaw<any[]>`
      SELECT 
        t.id,
        t.tenant_id,
        t.name,
        t.description,
        t.is_default,
        t.created_by,
        t.created_at,
        t.updated_at
      FROM event_crew_templates t
      WHERE t.tenant_id = ${organizationId}
      ORDER BY t.is_default DESC, t.name ASC
    `;

    const result: CrewTemplateResponse[] = [];
    for (const template of templates) {
      const fullTemplate = await this.findOne(organizationId, template.id);
      result.push(fullTemplate);
    }

    return result;
  }

  async findOne(organizationId: string, id: string): Promise<CrewTemplateResponse> {
    const templates = await this.prisma.$queryRaw<any[]>`
      SELECT 
        t.id,
        t.tenant_id,
        t.name,
        t.description,
        t.is_default,
        t.created_by,
        t.created_at,
        t.updated_at
      FROM event_crew_templates t
      WHERE t.id = ${id} AND t.tenant_id = ${organizationId}
    `;

    if (templates.length === 0) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    const template = templates[0];

    // Get groups with their members
    const groups = await this.prisma.$queryRaw<any[]>`
      SELECT 
        g.id,
        g.template_id,
        g.name,
        g.description,
        g.display_order,
        g.created_at,
        g.updated_at
      FROM event_crew_template_groups g
      WHERE g.template_id = ${id}
      ORDER BY g.display_order, g.name
    `;

    const groupsWithMembers = [];
    for (const group of groups) {
      const members = await this.prisma.$queryRaw<any[]>`
        SELECT 
          m.id,
          m.org_user_id,
          m.notes,
          ou.display_name,
          ou.email
        FROM event_crew_template_members m
        JOIN org_users ou ON m.org_user_id = ou.id
        WHERE m.group_id = ${group.id}
        ORDER BY ou.display_name
      `;

      groupsWithMembers.push({
        id: group.id,
        templateId: group.template_id,
        name: group.name,
        description: group.description,
        displayOrder: group.display_order,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        members: members.map(m => ({
          id: m.id,
          orgUserId: m.org_user_id,
          notes: m.notes,
          user: {
            id: m.org_user_id,
            displayName: m.display_name,
            email: m.email,
          },
        })),
      });
    }

    return {
      id: template.id,
      organizationId: template.tenant_id,
      name: template.name,
      description: template.description,
      isDefault: template.is_default,
      createdBy: template.created_by,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      groups: groupsWithMembers,
    };
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateCrewTemplateDto
  ): Promise<CrewTemplateResponse> {
    // Check if template exists
    await this.findOne(organizationId, id);

    // Check name uniqueness if changing name
    if (data.name) {
      const existing = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM event_crew_templates 
        WHERE tenant_id = ${organizationId} 
        AND name = ${data.name}
        AND id != ${id}
      `;

      if (existing.length > 0) {
        throw new ConflictException(`Template with name "${data.name}" already exists`);
      }
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.$executeRaw`
        UPDATE event_crew_templates 
        SET is_default = false 
        WHERE tenant_id = ${organizationId} 
        AND id != ${id}
      `;
    }

    // Update template
    if (data.name || data.description !== undefined || data.isDefault !== undefined) {
      const setClause: string[] = [];
      const values: any[] = [];

      if (data.name) {
        setClause.push(`name = $${setClause.length + 1}`);
        values.push(data.name);
      }
      if (data.description !== undefined) {
        setClause.push(`description = $${setClause.length + 1}`);
        values.push(data.description);
      }
      if (data.isDefault !== undefined) {
        setClause.push(`is_default = $${setClause.length + 1}`);
        values.push(data.isDefault);
      }

      setClause.push(`updated_at = NOW()`);

      await this.prisma.$executeRawUnsafe(
        `
        UPDATE event_crew_templates 
        SET ${setClause.join(', ')}
        WHERE id = $${values.length + 1}
      `,
        ...values,
        id
      );
    }

    // Update members if provided
    if (data.members) {
      // Delete existing members
      await this.prisma.$executeRaw`
        DELETE FROM event_crew_template_members 
        WHERE template_id = ${id}
      `;

      // Add new members
      for (const member of data.members) {
        await this.prisma.$executeRaw`
          INSERT INTO event_crew_template_members (template_id, org_user_id, role, notes)
          VALUES (${id}, ${member.orgUserId}, ${member.role}, ${member.notes || null})
        `;
      }
    }

    return this.findOne(organizationId, id);
  }

  async delete(organizationId: string, id: string): Promise<void> {
    // Check if template exists
    await this.findOne(organizationId, id);

    // Delete template (members will cascade)
    await this.prisma.$executeRaw`
      DELETE FROM event_crew_templates 
      WHERE id = ${id} AND tenant_id = ${organizationId}
    `;
  }

  async applyTemplateToEvent(
    organizationId: string,
    eventId: string,
    templateId: string,
    userId: string
  ): Promise<void> {
    // Verify template exists
    const template = await this.findOne(organizationId, templateId);

    // Verify event exists
    const events = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM events 
      WHERE id = ${eventId} AND tenant_id = ${organizationId}
    `;

    if (events.length === 0) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Delete existing assignments for this event
    await this.prisma.$executeRaw`
      DELETE FROM event_staff_assignments 
      WHERE event_id = ${eventId}
    `;

    // Add template members as event assignments
    for (const member of template.members) {
      await this.prisma.$executeRaw`
        INSERT INTO event_staff_assignments (tenant_id, event_id, org_user_id, role_type, role_label, template_id)
        VALUES (
          ${organizationId}, 
          ${eventId}, 
          ${member.orgUserId}, 
          'crew',
          ${member.role}, 
          ${templateId}
        )
      `;
    }
  }
}
