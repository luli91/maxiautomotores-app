'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Car, Zap, ChevronRight, BellRing, CheckCircle2, AlertCircle, Eye, Search, Heart, Wrench, Flame, UserCircle, SlidersHorizontal, X, MapPin, Phone, MessageSquare, ShieldCheck, TrendingUp, BadgeDollarSign, Gavel, Camera, Handshake } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sesion, setSesion] = useState<any>(null);
  const [favoritosIds, setFavoritosIds] = useState<string[]>([]);
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);

  // Filtros
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [filtroDano, setFiltroDano] = useState('Todos');
  const [filtroMarca, setFiltroMarca] = useState('Todas');
  const [filtroPrecio, setFiltroPrecio] = useState('');
  const [filtroAnoMin, setFiltroAnoMin] = useState('');
  const [filtroKmMax, setFiltroKmMax] = useState('');
  const [filtroCaja, setFiltroCaja] = useState('Todas');
  const [filtroMotor, setFiltroMotor] = useState('Todos');

  const [mensajeStatus, setMensajeStatus] = useState<{ tipo: 'exito' | 'error' | 'info'; texto: string } | null>(null);

  useEffect(() => {
    async function inicializar() {
      const { data: { session } } = await supabase.auth.getSession();
      setSesion(session);
      const { data } = await supabase.from('vehiculos').select('*').eq('activo', true).order('es_sold', { ascending: true }).order('created_at', { ascending: false });
      setVehiculos(data || []);
      if (session) {
        const { data: favs } = await supabase.from('favoritos').select('vehiculo_id').eq('user_id', session.user.id);
        if (favs) setFavoritosIds(favs.map(f => f.vehiculo_id));
      }
      setLoading(false);
    }
    inicializar();
  }, []);

  const activarAlertasEmail = async () => {
    if (!sesion) { setMostrarModalLogin(true); return; }
    
    // Actualizamos al usuario en la base de datos
    const { error } = await supabase
      .from('usuarios_perfiles')
      .update({ recibe_alertas: true })
      .eq('id', sesion.user.id);

    if (!error) {
      setMensajeStatus({ tipo: 'exito', texto: '¡Alertas activadas! Te avisaremos por mail.' });
    }
  };

  const limpiarFiltros = () => {
    setFiltroDano('Todos'); setFiltroMarca('Todas'); setFiltroPrecio('');
    setFiltroAnoMin(''); setFiltroKmMax(''); setFiltroCaja('Todas'); setFiltroMotor('Todos');
  };

  const extraerMarca = (titulo: string) => titulo ? titulo.trim().split(' ')[0].toUpperCase() : '';
  const marcasDisponibles = Array.from(new Set(vehiculos.map(v => extraerMarca(v.titulo)))).filter(Boolean).sort();
  const danosDisponibles = Array.from(new Set(vehiculos.map(v => v.tipo_dano).filter(Boolean))).sort();

  const vehiculosFiltrados = vehiculos.filter(v => {
    const marcaVehiculo = extraerMarca(v.titulo);
    if (filtroDano !== 'Todos' && v.tipo_dano !== filtroDano) return false;
    if (filtroMarca !== 'Todas' && marcaVehiculo !== filtroMarca.toUpperCase()) return false;
    if (filtroPrecio && v.precio_venta > Number(filtroPrecio)) return false;
    if (filtroAnoMin && v.año < Number(filtroAnoMin)) return false;
    if (filtroKmMax && Number(v.kilometraje) > Number(filtroKmMax)) return false;
    if (filtroCaja !== 'Todas' && v.caja_cambios?.toLowerCase() !== filtroCaja.toLowerCase()) return false;
    if (filtroMotor !== 'Todos' && v.motor_arranca !== filtroMotor) return false;
    return true;
  });

  const stockMaxi = vehiculosFiltrados.filter(v => v.tipo_publicacion === 'Propio');
  const stockOportunidades = vehiculosFiltrados.filter(v => v.tipo_publicacion === 'Oportunidad');

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-black tracking-widest uppercase animate-pulse">MaxiAutomotores...</div>;

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 text-black font-sans relative">
      
      <a href="https://wa.me/5491155819975" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group">
        <Phone size={28} />
      </a>

      {mostrarModalLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative text-center">
            <button onClick={() => setMostrarModalLogin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black bg-gray-100 p-2 rounded-full"><X size={20} /></button>
            <div className="bg-red-50 text-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><Heart size={40} className="fill-red-500" /></div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">¡Unite al Club!</h3>
            <p className="text-gray-500 font-bold text-sm mb-8">Iniciá sesión para guardar favoritos y activar alertas de nuevos ingresos por mail.</p>
            <button onClick={() => router.push('/login')} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all">Ingresar</button>
          </div>
        </div>
      )}

      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <Link href="/"><img src="/logo.png" alt="Maxi Automotores" className="h-10 md:h-14 object-contain" /></Link>
        <Link href={sesion ? "/perfil" : "/login"} className="flex items-center gap-2 bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-white/20">
          <UserCircle size={18} /> {sesion ? 'Mi Perfil' : 'Ingresar'}
        </Link>
      </nav>

      <header className="bg-black text-white pt-32 md:pt-40 pb-20 md:pb-28 px-4 md:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <span className="inline-block bg-yellow-500 text-black px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-4 md:mb-6">
            Compra, Venta e Intermediación Automotriz
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter mb-4 md:mb-6 leading-none uppercase break-words">MAXI<span className="text-yellow-500">AUTOMOTORES</span></h1>
          <p className="text-gray-300 font-bold text-xs md:text-lg max-w-3xl mx-auto leading-relaxed px-4">
          Compramos tu vehículo en cualquier estado y vendemos unidades con alto potencial de rentabilidad para talleristas.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-8 md:mt-10 px-4">
            <Link href="#publicar" className="w-full sm:w-auto bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-gray-200 transition-all">Quiero vender mi auto</Link>
            <Link href="#catalogo" className="w-full sm:w-auto bg-yellow-500 text-black px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">Ver stock para reparar</Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20 mb-16 md:mb-24 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6" id="compramos">
        
        {/* TARJETA BLANCA: COMPRAMOS TU AUTO */}
        <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col justify-between overflow-hidden relative group">
          <BadgeDollarSign size={180} className="absolute -right-10 -bottom-10 text-gray-50 group-hover:text-yellow-500/10 transition-colors" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-black uppercase leading-none mb-3 md:mb-4">Compramos tu auto <span className="text-yellow-500 italic text-xl md:text-3xl block mt-1 md:mt-2">¡En el estado que esté!</span></h2>
            <p className="text-gray-500 font-bold text-xs md:text-sm mb-6 md:mb-8 max-w-sm">Chocados, volcados, sin funcionar y en buen estado. Tasación inmediata por WhatsApp y retiro en el día.</p>
            <div className="space-y-2 md:space-y-3 mb-8 md:mb-10 text-[10px] md:text-xs font-black uppercase text-gray-700">
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500 md:w-4 md:h-4" /> Pago contado efectivo</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500 md:w-4 md:h-4" /> Retiro con grúa propia</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500 md:w-4 md:h-4" /> Gestoría sin vueltas</div>
            </div>
          </div>
          <a href="https://wa.me/5491155819975?text=Hola%20Maxi,%20quiero%20vender%20un%20vehiculo." target="_blank" rel="noreferrer" className="w-full bg-black text-white text-center py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-gray-800 transition-all relative z-10">Cotizar mi unidad ahora</a>
        </div>

        {/* TARJETA NEGRA: PROYECTO DE INVERSIÓN */}
        <div className="bg-zinc-900 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl text-white flex flex-col justify-between overflow-hidden relative group" id="catalogo">
          <Gavel size={180} className="absolute -right-10 -bottom-10 text-white/5 group-hover:text-white/10 transition-colors" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-black uppercase leading-none mb-3 md:mb-4">Encontrá tu próximo <span className="text-yellow-500 italic text-xl md:text-3xl block mt-1 md:mt-2">Proyecto de Inversión</span></h2>
            <p className="text-gray-400 font-bold text-xs md:text-sm mb-6 md:mb-8 max-w-sm">Accedé a nuestro stock exclusivo de siniestrados y oportunidades de la red con papeles listos para transferir.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
              <select value={filtroDano} onChange={(e) => setFiltroDano(e.target.value)} className="bg-white/10 p-3 md:p-4 rounded-xl border border-white/20 text-white text-[10px] md:text-xs font-black uppercase outline-none cursor-pointer"><option value="Todos">Tipo de Daño</option>{danosDisponibles.map((d:any) => <option key={d} value={d} className="bg-black">{d}</option>)}</select>
              <select value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)} className="bg-white/10 p-3 md:p-4 rounded-xl border border-white/20 text-white text-[10px] md:text-xs font-black uppercase outline-none cursor-pointer"><option value="Todas">Marca</option>{marcasDisponibles.map(m => <option key={m as string} value={m as string} className="bg-black">{m}</option>)}</select>
            </div>
          </div>
          <button onClick={() => { document.getElementById('grilla-autos')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full bg-yellow-500 text-black text-center py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-yellow-400 transition-all relative z-10">Ver unidades disponibles</button>
        </div>
        
      </section>

      <div className="max-w-7xl mx-auto px-6 space-y-24 mb-24 flex-grow" id="grilla-autos">
        {stockMaxi.length > 0 && (
          <section>
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10 border-l-8 border-black pl-4 md:pl-6">
              <div>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Stock Maxiautomotores</h2>
                <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Unidades propias seleccionadas para reventa</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stockMaxi.map(v => <CardVehiculo key={v.id} v={v} sesion={sesion} favoritosIds={favoritosIds} setFavoritosIds={setFavoritosIds} colorEtiqueta="bg-black text-white" textoEtiqueta="Propio" onRequestLogin={() => setMostrarModalLogin(true)} />)}
            </div>
          </section>
        )}

        <section className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-black border-4 border-black relative overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative z-10 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="bg-yellow-500 text-black p-4 md:p-5 rounded-3xl shadow-xl"><BellRing size={32} /></div>
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase leading-none mb-2">¡Activá las Alertas!</h3>
                <p className="text-gray-500 font-bold text-xs md:text-sm">Te avisamos al mail cada vez que ingrese una unidad nueva.</p>
              </div>
            </div>
            <button onClick={activarAlertasEmail} className="w-full md:w-auto bg-black text-white px-6 md:px-8 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-zinc-800 transition-colors shadow-lg">
              {sesion ? 'Activar Alertas de Stock' : 'Iniciá sesión para activar'}
            </button>
          </div>
          {mensajeStatus && <div className="mt-6 text-center text-green-600 font-black uppercase text-xs">{mensajeStatus.texto}</div>}
        </section>

        {stockOportunidades.length > 0 && (
          <section>
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10 border-l-8 border-red-600 pl-4 md:pl-6">
              <div>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Oportunidades de la Red</h2>
                <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Vehículos de terceros publicados en nuestra plataforma</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stockOportunidades.map(v => <CardVehiculo key={v.id} v={v} sesion={sesion} favoritosIds={favoritosIds} setFavoritosIds={setFavoritosIds} colorEtiqueta="bg-red-600 text-white" textoEtiqueta="Oportunidad" onRequestLogin={() => setMostrarModalLogin(true)} />)}
            </div>
          </section>
        )}

        {vehiculosFiltrados.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-[3rem] border-gray-200">
            <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-black uppercase text-gray-400">No encontramos autos con esos filtros</h3>
            <button onClick={limpiarFiltros} className="mt-4 text-black font-black uppercase text-xs border-b-2 border-yellow-500 pb-1">Ver todo el catálogo</button>
          </div>
        )}
      </div>

      <section className="bg-white py-24 mb-0 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 break-words">Gente que confía en Maxiautomotores</h2>
            <div className="w-20 h-2 bg-yellow-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "Carlos G.", z: "Cliente Particular - Moreno", m: "Increíble la rapidez. Le vendí un auto volcado un lunes y en el momento ya tenía la plata. Gente de palabra." },
              { n: "Hernán P.", z: "Tallerista - Floresta", m: "Compro siniestrados acá para reparar y revender. Siempre la documentación impecable y entrega inmediata." },
              { n: "Ricardo M.", z: "Cliente Particular - Villa Martelli", m: "Excelente atención de Maxi. Se encargó del traslado con la grúa y me ayudó con todos los papeles." }
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-shadow relative">
                <TrendingUp size={40} className="text-yellow-500/10 absolute top-6 right-8" />
                <p className="text-gray-700 font-bold italic mb-6 leading-relaxed">"{t.m}"</p>
                <div className="flex items-center gap-3">
                  <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xs uppercase">{t.n[0]}</div>
                  <div><p className="font-black uppercase text-xs leading-none">{t.n}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.z}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🟦 NUEVA SECCIÓN: PUBLICAR O VENDER A MAXI */}
      <section className="bg-zinc-100 py-24" id="publicar">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-black rounded-[4rem] p-8 md:p-20 text-white relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="bg-yellow-500 text-black p-4 rounded-3xl mb-8"><Handshake size={48}/></div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-tight">¿Tenés un auto para vender?</h2>
              <p className="text-gray-400 font-bold text-lg md:text-xl max-w-2xl mb-12">
                Evaluamos tu vehículo en el acto. Si cumple nuestros requisitos, <span className="text-white">te lo compramos</span>. Si no, <span className="text-yellow-500">te ayudamos a publicarlo</span> en nuestra red de inversores para que lo vendas rápido.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-12">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <Camera className="text-yellow-500 mx-auto mb-4" size={32}/>
                  <p className="font-black uppercase text-xs tracking-widest">1. Sacale fotos</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <MessageSquare className="text-yellow-500 mx-auto mb-4" size={32}/>
                  <p className="font-black uppercase text-xs tracking-widest">2. Envianos el detalle</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <Zap className="text-yellow-500 mx-auto mb-4" size={32}/>
                  <p className="font-black uppercase text-xs tracking-widest">3. Recibí una oferta</p>
                </div>
              </div>

              <a href="https://wa.me/5491155819975?text=Hola%20Maxi,%20tengo%20un%20auto%20para%20vender%20o%20publicar.%20Te%20paso%20los%20datos..." target="_blank" rel="noreferrer" className="bg-yellow-500 text-black px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20 active:scale-95">
                Contactar ahora
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white pt-20 pb-10 px-6 border-t-8 border-yellow-500 w-full mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-6">MAXI<span className="text-yellow-500">AUTOMOTORES</span></h3>
            <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-xs mx-auto md:mx-0">Compramos, vendemos e intermediamos. Líderes en Buenos Aires en gestión de unidades con siniestros y detalles.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-yellow-500">Contacto</h4>
            <div className="flex items-center justify-center md:justify-start gap-3 text-sm font-bold text-gray-300"><Phone size={18} className="text-yellow-500" /> +54 9 11 5581-9975</div>
            <div className="flex items-center justify-center md:justify-start gap-3 text-sm font-bold text-gray-300"><MapPin size={18} className="text-yellow-500" /> Buenos Aires, Argentina</div>
          </div>
          <div className="space-y-4">
            <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-yellow-500">Links</h4>
            <Link href="/login" className="block text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors">Registrar mi taller</Link>
            <Link href="#publicar" className="block text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors">Ofrecer un auto en la red</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-zinc-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">© {new Date().getFullYear()} MAXIAUTOMOTORES. DISEÑADO POR CYNTHIA MEDINA.</p>
        </div>
      </footer>
    </main>
  );
}

