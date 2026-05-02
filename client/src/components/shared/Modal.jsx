import { X } from 'lucide-react';

export function Modal({ open, title, onClose, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-charcoal/40 p-4 backdrop-blur-sm">
      <div className="app-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-charcoal/55">
              Action
            </p>
            <h3 className="font-display text-2xl text-app-charcoal">{title}</h3>
          </div>
          <button
            className="rounded-full bg-app-charcoal/5 p-2 text-app-charcoal transition hover:bg-app-charcoal/10"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
