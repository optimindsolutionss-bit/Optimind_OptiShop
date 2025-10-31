import { ShoppingCart, Home, Package, Leaf } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { Link } from "react-router-dom";

export default function Navbar({ onCartClick }) {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-gradient-to-r from-primary to-secondary text-white p-4 shadow-md flex justify-between items-center">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 text-2xl font-bold tracking-wide hover:text-background transition"
      >
        <Leaf size={28} strokeWidth={2.5} className="text-white" />
        <span>ShopEase</span>
      </Link>

      <ul className="flex space-x-6 items-center">
        <li>
          <Link
            to="/"
            className="flex items-center gap-2 hover:text-background transition-colors duration-200"
          >
            <Home size={20} /> Inicio
          </Link>
        </li>

        <li>
          <Link
            to="/"
            className="flex items-center gap-2 hover:text-background transition-colors duration-200"
          >
            <Package size={20} /> Productos
          </Link>
        </li>

        <li
          className="flex items-center gap-2 cursor-pointer transition-colors duration-200 relative hover:text-background"
          onClick={onCartClick}
        >
          <ShoppingCart size={20} /> Carrito
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-3 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex justify-center items-center shadow-md">
              {totalItems}
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
