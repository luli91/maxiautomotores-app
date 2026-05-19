'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Building, ArrowRight, Wrench, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [esRegistro, setEsRegistro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [empresa, setEmpresa] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (esRegistro) {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase.from('usuarios_perfiles').upsert({
            id: authData.user.id,
            email: email,
            nombre_completo: nombre,
            whatsapp: whatsapp,
            empresa: empresa || null,
            es_admin: false,
            apellidos: null,
            dni_cuit: null 
          });
          if (profileError) throw profileError;
        }
      } else {
        const { error: loginError, data } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        const { data: perfil } = await supabase.from('usuarios_perfiles').select('es_admin').eq('id', data.user.id).single();
        if (perfil?.es_admin) {
          router.push('/admin');
          return; 
        }
      }

      router.push('/');
      router.refresh(); 
      
    } catch (err: any) {
      if (err.message.includes('User already registered')) setError('Este correo ya está registrado. Por favor, iniciá sesión.');
      else if (err.message.includes('Invalid login')) setError('El correo o la contraseña son incorrectos.');
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-black opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black to-transparent"></div>

      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-gray-100">
        
        {/* COLUMNA IZQUIERDA: COMPUTADORA */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-black p-12 text-white relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          
          <div className="relative z-10">
            {/* LOGO EN VEZ DE ICONO */}
            <Link href="/" className="inline-block mb-8 hover:scale-105 transition-transform bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
              <img src="/logo.jpg" alt="Maxi Automotores" className="h-16 w-auto object-contain drop-shadow-lg" />
            </Link>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">
              MAXI<br/><span className="text-yellow-500">AUTOMOTORES</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Acceso a la plataforma</p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <Wrench className="text-yellow-500 shrink-0" size={24} />
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">Accedé a oportunidades únicas, autos sanos económicos y vehículos para reparar.</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 bg-white">
          
          {/* HEADER MOBILE CON LOGO */}
          <div className="md:hidden flex items-center justify-center mb-8 border-b pb-6">
            <img src="/logo.jpg" alt="Maxi Automotores" className="h-14 w-auto object-contain drop-shadow-md" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter">
              {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h2>
            <p className="text-sm font-bold text-gray-400 mt-2">
              {esRegistro ? 'Completá tus datos para acceder a las ofertas.' : 'Ingresá para ver tus favoritos y novedades.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-wide mb-8 border border-red-100">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {esRegistro && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
                  <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre y Apellido" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-yellow-500 focus:bg-white transition-colors font-bold text-black" />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Phone size={18} /></div>
                  <input type="number" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Número de WhatsApp" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-yellow-500 focus:bg-white transition-colors font-bold text-black" />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Building size={18} /></div>
                  <input type="text" value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Nombre del Taller / Empresa (Opcional)" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-yellow-500 focus:bg-white transition-colors font-bold text-black" />
                </div>
              </>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-yellow-500 focus:bg-white transition-colors font-bold text-black" />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
              <input 
                type={mostrarPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Contraseña" 
                minLength={6} 
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-yellow-500 focus:bg-white transition-colors font-bold text-black" 
              />
              <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black transition-colors">
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {!esRegistro && (
              <div className="text-right mt-2">
                <Link href="/recuperar" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-yellow-600 transition-colors">¿Olvidaste tu contraseña?</Link>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-black text-white font-black py-5 rounded-2xl mt-4 uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl disabled:bg-gray-400 active:scale-95">
              {loading ? 'Procesando...' : esRegistro ? 'Crear mi cuenta' : 'Ingresar'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-8">
            <p className="text-gray-500 font-bold text-sm">
              {esRegistro ? '¿Ya tenés cuenta?' : '¿Todavía no te registraste?'}
            </p>
            <button 
              onClick={() => {
                setEsRegistro(!esRegistro); setError(null);
                setEmail(''); setPassword(''); setNombre(''); setWhatsapp(''); setEmpresa('');
              }} 
              className="mt-2 text-black font-black uppercase text-xs tracking-widest hover:text-yellow-600 transition-colors"
            >
              {esRegistro ? 'INICIAR SESIÓN' : 'REGISTRARME GRATIS'}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}