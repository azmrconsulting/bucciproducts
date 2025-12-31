'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

type ProductFormData = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  cost: string;
  category: string;
  tags: string;
  featured: boolean;
  active: boolean;
  weight: string;
  inventory?: {
    available: string;
    reserved: string;
    allowBackorder: boolean;
  };
};

const CATEGORIES = [
  'Shampoo',
  'Conditioner',
  'Treatment',
  'Styling',
  'Tools',
  'Gift Sets',
  'Other',
];

export default function ProductForm({ product }: { product?: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ProductFormData>({
    sku: product?.sku || '',
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.priceCents ? (product.priceCents / 100).toFixed(2) : '',
    compareAtPrice: product?.compareAtPriceCents ? (product.compareAtPriceCents / 100).toFixed(2) : '',
    cost: product?.costCents ? (product.costCents / 100).toFixed(2) : '',
    category: product?.category || '',
    tags: product?.tags?.join(', ') || '',
    featured: product?.isFeatured || false,
    active: product?.isActive !== false,
    weight: product?.weightGrams ? (product.weightGrams / 28.3495).toFixed(2) : '',
    inventory: {
      available: product?.inventory?.quantity?.toString() || '0',
      reserved: product?.inventory?.reservedQuantity?.toString() || '0',
      allowBackorder: product?.inventory?.allowBackorder || false,
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith('inventory.')) {
      const inventoryField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        inventory: {
          ...prev.inventory!,
          [inventoryField]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Auto-generate slug from name
    if (name === 'name' && !product) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        sku: formData.sku,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        priceCents: Math.round(parseFloat(formData.price) * 100),
        compareAtPriceCents: formData.compareAtPrice
          ? Math.round(parseFloat(formData.compareAtPrice) * 100)
          : null,
        costCents: formData.cost ? Math.round(parseFloat(formData.cost) * 100) : null,
        category: formData.category || null,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
        isFeatured: formData.featured,
        isActive: formData.active,
        weightGrams: formData.weight ? Math.round(parseFloat(formData.weight) * 28.3495) : null,
        inventory: {
          quantity: parseInt(formData.inventory?.available || '0'),
          reservedQuantity: parseInt(formData.inventory?.reserved || '0'),
          allowBackorder: formData.inventory?.allowBackorder || false,
        },
      };

      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save product');
      }

      const savedProduct = await response.json();
      router.push(`/admin/products`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-body space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-ivory mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="admin-form-label">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="admin-form-input"
                />
              </div>

              <div>
                <label htmlFor="sku" className="admin-form-label">
                  SKU *
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  className="admin-form-input"
                />
              </div>

              <div>
                <label htmlFor="slug" className="admin-form-label">
                  URL Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="admin-form-input"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="admin-form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="admin-form-input resize-y"
                />
              </div>

              <div>
                <label htmlFor="category" className="admin-form-label">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="admin-form-select"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="admin-form-label">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Comma-separated tags"
                  className="admin-form-input"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h2 className="text-lg font-semibold text-ivory mb-4">Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="admin-form-label">
                  Price * ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="admin-form-input"
                />
              </div>

              <div>
                <label htmlFor="compareAtPrice" className="admin-form-label">
                  Compare at Price ($)
                </label>
                <input
                  type="number"
                  id="compareAtPrice"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="admin-form-input"
                />
              </div>

              <div>
                <label htmlFor="cost" className="admin-form-label">
                  Cost ($)
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="admin-form-input"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h2 className="text-lg font-semibold text-ivory mb-4">Inventory</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="inventory.available" className="admin-form-label">
                  Available Stock
                </label>
                <input
                  type="number"
                  id="inventory.available"
                  name="inventory.available"
                  value={formData.inventory?.available}
                  onChange={handleChange}
                  min="0"
                  className="admin-form-input"
                />
              </div>

              <div>
                <label htmlFor="inventory.reserved" className="admin-form-label">
                  Reserved Stock
                </label>
                <input
                  type="number"
                  id="inventory.reserved"
                  name="inventory.reserved"
                  value={formData.inventory?.reserved}
                  onChange={handleChange}
                  min="0"
                  className="admin-form-input"
                />
              </div>

              <div>
                <label htmlFor="weight" className="admin-form-label">
                  Weight (oz)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="admin-form-input"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="inventory.allowBackorder"
                  checked={formData.inventory?.allowBackorder}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gold/30 bg-black text-gold focus:ring-gold focus:ring-offset-0"
                />
                <span className="text-sm text-ivory">Allow backorders</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h2 className="text-lg font-semibold text-ivory mb-4">Status</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gold/30 bg-black text-gold focus:ring-gold focus:ring-offset-0"
                />
                <span className="text-sm text-ivory">Active (visible to customers)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gold/30 bg-black text-gold focus:ring-gold focus:ring-offset-0"
                />
                <span className="text-sm text-ivory">Featured product</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {product && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="admin-btn admin-btn-danger"
          >
            <Trash2 className="w-4 h-4" />
            Delete Product
          </button>
        )}
        <div className={`flex items-center gap-3 ${!product ? 'w-full justify-end' : ''}`}>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="admin-btn admin-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="admin-btn admin-btn-primary"
          >
            {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </form>
  );
}
