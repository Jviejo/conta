import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contabilidad
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Panel de gestión
          </p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="mr-3">🏠</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/niveles"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="mr-3">📋</span>
                Niveles
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/cuentas"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="mr-3">💼</span>
                Cuentas
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/conceptos"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="mr-3">📝</span>
                Conceptos
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/asientos"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="mr-3">📊</span>
                Asientos
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="mr-3">←</span>
            Volver al inicio
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}