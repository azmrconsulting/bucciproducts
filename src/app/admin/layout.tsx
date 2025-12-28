'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/discounts', label: 'Discounts', icon: Tag },
  { href: '/admin/inventory', label: 'Inventory', icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading') {
      if (!session || (session.user as any)?.role !== 'ADMIN') {
        router.replace('/auth/login?callbackUrl=/admin');
      }
    }
  }, [session, status, router]);

  if (status === 'loading' || !session || (session.user as any)?.role !== 'ADMIN') {
    return (
      <div className="admin-wrapper" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="admin-loading">
          <div className="admin-loading-spinner" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="admin-sidebar-header">
          <Link href="/admin" className="admin-sidebar-logo">
            <Sparkles />
            <div className="admin-logo-text">
              <span className="admin-logo-brand">BUCCI</span>
              <span className="admin-logo-label">Admin</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">
            <span className="admin-nav-section-label">Management</span>
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon />
                  <span className="admin-nav-label">{item.label}</span>
                  {isActive && <ChevronRight className="admin-nav-indicator" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User & Exit */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {(session.user?.name?.[0] || session.user?.email?.[0] || 'A').toUpperCase()}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{session.user?.name || 'Admin'}</span>
              <span className="admin-user-email">{session.user?.email}</span>
            </div>
          </div>
          <Link href="/" className="admin-exit-btn">
            <LogOut />
            <span>Exit Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
