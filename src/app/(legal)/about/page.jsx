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
import { ArrowRight, Award, Shield, Target, Truck, Users } from 'lucide-react';
import Link from 'next/link';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';

export async function generateMetadata() {
  const cmsData = await getPageMetadata('about');
  return buildPageMetadata('about', cmsData, {
    title: 'About Us - East West Offroad',
    description:
      'Learn about East West Offroad\'s mission to deliver quality steering and suspension products at affordable prices for off-road enthusiasts.',
    canonical: '/about',
  });
}

export default function AboutPage() {
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
                  About Us
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What We Do
          </h1>
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              At East West Offroad Products LLC, we are passionate about helping
              off-roading enthusiasts conquer the trails with confidence and
              reliability.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We specialize in crafting high-quality steering and suspension
              components — without the inflated price tag.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl lg:text-3xl">
              <Target className="w-8 h-8 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe that every off-roader deserves access to durable,
              performance-driven parts without overpaying.
            </p>
            <p className="text-base text-muted-foreground">
              Our mission is simple:
            </p>
            <p className="text-xl font-semibold text-foreground leading-relaxed">
              Deliver top-tier steering and suspension products at affordable
              prices to fuel your next adventure.
            </p>
          </CardContent>
        </Card>

        {/* What Sets Us Apart Section */}
        <div className="mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground text-center mb-8">
            What Sets Us Apart
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Award className="w-6 h-6 text-primary" />
                  Superior Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We use premium American materials and proven manufacturing
                  techniques to build parts that withstand the harshest
                  terrains.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Shield className="w-6 h-6 text-primary" />
                  Affordable Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We limit our operational cost and excessive markups, bringing
                  you exceptional components at a fair price.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Truck className="w-6 h-6 text-primary" />
                  Off-Road Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We design, test, and fine-tune our products specifically for
                  the needs of real off-road enthusiasts — because that's who we
                  are too.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Users className="w-6 h-6 text-primary" />
                  Customer Commitment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Your satisfaction drives everything we do. We proudly back our
                  products with a 100% guarantee.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final Statement */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <p className="text-lg text-muted-foreground text-center leading-relaxed mb-6">
              Whether you're building a rock crawler, trail rig, or overlanding
              setup, our components are engineered to perform when it matters
              most.
            </p>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl mb-4">
              Ready to upgrade your off-road machine?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Explore our full lineup at{' '}
              <Link
                href="/"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                www.eastwestoffroad.com
              </Link>{' '}
              and experience the East West Offroad difference.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/shop" className="flex items-center gap-2">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
