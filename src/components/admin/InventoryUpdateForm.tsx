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
        className="text-gold hover:text-gold-light font-medium transition-colors"
      >
        Update
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="admin-card max-w-md w-full mx-4">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Update Inventory</h3>
        </div>
        <div className="admin-card-body space-y-4">
          <div>
            <label className="admin-form-label">
              Available Stock
            </label>
            <input
              type="number"
              value={available}
              onChange={(e) => setAvailable(parseInt(e.target.value) || 0)}
              min="0"
              className="admin-form-input"
            />
          </div>

          <div>
            <label className="admin-form-label">
              Reserved Stock
            </label>
            <input
              type="number"
              value={reserved}
              onChange={(e) => setReserved(parseInt(e.target.value) || 0)}
              min="0"
              className="admin-form-input"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowBackorder}
                onChange={(e) => setAllowBackorder(e.target.checked)}
                className="w-4 h-4 rounded border-gold/30 bg-black text-gold focus:ring-gold focus:ring-offset-0"
              />
              <span className="text-sm text-ivory">Allow Backorders</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 admin-btn admin-btn-primary"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 admin-btn admin-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
