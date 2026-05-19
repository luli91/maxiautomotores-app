'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, LogOut, Contact2, Heart, Trash2, Car, Eye, Building, Wrench, ChevronRight, Edit3, Save, KeyRound, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para la edición de perfil
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formDatos, setFormDatos] = useState({ nombre_completo: '', whatsapp: '', empresa: '' });
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // 1. Traer datos del usuario
      const { data: datosUsuario } = await supabase.from('usuarios_perfiles').select('*').eq('id', session.user.id).single();
      
      setPerfil(datosUsuario);
      if (datosUsuario) {
        setFormDatos({
          nombre_completo: datosUsuario.nombre_completo || '',
          whatsapp: datosUsuario.whatsapp || '',
          empresa: datosUsuario.empresa || ''
        });
      }

      // 2. Traer favoritos
      const { data: favs } = await supabase.from('favoritos').select(`id, vehiculos (*)`).eq('user_id', session.user.id);

      if (favs) {
        const autosValidos = favs.filter(f => f.vehiculos !== null).map(f => ({ ...f.vehiculos, fav_id: f.id }));
        setFavoritos(autosValidos);
      }

      setLoading(false);
    }
    cargarDatos();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const quitarFavorito = async (fav_id: string) => {
    await supabase.from('favoritos').delete().eq('id', fav_id);
    setFavoritos(prev => prev.filter(f => f.fav_id !== fav_id));
  };

  const guardarCambios = async () => {
    setGuardando(true);
    setMensaje(null);
    const { error } = await supabase.from('usuarios_perfiles').update({
      nombre_completo: formDatos.nombre_completo,
      whatsapp: formDatos.whatsapp,
      empresa: formDatos.empresa
    }).eq('id', perfil.id);

    if (error) {
      setMensaje('Error al guardar los datos.');
    } else {
      setPerfil({ ...perfil, ...formDatos });
      setEditando(false);
      setMensaje('Datos actualizados con éxito.');
      setTimeout(() => setMensaje(null), 3000);
    }
    setGuardando(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-black tracking-widest uppercase animate-pulse">Cargando tu garaje...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 text-black font-sans pb-20">
      
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* ENCABEZADO DEL PERFIL */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-black p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex items-center space-x-6 relative z-10 w-full md:w-auto">
              <div className="bg-yellow-500 p-4 rounded-3xl text-black shrink-0 shadow-lg">
                <User size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase leading-none mb-1 truncate">
                  {perfil?.nombre_completo}
                </h1>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Building size={14} className="text-yellow-500" /> {perfil?.empresa || 'Cliente Particular'}
                </p>
              </div>
            </div>
            
            <button onClick={cerrarSesion} className="relative z-10 w-full md:w-auto bg-zinc-800 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              <LogOut size={16} /> Salir
            </button>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* DATOS PERSONALES */}
            <div className="md:col-span-2 relative">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase text-gray-400 flex items-center tracking-widest">
                  <Contact2 className="mr-2 text-yellow-500" size={16} /> Tus Datos de Contacto
                </h3>
                {!editando ? (
                  <button onClick={() => setEditando(true)} className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <Edit3 size={12} /> Modificar
                  </button>
                ) : (
                  <button onClick={guardarCambios} disabled={guardando} className="text-[10px] font-black uppercase text-green-600 hover:text-green-800 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg disabled:opacity-50">
                    <Save size={12} /> {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                )}
              </div>

              {mensaje && (
                <div className="bg-green-50 text-green-600 p-3 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase mb-4 animate-in fade-in">
                  <CheckCircle2 size={16} /> {mensaje}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                {editando ? (
                  <>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-400 font-black uppercase">Nombre Completo</label>
                      <input type="text" value={formDatos.nombre_completo} onChange={e => setFormDatos({...formDatos, nombre_completo: e.target.value})} className="w-full mt-1 p-2 rounded-lg border outline-none font-bold text-sm bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-black uppercase">WhatsApp Asociado</label>
                      <input type="text" value={formDatos.whatsapp} onChange={e => setFormDatos({...formDatos, whatsapp: e.target.value})} className="w-full mt-1 p-2 rounded-lg border outline-none font-bold text-sm bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-black uppercase">Empresa / Taller (Opcional)</label>
                      <input type="text" value={formDatos.empresa} onChange={e => setFormDatos({...formDatos, empresa: e.target.value})} className="w-full mt-1 p-2 rounded-lg border outline-none font-bold text-sm bg-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-[10px] text-gray-400 font-black uppercase">WhatsApp Asociado</span>
                      <p className="font-black text-lg uppercase mt-1">{perfil?.whatsapp}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-black uppercase">Email Comercial</span>
                      <p className="font-bold mt-1 text-gray-700">{perfil?.email}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <button onClick={() => router.push('/actualizar-password')} className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1 hover:text-black transition-colors border p-2 rounded-lg bg-white">
                  <KeyRound size={12} /> Cambiar Contraseña
                </button>
                
                {perfil?.es_admin && (
                  <button onClick={() => router.push('/admin')} className="bg-black text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-gray-800 transition-colors w-full sm:w-auto">
                    Ir al Panel Admin
                  </button>
                )}
              </div>
            </div>

            {/* BANNER COMERCIAL (VENDER AUTO EN LA RED) */}
            <div className="bg-gradient-to-br from-black to-zinc-900 rounded-3xl p-6 text-white flex flex-col justify-center relative overflow-hidden shadow-xl border border-zinc-800">
               <Car size={100} className="absolute -right-8 -bottom-8 text-white/5" />
               <h4 className="text-yellow-500 font-black uppercase tracking-tighter text-lg mb-2 relative z-10">Vendé tu auto en nuestra Red</h4>
               <p className="text-xs text-gray-300 font-medium mb-6 relative z-10">¿Tenés un auto chocado, volcado, con deudas o sin funcionar? Lo publicamos en nuestra sección de Oportunidades para que lo vendas rápido a nuestra cartera de clientes.</p>
               <a 
                  href={`https://wa.me/5491155819975?text=Hola%20Maxi,%20soy%20${perfil?.nombre_completo}.%20Tengo%20un%20auto%20y%20me%20gustaría%20publicarlo%20en%20las%20Oportunidades%20de%20la%20Red.`}
                  target="_blank" rel="noreferrer"
                  className="bg-yellow-500 text-black px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-yellow-400 transition-colors relative z-10 shadow-lg"
               >
                 Ofrecer mi auto
               </a>
            </div>

          </div>
        </div>

        {/* SECCIÓN MIS FAVORITOS */}
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 ml-2">
            <Heart className="text-red-500 fill-red-500" size={24} /> Mis Proyectos Guardados
          </h2>

          {favoritos.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-16 text-center">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-black uppercase mb-2">No tenés favoritos todavía</h3>
              <p className="text-sm font-bold text-gray-400 mb-8 max-w-sm mx-auto">Navegá por el catálogo y tocá el corazón en los autos que te interesen para armar tu presupuesto.</p>
              <Link href="/" className="inline-block bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg">
                Ir a ver ofertas
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritos.map(v => (
                <div key={v.fav_id} className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 relative group">
                  
                  <div className="h-40 bg-gray-200 relative">
                    {v.fotos && v.fotos.length > 0 ? (
                       <img src={v.fotos[0]} className={`w-full h-full object-cover ${v.es_sold ? 'grayscale opacity-60' : ''}`} alt={v.titulo} />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center"><Car className="text-gray-400" size={40}/></div>
                    )}
                    
                    <div className={`absolute top-3 left-3 ${v.es_sold ? 'bg-gray-800 text-white line-through' : 'bg-black text-white'} text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md`}>
                      {v.es_sold ? 'Vendido 🚫' : 'Disponible'}
                    </div>

                    <button 
                      onClick={() => quitarFavorito(v.fav_id)} 
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-md transition-all z-10"
                      title="Quitar de mi lista"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-black text-gray-900 uppercase leading-tight truncate mb-2">{v.marca ? `${v.marca} ` : ''}{v.titulo}</h3>
                    
                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                      <span>Lote {v.numero_lote}</span>
                      <span className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md"><Wrench size={10} /> {v.tipo_dano || 'Mecánica'}</span>
                    </div>

                    <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                      <div>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Precio Final</p>
                        <p className={`text-xl font-black ${v.es_sold ? 'text-gray-400 line-through' : 'text-green-600'}`}>${v.precio_venta.toLocaleString()}</p>
                      </div>
                      <Link href={`/auto/${v.id}`} className="bg-gray-100 hover:bg-black hover:text-white text-black p-2.5 rounded-xl transition-colors">
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}