import { useCart } from "../context/CartContext.jsx";
import { X, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ Formatear moneda COP
const formatCurrency = (value) => {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
};

export default function Cart({ onClose }) {
  const { cartItems, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();            // 🔹 Cierra el modal
    navigate("/checkout"); // 🔹 Navega al formulario
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-md w-11/12 sm:w-96 p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {cartItems.length === 0 ? (
          <p className="text-gray-600 text-center">Tu carrito está vacío.</p>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Carrito</h2>

            <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-green-600 font-bold">
                      {formatCurrency(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="p-1 bg-gray-200 rounded-full"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity === 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="p-1 bg-gray-200 rounded-full"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <span className="font-semibold text-lg">Total:</span>
              <span className="font-bold text-xl text-green-600">
                {formatCurrency(total)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-4 bg-green-600 text-white py-2 rounded-full hover:bg-green-700 transition"
            >
              Ir al pago
            </button>
          </>
        )}
      </div>
    </div>
  );
}
