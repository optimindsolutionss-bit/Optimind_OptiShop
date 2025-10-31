import { useState } from "react";
import ProductList from "../components/ProductList";
import productsData from "../data/products.json";
import { LayoutGrid, List } from "lucide-react";
import ProductModal from "../components/ProductModal.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState("grid");
  const [modalProduct, setModalProduct] = useState(null);
  const { addToCart } = useCart();

  const filteredProducts = productsData.filter((p) => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Todas" || p.category === category;
    return matchName && matchCategory;
  });

  const categories = ["Todas", ...new Set(productsData.map((p) => p.category))];

  const handleProductClick = (product) => setModalProduct(product);

  return (
    <div className="p-6">
      {/* 🔍 Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 p-2 rounded-full flex-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 🟩 Botones de cambio de vista */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-full transition font-medium ${
              viewMode === "grid"
                ? "bg-primary text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-full transition font-medium ${
              viewMode === "list"
                ? "bg-primary text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* 🛒 Lista de productos */}
      <ProductList
        products={filteredProducts}
        viewMode={viewMode}
        onProductClick={handleProductClick}
      />

      {/* 🧾 Modal del producto */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAdd={addToCart}
        />
      )}
    </div>
  );
}
