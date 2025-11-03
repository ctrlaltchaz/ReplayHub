import { OrgSelectClient } from "./OrgSelectClient";

export default function OrgSelectPage() {
    // Client-side only - let the client component handle fetching
    // This avoids server-side session issues
    return <OrgSelectClient />;
}