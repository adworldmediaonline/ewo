import HelloTailwind from '@/components/common/HelloTailwind';

export const metadata = {
  title: 'Demo TS + Tailwind',
  description: 'Verification page for TypeScript and Tailwind setup',
};

export default function DemoTsPage() {
  return (
    <main className="mx-auto bg-primary text-primary max-w-3xl space-y-6 p-6 md:p-10">
      <HelloTailwind />
      <div className="rounded-lg border border-dashed p-4 text-sm text-gray-600 dark:text-neutral-300">
        This is a demo page at{' '}
        <code className="rounded text-primary   bg-gray-100 px-1 py-0.5 dark:bg-neutral-800">
          /demo-ts
        </code>{' '}
        using a TSX page and a TSX component styled with Tailwind.
      </div>
    </main>
  );
}
