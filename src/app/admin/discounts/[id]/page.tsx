import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DiscountCodeForm from '@/components/admin/DiscountCodeForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDiscountCode(id: string) {
  const discountCode = await prisma.discountCode.findUnique({
    where: { id },
  });

  if (!discountCode) {
    notFound();
  }

  return discountCode;
}

export default async function EditDiscountCodePage({
  params,
}: {
  params: { id: string };
}) {
  const discountCode = await getDiscountCode(params.id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/discounts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discount Codes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Discount Code</h1>
        <p className="text-gray-600 mt-1">{discountCode.code}</p>
      </div>

      <DiscountCodeForm discountCode={discountCode} />
    </div>
  );
}
