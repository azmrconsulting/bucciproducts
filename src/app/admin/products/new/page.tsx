import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-gray hover:text-ivory transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="admin-page-title">Create New Product</h1>
        <p className="admin-page-subtitle">Add a new product to your catalog</p>
      </div>

      <ProductForm />
    </div>
  );
}
