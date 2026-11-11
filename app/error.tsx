"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="container-site grid place-items-center gap-4 py-24 text-center">
            <p className="text-7xl" aria-hidden="true">
                🙀
            </p>
            <h1 className="title">Ops! Não conseguimos carregar o conteúdo</h1>
            <p className="max-w-lg text-muted">{error.message.includes("Nexus") ? error.message : "Tente novamente em instantes."}</p>
            <button type="button" onClick={reset} className="btn btn-primary">
                Tentar de novo
            </button>
        </div>
    );
}
