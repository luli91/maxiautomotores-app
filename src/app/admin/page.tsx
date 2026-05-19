'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { DollarSign, Package, Trophy, Zap, TrendingUp, TrendingDown, Eye, Wrench, Flame, Medal, CarFront, FileText } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [listaVehiculos, setListaVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      
      const { data } = await supabase.from('vehiculos').select('*').order('es_sold', { ascending: true });
      setListaVehiculos(data || []);
      setLoading(false);
    }
    initAdmin();
  }, [router]);

  if (loading) return <div className="h-64 flex items-center justify-center font-black uppercase tracking-widest text-gray-400 animate-pulse">Calculando métricas...</div>;

  // --- CÁLCULOS GENERALES ---
  const mTotal = listaVehiculos.length;
  const mVendidos = listaVehiculos.filter(v => v.es_sold).length;
  const mDisponibles = mTotal - mVendidos;

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const añoActual = ahora.getFullYear();
  const mesPasado = mesActual === 0 ? 11 : mesActual - 1;
  const añoMesPasado = mesActual === 0 ? añoActual - 1 : añoActual;

  let ingresadosEsteMes = 0;
  let ingresadosMesPasado = 0;
  let ingresosEsteMes = 0;
  let ingresosMesPasado = 0;
  let autoMasRapido: any = null;
  let menorTiempoVenta = Infinity;
  
  let totalVistas = 0;
  let autoMasVisto: any = null;
  let maxVistas = -1;
  
  const stockPorDano: Record<string, number> = {};
  const vistasPorDano: Record<string, number> = {};
  const ventasPorDano: Record<string, number> = {};

  listaVehiculos.forEach(v => {
    const vistas = v.vistas || 0;
    totalVistas += vistas;
    if (vistas > maxVistas && vistas > 0) {
      maxVistas = vistas;
      autoMasVisto = v;
    }

    if (v.tipo_dano) {
      vistasPorDano[v.tipo_dano] = (vistasPorDano[v.tipo_dano] || 0) + vistas;
      if (v.es_sold) {
        ventasPorDano[v.tipo_dano] = (ventasPorDano[v.tipo_dano] || 0) + 1;
      } else {
        stockPorDano[v.tipo_dano] = (stockPorDano[v.tipo_dano] || 0) + 1;
      }
    }

    const fechaCreacion = new Date(v.created_at);
    if (fechaCreacion.getMonth() === mesActual && fechaCreacion.getFullYear() === añoActual) ingresadosEsteMes++;
    if (fechaCreacion.getMonth() === mesPasado && fechaCreacion.getFullYear() === añoMesPasado) ingresadosMesPasado++;

    if (v.es_sold && v.fecha_venta) {
      const fechaVenta = new Date(v.fecha_venta);
      if (fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === añoActual) ingresosEsteMes += Number(v.precio_venta);
      if (fechaVenta.getMonth() === mesPasado && fechaVenta.getFullYear() === añoMesPasado) ingresosMesPasado += Number(v.precio_venta);

      const diffTiempo = Math.abs(fechaVenta.getTime() - fechaCreacion.getTime());
      const diasVenta = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));
      if (diasVenta < menorTiempoVenta) {
        menorTiempoVenta = diasVenta;
        autoMasRapido = { titulo: v.titulo, dias: diasVenta, lote: v.numero_lote };
      }
    }
  });

  const crecIngresos = ingresosMesPasado === 0 ? (ingresosEsteMes > 0 ? 100 : 0) : Math.round(((ingresosEsteMes - ingresosMesPasado) / ingresosMesPasado) * 100);
  const crecIngresosColor = crecIngresos >= 0 ? 'text-green-500' : 'text-red-500';

  let danoMasVendido = { nombre: 'Sin datos', cant: 0 };
  Object.entries(ventasPorDano).forEach(([nombre, cant]) => {
    if (cant > danoMasVendido.cant) danoMasVendido = { nombre, cant };
  });

  let danoMasVisto = { nombre: 'Sin datos', cant: 0 };
  Object.entries(vistasPorDano).forEach(([nombre, cant]) => {
    if (cant > danoMasVisto.cant) danoMasVisto = { nombre, cant };
  });

  const autosVendidos = listaVehiculos.filter(v => v.es_sold);
  
  const rankingMarcas: Record<string, number> = {};
  const rankingModelos: Record<string, number> = {}; 

  autosVendidos.forEach(v => {
    const marca = v.marca ? v.marca.toUpperCase() : v.titulo.split(' ')[0].toUpperCase();
    rankingMarcas[marca] = (rankingMarcas[marca] || 0) + 1;
    
    const modeloExacto = v.titulo.toUpperCase();
    rankingModelos[modeloExacto] = (rankingModelos[modeloExacto] || 0) + 1;
  });

  const marcasOrdenadas = Object.entries(rankingMarcas)
    .map(([marca, cantidad]) => ({ marca, cantidad, porcentaje: Math.round((cantidad / Math.max(mVendidos, 1)) * 100) }))
    .sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

  const modelosOrdenados = Object.entries(rankingModelos)
    .map(([modelo, cantidad]) => ({ modelo, cantidad, porcentaje: Math.round((cantidad / Math.max(mVendidos, 1)) * 100) }))
    .sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

  const danosOrdenados = Object.entries(stockPorDano)
    .map(([dano, cantidad]) => ({ dano, cantidad, porcentaje: Math.round((cantidad / Math.max(mDisponibles, 1)) * 100) }))
    .sort((a, b) => b.cantidad - a.cantidad);

  return (
    <>
      {/* -------------------------------------------------------------
        1. VISTA DE LA PANTALLA NORMAL (Se oculta al imprimir)
        -------------------------------------------------------------
      */}
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10 print:hidden">
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Panel de Control</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Rendimiento y métricas de crecimiento de MaxiAutomotores.</p>
          </div>
          
          {/* BOTÓN DESCARGAR PDF */}
          <button onClick={() => window.print()} className="bg-red-50 text-red-700 border border-red-100 px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2 shadow-sm w-fit">
            <FileText size={16} /> Descargar Stock (PDF)
          </button>
        </div>

        {/* MÉTRICAS DEL MES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black text-white p-6 rounded-[2rem] shadow-xl flex flex-col justify-between border border-neutral-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Facturación del Mes</p>
                <p className="text-3xl font-black text-green-400">${ingresosEsteMes.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl"><DollarSign className="h-5 w-5 text-green-400" /></div>
            </div>
            <p className={`text-xs font-bold flex items-center gap-1 ${crecIngresosColor}`}>
              {crecIngresos >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {crecIngresos >= 0 ? '+' : ''}{crecIngresos}% vs mes pasado
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Ingresos de Unidades</p>
                <p className="text-3xl font-black text-black">{ingresadosEsteMes} <span className="text-sm text-gray-400">Autos</span></p>
              </div>
              <div className="bg-gray-100 p-3 rounded-2xl"><Package className="h-5 w-5 text-gray-600" /></div>
            </div>
            <p className="text-xs font-bold text-gray-500 flex items-center gap-1">Mes pasado ingresaron: {ingresadosMesPasado}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between text-black">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black uppercase text-black/60 tracking-widest mb-1">Venta Más Rápida ⚡</p>
                {autoMasRapido ? (
                  <p className="text-2xl font-black leading-tight truncate max-w-[150px]">{autoMasRapido.titulo}</p>
                ) : (
                  <p className="text-lg font-black text-black/50">Sin registros</p>
                )}
              </div>
              <div className="bg-black/10 p-3 rounded-2xl"><Zap className="h-5 w-5 text-black" /></div>
            </div>
            {autoMasRapido ? (
              <p className="text-xs font-bold text-black/70">
                Vendido en <span className="bg-black text-white px-2 py-0.5 rounded-md">{autoMasRapido.dias === 0 ? 'Horas' : `${autoMasRapido.dias} días`}</span> (Lote {autoMasRapido.lote})
              </p>
            ) : <p className="text-xs font-bold text-black/50">Faltan datos de venta</p>}
          </div>
        </div>

        {/* MÉTRICAS ESTRATÉGICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Vistas Web</p>
              <p className="text-xl font-black text-purple-600">{totalVistas} <span className="text-[10px] text-gray-400">Clicks</span></p>
            </div>
            <div className="bg-purple-50 p-3 rounded-2xl"><Eye className="h-5 w-5 text-purple-600" /></div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1 flex items-center"><Flame className="w-3 h-3 text-red-500 mr-1"/> Auto Más Visto</p>
              <p className="text-sm font-black text-black truncate" title={autoMasVisto?.titulo}>{autoMasVisto ? autoMasVisto.titulo : 'Sin datos'}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1 flex items-center"><Eye className="w-3 h-3 text-blue-500 mr-1"/> Rubro Más Buscado</p>
              <p className="text-sm font-black text-blue-600 truncate">{danoMasVisto.nombre}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{danoMasVisto.cant} vistas acumuladas</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1 flex items-center"><Medal className="w-3 h-3 text-yellow-500 mr-1"/> Rubro Más Vendido</p>
              <p className="text-sm font-black text-yellow-600 truncate">{danoMasVendido.nombre}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{danoMasVendido.cant} autos vendidos</p>
          </div>
        </div>

        {/* GRÁFICOS: 3 COLUMNAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={18} /> Marcas Más Vendidas
            </h2>
            {marcasOrdenadas.length === 0 ? (
              <p className="text-xs font-bold text-gray-400 text-center py-6">Todavía no hay ventas.</p>
            ) : (
              <div className="space-y-4">
                {marcasOrdenadas.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-700 mb-1">
                      <span>{item.marca}</span>
                      <span>{item.cantidad} ({item.porcentaje}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${item.porcentaje}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
              <CarFront className="text-black" size={18} /> Modelos Más Vendidos
            </h2>
            {modelosOrdenados.length === 0 ? (
              <p className="text-xs font-bold text-gray-400 text-center py-6">Todavía no hay ventas.</p>
            ) : (
              <div className="space-y-4">
                {modelosOrdenados.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-700 mb-1">
                      <span className="truncate pr-2" title={item.modelo}>{item.modelo}</span>
                      <span>{item.cantidad} Unds.</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-black h-2 rounded-full" style={{ width: `${item.porcentaje}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Wrench className="text-blue-500" size={18} /> Stock por Daño
            </h2>
            {danosOrdenados.length === 0 ? (
              <p className="text-xs font-bold text-gray-400 text-center py-6">No hay autos disponibles.</p>
            ) : (
              <div className="space-y-4">
                {danosOrdenados.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-700 mb-1">
                      <span>{item.dano}</span>
                      <span>{item.cantidad} Unds.</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.porcentaje}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
        2. VISTA EXCLUSIVA PARA EL PDF (Oculta normalmente, se ve al imprimir)
        -------------------------------------------------------------
      */}
      <div className="hidden print:block bg-white text-black min-h-screen absolute top-0 left-0 w-full z-[9999] p-8">
        
        {/* Cabecera del PDF */}
        <div className="flex justify-between items-center border-b-4 border-black pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">MAXIAUTOMOTORES</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Reporte de Stock e Inventario</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase bg-black text-white px-3 py-1 rounded-full mb-2 inline-block">Documento Interno</p>
            <p className="text-xs font-bold text-gray-600">Fecha: {new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        {/* Resumen para el PDF */}
        <div className="flex gap-8 mb-8 bg-gray-100 p-6 rounded-2xl">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase">Total Vehículos</p>
            <p className="text-2xl font-black">{mTotal}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase">Disponibles</p>
            <p className="text-2xl font-black text-green-600">{mDisponibles}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase">Vendidos</p>
            <p className="text-2xl font-black text-red-600">{mVendidos}</p>
          </div>
        </div>

        {/* Tabla Lista para PDF */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white text-[10px] font-black uppercase tracking-widest">
              <th className="p-3 border border-black">Lote</th>
              <th className="p-3 border border-black">Vehículo</th>
              <th className="p-3 border border-black">Año</th>
              <th className="p-3 border border-black">Kilómetros</th>
              <th className="p-3 border border-black text-center">Estado</th>
              <th className="p-3 border border-black text-right">Precio Contado</th>
            </tr>
          </thead>
          <tbody>
            {listaVehiculos.map(v => (
              <tr key={v.id} className="text-xs border-b border-gray-300">
                <td className="p-3 font-bold text-gray-600">{v.numero_lote}</td>
                <td className="p-3 font-black uppercase">{v.marca ? `${v.marca} ` : ''}{v.titulo}</td>
                <td className="p-3">{v.año}</td>
                <td className="p-3">{v.kilometraje || 'N/A'}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-sm font-black text-[9px] uppercase ${v.es_sold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {v.es_sold ? 'Vendido' : 'Disponible'}
                  </span>
                </td>
                <td className="p-3 font-black text-right text-base">${v.precio_venta.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-12 text-center text-[10px] font-bold text-gray-400 uppercase border-t pt-4">
          Sistema de Gestión Generado Automáticamente - MaxiAutomotores
        </div>
      </div>
    </>
  );
}