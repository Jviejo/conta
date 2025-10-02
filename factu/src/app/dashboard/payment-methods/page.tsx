'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PaymentMethod } from '@/types';

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    requiere_iban: false,
    dias_vencimiento_defecto: 30
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      const data = await res.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMethod) {
        await fetch(`/api/payment-methods/${editingMethod._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      fetchPaymentMethods();
      setShowForm(false);
      setEditingMethod(null);
      setFormData({ nombre: '', requiere_iban: false, dias_vencimiento_defecto: 30 });
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      nombre: method.nombre,
      requiere_iban: method.requiere_iban,
      dias_vencimiento_defecto: method.dias_vencimiento_defecto
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta forma de pago?')) return;
    try {
      await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  if (isLoading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">← Volver al Dashboard</Link>
            <h1 className="text-3xl font-bold">Formas de Pago</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {showForm ? 'Cancelar' : '+ Nueva Forma de Pago'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingMethod ? 'Editar Forma de Pago' : 'Nueva Forma de Pago'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                  placeholder="Ej: Transferencia, Efectivo, Domiciliación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Días de Vencimiento</label>
                <input
                  type="number"
                  value={formData.dias_vencimiento_defecto}
                  onChange={(e) => setFormData({ ...formData, dias_vencimiento_defecto: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requiere_iban}
                  onChange={(e) => setFormData({ ...formData, requiere_iban: e.target.checked })}
                  className="mr-2"
                  id="requiere_iban"
                />
                <label htmlFor="requiere_iban" className="text-sm font-medium">Requiere IBAN</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                  {editingMethod ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMethod(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Días Vencimiento</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Requiere IBAN</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((method) => (
                <tr key={method._id?.toString()} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{method.nombre}</td>
                  <td className="px-6 py-4">{method.dias_vencimiento_defecto} días</td>
                  <td className="px-6 py-4">{method.requiere_iban ? 'Sí' : 'No'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(method)}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(method._id?.toString() || '')}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paymentMethods.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay formas de pago. Crea la primera.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
