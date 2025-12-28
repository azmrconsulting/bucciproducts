'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

type DiscountCodeFormData = {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: string;
  minimumOrderCents: string;
  maxUses: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

export default function DiscountCodeForm({ discountCode }: { discountCode?: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<DiscountCodeFormData>({
    code: discountCode?.code || '',
    type: discountCode?.type || 'PERCENTAGE',
    value: discountCode?.value?.toString() || '',
    minimumOrderCents: discountCode?.minimumOrderCents ? (discountCode.minimumOrderCents / 100).toFixed(2) : '',
    maxUses: discountCode?.maxUses?.toString() || '',
    startsAt: discountCode?.startsAt ? new Date(discountCode.startsAt).toISOString().slice(0, 16) : '',
    expiresAt: discountCode?.expiresAt ? new Date(discountCode.expiresAt).toISOString().slice(0, 16) : '',
    isActive: discountCode?.isActive !== false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate code from uppercase input
    if (name === 'code') {
      setFormData((prev) => ({ ...prev, code: value.toUpperCase() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let discountValue = 0;
      if (formData.type === 'PERCENTAGE') {
        discountValue = parseFloat(formData.value);
        if (discountValue < 0 || discountValue > 100) {
          throw new Error('Percentage must be between 0 and 100');
        }
      } else if (formData.type === 'FIXED_AMOUNT') {
        discountValue = Math.round(parseFloat(formData.value) * 100);
      }

      const payload = {
        code: formData.code,
        type: formData.type,
        value: formData.type === 'FREE_SHIPPING' ? 0 : discountValue,
        minimumOrderCents: formData.minimumOrderCents
          ? Math.round(parseFloat(formData.minimumOrderCents) * 100)
          : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        isActive: formData.isActive,
      };

      const url = discountCode
        ? `/api/admin/discounts/${discountCode.id}`
        : '/api/admin/discounts';
      const method = discountCode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save discount code');
      }

      router.push('/admin/discounts');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!discountCode) return;

    if (!confirm('Are you sure you want to delete this discount code? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/discounts/${discountCode.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete discount code');
      }

      router.push('/admin/discounts');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Code *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="SUMMER2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">Code will be automatically converted to uppercase</p>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>

            {formData.type !== 'FREE_SHIPPING' && (
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount ($)'} *
                </label>
                <input
                  type="number"
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  required
                  step={formData.type === 'FIXED_AMOUNT' ? '0.01' : '1'}
                  min="0"
                  max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Restrictions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minimumOrderCents" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Value ($)
              </label>
              <input
                type="number"
                id="minimumOrderCents"
                name="minimumOrderCents"
                value={formData.minimumOrderCents}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no minimum</p>
            </div>

            <div>
              <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Uses
              </label>
              <input
                type="number"
                id="maxUses"
                name="maxUses"
                value={formData.maxUses}
                onChange={handleChange}
                min="1"
                placeholder="Unlimited"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited uses</p>
            </div>

            <div>
              <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date/Time
              </label>
              <input
                type="datetime-local"
                id="startsAt"
                name="startsAt"
                value={formData.startsAt}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to start immediately</p>
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date/Time
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {discountCode && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete Code
          </button>
        )}
        <div className={`flex items-center gap-3 ${!discountCode ? 'w-full justify-end' : ''}`}>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Saving...' : discountCode ? 'Update Code' : 'Create Code'}
          </button>
        </div>
      </div>
    </form>
  );
}
