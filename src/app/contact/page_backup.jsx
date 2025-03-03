import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import ContactBreadcrumb from '@/components/breadcrumb/contact-breadcrumb';
import ContactArea from '@/components/contact/contact-area';
// import ContactMap from '@/components/contact/contact-map';
import Footer from '@/layout/footers/footer';

export const metadata = {
  title: 'EWO- Contact Page',
};

export default function ContactPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <ContactBreadcrumb />
      <ContactArea />
      {/* <ContactMap /> */}
      <Footer primary_style={true} />
    </Wrapper>
  );
}
