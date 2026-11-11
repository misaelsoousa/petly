import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getContact } from "@/lib/content";

const display = Fredoka({ variable: "--font-display", subsets: ["latin"] });
const body = Nunito({ variable: "--font-body", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
    const contact = await getContact().catch(() => null);
    const name = contact?.nome_loja ?? "Petly Pet Shop";

    return {
        title: { default: name, template: `%s · ${name}` },
        description: "Banho e tosa, veterinário, hotelzinho e adoção responsável de cães e gatos.",
    };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
    const contact = await getContact().catch(() => null);
    const brand = contact?.cor_marca;

    return (
        <html
            lang="pt-BR"
            className={`${display.variable} ${body.variable} h-full antialiased`}
            style={brand ? ({ "--brand": brand } as React.CSSProperties) : undefined}
        >
            <body className="flex min-h-full flex-col font-sans">
                <Header storeName={contact?.nome_loja ?? "Petly"} whatsapp={contact?.whatsapp} />
                <main className="flex-1">{children}</main>
                <Footer contact={contact} />
            </body>
        </html>
    );
}
