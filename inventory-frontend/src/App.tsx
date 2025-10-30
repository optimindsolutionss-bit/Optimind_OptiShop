import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; // ✅ Importar Toaster
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import TestApi from "./pages/TestApi";

function App() {
  return (
    <Router>
      {/* Toaster global */}
      <Toaster position="top-right" richColors />

      <div className="min-h-screen bg-rose-100 text-gray-900">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test-api" element={<TestApi />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
