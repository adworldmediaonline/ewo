import Wrapper from '@/layout/wrapper';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import ShopBreadcrumb from '@/components/breadcrumb/shop-breadcrumb';
import ShopArea from '@/components/shop/shop-area';

export const metadata = {
  title: 'EWO- Shop Page',
};

export default function ShopPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <ShopBreadcrumb subtitle="Shop" />
      <ShopArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
