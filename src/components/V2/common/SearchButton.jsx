'use client';
import { Search } from '@/svg';
import { useFormStatus } from 'react-dom';
import { ClipLoader } from 'react-spinners';

export default function SearchButton({ className, isLoading }) {
  const status = useFormStatus();
  const showLoader = status.pending || isLoading;

  return (
    <button className={className} type="submit" disabled={showLoader}>
      {showLoader ? (
        <ClipLoader size={20} color="white" />
      ) : (
        <Search style={{ color: 'white!important' }} />
      )}
    </button>
  );
}
