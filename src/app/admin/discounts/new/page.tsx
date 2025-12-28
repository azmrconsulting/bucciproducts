import DiscountCodeForm from '@/components/admin/DiscountCodeForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewDiscountCodePage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Create Discount Code</h1>
        <p className="text-gray-600 mt-1">Create a new discount code for your customers</p>
      </div>

      <DiscountCodeForm />
    </div>
  );
}
