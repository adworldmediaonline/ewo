import ContactPage from '../../components/version-tsx/contact/contact-form';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';

export async function generateMetadata() {
  const cmsData = await getPageMetadata('contact');
  return buildPageMetadata('contact', cmsData, {
    title: 'Contact Us - East West Offroad',
    description:
      'Get in touch with East West Offroad. Contact us for questions about off-road steering parts, DANA 60/44 components, and orders.',
    keywords: 'contact East West Offroad, off-road parts support, customer service',
    canonical: '/contact',
  });
}

export default function Contact() {
  return (
    <>
      <ContactPage />
    </>
  );
}
