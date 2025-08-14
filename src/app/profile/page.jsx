import ProfileArea from '@/components/my-account/profile-area';
import HeaderV2 from '@/components/version-tsx/header';
import Footer from '@/layout/footers/footer';
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
