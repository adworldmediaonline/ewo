import Wrapper from '@/layout/wrapper';
import Footer from '@/layout/footers/footer';
import CategoryList from '@/components/V2/category/CategoryList';
import HeaderV2 from '@/layout/headers/HeaderV2';
import HeroBanner from '@/components/V2/heroBanner/HeroBanner';
import BannerWithDiscount from '@/components/V2/heroBanner/BannerWithDiscount';
import styles from './page.module.css';

export default async function HomePage() {
  return (
    <div className={styles.homePage}>
      <Wrapper>
        <HeaderV2 />
        <HeroBanner />
        <BannerWithDiscount />
        <CategoryList />
        <Footer />
      </Wrapper>
    </div>
  );
}
