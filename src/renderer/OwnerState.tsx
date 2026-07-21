import { RefreshCw } from "lucide-react";

export function OwnerState({
  title,
  summary,
  actionLabel = "检查连接",
  onRecover,
}: {
  title: string;
  summary: string;
  actionLabel?: string;
  onRecover?: () => void;
}) {
  return (
    <section className="owner-state" role="status">
      <RefreshCw size={20} aria-hidden="true" />
      <div><h1>{title}</h1><p>{summary}</p></div>
      {onRecover ? <button type="button" onClick={onRecover}>{actionLabel}</button> : null}
    </section>
  );
}
