'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, ChevronLeft, CheckCircle2, XCircle, BadgeCheck, CalendarDays, AlertTriangle, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function DetalleAuto() {
  const params = useParams();
  const id = params?.id;
  const [auto, setAuto] = useState<any>(null);
  const [fotoActiva, setFotoActiva] = useState(0);

  useEffect(() => {
    if (!id) return;
    async function cargar() {
      const { data } = await supabase.from('vehiculos').select('*').eq('id', id).single();
      setAuto(data);
    }
    cargar();
  }, [id]);

  if (!auto) return <div className="p-10 text-center font-black text-black">Cargando Ficha Técnica...</div>;

  const mensajeWhatsApp = `Hola Maxi. Ya leí toda la ficha técnica en la web y estoy interesado en agendar una cita para ver/comprar el ${auto.titulo} (Lote ${auto.numero_lote}). ¿Qué horarios tenés disponibles?`;

  // Determinamos qué fotos mostrar: las reales o una de relleno si no cargó ninguna
  const fotosAMostrar = auto.fotos && auto.fotos.length > 0 
    ? auto.fotos 
    : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000']; // Foto genérica por defecto

  // Extraemos el ID del video de YouTube de la URL que pegó Maxi
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(auto.video_youtube);

  return (
    <main className="min-h-screen bg-gray-50 pb-20 text-black font-sans">
      <div className="p-4 max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-black font-bold uppercase text-[10px] tracking-widest">
          <ChevronLeft size={18} /> Volver al Catálogo
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-6">
            
            {/* Carrusel Dinámico */}
            <div className="space-y-3">
              <div className="w-full aspect-video bg-gray-100 rounded-[2rem] overflow-hidden shadow-lg border border-gray-200 relative">
                <img src={fotosAMostrar[fotoActiva]} alt="Vista del vehículo" className="w-full h-full object-cover" />
              </div>
              
              {/* Solo mostramos miniaturas si hay más de una foto */}
              {fotosAMostrar.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                  {fotosAMostrar.map((foto: string, index: number) => (
                    <button 
                      key={index}
                      onClick={() => setFotoActiva(index)}
                      className={`aspect-video rounded-xl overflow-hidden border-4 transition-all ${
                        fotoActiva === index ? 'border-black scale-95 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={foto} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Video Dinámico de YouTube */}
            {youtubeId && (
              <div className="mt-8">
                <h3 className="text-xs font-black mb-4 uppercase tracking-[0.2em] text-gray-400 border-b pb-2 flex items-center gap-2">
                  <PlayCircle size={16} className="text-red-600" /> Video Demostración
                </h3>
                <div className="w-full aspect-video rounded-[2rem] overflow-hidden shadow-lg relative border border-gray-200 bg-black">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${youtubeId}`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* ... Todo el resto de la página (Ficha, Documentación, Precio) se mantiene idéntico ... */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-8">
            <h3 className="text-sm font-black mb-6 uppercase tracking-[0.2em] text-gray-400 border-b pb-2">Descripción Técnica Completa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {[
                  {l: 'Vehículo', v: auto.titulo}, {l: 'Año', v: auto.año}, {l: 'Combustible', v: auto.combustible},
                  {l: 'Caja', v: auto.caja_cambios || 'Manual'}, {l: 'Kilometraje', v: auto.kilometraje + ' KM'},
                  {l: 'Ubicación', v: auto.ubicacion}, {l: 'Radicación', v: auto.radicacion}
                ].map(i => (
                  <div key={i.l} className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-bold uppercase text-[10px]">{i.l}</span>
                    <span className="font-black text-right uppercase text-gray-900">{i.v}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black mb-4 uppercase tracking-widest text-gray-400 flex items-center">
                  <BadgeCheck className="mr-2 text-blue-600" size={16} /> Documentación Legal
                </h3>
                <div className="space-y-2">
                  {[ {l: 'VTV Vigente', v: auto.vtv}, {l: 'Verif. Policial (F12)', v: auto.verificacion_policial}, {l: 'Informe de Dominio', v: auto.informe_dominio}, {l: 'Libre de Deuda', v: auto.libre_deuda} ].map(d => (
                      <div key={d.l} className={`flex items-center justify-between p-3 rounded-xl border ${d.v ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 text-gray-300'}`}>
                        <span className="text-[10px] font-black uppercase">{d.l}</span>
                        {d.v ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-100 p-6 rounded-[2rem] border border-gray-200">
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 flex items-center">
                    <ShieldAlert size={16} className="mr-2" /> Estado y Observaciones
                </h3>
                <div className="bg-white p-3 rounded-xl border border-gray-200 mb-4 inline-block">
                    <span className="text-[10px] font-black text-black uppercase">{auto.estado_detalle}</span>
                </div>
                <p className="text-gray-700 text-sm italic font-medium leading-relaxed">
                  {auto.observaciones || "En el estado que se encuentra y exhibe."}
                </p>
              </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 h-fit">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-2xl">
            <div className="mb-6">
              <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 ${auto.tipo_publicacion === 'Propio' ? 'bg-black text-white' : 'bg-yellow-500 text-black'}`}>
                {auto.tipo_publicacion === 'Propio' ? 'Stock Directo Maxi' : 'Oportunidad de la Red'}
              </div>
              <h1 className="text-2xl font-black uppercase leading-tight mb-1">{auto.titulo}</h1>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Lote {auto.numero_lote} | {auto.tipo_tramite}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-[1.5rem] mb-6 border border-gray-100 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Precio Fijo Contado</p>
                <p className="text-4xl font-black text-green-600">${auto.precio_venta.toLocaleString()}</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-6">
                <div className="flex items-start">
                    <AlertTriangle className="text-yellow-600 mr-2 shrink-0 mt-0.5" size={16} />
                    <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-wide leading-relaxed">
                        Toda la información técnica y estado de papeles se encuentra detallada en esta página. 
                        <br/><br/><span className="font-black text-black">Por favor, contactar únicamente para agendar una visita o concretar la compra.</span>
                    </p>
                </div>
            </div>

            <a 
              href={`https://wa.me/5491111111111?text=${encodeURIComponent(mensajeWhatsApp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-black text-white font-black py-5 rounded-2xl shadow-xl hover:bg-gray-800 transition-all uppercase text-[11px] tracking-widest active:scale-95"
            >
              <CalendarDays size={20} className="text-yellow-500" /> 
              <span>Agendar Cita por WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}