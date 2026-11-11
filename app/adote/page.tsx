import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PetCard } from "@/components/Cards";
import { getPets, type PetFields } from "@/lib/content";

export const metadata: Metadata = {
    title: "Adote um pet",
    description: "Cães e gatos vacinados, castrados e prontos para um novo lar.",
};

const FILTERS = [
    { key: "especie", label: "Espécie", options: ["Cachorro", "Gato"] },
    { key: "porte", label: "Porte", options: ["Pequeno", "Médio", "Grande"] },
    { key: "sexo", label: "Sexo", options: ["Macho", "Fêmea"] },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function first(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

export default async function AdoptPage({ searchParams }: PageProps<"/adote">) {
    const params = await searchParams;
    const active = Object.fromEntries(FILTERS.map((filter) => [filter.key, first(params[filter.key]) ?? ""])) as Record<FilterKey, string>;

    const pets = await getPets();
    const matches = (fields: PetFields) => FILTERS.every((filter) => !active[filter.key] || fields[filter.key] === active[filter.key]);

    const waiting = pets.filter((pet) => pet.fields.situacao !== "Adotado" && matches(pet.fields));
    const adopted = pets.filter((pet) => pet.fields.situacao === "Adotado");
    const hasFilter = Object.values(active).some(Boolean);

    return (
        <div className="container-site py-12">
            <header className="mb-8 max-w-2xl">
                <p className="eyebrow">Adoção responsável</p>
                <h1 className="title mt-1">Encontre seu novo melhor amigo</h1>
                <p className="mt-2 text-lg text-muted">
                    Todos os nossos pets são vacinados, vermifugados e castrados (ou com castração agendada). Gostou de algum? Abra o perfil e preencha a solicitação de adoção.
                </p>
            </header>

            <form className="card mb-8 grid items-end gap-4 p-5 sm:grid-cols-4" aria-label="Filtrar pets">
                {FILTERS.map((filter) => (
                    <div key={filter.key}>
                        <label htmlFor={`filtro-${filter.key}`} className="mb-1.5 block text-sm font-bold">
                            {filter.label}
                        </label>
                        <select id={`filtro-${filter.key}`} name={filter.key} defaultValue={active[filter.key]} className="input">
                            <option value="">Todos</option>
                            {filter.options.map((option) => (
                                <option key={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                ))}
                <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary flex-1">
                        Filtrar
                    </button>
                    {hasFilter && (
                        <Link href="/adote" className="btn btn-ghost">
                            Limpar
                        </Link>
                    )}
                </div>
            </form>

            <p className="mb-4 text-sm text-muted" aria-live="polite">
                {waiting.length} {waiting.length === 1 ? "pet encontrado" : "pets encontrados"}
            </p>

            {waiting.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {waiting.map((pet) => (
                        <PetCard key={pet.id} pet={pet} />
                    ))}
                </div>
            ) : (
                <EmptyState title="Nenhum pet com esses filtros" text="Tente outra combinação — ou volte em breve, chegam pets novos toda semana." />
            )}

            {adopted.length > 0 && (
                <section className="mt-20">
                    <p className="eyebrow">Finais felizes</p>
                    <h2 className="title mt-1 mb-8">Já encontraram uma família</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {adopted.map((pet) => (
                            <PetCard key={pet.id} pet={pet} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
