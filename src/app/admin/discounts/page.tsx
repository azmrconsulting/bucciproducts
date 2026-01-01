import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDiscountCodes() {
  const discountCodes = await prisma.discountCode.findMany({
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return discountCodes;
}

export default async function DiscountsPage() {
  const discountCodes = await getDiscountCodes();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getDiscountValue = (code: any) => {
    if (code.type === 'PERCENTAGE') {
      return `${code.value}%`;
    } else if (code.type === 'FIXED_AMOUNT') {
      return formatCurrency(code.value);
    } else {
      return 'Free Shipping';
    }
  };

  const isActive = (code: any) => {
    if (!code.isActive) return false;
    const now = new Date();
    if (code.startsAt && now < code.startsAt) return false;
    if (code.expiresAt && now > code.expiresAt) return false;
    if (code.maxUses && code._count.orders >= code.maxUses) return false;
    return true;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Discount Codes</h1>
          <p className="admin-page-subtitle">{discountCodes.length} total discount codes</p>
        </div>
        <Link href="/admin/discounts/new" className="admin-btn admin-btn-primary">
          <Plus />
          Create Discount Code
        </Link>
      </div>

      {/* Discount Codes Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-table-empty">
                    <p>No discount codes found</p>
                    <Link href="/admin/discounts/new" className="admin-td-link" style={{ marginTop: '1rem', display: 'inline-block' }}>
                      Create your first discount code
                    </Link>
                  </td>
                </tr>
              ) : (
                discountCodes.map((code) => (
                  <tr key={code.id}>
                    <td className="admin-td-primary">{code.code}</td>
                    <td>{code.type.replace('_', ' ')}</td>
                    <td className="admin-td-gold">{getDiscountValue(code)}</td>
                    <td>{code.minimumOrderCents ? formatCurrency(code.minimumOrderCents) : 'None'}</td>
                    <td>
                      {code._count.orders}
                      {code.maxUses ? ` / ${code.maxUses}` : ' / ∞'}
                    </td>
                    <td>{formatDate(code.expiresAt)}</td>
                    <td>
                      <span className={`admin-badge ${isActive(code) ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                        {isActive(code) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/discounts/${code.id}`} className="admin-td-link">
                        Edit
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
