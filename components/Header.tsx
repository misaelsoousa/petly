"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { whatsappLink } from "@/lib/content";
import { ChatIcon, MenuIcon, PawIcon, XIcon } from "./Icons";

const LINKS = [
    { href: "/adote", label: "Adote" },
    { href: "/servicos", label: "Serviços" },
    { href: "/dicas", label: "Dicas" },
    { href: "/doar", label: "Doar um pet" },
    { href: "/sobre", label: "Sobre" },
    { href: "/contato", label: "Contato" },
];

export default function Header({ storeName, whatsapp }: { storeName: string; whatsapp?: string }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const whatsappHref = whatsappLink(whatsapp, "Olá! Vim pelo site e gostaria de mais informações.");
    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
            <div className="container-site flex h-16 items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold" onClick={() => setOpen(false)}>
                    <span className="grid size-9 place-items-center rounded-full bg-brand text-white">
                        <PawIcon className="size-5" />
                    </span>
                    {storeName}
                </Link>

                <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
                    {LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={isActive(link.href) ? "page" : undefined}
                            className="rounded-full px-3 py-2 font-display font-medium text-ink/80 transition hover:bg-brand-soft hover:text-brand-ink aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand-ink"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    {whatsappHref && (
                        <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn btn-primary hidden !px-4 !py-2 text-sm sm:inline-flex">
                            <ChatIcon /> WhatsApp
                        </a>
                    )}
                    <button
                        type="button"
                        className="grid size-10 place-items-center rounded-full border-2 border-line lg:hidden"
                        aria-expanded={open}
                        aria-controls="menu-mobile"
                        aria-label={open ? "Fechar menu" : "Abrir menu"}
                        onClick={() => setOpen((value) => !value)}
                    >
                        {open ? <XIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>

            {open && (
                <nav id="menu-mobile" aria-label="Principal" className="container-site grid gap-1 pb-4 lg:hidden">
                    {LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            aria-current={isActive(link.href) ? "page" : undefined}
                            className="rounded-2xl px-4 py-3 font-display text-lg font-medium hover:bg-brand-soft aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand-ink"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
