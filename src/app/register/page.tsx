'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);
    const formData = new FormData(e.currentTarget);
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const nombre = formData.get('nombre') as string;
    const apellidos = formData.get('apellidos') as string;
    const dni = formData.get('dni') as string;
    const whatsapp = formData.get('whatsapp') as string;

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setErrorStatus(authError.message);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (authData?.user) {
      const { error: perfilError } = await supabase.from('usuarios_perfiles').insert([{
          id: authData.user.id, email, nombre_completo: nombre, apellidos, dni_cuit: dni, whatsapp,
          direccion_calle: '', codigo_postal: '', provincia: '', ciudad: '', acepta_terminos: true
      }]);

      if (perfilError) {
        setErrorStatus('Error al guardar datos: ' + perfilError.message);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/login');
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-black font-sans">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-black p-8 text-center flex flex-col items-center">
          <UserPlus className="text-yellow-500 mb-2" size={32} />
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Crear Cuenta</h1>
        </div>

        <form onSubmit={handleRegister} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {errorStatus && (
            <div className="md:col-span-2 flex items-center gap-2 p-3 rounded-xl font-bold text-[11px] uppercase tracking-wide bg-red-100 text-red-700 animate-pulse">
              <AlertCircle size={14} /> {errorStatus}
            </div>
          )}

          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Email</label>
            <input name="email" type="email" required onChange={() => setErrorStatus(null)} className="w-full p-3 border rounded-xl bg-white outline-none focus:border-yellow-500" />
          </div>
          
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Contraseña</label>
            <div className="relative">
              <input 
                name="password" 
                type={mostrarPassword ? "text" : "password"} 
                required 
                onChange={() => setErrorStatus(null)}
                className="w-full p-3 border rounded-xl bg-white outline-none focus:border-yellow-500 pr-10" 
              />
              <button 
                type="button" 
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-black transition-colors"
              >
                {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div><label className="text-[10px] font-black uppercase text-gray-400">Nombre</label><input name="nombre" type="text" required className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
          <div><label className="text-[10px] font-black uppercase text-gray-400">Apellidos</label><input name="apellidos" type="text" required className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
          <div><label className="text-[10px] font-black uppercase text-gray-400">DNI / CUIT</label><input name="dni" type="text" required className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
          <div><label className="text-[10px] font-black uppercase text-gray-400">WhatsApp</label><input name="whatsapp" type="text" required placeholder="Ej: 1123456789" className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
          
          <button type="submit" disabled={loading} className="md:col-span-2 w-full bg-black text-white font-black py-4 rounded-xl uppercase tracking-widest hover:bg-gray-800 transition-all mt-4 disabled:bg-gray-400">
            {loading ? 'CREANDO CUENTA...' : 'REGISTRARME'}
          </button>
          
          <p className="md:col-span-2 text-center text-xs font-bold text-gray-400 mt-2 uppercase">
            ¿Ya tenés cuenta? <Link href="/login" className="text-black underline">Iniciá sesión acá</Link>
          </p>
        </form>
      </div>
    </main>
  );
}