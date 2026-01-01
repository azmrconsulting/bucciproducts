import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';

async function getOrder(orderId: string, userId: string, userEmail?: string | null) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [
        { userId },
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      },
      discountCode: {
        select: {
          code: true,
        },
      },
    },
  });
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user?.id) {
    return null;
  }

  const order = await getOrder(id, session.user.id, session.user.email);

  if (!order) {
    notFound();
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5" />;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <Package className="w-5 h-5" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
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

  const shippingAddress = order.shippingAddress as {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-gray hover:text-gold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Orders</span>
      </Link>

      {/* Order Header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl text-ivory mb-1">
              Order {order.orderNumber}
            </h2>
            <p className="text-gray text-sm">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded border text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            {order.status}
          </span>
        </div>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <div className="p-4 bg-white/[0.02] rounded-lg mb-6">
            <p className="text-xs text-gray uppercase tracking-wider mb-1">Tracking Number</p>
            {order.trackingUrl ? (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light font-mono text-sm"
              >
                {order.trackingNumber}
              </a>
            ) : (
              <p className="text-ivory font-mono text-sm">{order.trackingNumber}</p>
            )}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="card p-6">
        <h3 className="font-display text-lg text-ivory mb-4">Items Ordered</h3>
        <div className="space-y-4">
          {order.items.map((item) => {
            const imageUrl = item.product?.images?.[0]?.url;
            const hasValidImage = imageUrl && imageUrl.startsWith('http');

            return (
              <div key={item.id} className="flex gap-4 p-4 bg-white/[0.02] rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-charcoal to-black rounded flex items-center justify-center flex-shrink-0">
                  {hasValidImage ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center scale-50">
                      <div className="w-[20px] h-[8px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px]" />
                      <div className="w-[32px] h-[50px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  {item.product?.slug ? (
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-ivory hover:text-gold transition-colors font-medium"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="text-ivory font-medium">{item.name}</p>
                  )}
                  <p className="text-gray text-sm">Qty: {item.quantity}</p>
                  <p className="text-gray text-sm">
                    {formatCurrency(item.unitPriceCents)} each
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gold font-display">
                    {formatCurrency(item.totalCents)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Totals */}
        <div className="card p-6">
          <h3 className="font-display text-lg text-ivory mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotalCents)}</span>
            </div>
            {order.discountCode && order.discountCents > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount ({order.discountCode.code})</span>
                <span>-{formatCurrency(order.discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray">
              <span>Shipping</span>
              <span>{order.shippingCents === 0 ? 'Free' : formatCurrency(order.shippingCents)}</span>
            </div>
            {order.taxCents > 0 && (
              <div className="flex justify-between text-gray">
                <span>Tax</span>
                <span>{formatCurrency(order.taxCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-ivory font-display text-lg pt-3 border-t border-white/10">
              <span>Total</span>
              <span className="text-gold">{formatCurrency(order.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="card p-6">
          <h3 className="font-display text-lg text-ivory mb-4">Shipping Address</h3>
          {shippingAddress?.line1 ? (
            <div className="text-gray space-y-1">
              {shippingAddress.name && <p className="text-ivory">{shippingAddress.name}</p>}
              <p>{shippingAddress.line1}</p>
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              <p>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </p>
              <p>{shippingAddress.country}</p>
            </div>
          ) : (
            <p className="text-gray">No shipping address on file</p>
          )}
        </div>
      </div>

      {/* Need Help */}
      <div className="card p-6 text-center">
        <p className="text-gray text-sm">
          Need help with your order?{' '}
          <Link href="/contact" className="text-gold hover:text-gold-light">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
