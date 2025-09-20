import { Alert, AlertDescription } from '@/components/ui/alert';
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
  AlertTriangle,
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Returns - East West Offroad',
  alternates: {
    canonical: '/returns',
  },
};

export default function ReturnsPage() {
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
                  Returns
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Refund and Return Policy
          </h1>
          <Badge variant="secondary" className="text-base px-4 py-2">
            Effective Date: April 27, 2025
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              At East West Offroad Products LLC, your satisfaction is important
              to us. If for any reason you are not completely satisfied with
              your purchase, we offer a simple and transparent return policy.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Return Period Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Clock className="w-6 h-6 text-primary" />
                1. Return Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                You have{' '}
                <span className="font-semibold text-foreground">30 days</span>{' '}
                from the date of delivery to return any item for any reason.
              </p>
            </CardContent>
          </Card>

          {/* Return Conditions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="w-6 h-6 text-primary" />
                2. Return Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Items must be returned in new, unused, and uninstalled
                    condition.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Items must include all original packaging, hardware, and
                    accessories.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Returns that are damaged, used, or missing parts may be
                    subject to additional fees or denied.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Restocking Fee Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <RefreshCw className="w-6 h-6 text-primary" />
                3. Restocking Fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    All returns are subject to a{' '}
                    <span className="font-semibold text-foreground">
                      15% restocking fee
                    </span>{' '}
                    unless you qualify for a special case.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    The restocking fee will be deducted from your refund amount.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Non-Returnable Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <AlertTriangle className="w-6 h-6 text-primary" />
                4. Non-Returnable Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Certain items are non-returnable, including:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Any item sold as "Non Returnable"
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How to Start a Return Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Mail className="w-6 h-6 text-primary" />
                5. How to Start a Return
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                To initiate a return, please contact us at:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Email:
                    </span>
                    <br />
                    <a
                      href="mailto:info@eastwestoffroad.com"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      info@eastwestoffroad.com
                    </a>
                  </div>
                </div>
                {/* <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Phone:
                    </span>
                    <br />
                    <a
                      href="tel:1-866-396-7623"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      1-866-EWO-ROAD (396-7623)
                    </a>
                  </div>
                </div> */}
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground leading-relaxed">
                  We will provide you with a Return Authorization (RA) number
                  and instructions for sending your item back.
                </p>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Returns without a valid RA number will not be accepted.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Refund Processing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <RefreshCw className="w-6 h-6 text-primary" />
                6. Refund Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Once we receive and inspect your return, we will issue a
                    refund to your original method of payment.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Refunds are typically processed within{' '}
                    <span className="font-semibold text-foreground">
                      7–10 business days
                    </span>{' '}
                    after we receive the returned item.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Shipping charges are non-refundable.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Return Shipping Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="w-6 h-6 text-primary" />
                7. Return Shipping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Customers are responsible for return shipping costs.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    We recommend using a trackable shipping service and
                    purchasing shipping insurance.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    We are not responsible for returns lost in transit.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Need help or have questions about your return?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground text-center">
                Contact us anytime — we're happy to assist you!
              </p>

              <div className="bg-muted/50 rounded-lg p-6">
                <div className="text-center space-y-4">
                  <h4 className="font-semibold text-foreground">
                    East West Offroad Products LLC
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <a
                        href="mailto:info@eastwestoffroad.com"
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        info@eastwestoffroad.com
                      </a>
                    </div>
                    {/* <div className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <a
                        href="tel:1-866-396-7623"
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        1-866-EWO-ROAD
                      </a>
                    </div> */}
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        PO Box 2644 Everett WA 98213
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button asChild size="lg">
                  <Link href="/contact" className="flex items-center gap-2">
                    Contact Support
                    <ArrowRight className="w-5 h-5" />
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
