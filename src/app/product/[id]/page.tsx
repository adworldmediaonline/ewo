import ProductDetailsArea from '@/components/version-tsx/product-details/product-details-area';
import ProductBreadcrumbAsync from '@/components/version-tsx/product-details/product-breadcrumb-async';
import { BreadcrumbShell } from '@/components/version-tsx/product-details/breadcrumb-shell';
import { ProductContentSkeleton } from '@/components/version-tsx/product-details/product-content-skeleton';
import { getProductSingle } from '@/server/products';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { BreadcrumbItem, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

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
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/*
        Static breadcrumb shell renders instantly
        Dynamic breadcrumb content (category + product) streams in via Suspense
      */}
      <BreadcrumbShell>
        <Suspense fallback={<BreadcrumbLoadingSkeleton />}>
          <ProductBreadcrumbAsync params={props.params} />
        </Suspense>
      </BreadcrumbShell>

      {/*
        Main product content with Suspense boundary
        Cached product data streams in, providing fast subsequent loads
        Related products have their own nested Suspense boundary
      */}
      <Suspense fallback={<ProductContentSkeleton />}>
        <ProductDetailsArea params={props.params} />
      </Suspense>
    </div>
  );
}

const BreadcrumbLoadingSkeleton = () => {
  return (
    <>
      <BreadcrumbItem>
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
      </BreadcrumbItem>

      <BreadcrumbSeparator>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </BreadcrumbSeparator>

      <BreadcrumbItem>
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
      </BreadcrumbItem>
    </>
  );
};