function CardVehiculo({ v, sesion, favoritosIds, setFavoritosIds, colorEtiqueta, textoEtiqueta, onRequestLogin }: { v: any, sesion: any, favoritosIds: string[], setFavoritosIds: any, colorEtiqueta: string, textoEtiqueta: string, onRequestLogin: () => void }) {
  const tieneFoto = v.fotos && v.fotos.length > 0;
  const fotoPrincipal = tieneFoto ? v.fotos[0] : null;
  const esFavorito = favoritosIds.includes(v.id);

  const toggleFavorito = async (e: any) => {
    e.preventDefault(); 
    if (!sesion) { onRequestLogin(); return; }
    if (esFavorito) {
      setFavoritosIds((prev: string[]) => prev.filter((id) => id !== v.id));
      await supabase.from('favoritos').delete().match({ user_id: sesion.user.id, vehiculo_id: v.id });
    } else {
      setFavoritosIds((prev: string[]) => [...prev, v.id]);
      await supabase.from('favoritos').insert([{ user_id: sesion.user.id, vehiculo_id: v.id }]);
    }
  };

  const tituloCompleto = v.marca ? `${v.marca} ${v.titulo}` : v.titulo;

  return (
    <Link href={`/auto/${v.id}`} className="group relative block">
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
        <div className="bg-gray-200 h-64 relative overflow-hidden">
          {tieneFoto ? <img src={fotoPrincipal} alt={tituloCompleto} className={`w-full h-full object-cover transition-transform duration-500 ${v.es_sold ? 'opacity-40 grayscale' : 'group-hover:scale-110'}`} /> : <div className="w-full h-full flex items-center justify-center"><Car size={60} className="text-gray-300" /></div>}
          <div className={`absolute top-4 left-4 ${v.es_sold ? 'bg-zinc-800 text-white line-through' : colorEtiqueta} text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg`}>{v.es_sold ? 'Vendido' : textoEtiqueta}</div>
          <button onClick={toggleFavorito} className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all z-10 backdrop-blur-md ${esFavorito ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-400 hover:text-red-500'}`}><Heart size={20} className={esFavorito ? "fill-red-500" : ""} /></button>
        </div>
        <div className="p-8">
          <h3 className="text-xl font-black text-gray-900 uppercase leading-tight truncate mb-2">{tituloCompleto}</h3>
          <div className="flex items-center justify-between text-gray-400 font-bold text-[10px] mb-4 uppercase tracking-widest"><span>Año {v.año} • Lote {v.numero_lote}</span><span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><Eye size={12} /> {v.vistas || 0}</span></div>
          <div className="mb-6"><span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100"><Wrench size={12} /> {v.tipo_dano || 'Mecánica'}</span></div>
          <div className="flex justify-between items-center border-t border-gray-50 pt-6">
            <div><p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Precio Contado</p><p className={`text-2xl font-black ${v.es_sold ? 'text-gray-300 line-through' : 'text-green-600'}`}>${v.precio_venta.toLocaleString()}</p></div>
            <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-black group-hover:text-white transition-colors"><ChevronRight size={20} /></div>
          </div>
        </div>
      </div>
    </Link>
  );
}