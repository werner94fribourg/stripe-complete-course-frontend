import { ProductList } from "@/app/components/products/ProductList";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Our Products
      </h1>
      <ProductList />
    </div>
  );
}
