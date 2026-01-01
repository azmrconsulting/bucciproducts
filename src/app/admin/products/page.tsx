import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import ProductImage from '@/components/admin/ProductImage';

export const dynamic = 'force-dynamic';

async function getProducts(search?: string) {
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      inventory: true,
      _count: {
        select: {
          variants: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const products = await getProducts(searchParams.search);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} total products</p>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          <Plus />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="admin-search">
        <Search />
        <input
          type="text"
          placeholder="Search products by name, SKU, or description..."
          defaultValue={searchParams.search}
        />
      </div>

      {/* Products Grid */}
      <div className="admin-grid-3">
        {products.length === 0 ? (
          <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
            <div className="admin-table-empty">
              <p>No products found</p>
              <Link href="/admin/products/new" className="admin-td-link" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Create your first product
              </Link>
            </div>
          </div>
        ) : (
          products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className="admin-product-card"
            >
              {/* Product Image */}
              <div className="admin-product-image">
                <ProductImage src={product.images[0]?.url} alt={product.name} />
              </div>

              {/* Product Info */}
              <div className="admin-product-info">
                <div className="admin-product-header">
                  <h3 className="admin-product-name">{product.name}</h3>
                  <span className={`admin-badge ${product.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="admin-product-sku">SKU: {product.sku}</p>

                <div className="admin-product-footer">
                  <div>
                    <p className="admin-product-price">{formatCurrency(product.priceCents)}</p>
                    {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                      <p className="admin-product-price-compare">
                        {formatCurrency(product.compareAtPriceCents)}
                      </p>
                    )}
                  </div>
                  {product.inventory && (
                    <p className={`admin-product-stock ${product.inventory.quantity <= 10 ? 'low' : 'ok'}`}>
                      {product.inventory.quantity} in stock
                    </p>
                  )}
                </div>

                {(product._count.variants > 0 || product._count.reviews > 0) && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#666' }}>
                    {product._count.variants > 0 && (
                      <span>{product._count.variants} variants</span>
                    )}
                    {product._count.reviews > 0 && (
                      <span>{product._count.reviews} reviews</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
