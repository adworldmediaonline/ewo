'use client';
import { Search as SearchIcon } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { ClipLoader } from 'react-spinners';

interface SearchButtonProps {
  className?: string;
  isLoading?: boolean;
}

export default function SearchButton({
  className = '',
  isLoading = false,
}: SearchButtonProps) {
  const status = useFormStatus();
  const showLoader = Boolean(status?.pending) || isLoading;

  return (
    <button
      className={className}
      type="submit"
      aria-label="Search"
      disabled={showLoader}
    >
      {showLoader ? (
        <ClipLoader size={20} color="white" />
      ) : (
        <SearchIcon className="h-5 w-5 text-white" aria-hidden />
      )}
    </button>
  );
}
