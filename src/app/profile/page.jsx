import ProfileArea from '@/components/my-account/profile-area';
import Footer from '@/layout/footers/footer';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Wrapper from '@/layout/wrapper';

export const metadata = {
  title: 'EWO - Profile',
  alternates: {
    canonical: '/profile',
  },
};

export default function ProfilePage() {
  return (
    <div className="">
      <Wrapper>
        <HeaderV2 />
        <ProfileArea />
        <Footer style_2={true} />
      </Wrapper>
    </div>
  );
}
