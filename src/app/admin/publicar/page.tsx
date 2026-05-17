'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Car, ClipboardCheck, Tag, Layers, CheckCircle2, AlertCircle, Camera, Video, X, PackagePlus } from 'lucide-react';

export default function PublicarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [proximoLote, setProximoLote] = useState('');
  const [mensajeStatus, setMensajeStatus] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const [archivosFotos, setArchivosFotos] = useState<File[]>([]);
  const [previsualizaciones, setPrevisualizaciones] = useState<string[]>([]);
  const [subiendoFotos, setSubiendoFotos] = useState(false);

  useEffect(() => {
    async function inicializar() {
      const { data } = await supabase.from('vehiculos').select('numero_lote');
      if (data && data.length > 0) {
        const numeros = data.map(v => parseInt(v.numero_lote.replace('#', ''))).filter(n => !isNaN(n));
        setProximoLote(numeros.length > 0 ? `#${(Math.max(...numeros) + 1).toString().padStart(3, '0')}` : '#001');
      } else setProximoLote('#001');
    }
    inicializar();
  }, []);

  const handleSeleccionarFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevos = Array.from(e.target.files);
      setArchivosFotos(prev => [...prev, ...nuevos]);
      setPrevisualizaciones(prev => [...prev, ...nuevos.map(f => URL.createObjectURL(f))]);
    }
  };

  const eliminarFotoPrevia = (index: number) => {
    setArchivosFotos(prev => prev.filter((_, i) => i !== index));
    setPrevisualizaciones(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setMensajeStatus(null);
    const formData = new FormData(e.currentTarget);
    
    let urlsFotosFinales: string[] = [];

    if (archivosFotos.length > 0) {
      setSubiendoFotos(true);
      for (const foto of archivosFotos) {
        const fileExt = foto.name.split('.').pop();
        const filePath = `${proximoLote.replace('#', '')}/${Math.random()}.${fileExt}`;
        const { data } = await supabase.storage.from('vehiculos_fotos').upload(filePath, foto);
        if (data) urlsFotosFinales.push(supabase.storage.from('vehiculos_fotos').getPublicUrl(filePath).data.publicUrl);
      }
      setSubiendoFotos(false);
    }

    const datos = {
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
      video_youtube: formData.get('video_youtube') || null,
      fotos: urlsFotosFinales,
      vtv: formData.get('vtv') === 'on',
      verificacion_policial: formData.get('verificacion_policial') === 'on',
      informe_dominio: formData.get('informe_dominio') === 'on',
      libre_deuda: formData.get('libre_deuda') === 'on',
      activo: true,
      es_sold: false
    };

    const { error } = await supabase.from('vehiculos').insert([datos]);

    if (error) {
      setMensajeStatus({ tipo: 'error', texto: error.message });
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setMensajeStatus({ tipo: 'exito', texto: '¡Vehículo publicado con éxito!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => router.push('/admin/inventario'), 1500); 
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-500">
      {mensajeStatus && (
        <div className={`absolute top-0 left-0 w-full p-4 text-center font-black text-[11px] uppercase tracking-widest z-10 ${mensajeStatus.tipo === 'exito' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          <span className="flex items-center justify-center gap-2">{mensajeStatus.tipo === 'exito' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {mensajeStatus.texto}</span>
        </div>
      )}

      <div className={`bg-gray-50 p-8 border-b flex justify-between items-center ${mensajeStatus ? 'pt-16' : ''}`}>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <PackagePlus className="text-yellow-500" /> Publicar Nuevo Vehículo
          </h2>
          <p className="text-xs text-gray-500 font-bold mt-1">
            El sistema asignará el Lote {proximoLote}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8 text-black">
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest"><Camera className="inline mr-2" size={14} /> Material Visual</h3>
            <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-300">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <div className="bg-black text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">Seleccionar Fotos</div>
                <input type="file" multiple accept="image/*" onChange={handleSeleccionarFotos} className="hidden" />
              </label>

              {previsualizaciones.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {previsualizaciones.map((src, idx) => (
                      <div key={idx} className="relative h-20 w-20 shrink-0 group">
                        <img src={src} className="h-full w-full rounded-xl object-cover border-2 border-blue-200" />
                        <button type="button" onClick={() => eliminarFotoPrevia(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Clasificación</label>
                <select name="tipo_publicacion" className="w-full p-3 border rounded-xl bg-white text-black font-bold outline-none focus:border-yellow-500">
                  <option value="Propio">Stock Propio</option><option value="Oportunidad">Oferta de Terceros</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 flex items-center"><Video size={12} className="mr-1 text-red-500" /> Link YouTube (Opcional)</label>
                <input name="video_youtube" placeholder="Ej: https://youtube.com/watch?v=..." className="w-full p-3 border rounded-xl bg-white font-bold outline-none focus:border-red-500" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest"><Car className="inline mr-2" size={14} /> Ficha Técnica</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3"><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Título / Modelo</label><input name="titulo" required className="w-full p-3 border rounded-xl font-black bg-white outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Año</label><input name="año" type="number" required className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Kilómetros</label><input name="kilometraje" className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Combustible</label><input name="combustible" className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Caja</label><input name="caja_cambios" className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Ubicación</label><input name="ubicacion" className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Radicación</label><input name="radicacion" className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest"><ClipboardCheck className="inline mr-2" size={14} /> Legal y Valor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Trámite</label>
                <select name="tramite" className="w-full p-3 border rounded-xl font-bold bg-white outline-none">
                  <option value="08 Firmado - Listo para transferir">08 Firmado - Listo para transferir</option><option value="Transferencia Directa">Transferencia Directa</option><option value="08 en trámite">08 en trámite</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estado Visual</label>
                <select name="estado_detalle" className="w-full p-3 border rounded-xl font-bold bg-white outline-none">
                  <option value="Funcionando (Sin detalles)">Funcionando (Sin detalles)</option><option value="Funcionando (Detalles estéticos)">Funcionando (Detalles estéticos)</option><option value="Chocado (Siniestro)">Chocado (Siniestro)</option>
                </select>
              </div>
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 p-4 rounded-2xl border">
                {['vtv', 'verificacion_policial', 'informe_dominio', 'libre_deuda'].map(item => (
                  <label key={item} className="flex items-center text-[10px] font-black uppercase cursor-pointer"><input type="checkbox" name={item} className="mr-2 w-4 h-4 accent-black" /> {item.replace('_', ' ')}</label>
                ))}
              </div>
              <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-green-600 ml-1">Precio Fijo ($)</label>
                  <input name="precio" type="number" required className="w-full p-4 border-2 border-green-100 rounded-2xl bg-white text-black font-black text-lg outline-none focus:border-green-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Observaciones</label>
                <textarea name="observaciones" rows={2} className="w-full p-3 border rounded-xl bg-white outline-none focus:border-yellow-500"></textarea>
              </div>
            </div>
          </section>

          <button type="submit" disabled={loading || subiendoFotos} className="w-full bg-black text-white font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl disabled:bg-gray-400">
            {subiendoFotos ? 'SUBIENDO FOTOS...' : loading ? 'GUARDANDO...' : 'PUBLICAR VEHÍCULO'}
          </button>
      </form>
    </div>
  );
}