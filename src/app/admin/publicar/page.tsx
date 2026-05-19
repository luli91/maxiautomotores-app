'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Car, ClipboardCheck, Layers, CheckCircle2, AlertCircle, Camera, Video, X, PackagePlus, Wrench } from 'lucide-react';

const MARCAS_AUTOS = [
  "Audi", "BMW", "Chery", "Chevrolet", "Citroën", "Fiat", "Ford", "Honda", 
  "Hyundai", "Jeep", "Kia", "Mercedes Benz", "Nissan", "Peugeot", "Renault", 
  "Suzuki", "Toyota", "Volkswagen", "Otra"
];

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
      marca: formData.get('marca'),
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
      precio_venta: Number(formData.get('precio')),
      observaciones: formData.get('observaciones'),
      video_youtube: formData.get('video_youtube') || null,
      fotos: urlsFotosFinales,
      vtv: formData.get('vtv') === 'on',
      verificacion_policial: formData.get('verificacion_policial') === 'on',
      informe_dominio: formData.get('informe_dominio') === 'on',
      libre_deuda: formData.get('libre_deuda') === 'on',
      activo: true,
      es_sold: false,
      tipo_dano: formData.get('tipo_dano'),
      motor_arranca: formData.get('motor_arranca'),
      vehiculo_camina: formData.get('vehiculo_camina') === 'on',
      airbags_sanos: formData.get('airbags_sanos') === 'on',
      chasis_afectado: formData.get('chasis_afectado') === 'on',
    };

    const { data: autoInsertado, error } = await supabase
      .from('vehiculos')
      .insert([datos])
      .select();

    if (error) {
      setMensajeStatus({ tipo: 'error', texto: error.message });
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      try {
        await supabase.functions.invoke('enviar-alerta-auto', {
          body: { 
            titulo: datos.titulo, 
            auto_id: autoInsertado[0].id,
            marca: datos.marca,
            foto_url: urlsFotosFinales.length > 0 ? urlsFotosFinales[0] : 'https://via.placeholder.com/600x400?text=Sin+Foto',
            precio: datos.precio_venta
          
          },
        });
        console.log("Notificaciones disparadas.");
      } catch (err) {
        console.error("Error disparando alertas:", err);
      }

      setMensajeStatus({ tipo: 'exito', texto: '¡Vehículo publicado y notificaciones enviadas!' });
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
          {/* FOTOS Y VIDEO */}
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

          {/* FICHA TÉCNICA GENERAL */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest"><Car className="inline mr-2" size={14} /> Ficha Técnica Base</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* ACÁ ESTÁ EL NUEVO SELECT DE MARCAS */}
              <div className="md:col-span-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Marca</label>
                <select name="marca" required className="w-full p-3 border rounded-xl font-black bg-white outline-none">
                  <option value="">Seleccionar...</option>
                  {MARCAS_AUTOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Modelo y Versión</label>
                <input name="titulo" required placeholder="Ej: Gol Trend 1.6 MSI" className="w-full p-3 border rounded-xl font-black bg-white outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Año</label>
                <select name="año" required className="w-full p-3 border rounded-xl bg-white outline-none font-bold text-black">
                    {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Kilómetros</label>
                <input name="kilometraje" type="number" placeholder="Ej: 150000" className="w-full p-3 border rounded-xl bg-white outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Combustible</label>
                <select name="combustible" className="w-full p-3 border rounded-xl font-bold bg-white outline-none">
                  <option value="Nafta">Nafta</option><option value="Diesel">Diésel</option><option value="GNC">GNC</option><option value="Hibrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Caja</label>
                <select name="caja_cambios" className="w-full p-3 border rounded-xl font-bold bg-white outline-none">
                  <option value="Manual">Manual</option><option value="Automatica">Automática</option>
                </select>
              </div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Ubicación</label><input name="ubicacion" className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Radicación</label><input name="radicacion" className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
            </div>
          </section>

          {/* NUEVA SECCIÓN: ESTADO PARA TALLERISTAS */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase text-blue-600 tracking-widest flex items-center bg-blue-50 p-2 rounded-lg w-fit">
              <Wrench className="inline mr-2" size={14} /> Estado de Componentes Clave (Talleristas)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-200">
              
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Categoría del Daño Principal</label>
                <select name="tipo_dano" className="w-full p-3 border rounded-xl font-black text-black outline-none bg-white">
                  <option value="Chapa y Pintura">Chapa y Pintura (Toques estéticos)</option>
                  <option value="Mecánica">Problemas de Mecánica</option>
                  <option value="Electrónica">Fallas Electrónicas</option>
                  <option value="Choque Fuerte / Siniestro">Choque Fuerte / Siniestro</option>
                  <option value="Volcado">Volcado</option>
                  <option value="Para Repuestos / Desguace">Para Repuestos / Desguace</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">¿El motor arranca?</label>
                <select name="motor_arranca" className="w-full p-3 border rounded-xl font-black text-black outline-none bg-white">
                  <option value="Sí">Sí, arranca perfecto</option>
                  <option value="No">No arranca</option>
                  <option value="Gira pero no arranca">El motor gira pero no llega a arrancar</option>
                </select>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-3 bg-white p-4 rounded-2xl border cursor-pointer hover:border-black transition-colors">
                  <input type="checkbox" name="vehiculo_camina" className="w-5 h-5 accent-black" /> 
                  <div>
                    <p className="text-xs font-black uppercase">El auto camina</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Se puede mover por sus medios</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-white p-4 rounded-2xl border cursor-pointer hover:border-black transition-colors">
                  <input type="checkbox" name="airbags_sanos" defaultChecked className="w-5 h-5 accent-black" /> 
                  <div>
                    <p className="text-xs font-black uppercase">Airbags Sanos</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">No fueron detonados</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-white p-4 rounded-2xl border cursor-pointer hover:border-black transition-colors">
                  <input type="checkbox" name="chasis_afectado" className="w-5 h-5 accent-black" /> 
                  <div>
                    <p className="text-xs font-black uppercase text-red-600">Chasis Afectado</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Daño estructural</p>
                  </div>
                </label>
              </div>

            </div>
          </section>

          {/* LEGAL Y PRECIO */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest"><ClipboardCheck className="inline mr-2" size={14} /> Legal y Valor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Trámite</label>
                <select name="tramite" className="w-full p-3 border rounded-xl font-bold bg-white outline-none">
                  <option value="08 Firmado - Listo para transferir">08 Firmado - Listo para transferir</option><option value="Transferencia Directa">Transferencia Directa</option><option value="08 en trámite">08 en trámite</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-2xl border">
                {['vtv', 'verificacion_policial', 'informe_dominio', 'libre_deuda'].map(item => (
                  <label key={item} className="flex items-center text-[10px] font-black uppercase cursor-pointer"><input type="checkbox" name={item} className="mr-2 w-4 h-4 accent-black" /> {item.replace('_', ' ')}</label>
                ))}
              </div>
              <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-green-600 ml-1">Precio Fijo ($)</label>
                  <input name="precio" type="number" required className="w-full p-4 border-2 border-green-100 rounded-2xl bg-white text-black font-black text-lg outline-none focus:border-green-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Observaciones / Faltantes para el taller</label>
                <textarea name="observaciones" rows={3} placeholder="Detallá piezas faltantes, golpes ocultos, o aclaraciones para el mecánico..." className="w-full p-3 border rounded-xl bg-white outline-none focus:border-yellow-500"></textarea>
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