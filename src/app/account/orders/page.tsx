import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

async function getUserOrders(userId: string, userEmail?: string | null) {
  // Find orders by userId OR by email (for orders placed before account creation
  // or placed without being logged in)
  return prisma.order.findMany({
    where: {
      OR: [
        { userId },
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const orders = await getUserOrders(session.user.id, session.user.email);

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
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
      CONFIRMED: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      PROCESSING: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      SHIPPED: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      DELIVERED: 'text-green-500 bg-green-500/10 border-green-500/20',
      CANCELLED: 'text-red-500 bg-red-500/10 border-red-500/20',
      REFUNDED: 'text-gray bg-gray/10 border-gray/20',
    };
    return colors[status] || 'text-gray bg-gray/10 border-gray/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-ivory">Order History</h2>
        <p className="text-gray text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray/30 mx-auto mb-6" />
          <h3 className="font-display text-lg text-ivory mb-2">No orders yet</h3>
          <p className="text-gray mb-6">When you place an order, it will appear here.</p>
          <Link href="/products" className="btn btn-primary">
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              {/* Order Header */}
              <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <div>
                    <p className="text-xs text-gray uppercase tracking-wider mb-1">Order Number</p>
                    <p className="text-ivory font-medium">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray uppercase tracking-wider mb-1">Date</p>
                    <p className="text-ivory">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray uppercase tracking-wider mb-1">Total</p>
                    <p className="text-gold font-display">{formatCurrency(order.totalCents)}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded border text-xs font-medium uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Items Preview */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  {order.items.slice(0, 4).map((item) => {
                    const imageUrl = item.product?.images?.[0]?.url;
                    const hasValidImage = imageUrl && imageUrl.startsWith('http');

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 bg-white/[0.02] rounded-lg"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-charcoal to-black rounded flex items-center justify-center">
                          {hasValidImage ? (
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            /* Bottle placeholder */
                            <div className="flex flex-col items-center scale-50">
                              <div className="w-[20px] h-[8px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px]" />
                              <div className="w-[32px] h-[50px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-ivory text-sm line-clamp-1">{item.name}</p>
                          <p className="text-gray text-xs">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                  {order.items.length > 4 && (
                    <div className="flex items-center justify-center w-12 h-12 bg-white/[0.02] rounded-lg">
                      <span className="text-gray text-sm">+{order.items.length - 4}</span>
                    </div>
                  )}
                </div>

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="mb-4 p-3 bg-white/[0.02] rounded-lg">
                    <p className="text-xs text-gray uppercase tracking-wider mb-1">Tracking Number</p>
                    <p className="text-ivory font-mono text-sm">{order.trackingNumber}</p>
                  </div>
                )}

                {/* View Details Link */}
                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-2 text-gold hover:text-gold-light text-sm font-display tracking-wider uppercase transition-colors"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
