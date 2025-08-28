import SearchArea from '@/components/version-tsx/search/search-area';
import Wrapper from '@/components/wrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EWO - Search',
  alternates: {
    canonical: '/search',
  },
};

export default function SearchPage() {
  return (
    <Wrapper>
      <SearchArea />
    </Wrapper>
  );
}
