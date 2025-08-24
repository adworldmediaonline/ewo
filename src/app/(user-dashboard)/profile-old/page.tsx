import Wrapper from '@/components/wrapper';
import { Metadata } from 'next';
import ProfileArea from '../../../components/my-account/profile-area';

export const metadata: Metadata = {
  title: 'EWO - Profile',
  alternates: {
    canonical: '/profile',
  },
};

export default function ProfilePage() {
  return (
    <Wrapper>
      <h1>Profile</h1>
      <ProfileArea />
    </Wrapper>
  );
}
