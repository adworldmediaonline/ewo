// import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
// import CompareArea from '@/components/compare/compare-area';
// import Footer from '@/components/version-tsx/footer';
// import HeaderV2 from '@/components/version-tsx/header';
// import Wrapper from '@/components/wrapper';

import { Metadata } from 'next';
import { de } from 'zod/v4/locales';

export const metadata: Metadata = {
  title: 'EWO - Compare',
  alternates: {
    canonical: '/compare',
  },
};

// export default function ComparePage() {
//   return (
//     <div className="">
//       <Wrapper>
//         <HeaderV2 />
//         <CommonBreadcrumb subtitle="Compare" />
//         <CompareArea />
//         <Footer primary_style={true} />
//       </Wrapper>
//     </div>
//   );
// }

export default function ComparePage() {
  return <div className="container mx-auto">Coming Soon</div>;
}
