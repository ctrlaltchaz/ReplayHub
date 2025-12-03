import * as fs from 'fs/promises';
import * as path from 'path';

export class TenantStorageService {
    private readonly basePath: string;

    constructor() {
        // Base storage path - can be configured via environment
        this.basePath = process.env.TENANT_STORAGE_PATH || path.join(process.cwd(), 'data');
    }

    /**
     * Generate tenant-specific file path
     * @param tenantId The tenant/organisation ID
     * @param segments Additional path segments
     * @returns Full file path: /data/{tenantId}/...segments
     */
    tenantPath(tenantId: string, ...segments: string[]): string {
        return path.join(this.basePath, tenantId, ...segments);
    }

    /**
     * Ensure tenant directory exists
     * @param tenantId The tenant/organisation ID
     * @param subPath Optional subdirectory path within tenant folder
     */
    async ensureTenantDirectory(tenantId: string, subPath?: string): Promise<string> {
        const fullPath = subPath ? this.tenantPath(tenantId, subPath) : this.tenantPath(tenantId);

        try {
            await fs.mkdir(fullPath, { recursive: true });
            return fullPath;
        } catch (error) {
            throw new Error(`Failed to create tenant directory: ${error}`);
        }
    }

    /**
     * Get tenant storage root
     * @param tenantId The tenant/organisation ID
     * @returns Path to tenant's root storage directory
     */
    async getTenantRoot(tenantId: string): Promise<string> {
        return await this.ensureTenantDirectory(tenantId);
    }
}
