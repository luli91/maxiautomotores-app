'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Car, DollarSign, CheckSquare, Package, Trophy, Zap, TrendingUp, TrendingDown } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [listaVehiculos, setListaVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      
      const { data } = await supabase.from('vehiculos').select('*');
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
  const capitalVendido = listaVehiculos.filter(v => v.es_sold).reduce((sum, v) => sum + Number(v.precio_venta), 0);

  // --- CÁLCULOS MENSUALES (Métricas avanzadas) ---
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

  listaVehiculos.forEach(v => {
    const fechaCreacion = new Date(v.created_at);
    if (fechaCreacion.getMonth() === mesActual && fechaCreacion.getFullYear() === añoActual) ingresadosEsteMes++;
    if (fechaCreacion.getMonth() === mesPasado && fechaCreacion.getFullYear() === añoMesPasado) ingresadosMesPasado++;

    if (v.es_sold && v.fecha_venta) {
      const fechaVenta = new Date(v.fecha_venta);
      
      // Sumamos dinero del mes actual y pasado
      if (fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === añoActual) ingresosEsteMes += Number(v.precio_venta);
      if (fechaVenta.getMonth() === mesPasado && fechaVenta.getFullYear() === añoMesPasado) ingresosMesPasado += Number(v.precio_venta);

      // Calculamos venta más rápida (Días de diferencia)
      const diffTiempo = Math.abs(fechaVenta.getTime() - fechaCreacion.getTime());
      const diasVenta = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));
      
      if (diasVenta < menorTiempoVenta) {
        menorTiempoVenta = diasVenta;
        autoMasRapido = { titulo: v.titulo, dias: diasVenta, lote: v.numero_lote };
      }
    }
  });

  // Funciones para calcular porcentajes de crecimiento
  const calcCrecimiento = (actual: number, pasado: number) => {
    if (pasado === 0) return actual > 0 ? 100 : 0;
    return Math.round(((actual - pasado) / pasado) * 100);
  };
  
  const crecIngresos = calcCrecimiento(ingresosEsteMes, ingresosMesPasado);
  const crecIngresosColor = crecIngresos >= 0 ? 'text-green-500' : 'text-red-500';

  // --- RANKING DE MARCAS ---
  const autosVendidos = listaVehiculos.filter(v => v.es_sold);
  const ranking: Record<string, number> = {};
  autosVendidos.forEach(v => {
    const marca = v.titulo.split(' ')[0].toUpperCase();
    ranking[marca] = (ranking[marca] || 0) + 1;
  });

  const rankingOrdenado = Object.entries(ranking)
    .map(([marca, cantidad]) => ({ marca, cantidad, porcentaje: Math.round((cantidad / Math.max(mVendidos, 1)) * 100) }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Panel de Control</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">Rendimiento y métricas de crecimiento de MaxiAutomotores.</p>
      </div>

      {/* MÉTRICAS MENSUALES (Destacadas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* INGRESOS DEL MES */}
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

        {/* AUTOS INGRESADOS ESTE MES */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Ingresos de Unidades</p>
              <p className="text-3xl font-black text-black">{ingresadosEsteMes} <span className="text-sm text-gray-400">Autos</span></p>
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl"><Package className="h-5 w-5 text-gray-600" /></div>
          </div>
          <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
            Mes pasado ingresaron: {ingresadosMesPasado}
          </p>
        </div>

        {/* VENTA RÉCORD */}
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
          ) : (
            <p className="text-xs font-bold text-black/50">Faltan datos de venta</p>
          )}
        </div>

      </div>

      {/* MÉTRICAS HISTÓRICAS Y RANKING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TARJETITAS CHICAS HISTÓRICAS */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Stock Disponible</p>
              <p className="text-2xl font-black text-blue-600">{mDisponibles} Unidades</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-2xl"><Car className="h-5 w-5 text-blue-600" /></div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Histórico Vendido</p>
              <p className="text-2xl font-black text-yellow-500">{mVendidos} Unidades</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-2xl"><CheckSquare className="h-5 w-5 text-yellow-600" /></div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Capital Histórico</p>
              <p className="text-2xl font-black text-green-600">${capitalVendido.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-2xl"><DollarSign className="h-5 w-5 text-green-600" /></div>
          </div>
        </div>

        {/* RANKING GRÁFICO */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Marcas Más Vendidas Histórico
          </h2>
          {rankingOrdenado.length === 0 ? (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-sm font-bold text-gray-400 text-center">Todavía no hay ventas para armar el gráfico.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {rankingOrdenado.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-xs font-black uppercase text-gray-700 mb-2">
                    <span>{item.marca}</span>
                    <span>{item.cantidad} Unds. ({item.porcentaje}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-yellow-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${item.porcentaje}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}