'use client';

import * as React from 'react';
import CartMiniSheet from './cart-mini-sheet';

// Wrapper preserved for compatibility with existing imports.
// The implementation has been migrated to a shadcn Sheet in `cart-mini-sheet.tsx`.
export default function CartMiniSidebar(): React.ReactElement {
  return <CartMiniSheet />;
}
