'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, TrendingUp, DollarSign, Receipt, Car, CalendarDays, CheckCircle2, BarChart4 } from 'lucide-react';

export default function FinanzasPage() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarFinanzas() {
      const { data } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('es_sold', true)
        .order('created_at', { ascending: false });
      
      setVentas(data || []);
      setLoading(false);
    }
    cargarFinanzas();
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center font-black uppercase tracking-widest text-gray-400 animate-pulse">Calculando Reporte Financiero...</div>;

  const ingresosTotales = ventas.reduce((sum, v) => sum + Number(v.precio_venta), 0);
  const ticketPromedio = ventas.length > 0 ? Math.round(ingresosTotales / ventas.length) : 0;

  // --- LÓGICA PARA EL HISTORIAL DE 12 MESES ---
  const historialMeses: { mesStr: string, ingresos: number, autos: number }[] = [];
  const hoy = new Date();
  
  // 1. Armamos un array con los últimos 12 meses (vacíos al principio)
  for (let i = 11; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    const mesFormateado = fecha.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }).replace('.', '');
    historialMeses.push({ mesStr: key, ingresos: 0, autos: 0, ...{ label: mesFormateado } });
  }

  // 2. Llenamos el array con las ventas reales
  ventas.forEach(v => {
    // Usamos fecha_venta, y si es un auto viejo que no tenía, usamos created_at para no perder el dato
    const fechaRef = new Date(v.fecha_venta || v.created_at);
    const key = `${fechaRef.getFullYear()}-${String(fechaRef.getMonth() + 1).padStart(2, '0')}`;
    
    const mesEncontrado = historialMeses.find(m => m.mesStr === key);
    if (mesEncontrado) {
      mesEncontrado.ingresos += Number(v.precio_venta);
      mesEncontrado.autos += 1;
    }
  });

  // 3. Buscamos el mes de mayor ingreso para calcular el 100% de la barra del gráfico
  const maxIngreso = Math.max(...historialMeses.map(m => m.ingresos), 1);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10">
      
      <div>
        <h1 className="text-3xl font-black text-black uppercase tracking-tighter flex items-center gap-3">
          <Wallet className="text-yellow-500" size={32} /> Reporte de Finanzas
        </h1>
        <p className="text-gray-500 font-medium text-sm mt-1">Análisis de ingresos y evolución de ventas de los últimos 12 meses.</p>
      </div>

      {/* TARJETAS DE MÉTRICAS FINANCIERAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between border border-neutral-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Ingresos Brutos (Histórico)</p>
              <p className="text-4xl md:text-5xl font-black text-green-500">${ingresosTotales.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl"><DollarSign className="h-6 w-6 text-green-400" /></div>
          </div>
          <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
            <TrendingUp size={14} className="text-green-500" /> Suma total de operaciones cerradas
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Ticket Promedio</p>
              <p className="text-3xl font-black text-black">${ticketPromedio.toLocaleString()}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl"><Receipt className="h-6 w-6 text-gray-600" /></div>
          </div>
          <p className="text-xs text-gray-500 font-bold">Valor medio por cada unidad vendida.</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between text-black">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase text-black/60 tracking-widest mb-1">Volumen de Operaciones</p>
              <p className="text-3xl font-black text-black">{ventas.length} Autos</p>
            </div>
            <div className="bg-black/10 p-3 rounded-2xl"><Car className="h-6 w-6 text-black" /></div>
          </div>
          <p className="text-xs text-black/70 font-bold">Total de vehículos entregados.</p>
        </div>
      </div>

      {/* GRÁFICO EVOLUTIVO DE 12 MESES */}
      <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 w-full overflow-hidden">
        <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter flex items-center gap-2 mb-6">
          <BarChart4 className="text-yellow-500" size={24} /> Evolución Anual de Ingresos
        </h2>
        
        {/* Gráfico responsivo: sin scroll horizontal, se comprime automáticamente */}
        <div className="w-full h-48 md:h-64 flex items-end justify-between gap-1 md:gap-3 mt-4 pt-4 border-t border-gray-50">
          {historialMeses.map((mes, index) => {
            const porcentaje = Math.round((mes.ingresos / maxIngreso) * 100);
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                {/* Tooltip Hover (Solo visible en pantallas grandes o al tocar) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-black text-white p-2 rounded-lg text-center pointer-events-none z-10 shadow-lg hidden md:block">
                  <p className="text-[10px] font-black text-green-400">${mes.ingresos.toLocaleString()}</p>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full relative h-32 md:h-48 bg-gray-50 rounded-t-sm md:rounded-t-xl overflow-hidden flex items-end">
                  <div 
                    className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm md:rounded-t-xl transition-all duration-1000 group-hover:from-green-500 group-hover:to-green-300"
                    style={{ height: `${porcentaje}%` }}
                  ></div>
                </div>
                
                {/* Etiqueta del Mes: más chica en celu para que entren los 12 meses */}
                <span className="text-[7px] md:text-xs font-bold text-gray-400 uppercase mt-2 text-center break-all w-full">
                  {(mes as any).label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIBRO MAYOR DE VENTAS */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Receipt className="text-green-600" size={20} /> Libro Mayor de Ventas
          </h2>
        </div>
        
        {/* VISTA MÓVIL (Lista estilo App) */}
        <div className="md:hidden p-4 space-y-3 bg-gray-100">
          {ventas.map((v) => (
            <div key={v.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <p className="font-black text-black uppercase text-xs leading-tight">{v.titulo}</p>
                </div>
                <p className="font-black text-green-600 text-sm">${v.precio_venta.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  Lote {v.numero_lote} • <CalendarDays className="inline w-3 h-3 mb-0.5" /> {v.fecha_venta ? new Date(v.fecha_venta).toLocaleDateString('es-AR') : new Date(v.created_at).toLocaleDateString('es-AR')}
                </p>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest truncate max-w-[100px]">
                  {v.tipo_tramite}
                </span>
              </div>
            </div>
          ))}
          {ventas.length === 0 && <p className="text-center py-6 text-gray-400 font-bold text-xs uppercase">No hay ventas registradas.</p>}
        </div>

        {/* VISTA DESKTOP (Tabla Normal) */}
        <div className="hidden md:block p-8">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b-2 border-gray-100">
                <th className="pb-4 px-2">Operación / Vehículo</th>
                <th className="pb-4 px-2">Trámite Realizado</th>
                <th className="pb-4 px-2 text-right">Monto Facturado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ventas.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-2">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 text-green-700 p-3 rounded-xl shrink-0"><CheckCircle2 size={20} /></div>
                      <div>
                        <p className="font-black text-black uppercase leading-tight">{v.titulo}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                          Lote {v.numero_lote} • <CalendarDays className="inline w-3 h-3 mb-0.5" /> Vendido: {v.fecha_venta ? new Date(v.fecha_venta).toLocaleDateString('es-AR') : new Date(v.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-2"><span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{v.tipo_tramite}</span></td>
                  <td className="py-5 px-2 text-right font-black text-green-600 text-lg">${v.precio_venta.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}