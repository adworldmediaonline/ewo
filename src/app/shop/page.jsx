import Wrapper from '@/components/wrapper';
// import HeaderTwo from '@/layout/headers/header-2';
import ShopBreadcrumb from '@/components/breadcrumb/shop-breadcrumb';
import ShopArea from '@/components/shop/shop-area';
import HeaderV2 from '@/components/version-tsx/header';
import Footer from '@/layout/footers/footer';

export const metadata = {
  title: 'EWO - Shop',
  description: 'EWO - Shop',
  alternates: {
    canonical: '/shop',
  },
};

export default function ShopPage() {
  return (
    <div className="">
      <Wrapper>
        <HeaderV2 />
        <ShopBreadcrumb subtitle="Shop" />
        <div className="">
          <main className="">
            <div className="">
              <ShopArea />
            </div>
          </main>
        </div>
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
