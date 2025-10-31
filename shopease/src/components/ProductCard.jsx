import { ShoppingBag } from "lucide-react";

// ✅ Función para formatear en pesos colombianos
const formatCurrency = (value) => {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
};

export default function ProductCard({ product, viewMode, onProductClick }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 overflow-hidden ${
        viewMode === "list"
          ? "flex items-center gap-4 p-4"
          : "flex flex-col p-4"
      }`}
      onClick={() => onProductClick(product)}
    >
      <img
        src={product.image}
        alt={product.name}
        className={`transition-transform duration-300 hover:scale-105 ${
          viewMode === "list"
            ? "w-32 h-32 object-cover rounded-lg"
            : "w-full object-contain max-h-40 rounded-lg mb-3"
        }`}
      />

      <div
        className={`${
          viewMode === "list"
            ? "flex-1 flex flex-col justify-center gap-2"
            : "flex flex-col gap-2"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800">
          {product.name}
        </h3>
        <p className="text-green-600 font-bold">
          {formatCurrency(product.price)}
        </p>

        <div className="mt-2">
          <button
            className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-2 px-4 rounded-full hover:from-emerald-600 hover:to-green-700 flex justify-center items-center gap-2 transition"
            onClick={(e) => {
              e.stopPropagation(); // evita que se abra el modal dos veces
              onProductClick(product);
            }}
          >
            <ShoppingBag size={18} /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
