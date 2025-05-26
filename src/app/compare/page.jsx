import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CompareArea from '@/components/compare/compare-area';
import styles from './compare.module.css';

export const metadata = {
  title: 'EWO- Compare Page',
};

export default function ComparePage() {
  return (
    <div className={styles.comparePage}>
      <Wrapper>
        <HeaderV2 />
        <CommonBreadcrumb title="Compare" subtitle="Compare" />
        <CompareArea />
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
