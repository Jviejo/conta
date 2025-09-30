import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Contabilidad Moderna
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12">
            Gestiona tu contabilidad de forma simple, eficiente y profesional
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Control Total
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitoriza todas tus cuentas, asientos y apuntes en tiempo real
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Rápido y Eficiente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Registra operaciones contables en segundos con nuestro sistema intuitivo
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Plan General Contable
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                100% compatible con el PGC español y normativa vigente
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg px-12 py-4 rounded-lg shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Acceder al Dashboard
          </Link>

          <div className="mt-16 text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              Sistema de contabilidad profesional • IVA • Facturas • Asientos contables
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
