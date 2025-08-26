import { getCategories } from '@/lib/server-data';
import HeaderV2 from './header';

export default async function HeaderWrapper() {
  // Fetch categories on the server - Next.js will cache and dedupe this
  const categories = await getCategories();

  return <HeaderV2 categories={categories} />;
}
