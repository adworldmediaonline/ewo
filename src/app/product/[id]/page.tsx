import ProductDetailsArea from '@/components/version-tsx/product-details/product-details-area';
import ProductBreadcrumbAsync from '@/components/version-tsx/product-details/product-breadcrumb-async';
import { BreadcrumbShell } from '@/components/version-tsx/product-details/breadcrumb-shell';
import { getProductSingle } from '@/server/products';
import { Metadata } from 'next';

export const generateMetadata = async (props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const params = await props.params;
  const product = await getProductSingle(params.id);

  if (!product) {
    return {
      title: 'Product Not Found | East West Off Road',
      description: 'The requested product could not be found.',
    };
  }

  const seo = product?.seo;

  return {
    title: `${seo?.metaTitle || product.title}`,
    description:
      seo?.metaDescription ||
      product.description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
      '',
    keywords: seo?.metaKeywords || '',
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: product.title ?? '',
      description:
        product.description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
        `Shop ${product.title} at East West Off Road. Premium automotive & off-road gear.`,
      images: [
        {
          url: product.img ?? '',
          width: 1200,
          height: 630,
          alt: product.title ?? '',
        },
      ],
    },
  };
};

export default async function ProductDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  "use cache";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <BreadcrumbShell>
        <ProductBreadcrumbAsync params={props.params} />
      </BreadcrumbShell>

      {/* Product details content - streams in separately */}
      <ProductDetailsArea params={props.params} />
    </div>
  );
}
