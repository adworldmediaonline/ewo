'use cache';
// import Banner from '@/components/version-tsx/banner';
import CategoryShowcase from '@/components/version-tsx/category-showcase';
import HeroBanner from '@/components/version-tsx/hero-banner';


export default async function HomePage() {
  "use cache";
  return (
    <>
      <HeroBanner />
      {/* <Banner
        desktopPublicId="Extended_LABOR_DAY_SALE_20_OFF_On_All_Off-Road_Parts_txzlas"
        mobilePublicId="Extended_LABOR_DAY_SALE_20_OFF_On_All_Off-Road_Parts_txzlas"
        priority={false}
        showButton={false}
        aspectRatio={3.69} // 1920/520 ≈ 3.69 for 520px height
        mobileHeight={200}
      /> */}
      <CategoryShowcase />
    </>
  );
}
