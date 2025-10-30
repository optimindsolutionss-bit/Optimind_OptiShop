import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, PlusCircle, Edit3 } from "lucide-react";

interface Product {
  id?: number;
  name: string;
  price: number;
  quantity: number;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    quantity?: string;
  }>({});

  const [isSaving, setIsSaving] = useState(false);

  // Cuando cambie productToEdit
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        price: productToEdit.price.toString(),
        quantity: productToEdit.quantity.toString(),
      });
    } else {
      setFormData({ name: "", price: "", quantity: "" });
    }
    setErrors({});
  }, [productToEdit]);

  // handleChange
  // handleChange mejorado
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));

  // Validación en tiempo real
  setErrors((prev) => {
    const newErrors = { ...prev };

    if (name === "name") {
      if (!value.trim()) newErrors.name = "El nombre es obligatorio";
      else delete newErrors.name;
    }

    if (name === "price") {
      if (!value || parseFloat(value) <= 0) newErrors.price = "El precio debe ser mayor que 0";
      else delete newErrors.price;
    }

    if (name === "quantity") {
      if (!value || parseInt(value, 10) <= 0) newErrors.quantity = "La cantidad debe ser mayor que 0";
      else delete newErrors.quantity;
    }

    return newErrors;
  });
};

  // Validación
  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "El precio debe ser mayor que 0";
    if (!formData.quantity || parseInt(formData.quantity) <= 0)
      newErrors.quantity = "La cantidad debe ser mayor que 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    await onSave({
      id: productToEdit?.id,
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Fondo oscuro translúcido */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal principal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="ease-in duration-200"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {productToEdit ? (
                    <>
                      <Edit3 size={20} /> Editar producto
                    </>
                  ) : (
                    <>
                      <PlusCircle size={20} /> Agregar producto
                    </>
                  )}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:text-white focus:ring focus:ring-indigo-500 ${
                      errors.name
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Precio y cantidad */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300">
                      Precio
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className={`w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:text-white focus:ring focus:ring-indigo-500 ${
                        errors.price
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className={`w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:text-white focus:ring focus:ring-indigo-500 ${
                        errors.quantity
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.quantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || Object.keys(errors).length > 0}
                  className={`w-full py-2 rounded-lg text-white transition-all ${
                    isSaving || Object.keys(errors).length > 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isSaving
                    ? "Guardando..."
                    : productToEdit
                    ? "Guardar cambios"
                    : "Agregar producto"}
                </button>
              </form>
            </motion.div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
