import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import ProductDetailsArea from '@/components/product-details/product-details-area';
import Footer from '@/layout/footers/footer';

export const metadata = {
  title: 'EWO - Product Details Page',
};

export default async function ProductDetailsPage(props) {
  const params = await props.params;
  return (
    <Wrapper>
      <HeaderV2 />
      <ProductDetailsArea id={params.id} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
