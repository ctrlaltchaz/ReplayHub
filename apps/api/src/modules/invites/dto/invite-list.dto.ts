export interface InviteListDto {
    id: string;
    email: string | null;
    token?: string;
    inviteMethod?: 'EMAIL' | 'LINK';
    roles: string[];
    invitedBy: string; // Display name of inviter
    expiresAt: Date;
    createdAt: Date;
}
