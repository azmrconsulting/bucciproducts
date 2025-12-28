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
  params: { id: string };
}) {
  const order = await getOrder(params.id);

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product?.name || item.bundle?.name}
                        {item.variant && ` - ${item.variant.name}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        SKU: {item.variant?.sku || item.product?.sku || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatCurrency(item.unitPriceCents)} each</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(item.totalCents)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotalCents)}</span>
                </div>
                {order.discountCents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Discount
                      {order.discountCode && ` (${order.discountCode.code})`}
                    </span>
                    <span className="text-green-600">-{formatCurrency(order.discountCents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatCurrency(order.shippingCents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatCurrency(order.taxCents)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatCurrency(order.totalCents)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-900">
                <p className="font-medium">{(order.shippingAddress as any)?.name}</p>
                <p className="mt-2">{(order.shippingAddress as any)?.line1}</p>
                {(order.shippingAddress as any)?.line2 && <p>{(order.shippingAddress as any)?.line2}</p>}
                <p>
                  {(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.state} {(order.shippingAddress as any)?.postal_code}
                </p>
                <p>{(order.shippingAddress as any)?.country}</p>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Billing Address</h2>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-900">
                  <p className="font-medium">{(order.billingAddress as any)?.name}</p>
                  <p className="mt-2">{(order.billingAddress as any)?.line1}</p>
                  {(order.billingAddress as any)?.line2 && <p>{(order.billingAddress as any)?.line2}</p>}
                  <p>
                    {(order.billingAddress as any)?.city}, {(order.billingAddress as any)?.state} {(order.billingAddress as any)?.postal_code}
                  </p>
                  <p>{(order.billingAddress as any)?.country}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="p-6">
              {order.user ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{order.user.email}</p>
                  </div>
                  {order.user.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{order.user.phone}</p>
                    </div>
                  )}
                  <Link
                    href={`/admin/users/${order.user.id}`}
                    className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Customer Profile
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">Guest Checkout</p>
                  <p className="text-sm text-gray-900 mt-1">{order.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Management */}
          <OrderStatusUpdate order={order} />

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900">Stripe</p>
                </div>
                {order.stripePaymentIntentId && (
                  <div>
                    <p className="text-sm text-gray-500">Payment Intent ID</p>
                    <p className="text-xs text-gray-900 font-mono break-all">
                      {order.stripePaymentIntentId}
                    </p>
                  </div>
                )}
                {order.stripeChargeId && (
                  <div>
                    <p className="text-sm text-gray-500">Stripe Charge ID</p>
                    <p className="text-xs text-gray-900 font-mono break-all">
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
