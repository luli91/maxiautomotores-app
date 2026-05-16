'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, LogOut, Shield, MapPin, Contact2 } from 'lucide-react';

export default function PerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function obtenerPerfil() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('usuarios_perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setPerfil(data);
      setLoading(false);
    }
    obtenerPerfil();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="p-10 text-center font-black text-black">Cargando tu perfil...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-black p-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-3 rounded-2xl text-black"><User size={24} /></div>
            <div>
              <h1 className="text-xl font-black text-white uppercase leading-none">{perfil?.nombre_completo} {perfil?.apellidos}</h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Cliente Registrado</p>
            </div>
          </div>
          <button onClick={cerrarSesion} className="bg-zinc-800 text-white p-3 rounded-2xl hover:bg-red-600 transition-colors">
            <LogOut size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-gray-50 p-6 rounded-3xl border">
            <h3 className="text-xs font-black uppercase text-gray-400 mb-4 flex items-center tracking-widest"><Contact2 className="mr-2" size={16} /> Datos de Identificación</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-[10px] text-gray-400 font-black uppercase">DNI / CUIT</span><p className="font-bold uppercase mt-0.5">{perfil?.dni_cuit}</p></div>
              <div><span className="text-[10px] text-gray-400 font-black uppercase">WhatsApp</span><p className="font-bold uppercase mt-0.5">{perfil?.whatsapp}</p></div>
              <div className="col-span-2"><span className="text-[10px] text-gray-400 font-black uppercase">Email de Notificaciones</span><p className="font-bold mt-0.5">{perfil?.email}</p></div>
            </div>
          </div>

          {perfil?.es_admin && (
            <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-200 flex justify-between items-center">
              <div>
                <h4 className="font-black uppercase text-sm text-yellow-800">Cuenta de Administrador</h4>
                <p className="text-xs text-yellow-700 font-medium">Tenés acceso total para publicar y modificar el catálogo.</p>
              </div>
              <button onClick={() => router.push('/admin')} className="bg-black text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider">Ir al Panel</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}