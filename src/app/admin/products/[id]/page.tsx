import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      variants: true,
      inventory: true,
    },
  });

  if (!product) {
    notFound();
  }

  return product;
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-1">{product.name}</p>
      </div>

      <ProductForm product={product} />
    </div>
  );
}
