'use client';
import HeaderV2 from '@/components/version-tsx/header';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import { useSubmitContactMutation } from '@/redux/features/contactApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
const styles = new Proxy({}, { get: () => '' });

export default function ContactPage() {
  const router = useRouter();
  const [submitContact, { isLoading: isSubmitting, error: submitError }] =
    useSubmitContactMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (
      formData.phone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))
    ) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitMessage('');

    try {
      const result = await submitContact(formData).unwrap();

      // Store success flag in sessionStorage for thank you page
      sessionStorage.setItem('contactSubmitted', 'true');
      sessionStorage.setItem('contactId', result.data.id);
      sessionStorage.setItem('contactSubmittedAt', new Date().toISOString());

      // Redirect to thank you page
      router.push('/contact/thank-you');
    } catch (error) {
      console.error('Contact form submission error:', error);

      let errorMessage = 'Failed to send message. Please try again.';

      // Handle different types of errors with user-friendly messages
      if (error?.status === 429) {
        errorMessage =
          'You have submitted too many messages recently. Please wait before submitting again.';
      } else if (error?.status === 400) {
        errorMessage =
          error?.data?.message ||
          'Please check all required fields and try again.';
      } else if (error?.status === 500) {
        errorMessage =
          'Server error occurred. Please try again or contact us directly.';
      } else if (error?.status === 0 || error?.name === 'TypeError') {
        errorMessage =
          'Connection error. Please check your internet connection and try again.';
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      setSubmitMessage(errorMessage);
    }
  };

  return (
    <div className="">
      <Wrapper>
        <HeaderV2 />
        <div className="">
          <div className="">
            <div className="">
              <h1 className="">Contact Us</h1>
              <p className="">
                Get in touch with our team. We'd love to hear from you!
              </p>
            </div>

            <div className="">
              {/* Contact Form */}
              <div className="">
                <form onSubmit={handleSubmit} className="">
                  <div className="">
                    <div className="">
                      <label htmlFor="name" className="">
                        Name <span className="">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={` ${errors.name ? styles.inputError : ''}`}
                        placeholder="Your full name"
                        maxLength={100}
                      />
                      {errors.name && <span className="">{errors.name}</span>}
                    </div>

                    <div className="">
                      <label htmlFor="email" className="">
                        Email <span className="">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={` ${errors.email ? styles.inputError : ''}`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && <span className="">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="">
                    <div className="">
                      <label htmlFor="phone" className="">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={` ${errors.phone ? styles.inputError : ''}`}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && <span className="">{errors.phone}</span>}
                    </div>

                    <div className="">
                      <label htmlFor="subject" className="">
                        Subject <span className="">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={` ${
                          errors.subject ? styles.inputError : ''
                        }`}
                        placeholder="How can we help you?"
                        maxLength={200}
                      />
                      {errors.subject && (
                        <span className="">{errors.subject}</span>
                      )}
                    </div>
                  </div>

                  <div className="">
                    <label htmlFor="message" className="">
                      Message <span className="">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={` ${errors.message ? styles.inputError : ''}`}
                      placeholder="Please describe your inquiry in detail..."
                      rows={6}
                      maxLength={2000}
                    />
                    <div className="">
                      {formData.message.length}/2000 characters
                    </div>
                    {errors.message && (
                      <span className="">{errors.message}</span>
                    )}
                  </div>

                  {submitMessage && (
                    <div
                      className={` ${
                        submitMessage.includes('Network') ||
                        submitMessage.includes('Failed')
                          ? styles.errorMessage
                          : styles.successMessage
                      }`}
                    >
                      {submitMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={` ${isSubmitting ? styles.submitting : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className=""></span>
                        Sending Message...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="">
                <div className="">
                  <h3 className="">Get in Touch</h3>

                  <div className="">
                    <div className="">📞</div>
                    <div className="">
                      <h4>Phone</h4>
                      <a href="tel:1-866-396-7623" className="">
                        1-866-EWO-ROAD
                        <br />
                        (396-7623)
                      </a>
                    </div>
                  </div>

                  <div className="">
                    <div className="">✉️</div>
                    <div className="">
                      <h4>Email</h4>
                      <a href="mailto:info@eastwestoffroad.com" className="">
                        info@eastwestoffroad.com
                      </a>
                    </div>
                  </div>

                  <div className="">
                    <div className="">📍</div>
                    <div className="">
                      <h4>Address</h4>
                      <p>
                        PO Box 2644
                        <br />
                        Everett, WA 98213
                      </p>
                    </div>
                  </div>

                  <div className="">
                    <div className="">🕒</div>
                    <div className="">
                      <h4>Response Time</h4>
                      <p>
                        We typically respond within
                        <br />
                        24-48 hours during business days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
