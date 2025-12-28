'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { User, Package, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/account', label: 'Overview', icon: User },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/settings', label: 'Settings', icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="geo-pattern" />
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!session) {
    redirect('/auth/login?callbackUrl=/account');
  }

  return (
    <main className="min-h-screen bg-black pt-24 sm:pt-28 pb-16">
      <div className="geo-pattern" />

      <div className="section-container">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="font-display text-2xl sm:text-3xl text-ivory mb-2">
            My Account
          </h1>
          <p className="text-gray text-sm">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="card p-4 sm:p-6">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-gold/10 text-gold'
                            : 'text-gray hover:text-ivory hover:bg-white/5'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-display text-sm tracking-wider uppercase">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
                <li className="pt-4 mt-4 border-t border-white/10">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-display text-sm tracking-wider uppercase">
                      Sign Out
                    </span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
