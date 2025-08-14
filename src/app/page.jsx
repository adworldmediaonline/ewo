// import CategoryList from '@/components/V2/category/CategoryList';
import CategoryShowcase from '@/components/version-tsx/category-showcase';
import Footer from '@/components/version-tsx/footer';
import Header from '@/components/version-tsx/header';
import HeroBanner from '@/components/version-tsx/hero-banner';

export default async function HomePage() {
  return (
    <>
      <div>
        <Header />
        <HeroBanner />
        {/* <BannerWithDiscount /> */}
        {/* <CategoryList /> */}
        <CategoryShowcase />
        <Footer />
      </div>
    </>
  );
}
