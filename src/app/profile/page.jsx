import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import ProfileArea from '@/components/my-account/profile-area';

export const metadata = {
  title: 'EWO- Profile Page',
};

export default function ProfilePage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <ProfileArea />
      <Footer style_2={true} />
    </Wrapper>
  );
}
