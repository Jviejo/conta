export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>

     

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Bienvenido al Sistema de Contabilidad
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Selecciona una opción del menú lateral para comenzar a gestionar tu contabilidad.
        </p>
      </div>
    </div>
  );
}