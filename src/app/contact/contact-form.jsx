'use client';
import Footer from '@/layout/footers/footer';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Wrapper from '@/layout/wrapper';
import { useSubmitContactMutation } from '@/redux/features/contactApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';

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
    <div className={styles.contactPage}>
      <Wrapper>
        <HeaderV2 />
        <div className={styles.contactContainer}>
          <div className={styles.contactContent}>
            <div className={styles.contactHeader}>
              <h1 className={styles.contactTitle}>Contact Us</h1>
              <p className={styles.contactSubtitle}>
                Get in touch with our team. We'd love to hear from you!
              </p>
            </div>

            <div className={styles.contactLayout}>
              {/* Contact Form */}
              <div className={styles.formSection}>
                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name" className={styles.formLabel}>
                        Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.name ? styles.inputError : ''
                        }`}
                        placeholder="Your full name"
                        maxLength={100}
                      />
                      {errors.name && (
                        <span className={styles.errorMessage}>
                          {errors.name}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        Email <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.email ? styles.inputError : ''
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <span className={styles.errorMessage}>
                          {errors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="phone" className={styles.formLabel}>
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.phone ? styles.inputError : ''
                        }`}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && (
                        <span className={styles.errorMessage}>
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="subject" className={styles.formLabel}>
                        Subject <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.subject ? styles.inputError : ''
                        }`}
                        placeholder="How can we help you?"
                        maxLength={200}
                      />
                      {errors.subject && (
                        <span className={styles.errorMessage}>
                          {errors.subject}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.formLabel}>
                      Message <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`${styles.formTextarea} ${
                        errors.message ? styles.inputError : ''
                      }`}
                      placeholder="Please describe your inquiry in detail..."
                      rows={6}
                      maxLength={2000}
                    />
                    <div className={styles.charCount}>
                      {formData.message.length}/2000 characters
                    </div>
                    {errors.message && (
                      <span className={styles.errorMessage}>
                        {errors.message}
                      </span>
                    )}
                  </div>

                  {submitMessage && (
                    <div
                      className={`${styles.submitMessage} ${
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
                    className={`${styles.submitButton} ${
                      isSubmitting ? styles.submitting : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className={styles.spinner}></span>
                        Sending Message...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className={styles.infoSection}>
                <div className={styles.contactInfoCard}>
                  <h3 className={styles.infoTitle}>Get in Touch</h3>

                  <div className={styles.contactInfoItem}>
                    <div className={styles.infoIcon}>📞</div>
                    <div className={styles.infoDetails}>
                      <h4>Phone</h4>
                      <a
                        href="tel:1-866-396-7623"
                        className={styles.contactLink}
                      >
                        1-866-EWO-ROAD
                        <br />
                        (396-7623)
                      </a>
                    </div>
                  </div>

                  <div className={styles.contactInfoItem}>
                    <div className={styles.infoIcon}>✉️</div>
                    <div className={styles.infoDetails}>
                      <h4>Email</h4>
                      <a
                        href="mailto:info@eastwestoffroad.com"
                        className={styles.contactLink}
                      >
                        info@eastwestoffroad.com
                      </a>
                    </div>
                  </div>

                  <div className={styles.contactInfoItem}>
                    <div className={styles.infoIcon}>🕒</div>
                    <div className={styles.infoDetails}>
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
