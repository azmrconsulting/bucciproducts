import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import OrderStatusUpdate from '@/components/admin/OrderStatusUpdate';

export const dynamic = 'force-dynamic';

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
          variant: {
            select: {
              name: true,
              sku: true,
            },
          },
          bundle: {
            select: {
              name: true,
            },
          },
        },
      },
      discountCode: true,
    },
  });

  if (!order) {
    notFound();
  }

  return order;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

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
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-gray hover:text-ivory transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="admin-page-title">Order {order.orderNumber}</h1>
            <p className="admin-page-subtitle">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`admin-badge ${getStatusBadge(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Order Items</h2>
            </div>
            <div className="admin-card-body">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-ivory">
                        {item.product?.name || item.bundle?.name}
                        {item.variant && ` - ${item.variant.name}`}
                      </h3>
                      <p className="text-sm text-gray">
                        SKU: {item.variant?.sku || item.product?.sku || 'N/A'}
                      </p>
                      <p className="text-sm text-gray mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray">{formatCurrency(item.unitPriceCents)} each</p>
                      <p className="font-semibold text-gold">{formatCurrency(item.totalCents)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray">Subtotal</span>
                  <span className="text-ivory">{formatCurrency(order.subtotalCents)}</span>
                </div>
                {order.discountCents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray">
                      Discount
                      {order.discountCode && ` (${order.discountCode.code})`}
                    </span>
                    <span className="text-green-400">-{formatCurrency(order.discountCents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray">Shipping</span>
                  <span className="text-ivory">{formatCurrency(order.shippingCents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray">Tax</span>
                  <span className="text-ivory">{formatCurrency(order.taxCents)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-white/10">
                  <span className="text-ivory">Total</span>
                  <span className="text-gold">{formatCurrency(order.totalCents)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Shipping Address</h2>
            </div>
            <div className="admin-card-body">
              <div className="text-sm">
                <p className="font-medium text-ivory">{(order.shippingAddress as any)?.name}</p>
                <p className="mt-2 text-gray">{(order.shippingAddress as any)?.line1}</p>
                {(order.shippingAddress as any)?.line2 && <p className="text-gray">{(order.shippingAddress as any)?.line2}</p>}
                <p className="text-gray">
                  {(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.state} {(order.shippingAddress as any)?.postal_code}
                </p>
                <p className="text-gray">{(order.shippingAddress as any)?.country}</p>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Billing Address</h2>
              </div>
              <div className="admin-card-body">
                <div className="text-sm">
                  <p className="font-medium text-ivory">{(order.billingAddress as any)?.name}</p>
                  <p className="mt-2 text-gray">{(order.billingAddress as any)?.line1}</p>
                  {(order.billingAddress as any)?.line2 && <p className="text-gray">{(order.billingAddress as any)?.line2}</p>}
                  <p className="text-gray">
                    {(order.billingAddress as any)?.city}, {(order.billingAddress as any)?.state} {(order.billingAddress as any)?.postal_code}
                  </p>
                  <p className="text-gray">{(order.billingAddress as any)?.country}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Customer</h2>
            </div>
            <div className="admin-card-body">
              {order.user ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray uppercase tracking-wider">Name</p>
                    <p className="text-sm font-medium text-ivory">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray uppercase tracking-wider">Email</p>
                    <p className="text-sm text-ivory">{order.user.email}</p>
                  </div>
                  {order.user.phone && (
                    <div>
                      <p className="text-xs text-gray uppercase tracking-wider">Phone</p>
                      <p className="text-sm text-ivory">{order.user.phone}</p>
                    </div>
                  )}
                  <Link
                    href={`/admin/users/${order.user.id}`}
                    className="admin-td-link inline-block mt-2"
                  >
                    View Customer Profile
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray uppercase tracking-wider">Guest Checkout</p>
                  <p className="text-sm text-ivory mt-1">{order.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Management */}
          <OrderStatusUpdate order={order} />

          {/* Payment Info */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Payment</h2>
            </div>
            <div className="admin-card-body">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray uppercase tracking-wider">Payment Method</p>
                  <p className="text-sm font-medium text-ivory">Stripe</p>
                </div>
                {order.stripePaymentIntentId && (
                  <div>
                    <p className="text-xs text-gray uppercase tracking-wider">Payment Intent ID</p>
                    <p className="text-xs text-ivory font-mono break-all">
                      {order.stripePaymentIntentId}
                    </p>
                  </div>
                )}
                {order.stripeChargeId && (
                  <div>
                    <p className="text-xs text-gray uppercase tracking-wider">Stripe Charge ID</p>
                    <p className="text-xs text-ivory font-mono break-all">
                      {order.stripeChargeId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
