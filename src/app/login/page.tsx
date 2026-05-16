'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setErrorStatus('Email o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    if (authData?.user) {
      const { data: perfil } = await supabase
        .from('usuarios_perfiles')
        .select('es_admin')
        .eq('id', authData.user.id)
        .single();

      if (perfil?.es_admin) {
        router.push('/admin');
      } else {
        router.push('/perfil');
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-black font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-black p-8 text-center flex flex-col items-center">
          <KeyRound className="text-yellow-500 mb-2" size={32} />
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Ingreso al Sistema</h1>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-4">
          
          {errorStatus && (
            <div className="flex items-center gap-2 p-3 rounded-xl font-bold text-[11px] uppercase tracking-wide bg-red-100 text-red-700 animate-pulse">
              <AlertCircle size={14} /> {errorStatus}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400">Email Comercial</label>
            <input 
              name="email" 
              type="email" 
              required 
              onChange={() => setErrorStatus(null)}
              className="w-full p-3 border rounded-xl bg-white outline-none focus:border-yellow-500" 
            />
          </div>
          <div>
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

          <div className="text-right">
            <Link href="/recuperar" className="text-[10px] font-black text-gray-400 uppercase underline">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl uppercase tracking-widest hover:bg-gray-800 transition-all mt-2 disabled:bg-gray-400">
            {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
          </button>

          <p className="text-center text-xs font-bold text-gray-400 mt-4 uppercase">
            ¿No estás registrado? <Link href="/register" className="text-black underline">Creá tu cuenta</Link>
          </p>
        </form>
      </div>
    </main>
  );
}