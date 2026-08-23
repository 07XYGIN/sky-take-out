import { Inbox } from "lucide-react";

export function EmptyState({ label = "暂无数据" }: { label?: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-slate-400">
      <Inbox size={28} strokeWidth={1.5} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
