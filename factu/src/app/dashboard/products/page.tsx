'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    codigo_sku: '',
    nombre: '',
    descripcion_larga: '',
    precio_venta_base: 0,
    tipo_iva_defecto: 21,
    unidad_medida: 'UNIDAD'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        codigo_sku: '',
        nombre: '',
        descripcion_larga: '',
        precio_venta_base: 0,
        tipo_iva_defecto: 21,
        unidad_medida: 'UNIDAD'
      });
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      codigo_sku: product.codigo_sku,
      nombre: product.nombre,
      descripcion_larga: product.descripcion_larga,
      precio_venta_base: product.precio_venta_base,
      tipo_iva_defecto: product.tipo_iva_defecto,
      unidad_medida: product.unidad_medida
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (isLoading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">← Volver al Dashboard</Link>
            <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Producto'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Código SKU</label>
                  <input
                    type="text"
                    value={formData.codigo_sku}
                    onChange={(e) => setFormData({ ...formData, codigo_sku: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={formData.descripcion_larga}
                    onChange={(e) => setFormData({ ...formData, descripcion_larga: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio Base (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_venta_base}
                    onChange={(e) => setFormData({ ...formData, precio_venta_base: parseFloat(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IVA Defecto (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.tipo_iva_defecto}
                    onChange={(e) => setFormData({ ...formData, tipo_iva_defecto: parseFloat(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unidad de Medida</label>
                  <select
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="UNIDAD">Unidad</option>
                    <option value="HORA">Hora</option>
                    <option value="METRO">Metro</option>
                    <option value="KG">Kilogramo</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
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
                <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Precio</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">IVA</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Unidad</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id?.toString()} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{product.codigo_sku}</td>
                  <td className="px-6 py-4">{product.nombre}</td>
                  <td className="px-6 py-4">{product.precio_venta_base.toFixed(2)} €</td>
                  <td className="px-6 py-4">{product.tipo_iva_defecto}%</td>
                  <td className="px-6 py-4">{product.unidad_medida}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product._id?.toString() || '')}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay productos. Crea el primero.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
