import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

const inputCls =
  "w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

export function EText({
  edit,
  value,
  onChange,
  multiline,
  className,
  label,
}: {
  edit: boolean;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  className?: string;
  label?: string;
}) {
  if (!edit) return <span className={className}>{value}</span>;
  return multiline ? (
    <textarea
      aria-label={label}
      rows={3}
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ) : (
    <input
      aria-label={label}
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function EList({
  edit,
  items,
  onChange,
  render,
  addLabel,
}: {
  edit: boolean;
  items: string[];
  onChange: (v: string[]) => void;
  render: (item: string, i: number) => ReactNode;
  addLabel: string;
}) {
  if (!edit) return <>{items.map(render)}</>;
  const move = (i: number, d: number) => {
    const n = [...items];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    const t = n[i]!;
    n[i] = n[j]!;
    n[j] = t;
    onChange(n);
  };
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            aria-label={`รายการที่ ${i + 1}`}
            className={inputCls}
            value={it}
            onChange={(e) =>
              onChange(items.map((x, k) => (k === i ? e.target.value : x)))
            }
          />
          <IconBtn label="เลื่อนขึ้น" onClick={() => move(i, -1)}>
            <ArrowUp className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="เลื่อนลง" onClick={() => move(i, 1)}>
            <ArrowDown className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn
            label="ลบรายการ"
            danger
            onClick={() => onChange(items.filter((_, k) => k !== i))}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, "รายการใหม่"])}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/40 px-2 py-1 text-xs font-medium text-primary hover:bg-accent"
      >
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}

export function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-card ${danger ? "text-destructive" : "text-primary"} hover:bg-accent`}
    >
      {children}
    </button>
  );
}
