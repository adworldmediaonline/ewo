'use client'; // Error boundaries must be Client Components

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="">
      <div className="">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className=""
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h1 className="">Something went wrong!</h1>
        <p className="">
          We apologize for the inconvenience. The page you're trying to access
          encountered an error. You can try again or return to the homepage.
        </p>
        <div className="">
          <button onClick={() => reset()} className="">
            Try Again
          </button>
          <Link href="/" className="">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
