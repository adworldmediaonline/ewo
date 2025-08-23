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
  Copyright,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Phone,
  Scale,
  Shield,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Use - East West Offroad',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
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
                  Terms of Use
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Terms of Use
          </h1>
          <Badge variant="secondary" className="text-base px-4 py-2">
            Effective Date: April 27, 2025
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Welcome to East West Offroad Products LLC ("Company," "we,"
                "our," or "us"). These Terms of Use ("Terms") govern your use of
                our website located at www.eastwestoffroad.com
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                By accessing or using the Website, you agree to be bound by
                these Terms. If you do not agree, you may not use our Website.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Use of Website Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Shield className="w-6 h-6 text-primary" />
                1. Use of Website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                You agree to use our Website for lawful purposes only. You may
                not use our Website:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    To violate any applicable laws or regulations.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    To infringe the rights of others, including intellectual
                    property rights.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    To upload or transmit viruses, malware, or harmful code.
                  </span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to restrict or terminate your access to the
                Website at any time without notice if you violate these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Copyright className="w-6 h-6 text-primary" />
                2. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                All content on this Website, including text, graphics, logos,
                images, videos, and software, is the property of East West
                Offroad Products LLC or its licensors, and is protected by U.S.
                and international copyright, trademark, and other intellectual
                property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may not use, copy, modify, distribute, or reproduce any
                content without our prior written permission.
              </p>
            </CardContent>
          </Card>

          {/* Product Information and Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <DollarSign className="w-6 h-6 text-primary" />
                3. Product Information and Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We make every effort to ensure the accuracy of product
                descriptions, images, pricing, and availability. However, we do
                not guarantee that all information on our Website is complete,
                current, or error-free.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to correct any errors, update information,
                or cancel orders if any information is inaccurate at any time
                without prior notice.
              </p>
            </CardContent>
          </Card>

          {/* Payment Terms Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <DollarSign className="w-6 h-6 text-primary" />
                4. Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                All payments must be made at the time of purchase. We accept
                major credit cards and other payment methods as specified on our
                Website.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Prices are listed in U.S. dollars unless otherwise stated.
              </p>
            </CardContent>
          </Card>

          {/* Shipping and Returns Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Truck className="w-6 h-6 text-primary" />
                5. Shipping and Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Shipping and return policies are detailed separately{' '}
                <Link
                  href="/returns"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  here
                </Link>{' '}
                (you can link to your Shipping & Return Policy page). By placing
                an order, you agree to the terms outlined in those policies.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer of Warranties Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <AlertTriangle className="w-6 h-6 text-primary" />
                6. Disclaimer of Warranties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Our Website and products are provided on an "as-is" and
                "as-available" basis.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We disclaim all warranties, express or implied, including
                warranties of merchantability, fitness for a particular purpose,
                and non-infringement.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Scale className="w-6 h-6 text-primary" />
                7. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall East West Offroad Products LLC, its directors,
                employees, or agents be liable for any indirect, incidental,
                special, consequential, or punitive damages arising out of your
                use of the Website or the products purchased through the
                Website.
              </p>
            </CardContent>
          </Card>

          {/* Indemnification Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Shield className="w-6 h-6 text-primary" />
                8. Indemnification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless East West
                Offroad Products LLC from any claims, damages, losses,
                liabilities, and expenses (including attorneys' fees) arising
                from your use of the Website or violation of these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Scale className="w-6 h-6 text-primary" />
                9. Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with the laws of the State of Washington, without regard to
                conflict of law principles.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <FileText className="w-6 h-6 text-primary" />
                10. Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to update or modify these Terms at any time
                without prior notice.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your continued use of the Website after changes means you accept
                the revised Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                For any questions about these Terms, please contact us at:
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
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <a
                        href="tel:1-866-396-7623"
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        1-866-EWO-ROAD
                      </a>
                    </div>
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
                    Contact Us
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
