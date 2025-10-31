import { ShoppingBag, X } from "lucide-react";

// ✅ Formateo de moneda COP
const formatCurrency = (value) => {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
};

export default function ProductModal({ product, onClose, onAdd }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-11/12 sm:w-96 p-6 relative shadow-lg">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-contain mb-4"
        />

        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-green-600 font-bold mb-2">
  {formatCurrency(product.price)}
</p>

        <p className="text-gray-600 text-sm mb-4">
          {product.description || "Descripción del producto."}
        </p>

        <div className="flex gap-2 items-center mb-4">
          <label>Cantidad:</label>
          <input
            type="number"
            defaultValue={1}
            min={1}
            className="border p-1 rounded w-16 text-center"
            id="quantity"
          />
        </div>

        <button
  className="w-full bg-green-600 text-white py-2 rounded-full flex justify-center items-center gap-2 hover:bg-green-700 transition"
  onClick={() => {
    const qty = parseInt(document.getElementById("quantity").value);
    onAdd(product, qty);
    onClose();
  }}
>
  <ShoppingBag size={18} /> Agregar al carrito
</button>
      </div>
    </div>
  );
}
