import { prisma } from '@/lib/prisma';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertTriangle, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
    prisma.order.count(),
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
    prisma.product.count({
      where: { isActive: true },
    }),
    prisma.user.count(),
    prisma.order.findMany({
      take: 5,
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
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, { bg: string; text: string; dot: string }> = {
      PENDING: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', dot: '#eab308' },
      CONFIRMED: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', dot: '#3b82f6' },
      PROCESSING: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', dot: '#a855f7' },
      SHIPPED: { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', dot: '#6366f1' },
      DELIVERED: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', dot: '#22c55e' },
      CANCELLED: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', dot: '#ef4444' },
      REFUNDED: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', dot: '#6b7280' },
    };
    return styles[status] || styles.PENDING;
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      trend: '+8.2%',
      trendUp: true,
    },
    {
      label: 'Active Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      trend: '+3',
      trendUp: true,
    },
    {
      label: 'Total Customers',
      value: stats.totalUsers.toString(),
      icon: Users,
      trend: '+15.3%',
      trendUp: true,
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-dashboard-header">
        <div>
          <h1 className="admin-header-title">Dashboard</h1>
          <p className="admin-header-subtitle">Welcome back. Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div className="admin-header-date">
          <Clock />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="admin-stats-grid">
        {statCards.map((card, index) => (
          <div key={card.label} className="admin-stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="admin-stat-card-inner">
              <div className="admin-stat-header">
                <span className="admin-stat-label">{card.label}</span>
                <div className="admin-stat-icon-wrapper">
                  <card.icon />
                </div>
              </div>
              <div className="admin-stat-value">{card.value}</div>
              <div className={`admin-stat-trend ${card.trendUp ? 'admin-trend-up' : 'admin-trend-down'}`}>
                <TrendingUp />
                <span>{card.trend} from last month</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Orders by Status */}
      {stats.ordersByStatus.length > 0 && (
        <section className="admin-status-section">
          <h2 className="admin-section-title">Orders by Status</h2>
          <div className="admin-status-grid">
            {stats.ordersByStatus.map((item) => {
              const styles = getStatusStyles(item.status);
              return (
                <div key={item.status} className="admin-status-card" style={{ background: styles.bg }}>
                  <div className="admin-status-dot" style={{ background: styles.dot }} />
                  <span className="admin-status-name" style={{ color: styles.text }}>{item.status}</span>
                  <span className="admin-status-count">{item._count.status}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Two Column Layout */}
      <div className="admin-two-column">
        {/* Recent Orders */}
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Recent Orders</h2>
            <Link href="/admin/orders" className="admin-panel-link">
              View All
              <ArrowUpRight />
            </Link>
          </div>
          <div className="admin-panel-content">
            {stats.recentOrders.length === 0 ? (
              <div className="admin-empty-state">
                <ShoppingCart />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="admin-orders-list">
                {stats.recentOrders.map((order) => {
                  const styles = getStatusStyles(order.status);
                  return (
                    <Link href={`/admin/orders/${order.id}`} key={order.id} className="admin-order-item">
                      <div className="admin-order-info">
                        <span className="admin-order-number">{order.orderNumber}</span>
                        <span className="admin-order-customer">
                          {order.user ? `${order.user.firstName} ${order.user.lastName}` : order.email}
                        </span>
                        <span className="admin-order-date">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="admin-order-meta">
                        <span className="admin-order-amount">{formatCurrency(order.totalCents)}</span>
                        <span className="admin-order-status" style={{ background: styles.bg, color: styles.text }}>
                          {order.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Low Stock Alert */}
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">
              <AlertTriangle className="alert-icon" />
              Low Stock Alert
            </h2>
            <Link href="/admin/inventory" className="admin-panel-link">
              View All
              <ArrowUpRight />
            </Link>
          </div>
          <div className="admin-panel-content">
            {stats.lowStockProducts.length === 0 ? (
              <div className="admin-empty-state success">
                <Package />
                <p>All products are well stocked</p>
              </div>
            ) : (
              <div className="admin-stock-list">
                {stats.lowStockProducts.map((item) => (
                  <div key={item.id} className="admin-stock-item">
                    <div className="admin-stock-info">
                      <span className="admin-stock-name">
                        {item.product?.name || 'Product'}
                        {item.variant && <span className="admin-stock-variant"> - {item.variant.name}</span>}
                      </span>
                      <span className="admin-stock-sku">SKU: {item.variant?.sku || item.product?.sku}</span>
                    </div>
                    <div className={`admin-stock-quantity ${item.quantity <= 5 ? 'critical' : 'warning'}`}>
                      <span className="admin-quantity-value">{item.quantity}</span>
                      <span className="admin-quantity-label">in stock</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
