'use server';

import { captureServerException } from '@/lib/posthog-server';
import { z } from 'zod';

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Server action to handle contact form submission
 * Demonstrates proper PostHog server-side exception tracking
 */
export const submitContactForm = async (formData: ContactFormData) => {
  try {
    // Validate the form data
    const validatedData = contactFormSchema.parse(formData);

    // Simulate API call to send email or save to database
    // Replace this with your actual contact form processing logic
    const response = await fetch(
      process.env.CONTACT_API_ENDPOINT || 'https://api.example.com/contact',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      }
    );

    if (!response.ok) {
      throw new Error(`Contact API responded with status: ${response.status}`);
    }

    const result = await response.json();

    // Return success response (no PostHog tracking for success in server actions)
    return {
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      data: result,
    };
  } catch (error) {
    // Track server-side exceptions with PostHog
    await captureServerException(error, 'submitContactForm', {
      form_data: {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message_length: formData.message?.length || 0,
      },
      validation_passed: contactFormSchema.safeParse(formData).success,
    });

    // Return user-friendly error message
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Please check your form data and try again.',
        errors: error.issues,
      };
    }

    return {
      success: false,
      message:
        'Something went wrong while sending your message. Please try again later.',
    };
  }
};

/**
 * Server action to handle newsletter subscription
 * Another example of server-side PostHog exception tracking
 */
export const subscribeToNewsletter = async (email: string) => {
  try {
    // Validate email
    const emailSchema = z.string().email();
    const validatedEmail = emailSchema.parse(email);

    // Simulate API call to newsletter service
    const response = await fetch(
      process.env.NEWSLETTER_API_ENDPOINT ||
        'https://api.example.com/newsletter',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: validatedEmail }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Newsletter API responded with status: ${response.status}`
      );
    }

    return {
      success: true,
      message: 'Successfully subscribed to newsletter!',
    };
  } catch (error) {
    // Track server-side exceptions with PostHog
    await captureServerException(error, 'subscribeToNewsletter', {
      email: email,
      email_valid: z.string().email().safeParse(email).success,
    });

    // Return user-friendly error message
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Please enter a valid email address.',
      };
    }

    return {
      success: false,
      message: 'Failed to subscribe to newsletter. Please try again later.',
    };
  }
};
