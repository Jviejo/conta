import Link from "next/link";

export default function MaestrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Navegación horizontal */}
      <div className="bg-white dark:bg-gray-800 shadow mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-1 px-6" aria-label="Maestros">
            <Link
              href="/dashboard/maestros/niveles"
              className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-b-2 border-transparent hover:border-indigo-600 transition-colors"
            >
              📋 Niveles
            </Link>
            <Link
              href="/dashboard/maestros/cuentas"
              className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-b-2 border-transparent hover:border-indigo-600 transition-colors"
            >
              💼 Cuentas
            </Link>
            <Link
              href="/dashboard/maestros/ejercicios"
              className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-b-2 border-transparent hover:border-indigo-600 transition-colors"
            >
              📅 Ejercicios
            </Link>
            <Link
              href="/dashboard/maestros/conceptos"
              className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-b-2 border-transparent hover:border-indigo-600 transition-colors"
            >
              📝 Conceptos
            </Link>
            <Link
              href="/dashboard/maestros/subcontas"
              className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-b-2 border-transparent hover:border-indigo-600 transition-colors"
            >
              🔢 Subcontas
            </Link>
          </nav>
        </div>
      </div>

      {/* Contenido */}
      <div>{children}</div>
    </div>
  );
}
