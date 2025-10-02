import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-12">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900">
          Sistema de Facturación
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          Gestión completa de facturación con generación automática de Facturae y Verifactu
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl mb-2">📄</div>
            <h3 className="font-semibold text-lg mb-2">Facturae</h3>
            <p className="text-gray-600">Generación automática de XML en formato Facturae 3.2.1</p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold text-lg mb-2">Verifactu</h3>
            <p className="text-gray-600">Cumplimiento con el sistema Verifactu de la AEAT</p>
          </div>
          <div className="p-6 bg-purple-50 rounded-lg">
            <div className="text-3xl mb-2">💾</div>
            <h3 className="font-semibold text-lg mb-2">MongoDB</h3>
            <p className="text-gray-600">Base de datos NoSQL robusta y escalable</p>
          </div>
          <div className="p-6 bg-yellow-50 rounded-lg">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Next.js</h3>
            <p className="text-gray-600">Framework moderno con React y TypeScript</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg"
          >
            Acceder al Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
