import Form from 'next/form';
import styles from '@/styleModules/Search.module.css';
import SearchButton from './SearchButton';
export default function SearchForm() {
  return (
    <Form action="/search" className={styles.searchForm}>
      <input
        name="searchText"
        placeholder="search for products..."
        className={styles.searchInput}
      />
      {/* <button type="submit" className={styles.searchButton}>
          <Search />
        </button> */}

      <SearchButton className={styles.searchButton} />
    </Form>
  );
}
