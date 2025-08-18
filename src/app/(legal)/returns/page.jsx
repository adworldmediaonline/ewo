const styles = new Proxy({}, { get: () => '' });

export const metadata = {
  title: 'Returns - East West Offroad',
  alternates: {
    canonical: '/returns',
  },
};
export default function ReturnsPage() {
  return (
    <div className="">
      <div className="">
        <h1 className="">Refund and Return Policy</h1>
        <p className="">Effective Date: April 27, 2025</p>

        <p className="">
          At East West Offroad Products LLC, your satisfaction is important to
          us. If for any reason you are not completely satisfied with your
          purchase, we offer a simple and transparent return policy.
        </p>

        <div>
          <section className="">
            <h2 className="">1. Return Period</h2>
            <p className="">
              You have 30 days from the date of delivery to return any item for
              any reason.
            </p>
          </section>

          <section className="">
            <h2 className="">2. Return Conditions</h2>
            <ul className="">
              <li className="">
                Items must be returned in new, unused, and uninstalled
                condition.
              </li>
              <li className="">
                Items must include all original packaging, hardware, and
                accessories.
              </li>
              <li className="">
                Returns that are damaged, used, or missing parts may be subject
                to additional fees or denied.
              </li>
            </ul>
          </section>

          <section className="">
            <h2 className="">3. Restocking Fee</h2>
            <ul className="">
              <li className="">
                All returns are subject to a 15% restocking fee unless you
                qualify for a special case.
              </li>
              <li className="">
                The restocking fee will be deducted from your refund amount.
              </li>
            </ul>
          </section>

          <section className="">
            <h2 className="">4. Non-Returnable Items</h2>
            <p className="">Certain items are non-returnable, including:</p>
            <ul className="">
              <li className="">Any item sold as "Non Returnable"</li>
            </ul>
          </section>

          <section className="">
            <h2 className="">5. How to Start a Return</h2>
            <p className="">To initiate a return, please contact us at:</p>
            <div className="">
              <p className="">
                Email:{' '}
                <a href="mailto:info@eastwestoffroad.com" className="">
                  info@eastwestoffroad.com
                </a>
              </p>
              <p className="">
                Phone:{' '}
                <a href="tel:1-866-396-7623" className="">
                  1-866-EWO-ROAD (396-7623)
                </a>
              </p>
            </div>
            <p className="">
              We will provide you with a Return Authorization (RA) number and
              instructions for sending your item back.
            </p>
            <p className="">
              Returns without a valid RA number will not be accepted.
            </p>
          </section>

          <section className="">
            <h2 className="">6. Refund Processing</h2>
            <ul className="">
              <li className="">
                Once we receive and inspect your return, we will issue a refund
                to your original method of payment.
              </li>
              <li className="">
                Refunds are typically processed within 7–10 business days after
                we receive the returned item.
              </li>
              <li className="">Shipping charges are non-refundable.</li>
            </ul>
          </section>

          <section className="">
            <h2 className="">7. Return Shipping</h2>
            <ul className="">
              <li className="">
                Customers are responsible for return shipping costs.
              </li>
              <li className="">
                We recommend using a trackable shipping service and purchasing
                shipping insurance.
              </li>
              <li className="">
                We are not responsible for returns lost in transit.
              </li>
            </ul>
          </section>

          <div className="">
            <h3 className="">Need help or have questions about your return?</h3>
            <p className="">Contact us anytime — we're happy to assist you!</p>

            <div className="">
              <p className="">East West Offroad Products LLC</p>
              <p className="">
                Email:{' '}
                <a href="mailto:info@eastwestoffroad.com" className="">
                  info@eastwestoffroad.com
                </a>
              </p>
              <p className="">
                Phone:{' '}
                <a href="tel:1-866-396-7623" className="">
                  1-866-EWO-ROAD (396-7623)
                </a>
              </p>
              <p className="">Address: PO Box 2644 Everett WA 98213</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
