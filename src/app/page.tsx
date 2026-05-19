'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Car, Zap, ChevronRight, BellRing, CheckCircle2, AlertCircle, Eye, Search, Heart, Wrench, Flame, UserCircle, SlidersHorizontal, X, MapPin, Phone } from 'lucide-react';
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
  const [filtroCombustible, setFiltroCombustible] = useState('Todos');
  const [filtroCaja, setFiltroCaja] = useState('Todas');
  const [filtroVtv, setFiltroVtv] = useState(false);
  
  const [filtroMotor, setFiltroMotor] = useState('Todos');
  const [filtroCamina, setFiltroCamina] = useState('Todos');
  const [filtroChasis, setFiltroChasis] = useState('Todos');
  const [filtroAirbags, setFiltroAirbags] = useState('Todos');

  const [celular, setCelular] = useState('');
  const [guardandoCelular, setGuardandoCelular] = useState(false);
  const [mensajeStatus, setMensajeStatus] = useState<{ tipo: 'exito' | 'error' | 'info'; texto: string } | null>(null);

  useEffect(() => {
    async function inicializar() {
      const { data: { session } } = await supabase.auth.getSession();
      setSesion(session);

      const { data } = await supabase.from('vehiculos')
        .select('*')
        .eq('activo', true)
        .order('es_sold', { ascending: true }) 
        .order('created_at', { ascending: false });
      
      setVehiculos(data || []);

      if (session) {
        const { data: favs } = await supabase.from('favoritos').select('vehiculo_id').eq('user_id', session.user.id);
        if (favs) setFavoritosIds(favs.map(f => f.vehiculo_id));
      }

      setLoading(false);
    }
    inicializar();
  }, []);

  const activarAlertas = async () => {
    if (!celular || celular.length < 8) return;
    setGuardandoCelular(true); setMensajeStatus(null);
    try {
      const { data: existe } = await supabase.from('club_inversores').select('id').eq('whatsapp', celular).maybeSingle();
      if (existe) {
        setMensajeStatus({ tipo: 'info', texto: '¡Ya estás en la lista!' });
        setCelular(''); setGuardandoCelular(false); return;
      }
      await supabase.from('club_inversores').insert([{ whatsapp: celular, nombre: 'Oportunidades Web', activo: true }]);
      setMensajeStatus({ tipo: 'exito', texto: '¡Registro completado!' });
      setCelular('');
    } catch (error) {
      setMensajeStatus({ tipo: 'error', texto: 'Hubo un problema. Intentá de nuevo.' });
    } finally {
      setGuardandoCelular(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroDano('Todos'); setFiltroMarca('Todas'); setFiltroPrecio('');
    setFiltroAnoMin(''); setFiltroKmMax(''); setFiltroCombustible('Todos');
    setFiltroCaja('Todas'); setFiltroVtv(false); setFiltroMotor('Todos'); 
    setFiltroCamina('Todos'); setFiltroChasis('Todos'); setFiltroAirbags('Todos');
  };

  const extraerMarca = (titulo: string) => titulo ? titulo.trim().split(' ')[0].toUpperCase() : '';
  const marcasDisponibles = Array.from(new Set(vehiculos.map(v => extraerMarca(v.titulo)))).filter(Boolean).sort();
  const danosDisponibles = Array.from(new Set(vehiculos.map(v => v.tipo_dano).filter(Boolean))).sort();
  const combustiblesDisponibles = Array.from(new Set(vehiculos.map(v => v.combustible).filter(Boolean))).sort();

  const vehiculosFiltrados = vehiculos.filter(v => {
    const marcaVehiculo = extraerMarca(v.titulo);
    
    if (filtroDano !== 'Todos' && v.tipo_dano !== filtroDano) return false;
    if (filtroMarca !== 'Todas' && marcaVehiculo !== filtroMarca.toUpperCase()) return false;
    if (filtroPrecio && v.precio_venta > Number(filtroPrecio)) return false;
    
    if (filtroAnoMin && v.año < Number(filtroAnoMin)) return false;
    if (filtroKmMax && Number(v.kilometraje) > Number(filtroKmMax)) return false;
    if (filtroCombustible !== 'Todos' && v.combustible !== filtroCombustible) return false;
    if (filtroCaja !== 'Todas' && v.caja_cambios?.toLowerCase() !== filtroCaja.toLowerCase()) return false;
    if (filtroVtv && !v.vtv) return false;
    
    if (filtroMotor !== 'Todos' && v.motor_arranca !== filtroMotor) return false;
    if (filtroCamina !== 'Todos' && v.vehiculo_camina !== (filtroCamina === 'Si')) return false;
    if (filtroChasis !== 'Todos' && v.chasis_afectado !== (filtroChasis === 'Afectado')) return false;
    if (filtroAirbags !== 'Todos' && v.airbags_sanos !== (filtroAirbags === 'Sanos')) return false;

    return true;
  });

  const stockMaxi = vehiculosFiltrados.filter(v => v.tipo_publicacion === 'Propio');
  const stockOportunidades = vehiculosFiltrados.filter(v => v.tipo_publicacion === 'Oportunidad');

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-black tracking-widest uppercase animate-pulse">Cargando Salón Digital...</div>;

  return (
    // Agregamos flex y flex-col para que el contenido empuje el footer siempre hacia abajo
    <main className="min-h-screen flex flex-col bg-gray-50 text-black font-sans relative">
      
      {/* 🟢 BOTÓN FLOTANTE DE WHATSAPP */}
      <a 
        href="https://wa.me/5491155819975?text=Hola%20Maxi!%20Vengo%20de%20tu%20sitio%20web%20y%20tengo%20una%20consulta." 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-[0_4px_20px_rgba(34,197,94,0.5)] hover:scale-110 hover:bg-green-600 transition-all flex items-center justify-center group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      </a>

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

      {/* Todo el contenido envuelto en un div que crece (flex-grow) */}
      <div className="flex-grow">
        <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
          <Link href="/">
            <img src="/logo.jpg" alt="Maxi Automotores" className="h-10 md:h-12 w-auto object-contain drop-shadow-lg" />
          </Link>
          <Link href={sesion ? "/perfil" : "/login"} className="flex items-center gap-2 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border border-white/20 shadow-lg">
            <UserCircle size={18} /> <span className="hidden md:inline">{sesion ? 'Mi Perfil' : 'Ingresar'}</span>
          </Link>
        </nav>

        <header className="bg-black text-white pt-36 pb-24 px-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-block bg-yellow-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(234,179,8,0.5)]">
              Oportunidades y Autos para Reparar
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none uppercase">MAXI<span className="text-yellow-500 font-black">AUTOMOTORES</span></h1>
            <p className="text-gray-400 font-bold text-sm md:text-base">Autos con detalles de chapa, pintura o mecánica, y vehículos sanos a precios imbatibles.</p>
          </div>
        </header>

        {/* BARRA DE FILTROS */}
        <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-20 mb-16">
          <div className="bg-white p-4 rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col gap-4">
            
            <div className="flex flex-col md:flex-row gap-4 items-center w-full">
              <button onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)} className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] w-full md:w-auto shrink-0 transition-all ${mostrarFiltrosAvanzados ? 'bg-black text-yellow-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <SlidersHorizontal size={16} /> Filtros {mostrarFiltrosAvanzados ? 'Ocultar' : 'Avanzados'}
              </button>
              
              <select value={filtroDano} onChange={(e) => setFiltroDano(e.target.value)} className="w-full bg-gray-50 border-none p-4 rounded-xl font-bold text-black outline-none cursor-pointer">
                <option value="Todos">Todos los Daños</option>
                {danosDisponibles.map((dano: any) => <option key={dano} value={dano}>{dano}</option>)}
              </select>
              
              <select value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)} className="w-full bg-gray-50 border-none p-4 rounded-xl font-bold text-black outline-none cursor-pointer capitalize">
                <option value="Todas">Todas las Marcas</option>
                {marcasDisponibles.map(marca => <option key={marca as string} value={marca as string}>{marca as string}</option>)}
              </select>
              
              <div className="w-full relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input type="number" placeholder="Presupuesto Máx" value={filtroPrecio} onChange={(e) => setFiltroPrecio(e.target.value)} className="w-full bg-gray-50 border-none p-4 pl-8 rounded-xl font-bold text-black outline-none" />
              </div>

              <button className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs w-full md:w-auto shrink-0 hover:bg-gray-800 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2">
                <Search size={16} /> Buscar
              </button>
            </div>

            {mostrarFiltrosAvanzados && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 border-t border-gray-100 bg-gray-50 rounded-2xl animate-in fade-in slide-in-from-top-4">
                <div className="col-span-2 lg:col-span-6 mb-2"><h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b pb-2">Datos Técnicos</h3></div>
                
                <div><label className="text-[9px] font-black uppercase text-gray-500 ml-1">Año Mínimo</label><input type="number" value={filtroAnoMin} onChange={e => setFiltroAnoMin(e.target.value)} className="w-full p-2.5 rounded-lg border outline-none font-bold text-xs bg-white text-black" placeholder="Ej: 2010" /></div>
                <div><label className="text-[9px] font-black uppercase text-gray-500 ml-1">KM Máximo</label><input type="number" value={filtroKmMax} onChange={e => setFiltroKmMax(e.target.value)} className="w-full p-2.5 rounded-lg border outline-none font-bold text-xs bg-white text-black" placeholder="Ej: 150000" /></div>
                <div><label className="text-[9px] font-black uppercase text-gray-500 ml-1">Combustible</label><select value={filtroCombustible} onChange={e => setFiltroCombustible(e.target.value)} className="w-full p-2.5 rounded-lg border outline-none font-bold text-xs bg-white text-black"><option value="Todos">Todos</option>{combustiblesDisponibles.map((c:any) => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="text-[9px] font-black uppercase text-gray-500 ml-1">Caja</label><select value={filtroCaja} onChange={e => setFiltroCaja(e.target.value)} className="w-full p-2.5 rounded-lg border outline-none font-bold text-xs bg-white text-black"><option value="Todas">Todas</option><option value="Manual">Manual</option><option value="Automatica">Automática</option></select></div>

                <div className="col-span-2 lg:col-span-6 mt-4 mb-2"><h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b pb-2">Estado para Talleristas</h3></div>

                <div><label className="text-[9px] font-black uppercase text-gray-500 ml-1">¿Motor Arranca?</label><select value={filtroMotor} onChange={e => setFiltroMotor(e.target.value)} className="w-full p-2.5 rounded-lg border outline-none font-bold text-xs bg-white text-black"><option value="Todos">Indistinto</option><option value="Sí">Sí</option><option value="No">No</option><option value="Gira pero no arranca">Gira pero no</option></select></div>
                <div><label className="text-[9px] font-black uppercase text-gray-500 ml-1">¿Camina?</label><select value={filtroCamina} onChange={e => setFiltroCamina(e.target.value)} className="w-full p-2.5 rounded-lg border outline-none font-bold text-xs bg-white text-black"><option value="Todos">Indistinto</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                <div><label className="text-[9px] font-black uppercase text-gray-500 ml-1">Chasis</label><select value={filtroChasis} onChange={e => setFiltroChasis(e.target.value)} className="w-full p-2.5 rounded-lg border outline-none font-bold text-xs bg-white text-black"><option value="Todos">Indistinto</option><option value="Sano">Sano</option><option value="Afectado">Afectado</option></select></div>
                <div><label className="text-[9px] font-black uppercase text-gray-500 ml-1">Airbags</label><select value={filtroAirbags} onChange={e => setFiltroAirbags(e.target.value)} className="w-full p-2.5 rounded-lg border outline-none font-bold text-xs bg-white text-black"><option value="Todos">Indistinto</option><option value="Sanos">Sanos</option><option value="Explotados">Explotados</option></select></div>

                <div className="col-span-2 flex items-center pt-5 pl-2">
                  <label className="flex items-center text-[10px] font-black uppercase cursor-pointer text-gray-700">
                    <input type="checkbox" checked={filtroVtv} onChange={e => setFiltroVtv(e.target.checked)} className="mr-2 w-4 h-4 accent-black" /> 
                    Solo con VTV Vigente
                  </label>
                </div>

                <div className="col-span-2 lg:col-span-6 flex justify-end gap-3 mt-4">
                  <button onClick={limpiarFiltros} className="text-[10px] bg-gray-200 text-gray-600 px-4 py-3 rounded-lg font-black uppercase hover:bg-gray-300 transition-colors">Limpiar</button>
                  <button onClick={() => setMostrarFiltrosAvanzados(false)} className="text-[10px] bg-black text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-md">Aplicar Filtros</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 space-y-20 pb-20"> {/* pb-20 para separar el último contenido del footer */}
          
          {stockMaxi.length > 0 && (
            <section>
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-black text-white p-3 rounded-2xl"><Car size={24} /></div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Stock Inmediato</h2>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Vehículos de nuestra agencia listos para entregar.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stockMaxi.map(v => (
                  <CardVehiculo key={v.id} v={v} sesion={sesion} favoritosIds={favoritosIds} setFavoritosIds={setFavoritosIds} colorEtiqueta="bg-black text-white" textoEtiqueta="Stock Directo" onRequestLogin={() => setMostrarModalLogin(true)} />
                ))}
              </div>
            </section>
          )}

          <section className="relative z-10">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-8 md:p-10 rounded-[2.5rem] shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center">
                  <BellRing size={36} className="text-black mr-5 hidden md:block" />
                  <div>
                    <h2 className="text-2xl font-black text-black leading-none uppercase mb-2">Club de Oportunidades</h2>
                    <p className="text-black/80 font-bold text-sm">Dejanos tu WhatsApp. Te avisamos antes de publicar los autos acá.</p>
                  </div>
                </div>
                <div className="flex flex-col w-full md:w-auto gap-3">
                  <div className="flex w-full md:w-auto gap-3">
                    <input type="number" placeholder="Tu WhatsApp" value={celular} onChange={(e) => {setCelular(e.target.value); setMensajeStatus(null);}} className="flex-grow md:w-64 p-4 rounded-2xl bg-white/90 border-none outline-none font-bold text-black" />
                    <button onClick={activarAlertas} disabled={guardandoCelular} className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-gray-900 transition-all shadow-lg disabled:bg-gray-600">
                      {guardandoCelular ? '...' : 'Unirme'}
                    </button>
                  </div>
                  {mensajeStatus && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl font-bold text-[11px] uppercase tracking-wide animate-pulse ${mensajeStatus.tipo === 'exito' ? 'bg-green-100 text-green-800' : mensajeStatus.tipo === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                      {mensajeStatus.tipo === 'exito' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {mensajeStatus.texto}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {stockOportunidades.length > 0 && (
            <section>
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-red-500 text-white p-3 rounded-2xl animate-pulse"><Flame size={24} /></div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Oportunidades de la Red</h2>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Ofertas de terceros. Se venden rapidísimo.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stockOportunidades.map(v => (
                  <CardVehiculo key={v.id} v={v} sesion={sesion} favoritosIds={favoritosIds} setFavoritosIds={setFavoritosIds} colorEtiqueta="bg-red-600 text-white" textoEtiqueta="Oportunidad" onRequestLogin={() => setMostrarModalLogin(true)} />
                ))}
              </div>
            </section>
          )}

          {vehiculosFiltrados.length === 0 && (
            <div className="text-center py-20">
              <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-black uppercase text-gray-400">No hay autos con esos filtros</h3>
              <button onClick={limpiarFiltros} className="mt-4 text-blue-500 font-bold uppercase text-xs hover:underline">Limpiar Búsqueda</button>
            </div>
          )}

        </div>
      </div>

      {/* 🏁 FOOTER PREMIUM (Ahora con marginTop y margin interior correctos) */}
      <footer className="bg-black text-white pt-16 pb-8 px-6 border-t-8 border-yellow-500 relative z-20 w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-black tracking-tighter text-xl mb-4 text-white uppercase">MAXI<span className="text-yellow-500">AUTOMOTORES</span></h3>
            <p className="text-xs text-gray-400 font-bold max-w-xs leading-relaxed">
              Especialistas en vehículos con detalles de chapa, pintura o mecánica, y autos sanos liquidados al mejor precio del mercado para talleristas y revendedores.
            </p>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-[10px] text-yellow-500 mb-6">Contacto Comercial</h4>
            <p className="text-xs text-gray-300 font-bold mb-4 flex items-center gap-3"><Phone size={16} className="text-yellow-500"/> +54 9 11 5581-9975</p>
            <p className="text-xs text-gray-300 font-bold mb-4 flex items-center gap-3"><MapPin size={16} className="text-yellow-500"/> Buenos Aires, Argentina.</p>
            <p className="text-xs text-gray-300 font-bold mb-4 flex items-center gap-3"><Car size={16} className="text-yellow-500"/> Atención y visitas con turno previo.</p>
          </div>
          <div>
             <h4 className="font-black uppercase tracking-widest text-[10px] text-yellow-500 mb-6">Plataforma</h4>
             <Link href="/login" className="block text-xs text-gray-400 font-bold mb-3 hover:text-white transition-colors">Ingresar al Sistema</Link>
             <Link href="/perfil" className="block text-xs text-gray-400 font-bold mb-3 hover:text-white transition-colors">Ofrecer un Vehículo para la Red</Link>
             <Link href="/" className="block text-xs text-gray-400 font-bold hover:text-white transition-colors">Catálogo de Proyectos</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-zinc-900 mt-12 pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">© {new Date().getFullYear()} MAXIAUTOMOTORES. TODOS LOS DERECHOS RESERVADOS.</p>
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white">Términos del Servicio</span>
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
    if (!sesion) {
      onRequestLogin();
      return;
    }

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
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
        <div className="bg-gray-200 h-56 flex items-center justify-center relative overflow-hidden">
          {tieneFoto ? (
            <img src={fotoPrincipal} alt={tituloCompleto} className={`w-full h-full object-cover transition-transform duration-500 ${v.es_sold ? 'opacity-60 grayscale' : 'group-hover:scale-105'}`} />
          ) : (
            <Car size={60} className="text-gray-400 opacity-50 group-hover:scale-110 transition-transform" />
          )}
          
          <div className={`absolute top-4 left-4 ${v.es_sold ? 'bg-gray-800 text-white line-through' : colorEtiqueta} text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md`}>
            {v.es_sold ? 'Vendido 🚫' : textoEtiqueta}
          </div>

          <button onClick={toggleFavorito} className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md transition-all z-10 backdrop-blur-sm ${esFavorito ? 'bg-red-50 text-red-500 hover:bg-white' : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50'}`}>
            <Heart size={18} className={esFavorito ? "fill-red-500" : ""} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-black text-gray-900 uppercase leading-tight truncate pr-2" title={tituloCompleto}>{tituloCompleto}</h3>
          </div>
          
          <div className="flex items-center justify-between text-gray-400 font-bold text-xs mb-4 uppercase">
            <span>{v.año} • Lote {v.numero_lote}</span>
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md text-[10px] text-gray-500"><Eye size={12} /> {v.vistas || 0}</span>
          </div>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100">
              <Wrench size={10} /> Daño: {v.tipo_dano || 'Mecánica'}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-gray-50 pt-6">
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Precio Final</p>
              <p className={`text-2xl font-black ${v.es_sold ? 'text-gray-400 line-through' : 'text-green-600'}`}>${v.precio_venta.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-2xl transition-colors ${v.es_sold ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 group-hover:bg-black group-hover:text-white'}`}>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}