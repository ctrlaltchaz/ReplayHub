export interface TotpSetupDto {
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
}
