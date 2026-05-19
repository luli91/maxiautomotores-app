// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const { titulo, auto_id, marca, foto_url, precio } = await req.json()

  const formatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  const precioFormateado = formatter.format(precio);

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  const { data: usuarios } = await supabase
    .from('usuarios_perfiles')
    .select('email')
    .eq('recibe_alertas', true)

  const EMAIL_AUTORIZADO = "cynthia.medina.diaz@gmail.com";
  const emails = usuarios?.map((u: any) => u.email).filter(email => email === EMAIL_AUTORIZADO) || [];

  if (emails.length === 0) return new Response("Sin destinatarios", { status: 200, headers: corsHeaders })

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: "MaxiAutomotores <onboarding@resend.dev>",
      to: emails,
      subject: `🔥 ¡Nueva Oportunidad: ${marca} ${titulo}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 2px solid #EAB308; border-radius: 15px; overflow: hidden;">
          <div style="background-color: #000; color: #EAB308; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">MaxiAutomotores</h1>
          </div>
          
          <div style="padding: 25px;">
            <img src="${foto_url}" alt="${titulo}" style="width: 100%; height: auto; border-radius: 10px; margin-bottom: 20px; border: 1px solid #ddd;">
            
            <h2 style="color: #333; margin: 0 0 10px 0;">${marca} ${titulo}</h2>
            <p style="font-size: 28px; font-weight: 900; color: #EAB308; margin: 0 0 20px 0;">${precioFormateado}</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.5;">¡Acaba de ingresar una nueva unidad a nuestro stock y queríamos que seas el primero en saberlo!</p>
            
            <a href="https://maxiautomotores.com/auto/${auto_id}" 
               style="display: block; background-color: #EAB308; color: #000; padding: 15px; text-decoration: none; border-radius: 8px; font-weight: 900; text-align: center; font-size: 16px; text-transform: uppercase; margin-top: 20px;">
               Ver Vehículo Completo
            </a>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            MaxiAutomotores - Gestión de vehículos
          </div>
        </div>
      `,
    }),
  })

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})