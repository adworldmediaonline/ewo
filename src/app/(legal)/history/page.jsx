import { Badge } from '@/components/ui/badge';
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
import {
  ArrowRight,
  Award,
  Heart,
  MapPin,
  Mountain,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'History - East West Offroad',
  alternates: {
    canonical: '/history',
  },
};

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
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
                  History
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Built by Off-Roaders, for Off-Roaders.
          </h1>
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              At East West Offroad Products LLC, we didn't start this company
              because it was easy — we started it because it was necessary.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              As off-roading enthusiasts ourselves, we were tired of seeing
              overpriced steering and suspension parts that didn't always
              deliver on quality.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We knew there had to be a better way — so in 2015, we set out to
              create it.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Our Story Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl lg:text-3xl">
                <Mountain className="w-8 h-8 text-primary" />
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                What began as a personal mission to build better rigs has grown
                into a trusted brand known for high-performance, American-made
                steering and suspension components.
              </p>
              <p className="text-base text-muted-foreground">
                We believe in doing things the right way:
              </p>
              <ul className="space-y-3 pl-6">
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Using premium-grade materials sourced from America.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Engineering parts that can handle real-world abuse on rocks,
                    mud, and trails.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Offering honest pricing so you can spend less on parts and
                    more on your adventures.
                  </span>
                </li>
              </ul>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Today, East West Offroad is proud to support thousands of
                off-roaders across the country — from weekend warriors to
                hardcore crawlers.
              </p>
            </CardContent>
          </Card>

          {/* Why Choose Us Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl lg:text-3xl">
                <Award className="w-8 h-8 text-primary" />
                Why Choose Us?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Experience</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We live the off-road lifestyle and know what real vehicles
                    demand.
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Quality</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every product is built with pride, toughness, and precision.
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">
                    Customer First
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We treat every customer the way we would expect to be
                    treated — with respect, honesty, and support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action Section */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl mb-4">
                Join Our Off-Road Family
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Whether you're upgrading your trail rig or building your dream
                  crawler, we're here to help you go farther, climb higher, and
                  push harder.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Thank you for making East West Offroad part of your journey.
                </p>
                <p className="text-xl font-semibold text-foreground">
                  The trail is calling — let's get you ready.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/shop" className="flex items-center gap-2">
                    Shop Products
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contact" className="flex items-center gap-2">
                    Contact Us
                    <MapPin className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
