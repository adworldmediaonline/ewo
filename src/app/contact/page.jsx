import Script from 'next/script';
import ContactPage from './contact-form';

export default function Contact() {
  return (
    <>
      <ContactPage />
      {/* Tawk.to Live Chat Script */}
      <Script
        id={`${process.env.TAWK_TO_CHAT_ID}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='${process.env.TAWK_TO_CHAT_SCRIPT}';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
        }}
      />
    </>
  );
}
