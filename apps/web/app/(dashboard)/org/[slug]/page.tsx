import { redirect } from 'next/navigation';

interface PageProps {
    params: {
        slug: string;
    };
}

export default function OrgRootPage({ params }: PageProps) {
    redirect(`/org/${params.slug}/overview`);
}
