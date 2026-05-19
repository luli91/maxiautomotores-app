'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, ChevronLeft, CheckCircle2, XCircle, BadgeCheck, CalendarDays, AlertTriangle, PlayCircle, Eye, Share2, Heart, X } from 'lucide-react';
import Link from 'next/link';

export default function DetalleAuto() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [auto, setAuto] = useState<any>(null);
  const [fotoActiva, setFotoActiva] = useState(0);
  
  const [sesion, setSesion] = useState<any>(null);
  const [esFavorito, setEsFavorito] = useState(false);

  // Estado para el modal lindo
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function cargar() {
      // Cargamos sesión para favoritos
      const { data: { session } } = await supabase.auth.getSession();
      setSesion(session);

      // Cargamos datos del auto
      const { data } = await supabase.from('vehiculos').select('*').eq('id', id).single();
      if (data) {
        setAuto(data);
        
        // Sumamos 1 visita silenciosamente
        const nuevasVistas = (data.vistas || 0) + 1;
        await supabase.from('vehiculos').update({ vistas: nuevasVistas }).eq('id', id);

        // Verificamos si ya es favorito
        if (session) {
          const { data: fav } = await supabase.from('favoritos').select('id').match({ user_id: session.user.id, vehiculo_id: id }).maybeSingle();
          if (fav) setEsFavorito(true);
        }
      }
    }
    cargar();
  }, [id]);

  const toggleFavorito = async () => {
    if (!sesion) {
      setMostrarModalLogin(true); // ACÁ LLAMAMOS AL MODAL LINDO EN VEZ DEL ALERT
      return;
    }
    if (esFavorito) {
      setEsFavorito(false);
      await supabase.from('favoritos').delete().match({ user_id: sesion.user.id, vehiculo_id: id });
    } else {
      setEsFavorito(true);
      await supabase.from('favoritos').insert([{ user_id: sesion.user.id, vehiculo_id: id }]);
    }
  };

  const compartirWhatsApp = () => {
    const titulo = auto.marca ? `${auto.marca} ${auto.titulo}` : auto.titulo;
    const texto = `¡Mirá esta oportunidad en MaxiAutomotores! 🔥\n\n*${titulo}*\nPrecio: $${auto.precio_venta.toLocaleString()}\nAño: ${auto.año} | KM: ${auto.kilometraje}\n\nFijate el detalle técnico acá: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  };

  if (!auto) return <div className="min-h-screen flex items-center justify-center font-black text-black tracking-widest uppercase animate-pulse">Cargando Ficha Técnica...</div>;

  const mensajeWhatsApp = `Hola Maxi. Ya leí toda la ficha técnica en la web y estoy interesado en agendar una cita para ver/comprar el ${auto.marca ? auto.marca + ' ' : ''}${auto.titulo} (Lote ${auto.numero_lote}). ¿Qué horarios tenés disponibles?`;

  const fotosAMostrar = auto.fotos && auto.fotos.length > 0 
    ? auto.fotos 
    : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000']; 

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(auto.video_youtube);
  const tituloCompleto = auto.marca ? `${auto.marca} ${auto.titulo}` : auto.titulo;

  return (
    <main className="min-h-screen bg-gray-50 pb-20 text-black font-sans relative">
      
      {/* MODAL DE LOGIN LINDO */}
      {mostrarModalLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative text-center border border-gray-100">
            <button onClick={() => setMostrarModalLogin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black bg-gray-100 p-2 rounded-full transition-colors"><X size={20} /></button>
            <div className="bg-red-50 text-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="fill-red-500" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Guardá tus proyectos</h3>
            <p className="text-gray-500 font-bold text-sm mb-8">Iniciá sesión o creá una cuenta gratis para guardar tus autos favoritos y armar presupuestos.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push('/login')} className="bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95">Ingresar al sistema</button>
              <button onClick={() => setMostrarModalLogin(false)} className="text-gray-400 font-bold text-xs uppercase hover:text-black transition-colors py-3">Seguir mirando</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-black font-bold uppercase text-[10px] tracking-widest bg-white py-2 px-4 rounded-full shadow-sm border">
          <ChevronLeft size={16} className="mr-1" /> Volver al Catálogo
        </Link>
        
        <button onClick={compartirWhatsApp} className="inline-flex items-center text-green-700 hover:text-white hover:bg-green-600 bg-green-50 font-black uppercase text-[10px] tracking-widest py-2 px-4 rounded-full shadow-sm border border-green-200 transition-colors">
          <Share2 size={16} className="mr-2" /> Compartir Oferta
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-6">
            
            <div className="space-y-3">
              <div className="w-full aspect-video bg-gray-200 rounded-[2rem] overflow-hidden shadow-lg border border-gray-200 relative group">
                <img src={fotosAMostrar[fotoActiva]} alt="Vista del vehículo" className="w-full h-full object-cover" />
                
                <button 
                  onClick={toggleFavorito} 
                  className={`absolute top-6 right-6 p-4 rounded-full shadow-2xl transition-all z-10 backdrop-blur-md ${esFavorito ? 'bg-red-50 text-red-500 hover:bg-white' : 'bg-black/40 text-white hover:bg-red-500 hover:text-white'}`}
                >
                  <Heart size={24} className={esFavorito ? "fill-red-500" : ""} />
                </button>
              </div>
              
              {fotosAMostrar.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                  {fotosAMostrar.map((foto: string, index: number) => (
                    <button 
                      key={index}
                      onClick={() => setFotoActiva(index)}
                      className={`aspect-video rounded-xl overflow-hidden border-4 transition-all shadow-sm ${
                        fotoActiva === index ? 'border-yellow-500 scale-95 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={foto} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {youtubeId && (
              <div className="mt-8">
                <h3 className="text-xs font-black mb-4 uppercase tracking-[0.2em] text-gray-400 border-b pb-2 flex items-center gap-2">
                  <PlayCircle size={16} className="text-red-600" /> Video Demostración
                </h3>
                <div className="w-full aspect-video rounded-[2rem] overflow-hidden shadow-lg relative border border-gray-200 bg-black">
                  <iframe 
                    width="100%" height="100%" 
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

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-8">
            <h3 className="text-sm font-black mb-6 uppercase tracking-[0.2em] text-gray-400 border-b pb-2">Descripción Técnica Completa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {[
                  {l: 'Vehículo', v: tituloCompleto}, {l: 'Año', v: auto.año}, {l: 'Combustible', v: auto.combustible},
                  {l: 'Caja', v: auto.caja_cambios || 'Manual'}, {l: 'Kilometraje', v: auto.kilometraje ? auto.kilometraje + ' KM' : 'No especificado'},
                  {l: 'Ubicación', v: auto.ubicacion}, {l: 'Radicación', v: auto.radicacion}
                ].map(i => (
                  <div key={i.l} className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-bold uppercase text-[10px]">{i.l}</span>
                    <span className="font-black text-right uppercase text-gray-900 truncate max-w-[150px]" title={i.v}>{i.v}</span>
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
                    <span className="text-[10px] font-black text-black uppercase">{auto.tipo_dano || 'Mecánica'}</span>
                </div>
                <p className="text-gray-700 text-sm italic font-medium leading-relaxed">
                  {auto.observaciones || "Vehículo en el estado que se encuentra y exhibe. Consulte detalles."}
                </p>
              </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (Panel Comercial) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 h-fit">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-2xl">
            
            <div className="mb-6">
              <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm ${
                auto.es_sold ? 'bg-red-600 text-white animate-pulse' : auto.tipo_publicacion === 'Propio' ? 'bg-black text-white' : 'bg-red-600 text-white'
              }`}>
                {auto.es_sold ? '🚫 UNIDAD VENDIDA' : auto.tipo_publicacion === 'Propio' ? 'Stock Directo Maxi' : '🔥 Oportunidad de la Red'}
              </div>
              <h1 className="text-2xl font-black uppercase leading-tight mb-1">{tituloCompleto}</h1>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Lote {auto.numero_lote} | {auto.tipo_tramite}</p>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                  <Eye size={12} /> {auto.vistas || 0} vistas
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-[1.5rem] mb-6 border border-gray-100 text-center relative overflow-hidden">
                {auto.es_sold && (
                  <div className="absolute inset-0 bg-red-600/10 backdrop-blur-[1px] flex items-center justify-center rotate-12 scale-110 border-2 border-dashed border-red-600 m-2 rounded-xl">
                    <span className="text-red-700 font-black tracking-widest text-lg uppercase">VENDIDO</span>
                  </div>
                )}
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Precio Fijo Contado</p>
                <p className={`text-4xl font-black ${auto.es_sold ? 'text-gray-400 line-through' : 'text-green-600'}`}>${auto.precio_venta.toLocaleString()}</p>
            </div>

            {auto.es_sold ? (
              <div className="bg-gray-100 p-4 rounded-2xl border text-center font-black uppercase text-[10px] tracking-wide text-gray-500 leading-relaxed">
                Esta unidad ya fue reservada o retirada del stock. <br/> Te invitamos a mirar el resto de las ofertas vigentes.
              </div>
            ) : (
              <>
                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-6">
                    <div className="flex items-start">
                        <AlertTriangle className="text-yellow-600 mr-2 shrink-0 mt-0.5" size={16} />
                        <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-wide leading-relaxed">
                            Toda la información técnica y estado de papeles se encuentra detallada en esta página. 
                            <br/><br/><span className="font-black text-black">Contactar únicamente para agendar visita o reservar unidad.</span>
                        </p>
                    </div>
                </div>

                <a 
                  href={`https://wa.me/5491155819975?text=${encodeURIComponent(mensajeWhatsApp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full bg-black text-white font-black py-5 rounded-2xl shadow-xl hover:bg-gray-800 transition-all uppercase text-[11px] tracking-widest active:scale-95"
                >
                  <CalendarDays size={20} className="text-yellow-500" /> 
                  <span>Agendar Cita / Reservar</span>
                </a>
              </>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}