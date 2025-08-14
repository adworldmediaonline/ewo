import CategoryList from '@/components/V2/category/CategoryList';
import BannerWithDiscount from '@/components/V2/heroBanner/BannerWithDiscount';
import HeroBanner from '@/components/V2/heroBanner/HeroBanner';
import Header from '@/components/version-tsx/header';
import Footer from '@/layout/footers/footer';

export default async function HomePage() {
  return (
    <>
      <div>
        <Header />
        <HeroBanner />
        <BannerWithDiscount />
        <CategoryList />
        <Footer />
      </div>
    </>
  );
}
