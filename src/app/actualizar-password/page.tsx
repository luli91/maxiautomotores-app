'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { KeySquare, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ActualizarPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensajeStatus, setMensajeStatus] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMensajeStatus(null);
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setMensajeStatus({ tipo: 'error', texto: error.message });
    } else {
      setMensajeStatus({ tipo: 'exito', texto: '¡Contraseña actualizada con éxito! Redirigiendo...' });
      setTimeout(() => router.push('/perfil'), 2000);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-black font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-black p-8 text-center flex flex-col items-center">
          <KeySquare className="text-yellow-500 mb-2" size={32} />
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Crear Nueva Clave</h1>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-4">
          <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed text-center mb-4">
            Ingresá tu nueva contraseña de acceso.
          </p>

          {mensajeStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-xl font-bold text-[11px] uppercase tracking-wide animate-pulse ${
              mensajeStatus.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {mensajeStatus.tipo === 'exito' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {mensajeStatus.texto}
            </div>
          )}
          
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400">Nueva Contraseña</label>
            <div className="relative">
              <input 
                name="password" 
                type={mostrarPassword ? "text" : "password"} 
                required 
                onChange={() => setMensajeStatus(null)}
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

          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl uppercase tracking-widest hover:bg-gray-800 transition-all disabled:bg-gray-400">
            {loading ? 'ACTUALIZANDO...' : 'GUARDAR CONTRASEÑA'}
          </button>
        </form>
      </div>
    </main>
  );
}