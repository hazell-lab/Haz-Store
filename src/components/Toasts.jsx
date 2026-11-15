import { useToast } from "../context/ToastContext.jsx";

// short messages at the bottom (top on phones), read out by screen readers
export function Toasts() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id} role="status">
          <span className="toast-message">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              className="toast-action"
              onClick={() => {
                toast.action.onClick();
                dismiss(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
