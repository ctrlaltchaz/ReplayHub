import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../../modules/rbac/decorators/can.decorator';
import { PermissionGuard } from '../../../modules/rbac/guards/permission.guard';
import {
    CreateResourceDto,
    QueryResourcesDto,
    ResourceResponse,
    UpdateResourceDto
} from '../dto/scheduling.dto';
import { ResourcesService } from '../services/resources.service';

@ApiTags('Scheduling - Resources')
@ApiBearerAuth()
@Controller('org/:slug/resources')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class ResourcesController {
    constructor(private readonly resourcesService: ResourcesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new resource' })
    @ApiResponse({ status: 201, description: 'Resource created', type: ResourceResponse })
    @Can('resources.manage')
    async createResource(
        @TenantId() tenantId: string,
        @Body() createResourceDto: CreateResourceDto,
    ) {
        return await this.resourcesService.createResource(tenantId, createResourceDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get resources with filtering' })
    @ApiResponse({ status: 200, description: 'Resources retrieved', type: [ResourceResponse] })
    @Can('resources.view')
    async findResources(
        @TenantId() tenantId: string,
        @Query() queryDto: QueryResourcesDto,
    ) {
        return await this.resourcesService.findResources(tenantId, queryDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get resource by ID' })
    @ApiResponse({ status: 200, description: 'Resource found', type: ResourceResponse })
    @ApiResponse({ status: 404, description: 'Resource not found' })
    @Can('resources.view')
    async findResourceById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        const resource = await this.resourcesService.findOneResource(tenantId, id);
        if (!resource) {
            throw new NotFoundException('Resource not found');
        }
        return resource;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update resource' })
    @ApiResponse({ status: 200, description: 'Resource updated', type: ResourceResponse })
    @ApiResponse({ status: 404, description: 'Resource not found' })
    @Can('resources.manage')
    async updateResource(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() updateResourceDto: UpdateResourceDto,
    ) {
        const resource = await this.resourcesService.updateResource(tenantId, id, updateResourceDto);
        if (!resource) {
            throw new NotFoundException('Resource not found');
        }
        return resource;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete resource' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Resource deleted' })
    @ApiResponse({ status: 404, description: 'Resource not found' })
    @Can('resources.manage')
    async deleteResource(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        const result = await this.resourcesService.deleteResource(tenantId, id);
        if (!result) {
            throw new NotFoundException('Resource not found');
        }
        return { message: 'Resource deleted successfully' };
    }
}