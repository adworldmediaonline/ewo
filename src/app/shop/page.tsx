import ShopContentWrapper from '@/components/version-tsx/shop-content-wrapper';
import Wrapper from '@/components/wrapper';

export const metadata = {
  title: 'EWO - Shop',
  description: 'EWO - Shop',
  alternates: {
    canonical: '/shop',
  },
};

export default function ShopPage() {
  return (
    <Wrapper>
      <ShopContentWrapper />
    </Wrapper>
  );
}
