import type { Metadata } from "next";
import { EmptyState, TipCard } from "@/components/Cards";
import { getTips } from "@/lib/content";

export const metadata: Metadata = {
    title: "Dicas",
    description: "Dicas de saúde, alimentação, comportamento e adoção de cães e gatos.",
};

export default async function TipsPage() {
    const tips = await getTips();

    return (
        <div className="container-site py-12">
            <header className="mb-10 max-w-2xl">
                <p className="eyebrow">Blog</p>
                <h1 className="title mt-1">Dicas para cuidar melhor do seu pet</h1>
                <p className="mt-2 text-lg text-muted">Escritas pela nossa equipe e pelos veterinários parceiros.</p>
            </header>

            {tips.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tips.map((tip) => (
                        <TipCard key={tip.id} tip={tip} />
                    ))}
                </div>
            ) : (
                <EmptyState title="Nenhuma dica publicada ainda" text="Volte em breve!" />
            )}
        </div>
    );
}
