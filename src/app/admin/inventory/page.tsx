import { prisma } from '@/lib/prisma';
import { Search, AlertCircle } from 'lucide-react';
import InventoryUpdateForm from '@/components/admin/InventoryUpdateForm';

export const dynamic = 'force-dynamic';

async function getInventory(search?: string) {
  const where: any = {};

  if (search) {
    where.OR = [
      {
        product: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
      {
        variant: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  const inventory = await prisma.inventory.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          isActive: true,
        },
      },
      variant: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
    },
    orderBy: { quantity: 'asc' },
  });

  return inventory;
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const inventory = await getInventory(searchParams.search);

  const lowStockCount = inventory.filter((item) => item.quantity <= 10 && item.quantity > 0).length;
  const outOfStockCount = inventory.filter((item) => item.quantity === 0).length;

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventory Management</h1>
          <p className="admin-page-subtitle">{inventory.length} total items tracked</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-stat-small">
          <div className="admin-stat-small-header">
            <span className="admin-stat-small-label">Total Items</span>
          </div>
          <div className="admin-stat-small-value">{inventory.length}</div>
        </div>

        <div className="admin-stat-small">
          <div className="admin-stat-small-header">
            <span className="admin-stat-small-label">Low Stock</span>
            <div className="admin-stat-small-icon orange">
              <AlertCircle />
            </div>
          </div>
          <div className="admin-stat-small-value orange">{lowStockCount}</div>
        </div>

        <div className="admin-stat-small">
          <div className="admin-stat-small-header">
            <span className="admin-stat-small-label">Out of Stock</span>
            <div className="admin-stat-small-icon red">
              <AlertCircle />
            </div>
          </div>
          <div className="admin-stat-small-value red">{outOfStockCount}</div>
        </div>
      </div>

      {/* Search */}
      <div className="admin-search">
        <Search />
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          defaultValue={searchParams.search}
        />
      </div>

      {/* Inventory Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Total</th>
                <th>Backorder</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-table-empty">
                    No inventory found
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const total = item.quantity + item.reservedQuantity;
                  const stockStatus = item.quantity === 0 ? 'out' : item.quantity <= 10 ? 'low' : 'instock';

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-td-primary">
                          {item.product?.name || 'Unknown'}
                          {item.variant && (
                            <span style={{ color: '#888' }}> - {item.variant.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="admin-td-secondary">
                        {item.variant?.sku || item.product?.sku || 'N/A'}
                      </td>
                      <td>
                        <span className={`admin-td-${stockStatus === 'out' ? 'gold' : stockStatus === 'low' ? 'gold' : 'primary'}`} style={{ color: stockStatus === 'out' ? '#ef4444' : stockStatus === 'low' ? '#f97316' : '#22c55e' }}>
                          {item.quantity}
                        </span>
                      </td>
                      <td>{item.reservedQuantity}</td>
                      <td className="admin-td-primary">{total}</td>
                      <td>
                        <span className={`admin-badge ${item.allowBackorder ? 'admin-badge-confirmed' : 'admin-badge-inactive'}`}>
                          {item.allowBackorder ? 'Allowed' : 'Not Allowed'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge-${stockStatus}`}>
                          {stockStatus === 'out' ? 'Out of Stock' :
                           stockStatus === 'low' ? 'Low Stock' :
                           'In Stock'}
                        </span>
                      </td>
                      <td>
                        <InventoryUpdateForm inventory={item} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
