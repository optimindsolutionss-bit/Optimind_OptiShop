import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser({ username, password });

      if (data.data && data.data.token && data.data.role) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("role", data.data.role);

        // Mantener animación visible 0.8s antes de navegar
        setTimeout(() => {
          setLoading(false);
          navigate("/dashboard");
        }, 800);
      } else {
        setError("Respuesta inesperada del servidor.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center text-gray-100 relative">

      {/* Login Box */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900/70 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-96 border border-gray-700 z-10 relative"
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          Bienvenido
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Ingresa a tu panel de inventario
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Usuario</label>
            <input
              type="text"
              placeholder="Tu nombre de usuario"
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-100 placeholder-gray-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-100 placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-all shadow-md"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </motion.button>
        </form>
 {/*
        /*<p className="text-center text-sm text-gray-500 mt-6">
          ¿Olvidaste tu contraseña?{" "}
          <a href="#" className="text-blue-400 hover:underline">
            Recuperar
          </a>
        </p>
        */}

      </motion.div>

      {/* Overlay de carga con animación framer-motion */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="rounded-full h-16 w-16 border-t-4 border-blue-600 mb-4"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <motion.span
              className="text-white font-semibold text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Iniciando sesión...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
