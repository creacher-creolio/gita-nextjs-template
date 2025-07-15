// app/[locale]/page.tsx
import HomeContent from "./home-content";

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
    await params; // Ensure params are awaited for proper routing

    return <HomeContent />;
}
