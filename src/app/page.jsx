import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import HeroSlider from '@/components/hero-banner/hero-slider';
import ElectronicCategory from '@/components/categories/electronic-category';
// import FeatureArea from '@/components/features/feature-area';
import NewArrivals from '@/components/products/electronics/new-arrivals';
import OfferProducts from '@/components/products/electronics/offer-products';
import ProductArea from '@/components/products/electronics/product-area';
// import ProductBanner from '@/components/products/electronics/product-banner';
import ProductGadgetArea from '@/components/products/electronics/product-gadget-area';
import ProductSmArea from '@/components/products/electronics/product-sm-area';
import Footer from '@/layout/footers/footer';

export default function HomePage() {
  return (
    <Wrapper>
      <Header />
      <HeroSlider />
      <ElectronicCategory />
      {/* <FeatureArea /> */}
      <ProductArea />
      {/* <BannerArea /> */}
      <OfferProducts />
      <ProductGadgetArea />
      {/* <ProductBanner /> */}
      <NewArrivals />
      <ProductSmArea />
      {/* <BlogArea />
      <InstagramArea />
      <CtaArea /> */}
      <Footer />
    </Wrapper>
  );
}
