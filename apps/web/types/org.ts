import type { OrgUser } from '@/lib/auth/session';
import { Id, Slug } from './api';
import { Timestamped } from './common';

export interface Organisation extends Timestamped {
    id: Id;
    slug: Slug;
    name: string;
    brandingJson?: any;
    featuresJson?: any;
}

export interface OrgMe {
    user: OrgUser;
    permissions: string[];
}