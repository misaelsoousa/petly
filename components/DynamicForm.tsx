"use client";

import { useId, useRef, useState } from "react";
import type { FieldDefinition, PublicForm } from "@/lib/nexus";
import { submitForm } from "@/lib/submit";
import { CheckIcon, UploadIcon } from "./Icons";

// Tipos de campo do Nexus (Domain/Enums/FieldType.cs)
const T = { Text: 0, RichText: 1, Number: 2, Boolean: 3, Date: 4, Select: 5, Color: 8, Section: 9, Email: 10, Phone: 11, Url: 12, File: 13 };

const INPUT_TYPES: Record<number, string> = {
    [T.Text]: "text",
    [T.Number]: "number",
    [T.Date]: "date",
    [T.Color]: "color",
    [T.Email]: "email",
    [T.Phone]: "tel",
    [T.Url]: "url",
};

const AUTOCOMPLETE: Record<string, string> = { nome: "name", email: "email", telefone: "tel", cidade: "address-level2" };

const FILE_ACCEPT = ".pdf,.doc,.docx,.odt,.rtf,.txt,image/jpeg,image/png,image/webp";

type Props = {
    form: PublicForm;
    /** Valores iniciais por chave do campo. */
    initial?: Record<string, string>;
    /** Campos preenchidos pelo site e escondidos do usuário (ex.: o pet escolhido). */
    hidden?: string[];
    submitLabel?: string;
    successTitle?: string;
    successText?: string;
};

type Group = { title: string | null; fields: FieldDefinition[] };

function groupBySection(fields: FieldDefinition[]) {
    const groups: Group[] = [{ title: null, fields: [] }];

    for (const field of fields) {
        if (field.type === T.Section) groups.push({ title: field.label, fields: [] });
        else groups[groups.length - 1].fields.push(field);
    }

    return groups.filter((group) => group.fields.length > 0);
}

