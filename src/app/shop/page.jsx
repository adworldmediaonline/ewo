import Wrapper from '@/layout/wrapper';
// import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import ShopBreadcrumb from '@/components/breadcrumb/shop-breadcrumb';
import ShopArea from '@/components/shop/shop-area';
import HeaderV2 from '@/layout/headers/HeaderV2';
export const metadata = {
  title: 'EWO- Shop Page',
};

export default function ShopPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <ShopBreadcrumb subtitle="Shop" />
      <ShopArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
