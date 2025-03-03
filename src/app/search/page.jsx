import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import SearchArea from '@/components/search/search-area';
import Footer from '@/layout/footers/footer';

export const metadata = {
  title: 'EWO- Search Page',
};

export default function SearchPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <CommonBreadcrumb title="Search Products" subtitle="Search Products" />
      <SearchArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
