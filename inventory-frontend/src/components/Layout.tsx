import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b">
      <div className="app-container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
            IA
          </div>
          <span className="font-semibold text-lg">Inventory</span>
        </div>

        <nav className="flex items-center gap-3">
          <button className="btn btn-ghost small">Ayuda</button>
          <button className="btn btn-ghost small">Salir</button>
        </nav>
      </div>
    </header>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="app-container page">
          {children}
        </div>
      </main>
      <footer className="py-6">
        <div className="app-container text-sm text-gray-500">
          © {new Date().getFullYear()} Inventory — Proyecto personal
        </div>
      </footer>
    </div>
  );
};

export default Layout;