export default function DynamicForm({ form, initial = {}, hidden = [], submitLabel = "Enviar", successTitle = "Recebemos seu envio!", successText }: Props) {
    const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
    const [errors, setErrors] = useState<string[]>([]);
    const errorsRef = useRef<HTMLDivElement>(null);
    const baseId = useId();

    const visible = form.fields.filter((field) => !hidden.includes(field.key));
    const groups = groupBySection(visible);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const element = event.currentTarget;
        const data = new FormData(element);

        // Checkbox desmarcado não entra no FormData; o Nexus espera "true"/"false".
        for (const field of form.fields.filter((item) => item.type === T.Boolean)) {
            const input = element.elements.namedItem(field.key) as HTMLInputElement | null;
            data.set(field.key, input?.checked ? "true" : "false");
        }

        // Arquivo não escolhido chega como um File vazio — remove para não virar "arquivo vazio".
        for (const [key, value] of [...data.entries()]) {
            if (value instanceof File && value.size === 0) data.delete(key);
        }

        setStatus("sending");
        setErrors([]);
        const result = await submitForm(form.name, data);

        if (result.ok) {
            setStatus("sent");
            element.reset();
        } else {
            setStatus("idle");
            setErrors(result.errors);
            requestAnimationFrame(() => errorsRef.current?.focus());
        }
    }

    if (status === "sent") {
        return (
            <div role="status" className="card flex flex-col items-center gap-3 p-8 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-leaf/15 text-2xl text-leaf">
                    <CheckIcon />
                </span>
                <h3 className="font-display text-2xl font-bold">{successTitle}</h3>
                {successText && <p className="text-muted">{successText}</p>}
                <button type="button" className="btn btn-ghost mt-2" onClick={() => setStatus("idle")}>
                    Enviar outro
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="card grid gap-6 p-6 sm:p-8">
            {hidden.map((key) => (
                <input key={key} type="hidden" name={key} value={initial[key] ?? ""} />
            ))}

            {errors.length > 0 && (
                <div ref={errorsRef} tabIndex={-1} role="alert" className="rounded-2xl border-2 border-brand/30 bg-brand-soft p-4 text-sm text-brand-ink">
                    <p className="mb-1 font-bold">Confira os campos:</p>
                    <ul className="list-disc pl-5">
                        {errors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {groups.map((group, index) => (
                <fieldset key={index} className="grid gap-4 sm:grid-cols-2">
                    {group.title && <legend className="mb-1 font-display text-lg font-bold sm:col-span-2">{group.title}</legend>}
                    {group.fields.map((field) => (
                        <Field key={field.key} field={field} id={`${baseId}-${field.key}`} initial={initial[field.key]} />
                    ))}
                </fieldset>
            ))}

            <button type="submit" className="btn btn-primary justify-self-start" disabled={status === "sending"}>
                {status === "sending" ? "Enviando..." : submitLabel}
            </button>
        </form>
    );
}

function Label({ field, id }: { field: FieldDefinition; id: string }) {
    return (
        <label htmlFor={id} className="mb-1.5 block text-sm font-bold">
            {field.label}
            {field.required ? <span className="text-brand"> *</span> : <span className="font-normal text-muted"> (opcional)</span>}
        </label>
    );
}

function Field({ field, id, initial }: { field: FieldDefinition; id: string; initial?: string }) {
    const wide = field.type === T.RichText || field.type === T.File || field.type === T.Boolean;
    const wrapper = wide ? "sm:col-span-2" : "";

    if (field.type === T.Boolean) {
        return (
            <label htmlFor={id} className={`${wrapper} flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 has-[:checked]:border-brand`}>
                <input id={id} name={field.key} type="checkbox" required={field.required} defaultChecked={initial === "true"} className="size-5 accent-[var(--brand)]" />
                <span className="font-bold">
                    {field.label}
                    {field.required && <span className="text-brand"> *</span>}
                </span>
            </label>
        );
    }

    if (field.type === T.Select) {
        return (
            <div className={wrapper}>
                <Label field={field} id={id} />
                <select id={id} name={field.key} required={field.required} defaultValue={initial ?? ""} className="input">
                    <option value="" disabled={field.required}>
                        Selecione...
                    </option>
                    {(field.options?.choices ?? []).map((choice) => (
                        <option key={choice} value={choice}>
                            {choice}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    if (field.type === T.RichText) {
        return (
            <div className={wrapper}>
                <Label field={field} id={id} />
                <textarea id={id} name={field.key} required={field.required} defaultValue={initial} rows={4} className="input resize-y" />
            </div>
        );
    }

    if (field.type === T.File) {
        return <FileField field={field} id={id} className={wrapper} />;
    }

    return (
        <div className={wrapper}>
            <Label field={field} id={id} />
            <input
                id={id}
                name={field.key}
                type={INPUT_TYPES[field.type] ?? "text"}
                required={field.required}
                defaultValue={initial}
                autoComplete={AUTOCOMPLETE[field.key]}
                step={field.type === T.Number ? "any" : undefined}
                min={field.type === T.Date ? new Date().toISOString().slice(0, 10) : undefined}
                className={field.type === T.Color ? "input h-12 p-1" : "input"}
            />
        </div>
    );
}

function FileField({ field, id, className }: { field: FieldDefinition; id: string; className: string }) {
    const [fileName, setFileName] = useState<string | null>(null);

    return (
        <div className={className}>
            <Label field={field} id={id} />
            <label
                htmlFor={id}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-white px-4 py-5 transition hover:border-brand focus-within:border-brand"
            >
                <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-lg text-brand">
                    <UploadIcon />
                </span>
                <span className="text-sm">
                    <span className="block font-bold">{fileName ?? "Escolher arquivo"}</span>
                    <span className="text-muted">JPG, PNG, WEBP ou PDF</span>
                </span>
                <input
                    id={id}
                    name={field.key}
                    type="file"
                    accept={FILE_ACCEPT}
                    required={field.required}
                    className="sr-only"
                    onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
                />
            </label>
        </div>
    );
}
