'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Inventory = {
  id: string;
  quantity: number;
  reservedQuantity: number;
  allowBackorder: boolean;
};

export default function InventoryUpdateForm({ inventory }: { inventory: Inventory }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [available, setAvailable] = useState(inventory.quantity);
  const [reserved, setReserved] = useState(inventory.reservedQuantity);
  const [allowBackorder, setAllowBackorder] = useState(inventory.allowBackorder);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/inventory/${inventory.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: available,
          reservedQuantity: reserved,
          allowBackorder,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update inventory');
      }

      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAvailable(inventory.quantity);
    setReserved(inventory.reservedQuantity);
    setAllowBackorder(inventory.allowBackorder);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-blue-600 hover:text-blue-700 font-medium"
      >
        Update
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Inventory</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Stock
            </label>
            <input
              type="number"
              value={available}
              onChange={(e) => setAvailable(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reserved Stock
            </label>
            <input
              type="number"
              value={reserved}
              onChange={(e) => setReserved(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowBackorder}
                onChange={(e) => setAllowBackorder(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Allow Backorders</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
