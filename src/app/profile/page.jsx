import ProfileArea from '@/components/my-account/profile-area';
import HeaderV2 from '@/components/version-tsx/header';
import Wrapper from '@/components/wrapper';
import Footer from '@/layout/footers/footer';

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
