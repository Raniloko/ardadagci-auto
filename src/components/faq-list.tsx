import { Plus } from "lucide-react";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.q} className="faq-item">
          <summary><span>{item.q}</span><Plus /></summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
