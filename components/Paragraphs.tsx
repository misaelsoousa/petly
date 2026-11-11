/** Renderiza campos "Texto longo" do Nexus: blocos separados por linha em branco viram parágrafos. */
export default function Paragraphs({ text, className }: { text: string | undefined | null; className?: string }) {
    if (!text) return null;

    return (
        <div className={className}>
            {text
                .split(/\n{2,}/)
                .map((block) => block.trim())
                .filter(Boolean)
                .map((block, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                        {block.split("\n").map((line, lineIndex, lines) => (
                            <span key={lineIndex}>
                                {line}
                                {lineIndex < lines.length - 1 && <br />}
                            </span>
                        ))}
                    </p>
                ))}
        </div>
    );
}

/** Campos "um por linha" (horários, valores...) viram lista. */
export function splitLines(text: string | undefined | null) {
    return (text ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}
