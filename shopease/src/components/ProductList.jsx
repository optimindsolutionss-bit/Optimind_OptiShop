import ProductCard from "./ProductCard";

export default function ProductList({ products, viewMode, onProductClick }) {
  return (
    <div className={`grid gap-6 p-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}       // ✅ Pasamos el objeto completo
          viewMode={viewMode}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
}
