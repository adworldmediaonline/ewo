import CategoryList from '@/components/V2/category/CategoryList';
import BannerWithDiscount from '@/components/V2/heroBanner/BannerWithDiscount';
import HeroBanner from '@/components/V2/heroBanner/HeroBanner';
import IndependenceDayBanner from '@/components/V2/heroBanner/IndependenceDayBanner';
import Footer from '@/layout/footers/footer';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Wrapper from '@/layout/wrapper';
import styles from './page.module.css';

export default async function HomePage() {
  return (
    <div className={styles.homePage}>
      <Wrapper>
        <HeaderV2 />
        <IndependenceDayBanner />
        <HeroBanner />
        <BannerWithDiscount />
        <CategoryList />
        <Footer />
      </Wrapper>
    </div>
  );
}
