import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import SearchArea from '@/components/search/search-area';
import HeaderV2 from '@/components/version-tsx/header';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';

export const metadata = {
  title: 'EWO - Search',
  alternates: {
    canonical: '/search',
  },
};

export default function SearchPage() {
  return (
    <div className="">
      <Wrapper>
        <HeaderV2 />
        <CommonBreadcrumb title="Search Products" subtitle="Search Products" />
        <SearchArea />
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
