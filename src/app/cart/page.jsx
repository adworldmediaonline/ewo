import CartArea from '@/components/cart-wishlist/cart-area';
import Wrapper from '@/components/wrapper';

export const metadata = {
  title: 'EWO - Shopping Cart',
  alternates: {
    canonical: '/cart',
  },
};

export default function CartPage() {
  return (
    <Wrapper>
      <CartArea />
    </Wrapper>
  );
}
