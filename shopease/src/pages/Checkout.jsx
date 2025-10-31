import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import jsPDF from "jspdf";

// ✅ Formato de moneda COP
const formatCurrency = (value) => {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
};

// ✅ Generar número de pedido
const generateOrderNumber = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const counter = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `PED-${yyyy}${mm}${dd}-${counter}`;
};

export default function Checkout() {
  const { cartItems, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", email: "", direccion: "", metodo: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      clearCart(); // ✅ reset del carrito
      navigate("/checkout-success", { state: { form, cartItems, total } });
    }, 2000);
  };

  // ✅ PDF antes de confirmar compra
  const descargarPedidoPDF = () => {
    const doc = new jsPDF();
    const orderNumber = generateOrderNumber();
    const date = new Date().toLocaleDateString();

    // Encabezado
    doc.setFillColor(34, 197, 94); // verde
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Resumen de tu pedido", 105, 14, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Número de pedido: ${orderNumber}`, 20, 35);
    doc.text(`Fecha: ${date}`, 20, 42);

    let y = 55;
    doc.text("Productos:", 20, y);
    y += 6;
    cartItems.forEach((item) => {
      doc.text(`${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}`, 25, y);
      y += 8;
    });

    y += 4;
    doc.setDrawColor(34, 197, 94);
    doc.setFillColor(34, 197, 94);
    doc.rect(20, y, 170, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(`Total: ${formatCurrency(total)}`, 25, y + 6);

    doc.save(`pedido_${orderNumber}.pdf`);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 my-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Finalizar compra</h2>

      {/* Resumen del pedido */}
      <div className="border border-gray-200 rounded-xl p-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Resumen de tu pedido</h3>
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between border-b py-2 text-gray-700">
            <span>{item.name} × {item.quantity}</span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between mt-3 text-lg font-bold text-green-600">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <button
          onClick={descargarPedidoPDF}
          className="mt-4 bg-green-600 text-white py-2 px-4 rounded-full hover:bg-green-700 transition"
        >
          Descargar PDF
        </button>
      </div>

      {/* Formulario de pago */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Método de pago</h3>
          <div className="grid grid-cols-2 gap-3">
            {["Tarjeta de crédito", "Nequi", "Daviplata", "Contraentrega"].map((metodo) => (
              <label key={metodo} className={`border rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all ${
                form.metodo === metodo
                  ? "border-green-500 bg-green-50 ring-2 ring-green-400"
                  : "border-gray-300 hover:bg-gray-50"
              }`}>
                <input type="radio" name="metodo" value={metodo} checked={form.metodo === metodo} onChange={handleChange} className="hidden" />
                <span className="font-medium text-gray-700">{metodo}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Nombre completo</label>
          <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Correo electrónico</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Dirección de envío</label>
          <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition font-semibold">
          {loading ? "Procesando pago..." : "Confirmar compra"}
        </button>
      </form>
    </div>
  );
}
