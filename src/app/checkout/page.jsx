import CheckoutArea from '@/components/version-tsx/checkout/checkout-area';
import Wrapper from '@/components/wrapper';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const metadata = {
  title: 'EWO - Checkout',
  alternates: {
    canonical: '/checkout',
  },
};

export default function CheckoutPage() {
  return (
    <Wrapper>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Breadcrumb className="mb-4 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Checkout
          </h1>
        </div> */}
        <CheckoutArea />
      </div>
    </Wrapper>
  );
}
