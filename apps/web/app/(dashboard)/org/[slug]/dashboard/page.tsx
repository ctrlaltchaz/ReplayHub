import { redirect } from 'next/navigation';

interface DashboardRedirectProps {
    params: {
        slug: string;
    };
}

export default function DashboardRedirect({ params }: DashboardRedirectProps) {
    // Redirect dashboard to overview page
    redirect(`/org/${params.slug}/overview`);
}
