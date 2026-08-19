export default function EmptyState({
  icon = "🗒️",
  title,
  description,
}: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-14 text-muted-green">
      <span className="text-3xl">{icon}</span>
      <p className="font-manrope font-bold text-[14px] text-green-text-1">{title}</p>
      {description && <p className="text-[12px] max-w-sm">{description}</p>}
    </div>
  );
}
