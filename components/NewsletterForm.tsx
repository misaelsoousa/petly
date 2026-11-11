"use client";

import { useState } from "react";
import { submitForm } from "@/lib/submit";

/** Formulário "newsletter" do Nexus, em versão compacta para o rodapé. */
export default function NewsletterForm() {
    const [state, setState] = useState<{ status: "idle" | "sending" | "sent" | "error"; message?: string }>({ status: "idle" });

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const element = event.currentTarget;
        setState({ status: "sending" });
        const result = await submitForm("newsletter", new FormData(element));

        if (result.ok) {
            element.reset();
            setState({ status: "sent", message: "Pronto! Você vai receber nossas novidades." });
        } else {
            setState({ status: "error", message: result.errors.join(" ") });
        }
    }

    return (
        <form onSubmit={onSubmit} className="grid gap-2">
            <label htmlFor="newsletter-email" className="font-display font-semibold">
                Receba novidades e pets para adoção
            </label>
            <div className="flex gap-2">
                <input id="newsletter-email" name="email" type="email" required autoComplete="email" placeholder="seu@email.com" className="input min-w-0 !py-2" />
                <button type="submit" className="btn btn-primary shrink-0 !px-4 !py-2" disabled={state.status === "sending"}>
                    {state.status === "sending" ? "..." : "Assinar"}
                </button>
            </div>
            <p role="status" className={`min-h-5 text-sm ${state.status === "error" ? "text-brand" : "text-leaf"}`}>
                {state.message}
            </p>
        </form>
    );
}
