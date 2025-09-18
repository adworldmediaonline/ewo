'use server';

import { PostHog } from 'posthog-node';
import { cookies } from 'next/headers';

/**
 * Server-side PostHog utilities
 * Use these functions in server actions and API routes
 */

// Initialize PostHog server client
let posthogServer: PostHog | null = null;

const initPostHogServer = () => {
  if (!posthogServer && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthogServer = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    });
  }
  return posthogServer;
};

// Get user ID from cookies or use 'unknown'
const getDistinctId = async (): Promise<string> => {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    const email = cookieStore.get('email')?.value;
    return userId || email || 'unknown';
  } catch (error) {
    return 'unknown';
  }
};

// Capture server-side exceptions (primary use case for server actions)
export const captureServerException = async (
  error: unknown,
  actionName: string,
  additionalProperties?: Record<string | number, any>
) => {
  const client = initPostHogServer();
  if (!client) return;

  try {
    const distinctId = await getDistinctId();

    client.captureException(error, distinctId, {
      action: actionName,
      timestamp: new Date().toISOString(),
      server_side: true,
      ...additionalProperties,
    });

    // Ensure events are sent
    await client.flush();
  } catch (captureError) {
    console.error('Failed to capture server exception:', captureError);
  }
};

// Capture server-side events (use sparingly - mainly for server-specific events)
export const captureServerEvent = async (
  eventName: string,
  properties?: Record<string, any>,
  distinctId?: string
) => {
  const client = initPostHogServer();
  if (!client) return;

  try {
    const userId = distinctId || (await getDistinctId());

    client.capture({
      distinctId: userId,
      event: eventName,
      properties: {
        timestamp: new Date().toISOString(),
        server_side: true,
        ...properties,
      },
    });

    // Ensure events are sent
    await client.flush();
  } catch (captureError) {
    console.error('Failed to capture server event:', captureError);
  }
};

// Identify user on server (for server actions that handle authentication)
export const identifyServerUser = async (
  userId: string,
  userProperties?: Record<string, any>
) => {
  const client = initPostHogServer();
  if (!client) return;

  try {
    client.identify({
      distinctId: userId,
      properties: {
        timestamp: new Date().toISOString(),
        server_side: true,
        ...userProperties,
      },
    });

    await client.flush();
  } catch (identifyError) {
    console.error('Failed to identify server user:', identifyError);
  }
};

// Shutdown PostHog client (call on app shutdown)
export const shutdownPostHog = async () => {
  if (posthogServer) {
    await posthogServer.shutdown();
    posthogServer = null;
  }
};

// Utility function for server actions to handle try-catch with PostHog
export const withServerTracking = async <T>(
  actionName: string,
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<{ success: boolean; data?: T; message?: string }> => {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    await captureServerException(error, actionName, context);

    // Return user-friendly error message
    const errorMessage =
      error instanceof Error ? error.message : 'Operation failed';
    return { success: false, message: errorMessage };
  }
};

export default posthogServer;
