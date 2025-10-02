'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Package,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react';

const menuItems = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Proveedores', href: '/proveedores', icon: Users },
  { name: 'Facturas Emitidas', href: '/facturas-emitidas', icon: FileText },
  { name: 'Facturas Recibidas', href: '/facturas-recibidas', icon: FileText },
  { name: 'Ingresos', href: '/ingresos', icon: TrendingUp },
  { name: 'Gastos', href: '/gastos', icon: TrendingDown },
  { name: 'Bienes de Inversión', href: '/bienes-inversion', icon: Package },
  { name: 'Modelos AEAT', href: '/modelos-aeat', icon: Calendar },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
];

export default function Sidenav() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-20 items-center justify-center border-b border-gray-800">
        <h1 className="text-2xl font-bold">Autónomos</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-800 p-4">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
