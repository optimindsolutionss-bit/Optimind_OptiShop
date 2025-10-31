import { CheckCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import jsPDF from "jspdf";

const formatCurrency = (value) => {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
};

const generateOrderNumber = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const counter = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `PED-${yyyy}${mm}${dd}-${counter}`;
};

export default function CheckoutSuccess() {
  const location = useLocation();
  const { form, cartItems, total } = location.state || {};
  const orderNumber = generateOrderNumber();
  const date = new Date().toLocaleDateString();

  const descargarPDFPagoExitoso = () => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFillColor(34, 197, 94); // verde
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("¡Pago exitoso!", 105, 14, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Número de pedido: ${orderNumber}`, 20, 35);
    doc.text(`Fecha: ${date}`, 20, 42);

    // Datos del comprador
    let y = 55;
    doc.text("Datos del comprador:", 20, y);
    y += 6;
    doc.text(`Nombre: ${form.nombre}`, 25, y); y += 6;
    doc.text(`Email: ${form.email}`, 25, y); y += 6;
    doc.text(`Dirección: ${form.direccion}`, 25, y); y += 10;

    // Productos
    doc.text("Productos:", 20, y); y += 6;
    cartItems.forEach(item => {
      doc.text(`${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}`, 25, y);
      y += 8;
    });

    // Total destacado
    y += 4;
    doc.setDrawColor(34, 197, 94);
    doc.setFillColor(34, 197, 94);
    doc.rect(20, y, 170, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(`Total: ${formatCurrency(total)}`, 25, y + 6);

    doc.save(`pago_${orderNumber}.pdf`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
      <CheckCircle size={80} className="text-green-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pago exitoso!</h2>
      <p className="text-gray-600 mb-6">Gracias por tu compra. Recibirás un correo con la confirmación.</p>
      
      <button
        onClick={descargarPDFPagoExitoso}
        className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition mb-4"
      >
        Descargar Comprobante
      </button>

      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
