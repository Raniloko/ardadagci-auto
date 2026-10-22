import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, copy, action, align = "left" }: { eyebrow?: string; title: ReactNode; copy?: string; action?: ReactNode; align?: "left" | "center" }) {
  return (
    <div className={`section-heading ${align === "center" ? "is-center" : ""}`}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {copy && <p className="section-copy">{copy}</p>}
      </div>
      {action}
    </div>
  );
}
