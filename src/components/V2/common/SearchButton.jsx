'use client';
import { Search } from '@/svg';
import { useFormStatus } from 'react-dom';
import { ClipLoader } from 'react-spinners';

export default function SearchButton({ className }) {
  const status = useFormStatus();
  return (
    <button className={className} type="submit">
      {status.pending ? (
        <ClipLoader size={20} color="var(--tp-theme-primary)" />
      ) : (
        <Search />
      )}
    </button>
  );
}
