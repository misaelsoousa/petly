import type { Metadata } from "next";
import DynamicForm from "@/components/DynamicForm";
import { CheckIcon } from "@/components/Icons";
import { getForm } from "@/lib/nexus";

export const metadata: Metadata = {
    title: "Doar um pet",
    description: "Precisa encontrar um novo lar para seu pet? A gente ajuda.",
};

const STEPS = [
    "Você preenche o formulário com uma foto do pet.",
    "Nossa equipe entra em contato para conhecer o pet.",
    "Ele passa por avaliação veterinária e castração.",
    "Divulgamos e cuidamos de todo o processo de adoção.",
];

export default async function DonatePage() {
    const form = await getForm("doacao");

    return (
        <div className="container-site grid gap-10 py-12 lg:grid-cols-[1fr_1.4fr]">
            <header className="grid content-start gap-4">
                <p className="eyebrow">Doação responsável</p>
                <h1 className="title">Precisa encontrar um novo lar para seu pet?</h1>
                <p className="text-lg text-muted">Sabemos que não é uma decisão fácil. Nós ajudamos a encontrar uma família que vai cuidar dele com todo o amor.</p>
                <ol className="mt-2 grid gap-3">
                    {STEPS.map((step, index) => (
                        <li key={step} className="card flex items-center gap-4 p-4">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-display font-bold text-white">{index + 1}</span>
                            {step}
                        </li>
                    ))}
                </ol>
                <p className="flex items-center gap-2 text-sm text-muted">
                    <CheckIcon className="text-leaf" /> Não cobramos nada pela doação.
                </p>
            </header>

            {form && (
                <DynamicForm
                    form={form}
                    submitLabel="Enviar pedido de doação"
                    successTitle="Recebemos seu pedido!"
                    successText="Nossa equipe vai analisar e entrar em contato em até 3 dias úteis."
                />
            )}
        </div>
    );
}
