export class OrganisationDto {
    id: string;
    name: string;
    slug: string;
    brandingJson?: any;
    featuresJson?: any;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;

    // Additional fields for listing
    isOwner?: boolean;
    isAdmin?: boolean;
    role?: string;
}
