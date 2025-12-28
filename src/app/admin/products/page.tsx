import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">{products.length} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or description..."
            defaultValue={searchParams.search}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No products found</p>
            <Link
              href="/admin/products/new"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first product
            </Link>
          </div>
        ) : (
          products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.images[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No Image</div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-3">SKU: {product.sku}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(product.priceCents)}</p>
                    {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.compareAtPriceCents)}
                      </p>
                    )}
                  </div>
                  {product.inventory && (
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        product.inventory.quantity <= 10 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.inventory.quantity} in stock
                      </p>
                    </div>
                  )}
                </div>

                {(product._count.variants > 0 || product._count.reviews > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
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
