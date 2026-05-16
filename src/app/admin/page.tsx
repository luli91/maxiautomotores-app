'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { PackagePlus, Car, ClipboardCheck, Info, Tag, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [proximoLote, setProximoLote] = useState('');
  const [refreshLote, setRefreshLote] = useState(0); 
  const [mensajeStatus, setMensajeStatus] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    async function verificarPermisosAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: perfil } = await supabase
        .from('usuarios_perfiles')
        .select('es_admin')
        .eq('id', session.user.id)
        .single();

      if (!perfil || !perfil.es_admin) {
        router.push('/'); 
      } else {
        setAutorizado(true);
      }
      setVerificando(false);
    }
    verificarPermisosAdmin();
  }, [router]);

  useEffect(() => {
    async function obtenerMaximoLote() {
      const { data } = await supabase.from('vehiculos').select('numero_lote');
      if (data && data.length > 0) {
        const numeros = data.map(v => parseInt(v.numero_lote.replace('#', ''))).filter(n => !isNaN(n));
        if (numeros.length > 0) {
            setProximoLote(`#${(Math.max(...numeros) + 1).toString().padStart(3, '0')}`);
        } else setProximoLote('#001');
      } else setProximoLote('#001');
    }
    if (autorizado) obtenerMaximoLote();
  }, [refreshLote, autorizado]); 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMensajeStatus(null);
    const formData = new FormData(e.currentTarget);
    
    const nuevoVehiculo = {
      titulo: formData.get('titulo'),
      numero_lote: proximoLote,
      tipo_publicacion: formData.get('tipo_publicacion'),
      año: Number(formData.get('año')),
      combustible: formData.get('combustible'),
      caja_cambios: formData.get('caja_cambios'),
      kilometraje: formData.get('kilometraje'),
      ubicacion: formData.get('ubicacion'),
      radicacion: formData.get('radicacion'),
      tipo_tramite: formData.get('tramite'),
      estado_detalle: formData.get('estado_detalle'),
      precio_venta: Number(formData.get('precio')),
      observaciones: formData.get('observaciones'),
      vtv: formData.get('vtv') === 'on',
      verificacion_policial: formData.get('verificacion_policial') === 'on',
      informe_dominio: formData.get('informe_dominio') === 'on',
      libre_deuda: formData.get('libre_deuda') === 'on',
      activo: true
    };

    const { error } = await supabase.from('vehiculos').insert([nuevoVehiculo]);
    
    if (error) {
      setMensajeStatus({ tipo: 'error', texto: error.message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setMensajeStatus({ tipo: 'exito', texto: '¡Vehículo publicado con éxito en la web!' });
      (e.target as HTMLFormElement).reset(); 
      setRefreshLote(prev => prev + 1); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMensajeStatus(null), 4000);
    }
    setLoading(false);
  };

  if (verificando || !autorizado) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="p-10 text-center font-black text-black tracking-widest uppercase animate-pulse">
                  Verificando credenciales...
              </div>
          </div>
      );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden font-sans relative">
        
        {mensajeStatus && (
          <div className={`absolute top-0 left-0 w-full p-4 text-center font-black text-xs uppercase tracking-widest ${
            mensajeStatus.tipo === 'exito' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <span className="flex items-center justify-center gap-2">
              {mensajeStatus.tipo === 'exito' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {mensajeStatus.texto}
            </span>
          </div>
        )}

        <div className={`bg-black p-8 text-center flex flex-col items-center ${mensajeStatus ? 'pt-16' : ''}`}>
          <PackagePlus className="text-yellow-500 mb-2" size={32} />
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Administración de Stock</h1>
          <div className="mt-2 bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-black uppercase">
            Siguiente Lote: {proximoLote}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 text-black">
          {/* ... Acá va exactamente todo tu formulario que tenías (secciones, inputs, selectores) sin cambios ... */}
          <section className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
            <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center">
              <Layers className="mr-2" size={16} /> Clasificación de la Publicación
            </h3>
            <select name="tipo_publicacion" required className="w-full p-4 rounded-2xl bg-white border-2 border-gray-100 shadow-sm font-bold text-black outline-none focus:border-yellow-500">
              <option value="Propio">Stock Propio</option>
              <option value="Oportunidad">Oferta de Terceros</option>
            </select>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black border-b pb-2 flex items-center text-gray-400 uppercase tracking-widest">
              <Car className="mr-2" size={18} /> Ficha Técnica del Vehículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Título / Modelo Exacto</label>
                <input name="titulo" required placeholder="Ej: PEUGEOT 307 XS 1.6 4P 110 CV" className="w-full p-3 border rounded-xl bg-white text-black font-bold outline-none focus:border-yellow-500" />
              </div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Año</label><input name="año" type="number" required placeholder="2008" className="w-full p-3 border rounded-xl bg-white text-black outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Kilometraje</label><input name="kilometraje" placeholder="249.409" className="w-full p-3 border rounded-xl bg-white text-black outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Combustible</label><input name="combustible" placeholder="NAFTA" className="w-full p-3 border rounded-xl bg-white text-black outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Caja de Cambio</label><input name="caja_cambios" placeholder="MANUAL" className="w-full p-3 border rounded-xl bg-white text-black outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Ubicación</label><input name="ubicacion" placeholder="LANUS ESTE" className="w-full p-3 border rounded-xl bg-white text-black outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Radicación</label><input name="radicacion" placeholder="LANUS" className="w-full p-3 border rounded-xl bg-white text-black outline-none" /></div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black border-b pb-2 flex items-center text-gray-400 uppercase tracking-widest">
              <ClipboardCheck className="mr-2" size={18} /> Documentación y Estado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Trámite de Venta</label>
                <select name="tramite" className="w-full p-3 border rounded-xl bg-white text-black font-bold outline-none">
                  <option value="08 Firmado - Listo para transferir">08 Firmado - Listo para transferir</option>
                  <option value="Transferencia Directa">Transferencia Directa</option>
                  <option value="08 en trámite">08 en trámite</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estado Visual</label>
                <select name="estado_detalle" className="w-full p-3 border rounded-xl bg-white text-black font-bold outline-none">
                  <option value="Funcionando (Sin detalles)">Funcionando (Sin detalles)</option>
                  <option value="Funcionando (Detalles estéticos)">Funcionando (Detalles estéticos)</option>
                  <option value="Chocado (Siniestro)">Chocado (Siniestro)</option>
                  <option value="Volcado (Siniestro)">Volcado (Siniestro)</option>
                  <option value="Para Reparar (Mecánica)">Para Reparar (Mecánica)</option>
                </select>
              </div>
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300">
                {['verificacion_policial', 'informe_dominio', 'libre_deuda', 'vtv'].map(item => (
                  <label key={item} className="flex items-center text-[10px] font-black uppercase cursor-pointer">
                    <input type="checkbox" name={item} className="mr-2 w-4 h-4 accent-yellow-600" /> {item.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black border-b pb-2 flex items-center text-gray-400 uppercase tracking-widest">
              <Tag className="mr-2 text-green-600" size={18} /> Valor de Publicación
            </h3>
            <div>
                <label className="text-[10px] font-black uppercase text-green-700 ml-1">Precio de Venta Final ($)</label>
                <input name="precio" type="number" required placeholder="Ej: 3500000" className="w-full p-4 border-2 border-green-100 rounded-2xl bg-white text-black font-black text-sm outline-none focus:border-green-500" />
            </div>
          </section>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Observaciones</label>
            <textarea name="observaciones" rows={3} className="w-full p-3 border rounded-xl bg-white text-black outline-none focus:border-yellow-500"></textarea>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:bg-gray-600">
            {loading ? 'CARGANDO VEHÍCULO...' : 'PUBLICAR EN CATÁLOGO'}
          </button>
        </form>
      </div>
    </main>
  );
}