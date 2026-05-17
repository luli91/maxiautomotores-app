'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Car, Trash2, Edit3, X, Camera, Video, ClipboardCheck, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InventarioPage() {
  const router = useRouter();
  const [listaVehiculos, setListaVehiculos] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [mensajeStatus, setMensajeStatus] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  // Estados del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState<any | null>(null);
  const [guardando, setGuardando] = useState(false);
  
  // Estados de Fotos
  const [archivosFotos, setArchivosFotos] = useState<File[]>([]);
  const [previsualizaciones, setPrevisualizaciones] = useState<string[]>([]);

  useEffect(() => {
    async function traerStock() {
      const { data } = await supabase.from('vehiculos')
        .select('*')
        .order('es_sold', { ascending: true }) // Los vendidos van abajo
        .order('created_at', { ascending: false }); // Los más nuevos arriba
      setListaVehiculos(data || []);
    }
    traerStock();
  }, [refresh]);

  const cambiarEstadoVenta = async (id: string, nuevoEstado: string) => {
    const esVendido = nuevoEstado === 'vendido';
    // Si se vende, guardamos la fecha de hoy. Si vuelve a disponible, borramos la fecha.
    const datosUpdate = esVendido 
      ? { es_sold: true, fecha_venta: new Date().toISOString() } 
      : { es_sold: false, fecha_venta: null };
      
    await supabase.from('vehiculos').update(datosUpdate).eq('id', id);
    setRefresh(prev => prev + 1);
    };

  const eliminarVehiculo = async (id: string) => {
    if (!confirm('¿Borrar definitivamente?')) return;
    await supabase.from('vehiculos').delete().eq('id', id);
    setRefresh(prev => prev + 1);
  };

  // Funciones del Modal
  const abrirModalEdicion = (v: any) => {
    setVehiculoEditando(v);
    setArchivosFotos([]);
    setPrevisualizaciones([]);
    setModalAbierto(true);
    setMensajeStatus(null);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVehiculoEditando(null);
  };

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

  const guardarEdicion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGuardando(true);
    const formData = new FormData(e.currentTarget);
    
    let urlsFotosFinales = [...(vehiculoEditando.fotos || [])];

    if (archivosFotos.length > 0) {
      for (const foto of archivosFotos) {
        const fileExt = foto.name.split('.').pop();
        const filePath = `${vehiculoEditando.numero_lote.replace('#', '')}/${Math.random()}.${fileExt}`;
        const { data } = await supabase.storage.from('vehiculos_fotos').upload(filePath, foto);
        if (data) urlsFotosFinales.push(supabase.storage.from('vehiculos_fotos').getPublicUrl(filePath).data.publicUrl);
      }
    }

    const datosActualizados = {
      titulo: formData.get('titulo'),
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
    };

    const { error } = await supabase.from('vehiculos').update(datosActualizados).eq('id', vehiculoEditando.id);

    if (error) {
      setMensajeStatus({ tipo: 'error', texto: error.message });
      setGuardando(false);
    } else {
      setMensajeStatus({ tipo: 'exito', texto: '¡Vehículo actualizado con éxito!' });
      setRefresh(prev => prev + 1);
      setTimeout(() => {
        cerrarModal();
        setGuardando(false);
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      
      {/* MODAL EMERGENTE DE EDICIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            
            <button onClick={cerrarModal} className="absolute top-6 right-6 bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors z-10">
              <X size={20} />
            </button>

            {mensajeStatus && (
              <div className={`sticky top-0 w-full p-4 text-center font-black text-[11px] uppercase tracking-widest z-10 ${mensajeStatus.tipo === 'exito' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                <span className="flex items-center justify-center gap-2">{mensajeStatus.tipo === 'exito' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {mensajeStatus.texto}</span>
              </div>
            )}

            <div className="p-8 border-b bg-gray-50">
              <h2 className="text-xl font-black uppercase tracking-tighter">Editando Lote {vehiculoEditando?.numero_lote}</h2>
              <p className="text-xs text-gray-500 font-bold">Modificá los datos y guardá los cambios.</p>
            </div>

            <form onSubmit={guardarEdicion} className="p-8 space-y-8 text-black">
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest"><Camera className="inline mr-2" size={14} /> Material Visual</h3>
                <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-300">
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <div className="bg-black text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800">Agregar Fotos Nuevas</div>
                    <input type="file" multiple accept="image/*" onChange={handleSeleccionarFotos} className="hidden" />
                  </label>

                  {vehiculoEditando?.fotos?.length > 0 && (
                    <div className="mt-6"><p className="text-[10px] font-black uppercase text-gray-400 mb-3">Fotos actuales:</p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {vehiculoEditando.fotos.map((url: string, i: number) => (<img key={i} src={url} className="h-16 w-16 rounded-xl object-cover border shrink-0" />))}
                      </div>
                    </div>
                  )}

                  {previsualizaciones.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4"><p className="text-[10px] font-black uppercase text-blue-500 mb-3">Nuevas a subir:</p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {previsualizaciones.map((src, idx) => (
                          <div key={idx} className="relative h-16 w-16 shrink-0 group">
                            <img src={src} className="h-full w-full rounded-xl object-cover border-2 border-blue-200" />
                            <button type="button" onClick={() => eliminarFotoPrevia(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Clasificación</label>
                    <select name="tipo_publicacion" defaultValue={vehiculoEditando?.tipo_publicacion} className="w-full p-3 border rounded-xl bg-white text-black font-bold outline-none">
                      <option value="Propio">Stock Propio</option><option value="Oportunidad">Oferta de Terceros</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1 flex items-center"><Video size={12} className="mr-1 text-red-500" /> Link YouTube</label>
                    <input name="video_youtube" defaultValue={vehiculoEditando?.video_youtube || ''} className="w-full p-3 border rounded-xl bg-white font-bold outline-none" />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest"><Car className="inline mr-2" size={14} /> Ficha Técnica</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3"><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Título</label><input name="titulo" defaultValue={vehiculoEditando?.titulo} required className="w-full p-3 border rounded-xl font-black bg-white outline-none" /></div>
                  <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Año</label><input name="año" type="number" defaultValue={vehiculoEditando?.año} required className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
                  <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Kilómetros</label><input name="kilometraje" defaultValue={vehiculoEditando?.kilometraje} className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
                  <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Combustible</label><input name="combustible" defaultValue={vehiculoEditando?.combustible} className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
                  <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Caja</label><input name="caja_cambios" defaultValue={vehiculoEditando?.caja_cambios} className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
                  <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Ubicación</label><input name="ubicacion" defaultValue={vehiculoEditando?.ubicacion} className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
                  <div><label className="text-[10px] font-black uppercase text-gray-400 ml-1">Radicación</label><input name="radicacion" defaultValue={vehiculoEditando?.radicacion} className="w-full p-3 border rounded-xl bg-white outline-none" /></div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest"><ClipboardCheck className="inline mr-2" size={14} /> Legal y Valor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Trámite</label>
                    <select name="tramite" defaultValue={vehiculoEditando?.tipo_tramite} className="w-full p-3 border rounded-xl font-bold bg-white outline-none">
                      <option value="08 Firmado - Listo para transferir">08 Firmado - Listo para transferir</option><option value="Transferencia Directa">Transferencia Directa</option><option value="08 en trámite">08 en trámite</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estado Visual</label>
                    <select name="estado_detalle" defaultValue={vehiculoEditando?.estado_detalle} className="w-full p-3 border rounded-xl font-bold bg-white outline-none">
                      <option value="Funcionando (Sin detalles)">Funcionando (Sin detalles)</option><option value="Funcionando (Detalles estéticos)">Funcionando (Detalles estéticos)</option><option value="Chocado (Siniestro)">Chocado (Siniestro)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-2xl border">
                    {['vtv', 'verificacion_policial', 'informe_dominio', 'libre_deuda'].map(item => (
                      <label key={item} className="flex items-center text-[10px] font-black uppercase cursor-pointer"><input type="checkbox" name={item} defaultChecked={vehiculoEditando?.[item]} className="mr-2 w-4 h-4 accent-black" /> {item.replace('_', ' ')}</label>
                    ))}
                  </div>
                  <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase text-green-600 ml-1">Precio Fijo ($)</label>
                      <input name="precio" type="number" defaultValue={vehiculoEditando?.precio_venta} required className="w-full p-4 border-2 border-green-100 rounded-2xl bg-white text-black font-black text-lg outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Observaciones</label>
                    <textarea name="observaciones" rows={2} defaultValue={vehiculoEditando?.observaciones} className="w-full p-3 border rounded-xl bg-white outline-none"></textarea>
                  </div>
                </div>
              </section>

              <button type="submit" disabled={guardando} className="w-full bg-black text-white font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl disabled:bg-gray-400">
                {guardando ? 'GUARDANDO EN LA NUBE...' : 'CONFIRMAR CAMBIOS'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VISTA NORMAL DE LA PÁGINA (TABLA) */}
      <div className="p-8 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-black uppercase tracking-tighter">Control de Inventario</h2>
        <button onClick={() => router.push('/admin/publicar')} className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors">
          + Publicar Auto
        </button>
      </div>
      <div className="overflow-x-auto p-4 md:p-8">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b-2 border-gray-100">
              <th className="pb-4 px-2">Lote / Unidad</th>
              <th className="pb-4 px-2">Precio</th>
              <th className="pb-4 px-2 text-center">Estado Comercial</th>
              <th className="pb-4 px-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {listaVehiculos.map(v => (
              <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-200 overflow-hidden border shrink-0">
                      {v.fotos?.[0] ? <img src={v.fotos[0]} className="h-full w-full object-cover" /> : <Car className="m-2 text-gray-400 opacity-50" />}
                    </div>
                    <div>
                      <p className="font-black text-black uppercase leading-tight truncate max-w-[200px] md:max-w-xs">{v.titulo}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                        Lote {v.numero_lote} • {v.año} • <Eye size={10} className="text-gray-400" /> {v.vistas || 0} vistas
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 font-black text-green-600">${v.precio_venta.toLocaleString()}</td>
                <td className="py-4 px-2 text-center">
                  <select 
                    value={v.es_sold ? 'vendido' : 'disponible'}
                    onChange={(e) => cambiarEstadoVenta(v.id, e.target.value)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl outline-none cursor-pointer border-2 transition-colors ${
                      v.es_sold ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                    }`}
                  >
                    <option value="disponible">🟢 Disponible</option>
                    <option value="vendido">🔴 Vendido</option>
                  </select>
                </td>
                <td className="py-4 px-2 text-right space-x-2">
                  <button onClick={() => abrirModalEdicion(v)} className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-black hover:text-white transition-colors" title="Editar"><Edit3 size={16} /></button>
                  <button onClick={() => eliminarVehiculo(v.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors" title="Eliminar"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {listaVehiculos.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 font-bold text-gray-400">No hay vehículos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}