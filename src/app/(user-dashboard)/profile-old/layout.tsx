import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EWO - Profile',
  alternates: {
    canonical: '/profile',
  },
};
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
