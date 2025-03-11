import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import ProductDetailsArea from '@/components/product-details/product-details-area';
import Footer from '@/layout/footers/footer';

export const metadata = {
  title: 'EWO - Product Details Page',
};

export default function ProductDetailsPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <ProductDetailsArea id="6431364df5a812bd37e765ac" />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
