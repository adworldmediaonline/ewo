'use client';
import { useEffect } from 'react';
import styles from '../app/shop/shop.module.css';

export default function Pagination({
  items = [],
  countOfPage = 12,
  paginatedData,
  currPage,
  setCurrPage,
}) {
  const pageStart = (currPage - 1) * countOfPage;
  const totalPage = Math.ceil(items.length / countOfPage);

  function setPage(idx) {
    if (idx <= 0 || idx > totalPage) {
      return;
    }
    setCurrPage(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    paginatedData(items, pageStart, countOfPage);
  }

  useEffect(() => {
    paginatedData(items, pageStart, countOfPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, pageStart, countOfPage]);

  // Generate the page number buttons with ellipsis for large page counts
  const renderPageButtons = () => {
    const visiblePages = [];

    // Always show first page
    visiblePages.push(1);

    // Calculate range around current page
    let rangeStart = Math.max(2, currPage - 1);
    let rangeEnd = Math.min(totalPage - 1, currPage + 1);

    // Adjust range to always show 3 pages when possible
    if (rangeEnd - rangeStart < 2) {
      if (currPage < totalPage / 2) {
        rangeEnd = Math.min(totalPage - 1, rangeStart + 2);
      } else {
        rangeStart = Math.max(2, rangeEnd - 2);
      }
    }

    // Add ellipsis before range if needed
    if (rangeStart > 2) {
      visiblePages.push('...');
    }

    // Add page numbers in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      visiblePages.push(i);
    }

    // Add ellipsis after range if needed
    if (rangeEnd < totalPage - 1) {
      visiblePages.push('...');
    }

    // Always show last page if there's more than one page
    if (totalPage > 1) {
      visiblePages.push(totalPage);
    }

    return visiblePages.map((page, index) => {
      if (page === '...') {
        return (
          <div key={`ellipsis-${index}`} className={styles.paginationEllipsis}>
            ...
          </div>
        );
      }

      return (
        <button
          key={page}
          onClick={() => setPage(page)}
          className={`${styles.paginationButton} ${
            currPage === page ? styles.paginationButtonActive : ''
          }`}
          aria-current={currPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      );
    });
  };

  if (totalPage <= 1) return null;

  return (
    <div
      className={styles.pagination}
      role="navigation"
      aria-label="Pagination"
    >
      <button
        onClick={() => setPage(currPage - 1)}
        className={`${styles.paginationButton} ${styles.paginationPrevNext} ${
          currPage === 1 ? styles.paginationDisabled : ''
        }`}
        disabled={currPage === 1}
        aria-label="Go to previous page"
      >
        Previous
      </button>

      {renderPageButtons()}

      <button
        onClick={() => setPage(currPage + 1)}
        className={`${styles.paginationButton} ${styles.paginationPrevNext} ${
          currPage === totalPage ? styles.paginationDisabled : ''
        }`}
        disabled={currPage === totalPage}
        aria-label="Go to next page"
      >
        Next
      </button>
    </div>
  );
}
