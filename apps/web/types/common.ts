import type { Id, IsoDate, Slug } from './api';

export type { Id, IsoDate, Slug };

export interface Timestamped {
    createdAt: IsoDate;
    updatedAt: IsoDate;
}