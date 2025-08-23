'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import WishlistItem from './wishlist-item';

export default function WishlistArea() {
  const { wishlist } = useSelector((state: any) => state.wishlist);

  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  Wishlist
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 lg:py-24">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-8 pb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Your Wishlist is Empty
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Save your favorite items to your wishlist and come back to
                  them later.
                </p>
                <Button asChild className="w-full">
                  <Link href="/shop" className="flex items-center gap-2">
                    Start Shopping
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center lg:text-left">
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  My Wishlist
                </h1>
                <p className="text-lg text-muted-foreground">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}{' '}
                  saved
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Wishlist Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Saved Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border px-4 sm:px-6">
                      {wishlist.map((item: any, i: number) => (
                        <WishlistItem key={i} product={item} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Wishlist Actions Sidebar */}
              <div className="lg:col-span-1">
                <Card className="lg:sticky lg:top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button asChild className="w-full" size="lg">
                      <Link href="/cart" className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        View Cart
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Link href="/shop" className="flex items-center gap-2">
                        Continue Shopping
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
