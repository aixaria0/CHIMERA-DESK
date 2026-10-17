import type { Lang } from "@/lib/i18n";
import { TERMS, type DeskId } from "@/lib/guide";

export function Explain({
  id,
  lang,
  className = "mt-2 text-xs leading-relaxed text-muted",
}: {
  id: string;
  lang: Lang;
  className?: string;
}) {
  const t = TERMS.find((x) => x.id === id);
  if (!t) return null;
  const copy = t[lang];
  return <p className={className}>{copy.means}</p>;
}

export function Glossary({ lang, desk }: { lang: Lang; desk?: DeskId }) {
  const rows = desk ? TERMS.filter((t) => t.desk === desk) : TERMS;
  return (
    <dl className="grid gap-2 md:grid-cols-2">
      {rows.map((t) => {
        const copy = t[lang];
        const line = copy.means.split(/(?<=\.)\s/)[0];
        return (
          <div key={t.id} className="rounded-md bg-card-2 px-3 py-2">
            <dt className="text-sm font-medium text-foreground">{copy.term}</dt>
            <dd className="mt-1 text-xs leading-relaxed text-muted">{line}</dd>
          </div>
        );
      })}
    </dl>
  );
}

