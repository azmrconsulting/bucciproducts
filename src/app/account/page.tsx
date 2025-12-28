import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Package, MapPin, ArrowRight } from 'lucide-react';

async function getAccountData(userId: string) {
  const [user, recentOrders, addresses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalCents: true,
        createdAt: true,
      },
    }),
    prisma.address.findMany({
      where: { userId },
      take: 2,
    }),
  ]);

  return { user, recentOrders, addresses };
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const { user, recentOrders, addresses } = await getAccountData(session.user.id);

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
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'text-yellow-500 bg-yellow-500/10',
      CONFIRMED: 'text-blue-500 bg-blue-500/10',
      PROCESSING: 'text-purple-500 bg-purple-500/10',
      SHIPPED: 'text-indigo-500 bg-indigo-500/10',
      DELIVERED: 'text-green-500 bg-green-500/10',
      CANCELLED: 'text-red-500 bg-red-500/10',
      REFUNDED: 'text-gray bg-gray/10',
    };
    return colors[status] || 'text-gray bg-gray/10';
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="card p-6 sm:p-8">
        <h2 className="font-display text-lg text-ivory mb-6">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray uppercase tracking-wider mb-1">Name</p>
            <p className="text-ivory">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray uppercase tracking-wider mb-1">Email</p>
            <p className="text-ivory">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray uppercase tracking-wider mb-1">Phone</p>
            <p className="text-ivory">{user?.phone || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-gray uppercase tracking-wider mb-1">Member Since</p>
            <p className="text-ivory">{user?.createdAt ? formatDate(user.createdAt) : '-'}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10">
          <Link
            href="/account/settings"
            className="text-gold hover:text-gold-light text-sm font-display tracking-wider uppercase transition-colors inline-flex items-center gap-2"
          >
            Edit Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg text-ivory flex items-center gap-2">
            <Package className="w-5 h-5 text-gold" />
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-gold hover:text-gold-light text-xs font-display tracking-wider uppercase transition-colors"
          >
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray/30 mx-auto mb-4" />
            <p className="text-gray mb-4">No orders yet</p>
            <Link href="/products" className="btn btn-outline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-gold/20 rounded-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ivory font-medium">{order.orderNumber}</p>
                    <p className="text-gray text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold font-display">{formatCurrency(order.totalCents)}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Addresses */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg text-ivory flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold" />
            Saved Addresses
          </h2>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray/30 mx-auto mb-4" />
            <p className="text-gray">No saved addresses</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="p-4 bg-white/[0.02] border border-white/5 rounded-lg"
              >
                <p className="text-ivory font-medium mb-1">
                  {address.firstName} {address.lastName}
                </p>
                <p className="text-gray text-sm">{address.addressLine1}</p>
                {address.addressLine2 && (
                  <p className="text-gray text-sm">{address.addressLine2}</p>
                )}
                <p className="text-gray text-sm">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                {address.isDefault && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-gold/10 text-gold text-xs rounded uppercase tracking-wider">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
