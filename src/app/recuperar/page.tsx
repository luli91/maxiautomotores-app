'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarPage() {
  const [loading, setLoading] = useState(false);
  const [mensajeStatus, setMensajeStatus] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const handleRecover = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMensajeStatus(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-password`,
    });

    if (error) {
      setMensajeStatus({ tipo: 'error', texto: error.message });
    } else {
      setMensajeStatus({ tipo: 'exito', texto: '¡Listo! Revisá tu casilla de correo.' });
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-black font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <Link href="/login" className="inline-flex items-center text-gray-400 hover:text-black font-black uppercase text-[9px] tracking-widest">
            <ChevronLeft size={14} /> Volver al login
          </Link>
        </div>
        <div className="bg-black p-8 text-center flex flex-col items-center">
          <Mail className="text-yellow-500 mb-2" size={32} />
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">Recuperar Contraseña</h1>
        </div>

        <form onSubmit={handleRecover} className="p-8 space-y-4">
          <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed text-center">
            Ingresá tu correo y te enviaremos un enlace para que generes una nueva clave.
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
            <label className="text-[10px] font-black uppercase text-gray-400">Tu Email Registrado</label>
            <input 
              name="email" 
              type="email" 
              required 
              onChange={() => setMensajeStatus(null)}
              className="w-full p-3 border rounded-xl bg-white outline-none focus:border-yellow-500" 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl uppercase tracking-widest hover:bg-gray-800 transition-all disabled:bg-gray-400">
            {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
          </button>
        </form>
      </div>
    </main>
  );
}