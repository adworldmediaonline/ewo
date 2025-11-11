import ProductDetailsContent from './product-details-content';
import { getProductSingle } from '@/server/products';

/**
 * Product details area - renders the main product content
 * This component streams in after the static breadcrumb shell
 */
export default async function ProductDetailsArea({
  params
}: {
  params: Promise<{ id: string }>
}) {
  "use cache";

  const { id } = await params;
  const product = await getProductSingle(id);

  if (!product) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground text-lg">Product not found</p>
      </div>
    );
  }

  return <ProductDetailsContent productItem={product} />;
}
