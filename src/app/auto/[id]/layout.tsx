import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data } = await supabase.from('vehiculos').select('*').eq('id', params.id).single();
  
  if (!data) return { title: 'Auto no encontrado' };
  
  const marca = data.marca ? `${data.marca} ` : '';
  const tituloFull = `${marca}${data.titulo}`;
  
  return {
    title: `${tituloFull} | MaxiAutomotores`,
    description: `Modelo ${data.año} • ${data.kilometraje} KM. Gran oportunidad de inversión o proyecto. Lote ${data.numero_lote}.`,
    openGraph: {
      title: `${tituloFull} | MaxiAutomotores`,
      description: `Mirá el estado detallado y el precio de este vehículo.`,
      images: [data.fotos?.[0] || 'https://www.transparenttextures.com/patterns/carbon-fibre.png'],
      type: 'website',
    }
  }
}

export default function AutoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}