import { IsoDate } from './api';

export interface IncidentBucket {
    category: string;
    severity: string;
    status: string;
    count: number;
}

export interface IncidentsReport {
    range: {
        from: IsoDate;
        to: IsoDate;
    };
    buckets: IncidentBucket[];
    topTags: {
        tag: string;
        count: number;
    }[];
}