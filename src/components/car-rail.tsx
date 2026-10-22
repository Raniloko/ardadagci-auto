import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { useLanguage } from "@/lib/language";

/** Horizontally scrollable row with arrow controls. */
export function Rail({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <div className={`rail ${className}`}>
      <div className="rail-track" ref={ref}>{children}</div>
      <div className="rail-controls">
        <button type="button" className="icon-btn" onClick={() => scroll(-1)} aria-label={t("Zurück", "Previous")}><ChevronLeft /></button>
        <button type="button" className="icon-btn" onClick={() => scroll(1)} aria-label={t("Weiter", "Next")}><ChevronRight /></button>
      </div>
    </div>
  );
}
