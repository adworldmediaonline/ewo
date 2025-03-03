import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import ShopBreadcrumb from '@/components/breadcrumb/shop-breadcrumb';
import ShopCategoryArea from '@/components/categories/shop-category-area';

export const metadata = {
  title: 'EWO - Shop Categories',
};

export default function CategoryPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <ShopBreadcrumb
        title="Shop Categories"
        subtitle="Browse our product categories"
      />
      <ShopCategoryArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
