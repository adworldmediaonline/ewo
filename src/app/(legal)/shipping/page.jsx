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
  CheckCircle,
  Clock,
  Globe,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping Policy | East West Offroad Products LLC – Fast & Reliable Delivery',
  description:
    'Explore East West Offroad\'s fast, reliable shipping policy. Learn about processing times, delivery methods, and international shipping options for off-road parts.',
  keywords:
    'east west offroad shipping policy, off-road parts shipping usa, dana 60 steering parts delivery, custom 4x4 fabrication shipping, usa offroad suspension delivery, heavy duty truck parts shipping, offroad accessories shipping usa, international offroad parts delivery',
  alternates: {
    canonical: '/shipping',
  },
};

export default function ShippingPage() {
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
                  Shipping Policy
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Shipping Policy
          </h1>
          <Badge variant="secondary" className="text-base px-4 py-2">
            Effective Date: April 27, 2025
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              At East West Offroad Products LLC, we take pride in delivering
              high-quality off-road parts and accessories safely and on time. Our
              goal is to ensure every order reaches you quickly, securely, and with
              full transparency.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* 1. Order Processing Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Clock className="w-6 h-6 text-primary" />
                1. Order Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  Orders are processed Monday through Friday, excluding weekends
                  and public holidays.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  Most in-stock items are processed and shipped within 2–4
                  business days from the date of purchase.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  During high-volume periods (sales, holidays), processing times
                  may be slightly longer.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  For urgent or time-sensitive orders, please contact us before
                  placing your order to confirm availability and shipping times.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Shipping Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Truck className="w-6 h-6 text-primary" />
                2. Shipping Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We ship using UPS and US Postal Service (USPS) to ensure reliable
                and trackable delivery.
              </p>

              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Standard Shipping:
                  </h3>
                  <ul className="space-y-2 ml-7">
                    <li className="text-muted-foreground leading-relaxed">
                      • Automatically applied to all online orders at checkout.
                    </li>
                    <li className="text-muted-foreground leading-relaxed">
                      • Estimated delivery times vary depending on your location.
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-primary" />
                    Expedited Shipping (Next Day, 1 to 2 Days): Monday – Friday
                  </h3>
                  <ul className="space-y-2 ml-7">
                    <li className="text-muted-foreground leading-relaxed">
                      • Available by phone order only.
                    </li>
                    <li className="text-muted-foreground leading-relaxed">
                      • Orders requiring same-day shipping must be placed before
                      1:30 PM (Pacific Time) and may include an additional
                      handling charge.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Shipping Coverage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Globe className="w-6 h-6 text-primary" />
                3. Shipping Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  We currently ship across the United States and to select
                  international destinations.
                </p>
              </div>
              <ul className="space-y-2 ml-8">
                <li className="text-muted-foreground leading-relaxed">
                  • International customers are responsible for all customs
                  duties, import taxes, and local delivery fees.
                </li>
                <li className="text-muted-foreground leading-relaxed">
                  • East West Offroad Products LLC is not responsible for
                  international customs delays or additional charges imposed by
                  local authorities.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 4. Large or Custom Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="w-6 h-6 text-primary" />
                4. Large or Custom Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                Some large, heavy, or custom-built orders may require additional
                handling or extended lead times based on inventory availability.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If your order is custom-fabricated or made to order, our team will
                contact you to confirm delivery estimates before shipping.
              </p>
            </CardContent>
          </Card>

          {/* 5. Shipping Confirmation & Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <PackageCheck className="w-6 h-6 text-primary" />
                5. Shipping Confirmation & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                Once your order has shipped, you will receive a confirmation email
                with tracking details.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can track your shipment directly through the carrier's website
                for the most accurate delivery updates.
              </p>
            </CardContent>
          </Card>

          {/* 6. Delivery Inspection & Damages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <AlertTriangle className="w-6 h-6 text-primary" />
                6. Delivery Inspection & Damages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Please inspect your order immediately upon arrival.
              </p>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Report any of the following issues within 30 days of delivery:
                </p>
                <ul className="space-y-2 ml-7">
                  <li className="text-muted-foreground leading-relaxed">
                    • Missing or incorrect parts
                  </li>
                  <li className="text-muted-foreground leading-relaxed">
                    • Visible shipping damage
                  </li>
                  <li className="text-muted-foreground leading-relaxed">
                    • Damaged packaging
                  </li>
                </ul>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                We cannot be held liable for items reported missing or damaged
                after 30 days or for parts damaged due to mishandling after
                receipt.
              </p>
            </CardContent>
          </Card>

          {/* 7. International Duties & Taxes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Globe className="w-6 h-6 text-primary" />
                7. International Duties & Taxes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                For international shipments, customers are responsible for paying:
              </p>
              <ul className="space-y-2 ml-7">
                <li className="text-muted-foreground leading-relaxed">
                  • Customs duties
                </li>
                <li className="text-muted-foreground leading-relaxed">
                  • Import taxes
                </li>
                <li className="text-muted-foreground leading-relaxed">
                  • Local handling fees
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                These charges are not included in the product price or shipping
                cost and must be paid at the time of delivery.
              </p>
            </CardContent>
          </Card>

          {/* 8. Lost or Delayed Shipments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="w-6 h-6 text-primary" />
                8. Lost or Delayed Shipments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                In the rare event that a shipment is lost or delayed, please
                contact our support team.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We will assist in filing a claim with the shipping carrier and help
                resolve the issue as quickly as possible.
              </p>
            </CardContent>
          </Card>

          {/* 9. Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Mail className="w-6 h-6 text-primary" />
                9. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                For any shipping-related questions or urgent delivery requests,
                please reach out to us:
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email:</p>
                    <a
                      href="mailto:info@eastwestoffroad.com"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      info@eastwestoffroad.com
                    </a>
                  </div>
                </div>

                {/* <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Mailing Address:
                    </p>
                    <p className="leading-relaxed">
                      East West Offroad Products LLC
                      <br />
                      PO Box 2644, Everett, WA 98213, USA
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Customer Support Hours:
                    </p>
                    <p className="leading-relaxed">
                      Monday – Friday | 9:00 AM – 5:00 PM (Pacific Time)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-12 text-center">
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

