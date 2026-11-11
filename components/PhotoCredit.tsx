/**
 * Crédito da foto (campos "Crédito da imagem" / "Link do crédito" do Nexus), sobre o canto da imagem.
 * O contêiner da imagem precisa ser `relative`. Use `asText` dentro de cards que já são links (não pode haver <a> dentro de <a>).
 */
export default function PhotoCredit({ text, url, asText = false }: { text?: string; url?: string; asText?: boolean }) {
    if (!text) return null;

    const className = "absolute right-2 bottom-2 max-w-[90%] truncate rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] text-white/90 backdrop-blur-sm";

    if (url && !asText) {
        return (
            <a href={url} target="_blank" rel="noreferrer" className={`${className} hover:bg-black/75 hover:text-white`} title="Ver a foto original e a licença">
                {text}
            </a>
        );
    }

    return <span className={className}>{text}</span>;
}
