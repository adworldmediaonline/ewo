import CategoryList from '@/components/V2/category/CategoryList';
import BannerWithDiscount from '@/components/V2/heroBanner/BannerWithDiscount';
import HeroBanner from '@/components/V2/heroBanner/HeroBanner';
// import IndependenceDayBanner from '@/components/V2/heroBanner/IndependenceDayBanner';
import Footer from '@/layout/footers/footer';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Wrapper from '@/layout/wrapper';
import Script from 'next/script';
import styles from './page.module.css';

export default async function HomePage() {
  return (
    <>
      <div className={styles.homePage}>
        <Wrapper>
          <HeaderV2 />
          {/* <IndependenceDayBanner /> */}
          <HeroBanner />
          <BannerWithDiscount />
          <CategoryList />
          <Footer />
        </Wrapper>
      </div>
      {/* Tawk.to Live Chat Script */}
      <Script
        id={`${process.env.TAWK_TO_CHAT_ID}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='${process.env.TAWK_TO_CHAT_SCRIPT}';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
        }}
      />
    </>
  );
}
