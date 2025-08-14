import ProductDetailsArea from '@/components/product-details/product-details-area';
import HeaderV2 from '@/components/version-tsx/header';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';

// Fetch product data for metadata
async function getProductData(id) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(
      `${baseUrl}/api/product/single-product/${id}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return null;
  }
}

export const generateMetadata = async props => {
  const params = await props.params;
  const product = await getProductData(params.id);

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

export default async function ProductDetailsPage(props) {
  const params = await props.params;
  return (
    <div className="">
      <Wrapper>
        <HeaderV2 />
        <ProductDetailsArea id={params.id} />
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
