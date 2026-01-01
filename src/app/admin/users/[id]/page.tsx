import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import UserRoleUpdate from '@/components/admin/UserRoleUpdate';

export const dynamic = 'force-dynamic';

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      addresses: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Calculate total spent
  const totalSpent = await prisma.order.aggregate({
    where: {
      userId: id,
      status: {
        in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
      },
    },
    _sum: {
      totalCents: true,
    },
  });

  return {
    ...user,
    totalSpent: totalSpent._sum.totalCents || 0,
  };
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      year: 'numeric',
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray hover:text-ivory transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <div className="flex items-center gap-4">
          <div className="admin-avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
            {user.image ? (
              <img
                src={user.image}
                alt={user.firstName || ''}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            )}
          </div>
          <div>
            <h1 className="admin-page-title">
              {user.firstName} {user.lastName}
            </h1>
            <p className="admin-page-subtitle">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-grid-3 mb-6">
        <div className="admin-stat-small">
          <div className="admin-stat-small-header">
            <span className="admin-stat-small-label">Total Orders</span>
            <div className="admin-stat-small-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <ShoppingBag />
            </div>
          </div>
          <div className="admin-stat-small-value">{user._count.orders}</div>
        </div>

        <div className="admin-stat-small">
          <div className="admin-stat-small-header">
            <span className="admin-stat-small-label">Total Spent</span>
            <div className="admin-stat-small-icon" style={{ background: 'rgba(201, 169, 98, 0.15)', color: '#c9a962' }}>
              <DollarSign />
            </div>
          </div>
          <div className="admin-stat-small-value" style={{ color: '#c9a962' }}>{formatCurrency(user.totalSpent)}</div>
        </div>

        <div className="admin-stat-small">
          <div className="admin-stat-small-header">
            <span className="admin-stat-small-label">Member Since</span>
            <div className="admin-stat-small-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <Calendar />
            </div>
          </div>
          <div className="admin-stat-small-value">{formatShortDate(user.createdAt)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Recent Orders</h2>
            </div>
            <div>
              {user.orders.length === 0 ? (
                <p className="p-6 text-gray text-center">No orders yet</p>
              ) : (
                user.orders.map((order) => (
                  <div key={order.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="admin-td-link font-medium"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs text-gray mt-1">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gold">{formatCurrency(order.totalCents)}</p>
                        <span className={`admin-badge ${getStatusBadge(order.status)} mt-1`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {user._count.orders > 10 && (
              <div className="p-4 border-t border-white/10 text-center">
                <p className="text-sm text-gray">
                  Showing 10 of {user._count.orders} orders
                </p>
              </div>
            )}
          </div>

          {/* Addresses */}
          {user.addresses.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Saved Addresses</h2>
              </div>
              <div className="admin-card-body space-y-4">
                {user.addresses.map((address) => (
                  <div key={address.id} className="p-4 border border-white/10 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-ivory">{address.firstName} {address.lastName}</h3>
                      <span className="admin-badge admin-badge-inactive">
                        {address.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray">
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Contact Information</h2>
            </div>
            <div className="admin-card-body space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray" />
                <div>
                  <p className="text-xs text-gray uppercase tracking-wider">Email</p>
                  <p className="text-sm text-ivory">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray" />
                  <div>
                    <p className="text-xs text-gray uppercase tracking-wider">Phone</p>
                    <p className="text-sm text-ivory">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray" />
                <div>
                  <p className="text-xs text-gray uppercase tracking-wider">Joined</p>
                  <p className="text-sm text-ivory">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Role Management */}
          <UserRoleUpdate user={user} />
        </div>
      </div>
    </div>
  );
}
