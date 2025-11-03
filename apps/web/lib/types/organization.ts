export interface OrganizationBranding {
    logo?: string;
    logoUrl?: string;
    theme?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    sidebarColor?: string;
    textColor?: string;
}

export interface Organization {
    id: string;
    slug: string;
    name: string;
    branding: OrganizationBranding | null;
    createdAt: string;
    updatedAt: string;
}

export interface ThemePreset {
    name: string;
    label: string;
    description: string;
    colors: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        backgroundColor: string;
        sidebarColor: string;
        textColor: string;
    };
}
