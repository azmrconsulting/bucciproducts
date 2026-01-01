import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getUsers(search?: string) {
  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const users = await getUsers(searchParams.search);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-subtitle">{users.length} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="admin-search">
        <Search />
        <input
          type="text"
          placeholder="Search users by name or email..."
          defaultValue={searchParams.search}
        />
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-table-empty">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="admin-avatar">
                          {user.image ? (
                            <img src={user.image} alt={user.firstName || ''} />
                          ) : (
                            <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                          )}
                        </div>
                        <span className="admin-td-primary">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <span className={`admin-badge ${user.role === 'ADMIN' ? 'admin-badge-admin' : 'admin-badge-customer'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user._count.orders}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <Link href={`/admin/users/${user.id}`} className="admin-td-link">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
