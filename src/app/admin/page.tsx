import { prisma } from '@/lib/prisma';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

async function getDashboardStats() {
  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    recentOrders,
    lowStockProducts,
    ordersByStatus,
  ] = await Promise.all([
    // Total orders
    prisma.order.count(),

    // Total revenue (sum of all completed orders)
    prisma.order.aggregate({
      where: {
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
      _sum: {
        totalCents: true,
      },
    }),

    // Total products
    prisma.product.count({
      where: { isActive: true },
    }),

    // Total users
    prisma.user.count(),

    // Recent orders (last 10)
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),

    // Low stock products
    prisma.inventory.findMany({
      where: {
        quantity: {
          lte: 10,
        },
      },
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
      },
      take: 5,
    }),

    // Orders by status
    prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    }),
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalCents || 0,
    totalProducts,
    totalUsers,
    recentOrders,
    lowStockProducts,
    ordersByStatus,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalOrders}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalProducts}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {stats.ordersByStatus.map((item) => (
            <div key={item.status} className="text-center">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">{item._count.status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentOrders.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No orders yet</p>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : order.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(order.totalCents)}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Low Stock Alert
              </h2>
              <Link href="/admin/inventory" className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.lowStockProducts.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">All products are well stocked</p>
            ) : (
              stats.lowStockProducts.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product?.name || 'Product'}
                        {item.variant && ` - ${item.variant.name}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        SKU: {item.variant?.sku || item.product?.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${item.quantity <= 5 ? 'text-red-600' : 'text-orange-600'}`}>
                        {item.quantity}
                      </p>
                      <p className="text-xs text-gray-500">in stock</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
