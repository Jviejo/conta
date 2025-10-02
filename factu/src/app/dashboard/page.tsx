'use client';

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Sistema de Facturación</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Company */}
          <Link href="/dashboard/company">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-blue-600 text-3xl mb-4">🏢</div>
              <h2 className="text-xl font-semibold mb-2">Empresa</h2>
              <p className="text-gray-600">Configurar datos de la empresa emisora</p>
            </div>
          </Link>

          {/* Products */}
          <Link href="/dashboard/products">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-green-600 text-3xl mb-4">📦</div>
              <h2 className="text-xl font-semibold mb-2">Productos</h2>
              <p className="text-gray-600">Gestionar catálogo de productos y servicios</p>
            </div>
          </Link>

          {/* Customers */}
          <Link href="/dashboard/customers">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-purple-600 text-3xl mb-4">👥</div>
              <h2 className="text-xl font-semibold mb-2">Clientes</h2>
              <p className="text-gray-600">Administrar base de datos de clientes</p>
            </div>
          </Link>

          {/* Payment Methods */}
          <Link href="/dashboard/payment-methods">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-yellow-600 text-3xl mb-4">💳</div>
              <h2 className="text-xl font-semibold mb-2">Formas de Pago</h2>
              <p className="text-gray-600">Configurar métodos de pago disponibles</p>
            </div>
          </Link>

          {/* Invoices */}
          <Link href="/dashboard/invoices">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-red-600 text-3xl mb-4">📄</div>
              <h2 className="text-xl font-semibold mb-2">Facturas</h2>
              <p className="text-gray-600">Crear y gestionar facturas</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4">Características</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Gestión completa de productos, clientes y formas de pago</li>
            <li>✅ Creación automática de facturas con cálculo de impuestos</li>
            <li>✅ Generación automática de XML Facturae (formato estándar español)</li>
            <li>✅ Generación automática de XML Verifactu (sistema AEAT)</li>
            <li>✅ Almacenamiento en MongoDB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
