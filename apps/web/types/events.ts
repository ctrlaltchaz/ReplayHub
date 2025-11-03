import { Id, IsoDate } from './api';

export interface Event {
    id: Id;
    title: string;
    startAt: IsoDate;
    endAt: IsoDate;
    location?: string;
    teamId?: Id;
    lineupId?: Id;
}