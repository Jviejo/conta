# Sistema de Facturación

Sistema completo de gestión de facturación con generación automática de XML Facturae y Verifactu.

## Características

- ✅ CRUD completo de Productos, Clientes, Formas de Pago y Empresa
- ✅ Creación de facturas con líneas de detalle
- ✅ Cálculo automático de impuestos (IVA)
- ✅ Generación automática de XML Facturae 3.2.1
- ✅ Generación automática de XML Verifactu (AEAT)
- ✅ Almacenamiento en MongoDB
- ✅ Interfaz moderna con Next.js 15 y Tailwind CSS

## Tecnologías

- **Frontend/Backend**: Next.js 15 (React 19)
- **Base de Datos**: MongoDB (sin Mongoose)
- **Estilos**: Tailwind CSS 4
- **Lenguaje**: TypeScript
- **Generación XML**: xml-js

## Instalación

1. **Instalar dependencias**

```bash
npm install
```

2. **Configurar variables de entorno**

Crear archivo `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017
```

3. **Iniciar MongoDB**

Asegúrate de tener MongoDB ejecutándose:

```bash
# macOS (con Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

4. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

5. **Abrir en el navegador**

```
http://localhost:3000
```

## Estructura del Proyecto

```
factu/
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   ├── company/
│   │   │   ├── customers/
│   │   │   ├── invoices/
│   │   │   ├── payment-methods/
│   │   │   └── products/
│   │   ├── dashboard/        # Páginas del dashboard
│   │   │   ├── company/
│   │   │   ├── customers/
│   │   │   ├── invoices/
│   │   │   ├── payment-methods/
│   │   │   ├── products/
│   │   │   └── page.tsx      # Dashboard principal
│   │   ├── layout.tsx
│   │   └── page.tsx          # Página principal
│   ├── lib/
│   │   ├── mongodb.ts        # Conexión a MongoDB
│   │   └── xml-generators.ts # Generadores de XML
│   └── types/
│       └── index.ts          # TypeScript types
└── package.json
```

## Uso

### 1. Configurar la Empresa

Configura los datos de tu empresa en **Empresa**. Esto es necesario para generar las facturas.

### 2. Crear Productos

Añade productos o servicios en **Productos**.

### 3. Añadir Clientes

Registra clientes con su información fiscal en **Clientes**.

### 4. Configurar Formas de Pago

Define formas de pago (transferencia, efectivo, etc.) en **Formas de Pago**.

### 5. Crear Facturas

En **Facturas**:
1. Haz clic en "Nueva Factura"
2. Selecciona cliente y forma de pago
3. Añade líneas de factura
4. Los totales se calculan automáticamente
5. Al crear, se generan automáticamente los XMLs Facturae y Verifactu

### 6. Descargar XMLs

Desde la lista de facturas puedes ver y descargar los XMLs generados.

## Modelos de Datos

Ver documentación completa en [FACTU.md](FACTU.md)

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Producción
npm start        # Iniciar servidor
npm run lint     # Linter
```

## Base de Datos

MongoDB con colecciones: `products`, `customers`, `payment_methods`, `company`, `invoices`

## Cumplimiento Legal

- **Facturae**: Formato XML estándar para facturación electrónica en España (v3.2.1)
- **Verifactu**: Sistema de verificación de software de facturación de la AEAT

⚠️ **Nota**: Los certificados digitales deben configurarse según requisitos legales.
