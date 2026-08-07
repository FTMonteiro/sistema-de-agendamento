import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        flex
        items-center
        justify-center
        bg-black/50
        z-50
      "
    >
      <div
        className="
          bg-white
          rounded-xl
          p-6
          w-full
          max-w-md
        "
      >
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}

          <button
            onClick={onClose}
            className="
              text-gray-500
              hover:text-black
            "
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
