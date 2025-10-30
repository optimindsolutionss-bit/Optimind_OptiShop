import { useEffect, useState } from "react";
import { Package, Search, Plus, Edit2, Trash2, LogOut, Check, X } from "lucide-react";
import ProductModal from "../components/ProductModal";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "sonner";
import { getItems } from "../api";

interface Product {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  created_at?: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [addingId, setAddingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [role, setRole] = useState<string | null>(null);

  // Nuevo estado para animación de logout
  const [loggingOut, setLoggingOut] = useState(false);

  const token = localStorage.getItem("token") || undefined;
  const API_URL = "http://localhost:8080/api/v1";

  // Cargar rol al montar
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  // Cargar items
  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getItems(token);
      setItems(data);
    } catch (err) {
      toast.error("Error cargando items", { id: "load-items-error", icon: <X />, duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [token]);

  // Filtrado
  const filteredItems = items.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.price.toString().includes(searchLower) ||
      item.quantity.toString().includes(searchLower)
    );
  });

  // Paginación
  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = itemsPerPage === 0 ? 0 : (currentPage - 1) * itemsPerPage;
  const currentItems = itemsPerPage === 0 ? filteredItems : filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const handleFirst = () => setCurrentPage(1);
  const handleLast = () => setCurrentPage(totalPages);

  const formatPrice = (price: number) =>
    "$" + price.toLocaleString("es-CO", { minimumFractionDigits: 0 });

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  };

  // Modal handlers
  const handleAddClick = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item: Product) => {
    setProductToEdit(item);
    setIsModalOpen(true);
  };

  const handleSave = async (product: Product) => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      if (product.id != null) {
        // Editar producto
        const res = await fetch(`${API_URL}/items/${product.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(product),
        });

        if (!res.ok) {
          const errData = await res.json();
          toast.error("No se pudo actualizar: " + errData.message, { icon: <X />, duration: 5000 });
          return;
        }

        const resData = await res.json();
        const updated: Product = resData.data;

        setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

        setEditingId(updated.id!);
        setTimeout(() => setEditingId(null), 500);

        toast.success("Producto actualizado", { icon: <Check />, duration: 5000 });
      } else {
        // Crear producto
        const res = await fetch(`${API_URL}/items`, {
          method: "POST",
          headers,
          body: JSON.stringify(product),
        });

        if (!res.ok) {
          const errData = await res.json();
          toast.error("No se pudo crear: " + errData.message, { icon: <X />, duration: 5000 });
          return;
        }

        const resData = await res.json();
        const newProduct: Product = resData.data;

        setItems((prev) => [...prev, newProduct]);
        setAddingId(newProduct.id!);
        setTimeout(() => setAddingId(null), 300);

        toast.success("Producto creado", { icon: <Check />, duration: 5000 });
      }
    } catch (err) {
      console.error("Error al guardar producto:", err);
      toast.error("Error al guardar producto", { icon: <X />, duration: 5000 });
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/items/${deleteId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const errData = await res.json();
        toast.error("No se pudo eliminar: " + errData.message, { icon: <X />, duration: 5000 });
        return;
      }

      setDeletingId(deleteId);
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== deleteId));
        setDeletingId(null);
      }, 300);

      toast.success("Producto eliminado", { icon: <Check />, duration: 5000 });
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      toast.error("Error al eliminar producto", { icon: <X />, duration: 5000 });
    } finally {
      setIsConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // Logout con animación fade-in
  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/";
    }, 800); // espera 0.8s para mostrar animación
  };

  return (
    <div className="min-h-screen bg-[#e9edf3] text-gray-900 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 font-sans transition-colors">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
          <Package className="w-9 h-9 text-blue-600 drop-shadow-sm" />
          <span className="tracking-tight">Inventario</span>
        </h1>

        <div className="ml-auto relative group">
          <LogOut
            onClick={handleLogout}
            className="w-6 h-6 text-red-500 hover:text-red-600 cursor-pointer transition"
          />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block 
            bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
            Cerrar sesión
          </span>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-8">
        {role === "admin" && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-all w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Agregar producto
          </button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="flex justify-end mt-4 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white shadow-sm text-gray-700 transition-all hover:border-gray-400"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-x-auto transition-all hover:shadow-xl">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-[#f3f6fb] text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-3 sm:px-6 py-3 font-semibold w-1/12">ID</th>
              <th className="px-3 sm:px-6 py-3 font-semibold w-3/12">Producto</th>
              <th className="px-3 sm:px-6 py-3 font-semibold w-2/12">Cantidad</th>
              <th className="px-3 sm:px-6 py-3 font-semibold w-2/12">Precio</th>
              <th className="px-3 sm:px-6 py-3 font-semibold w-3/12 whitespace-nowrap hidden sm:table-cell">Fecha creación</th>
              <th className="px-3 sm:px-6 py-3 font-semibold w-1/12 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400 italic">Cargando...</td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-all duration-300 border-b border-gray-200
                    ${deletingId === item.id ? "opacity-0 -translate-y-4" : ""}
                    ${addingId === item.id ? "opacity-0 translate-y-[-10px] animate-fadeInDown" : "opacity-100 translate-y-0"}
                    ${editingId === item.id ? "bg-green-100 animate-pulse" : ""}
                  `}
                >
                  <td className="px-3 sm:px-6 py-4 text-gray-600">{item.id}</td>
                  <td className="px-3 sm:px-6 py-4 font-medium text-gray-800">{item.name}</td>
                  <td className="px-3 sm:px-6 py-4 text-gray-600">{item.quantity}</td>
                  <td className="px-3 sm:px-6 py-4 text-gray-900">{formatPrice(item.price)}</td>
                  <td className="px-3 sm:px-6 py-4 text-gray-500 hidden sm:table-cell">{formatDate(item.created_at || "")}</td>
                  <td className="px-3 sm:px-6 py-4 text-center flex justify-center gap-2 sm:gap-3">
                    {role === "admin" && (
                      <>
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400 italic">No se encontraron resultados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginador */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 gap-4 sm:gap-0 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-1 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={0}>Todos</option>
          </select>
          <span>de {filteredItems.length} producto{filteredItems.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={handleFirst} disabled={currentPage === 1 || itemsPerPage === 0} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-40 hover:bg-[#f1f3f8] transition">« Primera</button>
          <button onClick={handlePrev} disabled={currentPage === 1 || itemsPerPage === 0} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-40 hover:bg-[#f1f3f8] transition">← Anterior</button>
          {itemsPerPage !== 0 && <span className="font-medium">Página {currentPage} de {totalPages}</span>}
          <button onClick={handleNext} disabled={currentPage === totalPages || itemsPerPage === 0} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-40 hover:bg-[#f1f3f8] transition">Siguiente →</button>
          <button onClick={handleLast} disabled={currentPage === totalPages || itemsPerPage === 0} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-40 hover:bg-[#f1f3f8] transition">Última »</button>
        </div>
      </div>

      {/* Modales */}
      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} productToEdit={productToEdit} />
      <ConfirmModal isOpen={isConfirmOpen} title="Eliminar producto" message="¿Seguro que deseas eliminar este producto?" onConfirm={handleConfirmDelete} onCancel={() => setIsConfirmOpen(false)} />

      {/* Spinner flotante carga general */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      )}

      {/* Overlay de logout con fade-in/fade-out */}
      {loggingOut && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50 animate-fadeIn">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mb-4"></div>
          <span className="text-white font-semibold text-lg opacity-0 animate-fadeIn animate-delay-150">Cerrando sesión...</span>
        </div>
      )}

      {/* Tailwind animations */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-fadeIn { animation: fadeIn 0.8s forwards; }
          .animate-delay-150 { animation-delay: 0.15s; animation-fill-mode: forwards; }
        `}
      </style>

    </div>
  );
}
