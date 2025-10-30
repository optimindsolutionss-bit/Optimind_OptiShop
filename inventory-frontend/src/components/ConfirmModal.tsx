import React from "react";
import { X, Check, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Eliminar producto",
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center transition-all">
        {/* Título con ícono */}
        <h2 className="flex items-center justify-center gap-2 text-xl font-bold mb-4 text-white rounded-xl py-2 px-4 mx-auto">
          <Trash2 className="w-5 h-5" /> {title}
        </h2>

        {/* Mensaje */}
        <p className="text-gray-700 dark:text-gray-200 mb-6">{message}</p>

        {/* Botones responsive */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
          >
            <Check className="w-4 h-4" /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
