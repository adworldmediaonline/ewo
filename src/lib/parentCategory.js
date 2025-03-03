export default function parentCategoryModified(category) {
  if (!category) {
    return '';
  }
  const categoryName = category
    .toLowerCase()
    .replace('&', '')
    .split(' ')
    .join('-');

  return categoryName;
}
