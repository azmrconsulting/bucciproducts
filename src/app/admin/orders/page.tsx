import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getOrders(status?: string, search?: string) {
  const where: any = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { user: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      }},
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const orders = await getOrders(searchParams.status, searchParams.search);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'admin-badge-pending',
      CONFIRMED: 'admin-badge-confirmed',
      PROCESSING: 'admin-badge-processing',
      SHIPPED: 'admin-badge-shipped',
      DELIVERED: 'admin-badge-delivered',
      CANCELLED: 'admin-badge-cancelled',
      REFUNDED: 'admin-badge-refunded',
    };
    return badges[status] || 'admin-badge-inactive';
  };

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      {/* Search */}
      <div className="admin-search">
        <Search />
        <input
          type="text"
          placeholder="Search by order number, email, or customer name..."
          defaultValue={searchParams.search}
        />
      </div>

      {/* Filters */}
      <div className="admin-filters">
        {statuses.map((status) => (
          <Link
            key={status}
            href={`/admin/orders${status !== 'ALL' ? `?status=${status}` : ''}`}
            className={`admin-filter-btn ${(searchParams.status || 'ALL') === status ? 'active' : ''}`}
          >
            {status}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-table-empty">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="admin-td-primary">{order.orderNumber}</div>
                      {order.trackingNumber && (
                        <div className="admin-td-secondary">Tracking: {order.trackingNumber}</div>
                      )}
                    </td>
                    <td>
                      <div className="admin-td-primary">
                        {order.user
                          ? `${order.user.firstName} ${order.user.lastName}`
                          : 'Guest'}
                      </div>
                      <div className="admin-td-secondary">{order.email}</div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order._count.items} {order._count.items === 1 ? 'item' : 'items'}</td>
                    <td className="admin-td-gold">{formatCurrency(order.totalCents)}</td>
                    <td>
                      <span className={`admin-badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="admin-td-link">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
