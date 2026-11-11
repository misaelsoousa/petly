import Link from "next/link";

export default function NotFound() {
    return (
        <div className="container-site grid place-items-center gap-4 py-24 text-center">
            <p className="text-7xl" aria-hidden="true">
                🐾
            </p>
            <h1 className="title">Essa página fugiu para passear</h1>
            <p className="text-lg text-muted">Não encontramos o que você procurava.</p>
            <Link href="/" className="btn btn-primary">
                Voltar para o início
            </Link>
        </div>
    );
}
