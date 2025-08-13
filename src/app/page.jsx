import CategoryList from '@/components/V2/category/CategoryList';
import BannerWithDiscount from '@/components/V2/heroBanner/BannerWithDiscount';
import HeroBanner from '@/components/V2/heroBanner/HeroBanner';
import Footer from '@/layout/footers/footer';
import HeaderV2 from '@/layout/headers/HeaderV2';

export default async function HomePage() {
  return (
    <>
      <div>
        <HeaderV2 />
        <HeroBanner />
        <BannerWithDiscount />
        <CategoryList />
        <Footer />
      </div>
    </>
  );
}
