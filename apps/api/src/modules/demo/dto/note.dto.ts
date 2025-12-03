export class NoteDto {
    id: string;
    tenantId: string;
    title: string;
    body?: string;
    createdBy: string;
    createdAt: Date;
}
