'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  submitContactForm,
  type ContactFormData,
} from '@/lib/server-actions/contact-action';
import { captureEvent, captureException } from '@/lib/posthog-client';
import { notifySuccess, notifyError } from '@/utils/toast';

/**
 * Example Contact Form Component with Complete PostHog Integration
 * Demonstrates proper client-side PostHog tracking following the guidelines
 */
export default function ContactFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call server action
      const result = await submitContactForm(formData);

      if (result.success) {
        // Success tracking
        captureEvent('contact_form_submitted', {
          form_type: 'contact',
          subject_category: formData.subject,
          message_length: formData.message.length,
          user_email: formData.email,
        });

        notifySuccess(result.message);

        // Reset form on success
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        // Failed response tracking
        captureException(new Error(result.message), {
          form_data: formData,
          server_response: result,
          error_type: 'server_validation_failed',
        });

        notifyError(result.message);
      }
    } catch (error) {
      // Catch block exception tracking
      captureException(error, {
        form_data: formData,
        action: 'contact_form_submit',
        error_type: 'unexpected_error',
      });

      notifyError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track form field interactions
  const handleFieldFocus = (fieldName: string) => {
    captureEvent('form_field_focused', {
      form_type: 'contact',
      field_name: fieldName,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => handleFieldFocus('name')}
                required
                disabled={isSubmitting}
                data-ph-capture="contact-form-name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => handleFieldFocus('email')}
                required
                disabled={isSubmitting}
                data-ph-capture="contact-form-email"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleInputChange}
              onFocus={() => handleFieldFocus('subject')}
              required
              disabled={isSubmitting}
              data-ph-capture="contact-form-subject"
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              onFocus={() => handleFieldFocus('message')}
              required
              disabled={isSubmitting}
              rows={5}
              data-ph-capture="contact-form-message"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            data-ph-capture="contact-form-submit"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
