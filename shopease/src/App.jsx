import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./components/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./components/CheckoutSuccess";
import { Sprout } from "lucide-react"; // 🌱 icono profesional

function App() {
  const [showCart, setShowCart] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background text-dark">
        <Navbar onCartClick={() => setShowCart((prev) => !prev)} />

        <main className="flex-1 container mx-auto px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
          </Routes>
        </main>

        {/* Cart modal flotante */}
        {showCart && <Cart onClose={() => setShowCart(false)} />}

        {/* ✅ Footer con los mismos colores que el navbar */}
        <footer className="bg-gradient-to-r from-primary to-secondary text-white text-center py-4 mt-6 flex justify-center items-center gap-2">
          <Sprout size={20} className="text-white" />
          <p>© 2025 ShopEase. Inspirado en lo natural</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
