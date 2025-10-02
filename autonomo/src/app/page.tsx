import {
  AlertCircle,
  CheckCircle,
  Calendar,
  TrendingUp,
  FileText,
  Bell
} from 'lucide-react';

export default function Home() {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const mensajes = [
    {
      tipo: 'importante',
      titulo: 'Recordatorio: Modelo 303 - IVA Trimestral',
      descripcion: 'El plazo para presentar el modelo 303 del trimestre finaliza el día 20 de este mes.',
      fecha: '2025-10-02',
      icon: AlertCircle,
      color: 'bg-red-50 border-red-200 text-red-800'
    },
    {
      tipo: 'recordatorio',
      titulo: 'Modelo 130 - IRPF Pago Fraccionado',
      descripcion: 'Próximamente vence el plazo para la presentación del modelo 130. Recuerda preparar tu documentación.',
      fecha: '2025-10-05',
      icon: Calendar,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    {
      tipo: 'informacion',
      titulo: 'Resumen de Facturación',
      descripcion: 'Revisa tu resumen de facturación mensual y asegúrate de que todas las facturas estén registradas.',
      fecha: '2025-10-01',
      icon: TrendingUp,
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      tipo: 'completado',
      titulo: 'Facturas Emitidas Actualizadas',
      descripcion: 'Se han registrado correctamente todas las facturas emitidas del mes anterior.',
      fecha: '2025-09-30',
      icon: CheckCircle,
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      tipo: 'informacion',
      titulo: 'Libro de Gastos',
      descripcion: 'No olvides mantener actualizado tu libro de gastos para una correcta deducción del IVA.',
      fecha: '2025-10-01',
      icon: FileText,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    }
  ];

  const proximosVencimientos = [
    { modelo: '303', concepto: 'IVA Trimestral', fecha: '20 de Octubre', dias: 18 },
    { modelo: '130', concepto: 'IRPF Pago Fraccionado', fecha: '20 de Octubre', dias: 18 },
    { modelo: '111', concepto: 'Retenciones Trabajo', fecha: '20 de Octubre', dias: 18 },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido a tu Panel de Gestión
          </h1>
          <p className="mt-2 text-gray-600">
            {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Facturas Emitidas</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
              </div>
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Facturas Recibidas</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
              </div>
              <FileText className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modelos Pendientes</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{proximosVencimientos.length}</p>
              </div>
              <Calendar className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Calendar className="h-6 w-6 text-orange-500" />
            Próximos Vencimientos AEAT
          </h2>
          <div className="space-y-3">
            {proximosVencimientos.map((vencimiento, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    Modelo {vencimiento.modelo} - {vencimiento.concepto}
                  </p>
                  <p className="text-sm text-gray-600">Plazo: {vencimiento.fecha}</p>
                </div>
                <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-800">
                  {vencimiento.dias} días
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Bell className="h-6 w-6 text-blue-500" />
            Mensajes del Servicio
          </h2>
          <div className="space-y-4">
            {mensajes.map((mensaje, index) => {
              const Icon = mensaje.icon;
              return (
                <div
                  key={index}
                  className={`rounded-lg border-2 p-4 ${mensaje.color}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-6 w-6 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{mensaje.titulo}</h3>
                      <p className="mt-1 text-sm">{mensaje.descripcion}</p>
                      <p className="mt-2 text-xs opacity-75">
                        {new Date(mensaje.fecha).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
