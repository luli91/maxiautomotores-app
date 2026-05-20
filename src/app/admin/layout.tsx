'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Globe, LogOut, Menu, X, Car, PackagePlus, Wallet } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { label: 'Tablero y Métricas', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Inventario de Stock', path: '/admin/inventario', icon: <Car className="h-5 w-5" /> },
    { label: 'Publicar Vehículo', path: '/admin/publicar', icon: <PackagePlus className="h-5 w-5" /> },
    { label: 'Finanzas', path: '/admin/finanzas', icon: <Wallet className="h-5 w-5" /> },
    { label: 'Ver Web Pública', path: '/', icon: <Globe className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-black font-sans">
      
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-black p-2 rounded-xl text-white shadow-lg"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {menuAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setMenuAbierto(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-black text-white p-8 flex flex-col z-40 transform transition-transform duration-300 ${menuAbierto ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 shadow-2xl`}>
        <div className="mb-12 flex flex-col items-center text-center mt-8 md:mt-0">
          <img 
            src="/logo.png" 
            alt="Maxi Automotores Logo" 
            className="h-16 w-auto object-contain mb-4 drop-shadow-md" 
          />
          
          <h2 className="text-xl font-black tracking-tight leading-none uppercase">
            MAXI<span className="text-yellow-500 font-black">ADMIN</span>
          </h2>
          <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">
            Gestión de Agencia
          </p>
        </div>
        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setMenuAbierto(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                pathname === item.path ? "bg-yellow-500 text-black font-black shadow-lg" : "text-gray-400 font-bold hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="text-sm tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button onClick={handleCerrarSesion} className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-colors font-bold text-sm">
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 pt-24 md:pt-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}