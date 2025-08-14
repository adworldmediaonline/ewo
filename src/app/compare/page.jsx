import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CompareArea from '@/components/compare/compare-area';
import HeaderV2 from '@/components/version-tsx/header';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';

export const metadata = {
  title: 'EWO - Compare',
  alternates: {
    canonical: '/compare',
  },
};

export default function ComparePage() {
  return (
    <div className="">
      <Wrapper>
        <HeaderV2 />
        <CommonBreadcrumb subtitle="Compare" />
        <CompareArea />
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
