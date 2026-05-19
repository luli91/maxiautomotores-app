# 🚗 MaxiAutomotores - Ecosistema Digital Fierrero

Plataforma integral de gestión, comercialización e intermediación de vehículos de oportunidad, salvamentos y proyectos para talleristas. Desarrollada para modernizar el flujo de trabajo de una agencia automotor, conectando stock propio con "Oportunidades de la Red".

## 🚀 Características Principales

### 🏪 Salón Digital (Público)
- **Filtros Avanzados para Talleristas:** Búsqueda técnica por estado de chasis, despliegue de airbags, arranque de motor, daños específicos y VTV.
- **Catálogo Inteligente:** División automática entre "Stock Directo" y "Oportunidades de la Red".
- **Favoritos (Garaje Virtual):** Guardado de proyectos en tiempo real con Modal de Login sin fricción.
- **SEO & WhatsApp:** Fichas de vehículos optimizadas con OpenGraph para previsualizaciones premium al compartir enlaces por WhatsApp.

### 👤 Perfil de Usuario (Clientes)
- **Dashboard Personal:** Edición rápida de datos comerciales (WhatsApp, Empresa/Taller).
- **Gestor de Favoritos:** Presupuestación visual de autos de interés.
- **Intermediación (Broker):** Call-To-Action directo para ofrecer vehículos propios y publicarlos en la red de la agencia.

### ⚙️ Panel de Control (Administrador)
- **Métricas en Tiempo Real:** Cálculo de facturación mensual, ingresos de unidades, y tiempo récord de ventas.
- **Rankings Inteligentes:** Marcas más vendidas, Modelos exactos más buscados y distribución de stock por tipo de daño.
- **Gestión Física (QR):** Generador de cartelería PDF en blanco y negro con Código QR para pegar en el parabrisas de los autos físicos.
- **Exportación:** Descarga del inventario en formato PDF para compartir con la red de revendedores.
- **Control de Inventario:** CRUD completo con carga masiva de fotos a la nube y control estricto de nomenclaturas.

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js (React) + TypeScript
- **Estilos:** Tailwind CSS
- **Iconografía:** Lucide React
- **Backend / Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Almacenamiento:** Supabase Storage (Imágenes de vehículos)

## Sistema de Notificaciones
El sistema cuenta con un motor de notificaciones automatizado que alerta vía email cada vez que se publica un nuevo vehículo:
- **Backend:** Edge Functions de Supabase.
- **Provider:** Resend.
- **Flujo:** Al guardar un vehículo, el frontend invoca la función `enviar-alerta-auto`, que procesa los datos, busca suscriptores activos y envía un email con diseño personalizado.
- **Estado:** Configurado en modo prueba (filtrado por email autorizado).

## 💻 Instalación y Uso Local

1. Clonar el repositorio:
   ```bash
   git clone [URL_DEL_REPO]

Instalar dependencias:

Bash
npm install
Configurar variables de entorno (.env.local):

Fragmento de código
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

Iniciar el servidor de desarrollo:

Bash
npm run dev


Diseñado y desarrollado por Cynthia Medina ♡