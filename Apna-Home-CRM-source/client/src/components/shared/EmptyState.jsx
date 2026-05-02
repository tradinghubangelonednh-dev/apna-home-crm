export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-app-sand bg-app-sand/35 px-5 py-8 text-center">
      <p className="font-display text-xl text-app-charcoal">{title}</p>
      <p className="mt-2 text-sm text-app-charcoal/60">{description}</p>
    </div>
  );
}
