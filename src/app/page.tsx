'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Car, Zap, ChevronRight, Star, BellRing, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [celular, setCelular] = useState('');
  const [guardandoCelular, setGuardandoCelular] = useState(false);
  // Nuevo estado para los mensajes personalizados (reemplaza al alert)
  const [mensajeStatus, setMensajeStatus] = useState<{ tipo: 'exito' | 'error' | 'info'; texto: string } | null>(null);

  useEffect(() => {
    async function traerVehiculos() {
      const { data } = await supabase.from('vehiculos').select('*').eq('activo', true);
      setVehiculos(data || []);
      setLoading(false);
    }
    traerVehiculos();
  }, []);

  const activarAlertas = async () => {
    if (!celular || celular.length < 8) {
      setMensajeStatus({ tipo: 'error', texto: 'Por favor, ingresá un WhatsApp válido.' });
      return;
    }

    setGuardandoCelular(true);
    setMensajeStatus(null);

    try {
      // 1. COMPROBACIÓN: ¿Ya existe este número?
      const { data: existe } = await supabase
        .from('club_inversores')
        .select('id')
        .eq('whatsapp', celular)
        .maybeSingle();

      if (existe) {
        setMensajeStatus({ tipo: 'info', texto: '¡Ya estás en la lista! Te avisaremos cuando haya novedades.' });
        setCelular('');
        setGuardandoCelular(false);
        return;
      }

      // 2. SI NO EXISTE: Lo guardamos
      const { error } = await supabase.from('club_inversores').insert([
        { whatsapp: celular, nombre: 'Usuario Web', activo: true }
      ]);

      if (error) throw error;

      setMensajeStatus({ tipo: 'exito', texto: '¡Excelente! Registro completado con éxito.' });
      setCelular('');

    } catch (error: any) {
      setMensajeStatus({ tipo: 'error', texto: 'Hubo un problema. Intentá de nuevo más tarde.' });
    } finally {
      setGuardandoCelular(false);
    }
  };

  const propios = vehiculos.filter(v => v.tipo_publicacion === 'Propio');
  const oportunidades = vehiculos.filter(v => v.tipo_publicacion === 'Oportunidad');

  if (loading) return <div className="p-10 text-center font-black text-black tracking-widest uppercase">Cargando catálogo...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black font-sans">
      <header className="bg-black text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <h1 className="text-5xl font-black tracking-tighter mb-4">MAXIAUTOMOTORES</h1>
        <p className="text-yellow-500 font-bold uppercase tracking-widest text-sm">Venta Directa & Oportunidades</p>
      </header>

      {/* ALERTAS DE WHATSAPP CTA ACTUALIZADO */}
      <section className="max-w-6xl mx-auto mt-6 mb-16 px-4 relative z-10">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-4 border-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center">
              <BellRing size={36} className="text-black mr-5 hidden md:block" />
              <div>
                <h2 className="text-2xl font-black text-black leading-none uppercase mb-2">Alertas por WhatsApp</h2>
                <p className="text-black/80 font-bold text-sm">Dejanos tu número para enterarte de los nuevos ingresos.</p>
              </div>
            </div>
            
            <div className="flex flex-col w-full md:w-auto gap-3">
              <div className="flex w-full md:w-auto gap-3">
                <input 
                  type="number"
                  placeholder="Tu WhatsApp" 
                  value={celular}
                  onChange={(e) => {
                    setCelular(e.target.value);
                    if(mensajeStatus) setMensajeStatus(null); // Limpiar mensaje al escribir
                  }}
                  className="flex-grow md:w-64 p-4 rounded-2xl bg-white/90 border-none outline-none font-bold text-black" 
                />
                <button 
                  onClick={activarAlertas}
                  disabled={guardandoCelular}
                  className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-gray-900 transition-all shadow-lg disabled:bg-gray-600"
                >
                  {guardandoCelular ? '...' : 'Unirme'}
                </button>
              </div>

              {/* MENSAJE DE ESTADO PERSONALIZADO (En lugar del alert de localhost) */}
              {mensajeStatus && (
                <div className={`flex items-center gap-2 p-3 rounded-xl font-bold text-[11px] uppercase tracking-wide animate-pulse ${
                  mensajeStatus.tipo === 'exito' ? 'bg-green-100 text-green-700' : 
                  mensajeStatus.tipo === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                  {mensajeStatus.tipo === 'exito' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {mensajeStatus.texto}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 space-y-20 pb-20">
        <section>
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-black text-white p-3 rounded-2xl"><Star size={24} /></div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Nuestro Stock Seleccionado</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propios.map(v => <CardVehiculo key={v.id} v={v} color="black" />)}
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-yellow-500 text-black p-3 rounded-2xl"><Zap size={24} /></div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Oportunidades de la Red</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {oportunidades.map(v => <CardVehiculo key={v.id} v={v} color="yellow" />)}
          </div>
        </section>
      </div>
    </main>
  );
}

// El componente CardVehiculo se mantiene igual
function CardVehiculo({ v, color }: { v: any, color: string }) {
  // Verificamos si el auto tiene fotos cargadas
  const tieneFoto = v.fotos && v.fotos.length > 0;
  const fotoPrincipal = tieneFoto ? v.fotos[0] : null;

  return (
    <Link href={`/auto/${v.id}`} className="group">
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
        
        {/* ZONA DE IMAGEN DINÁMICA */}
        <div className="bg-gray-200 h-56 flex items-center justify-center relative overflow-hidden">
          {tieneFoto ? (
            <img src={fotoPrincipal} alt={v.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <Car size={60} className="text-gray-400 opacity-50 group-hover:scale-110 transition-transform" />
          )}
          
          <div className={`absolute top-4 left-4 ${color === 'black' ? 'bg-black text-white' : 'bg-yellow-500 text-black'} text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md`}>
            {v.tipo_publicacion === 'Propio' ? 'Stock inmediato' : 'Oportunidad'}
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-black text-gray-900 mb-1 uppercase leading-none truncate" title={v.titulo}>{v.titulo}</h3>
          <p className="text-gray-400 font-bold text-xs mb-6 uppercase">{v.año} • {v.kilometraje} KM</p>
          <div className="flex justify-between items-center border-t border-gray-50 pt-6">
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Precio Final</p>
              <p className="text-2xl font-black text-green-600">${v.precio_venta.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-black group-hover:text-white transition-colors">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}