import CategoryShowcase from '@/components/version-tsx/category-showcase';
import HeroBanner from '@/components/version-tsx/hero-banner';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';

export async function generateMetadata() {
  const cmsData = await getPageMetadata('home');
  return buildPageMetadata('home', cmsData, {
    title: 'East West Off Road | Premium Automotive & Off-Road Gear USA',
    description:
      'Discover high-performance automotive & off-road parts at East West Offroad (EWO) USA! 🛠️ Durable, reliable, and adventure-ready gear for trucks, Jeeps & 4x4s. Shop now for exclusive deals!',
    keywords:
      'Automotive off-road parts USA, East West Offroad EWO, Jeep & truck accessories, Best off-road gear 2024, 4x4 performance upgrades, Durable automotive parts, Off-road suspension kits, Adventure-ready truck mods, USA-made off-road equipment, Top-rated automotive upgrades, hd crossover steering kit',
    canonical: '/',
  });
}

export default async function HomePage() {
  return (
    <>
      <HeroBanner />

      {/* Hero Section Content */}
      <section className="w-full bg-white py-6 md:py-8 lg:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
              Premium Off-Road Steering Parts & DANA 60/44 Components | East West Offroad
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Shop high-performance off-road steering parts, DANA 60 & DANA 44 tie rod ends, high steer arms & crossover kits. Quality steering components for 4x4 trucks & Jeeps.
            </p>
          </div>
        </div>
      </section>

      <CategoryShowcase />

      {/* About & What We Offer Section */}
      <section className="w-full bg-gradient-to-b from-gray-50 to-white py-10 md:py-14 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* About Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
                  About
                </h2>
                <div className="w-16 h-1 bg-primary mx-auto mb-6 md:mb-8 rounded-full"></div>
                <div className="space-y-4">
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    East West Offroad specializes in heavy-duty off-road steering components and DANA 60/DANA 44 parts designed for serious 4x4 enthusiasts, Jeep owners, and truck builders.
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    Whether you're upgrading your stock steering system for trail performance or building a hardcore rock crawler, our extensive inventory of steering linkage parts delivers the strength and durability your rig demands.
                  </p>
                </div>
              </div>

              {/* What We Offer Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
                  What We Offer
                </h2>
                <div className="w-16 h-1 bg-primary mx-auto mb-6 md:mb-8 rounded-full"></div>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-4 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Heavy Duty One Ton Tie Rod Ends and High Angle Drag Links for all Dana 44 and Dana 60 Kingpin Applications
                    </p>
                  </div>

                  <div className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-4 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      High steer arms and crossover steering kits for lifted vehicles
                    </p>
                  </div>

                  <div className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-4 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Steering knuckles and suspension components
                    </p>
                  </div>

                  <div className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-4 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Heavy-duty pitman arms and ball joints for aggressive off-roading
                    </p>
                  </div>

                  <div className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-4 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      DOM tubes and stud kits for custom builds
                    </p>
                  </div>

                  <div className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-4 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Steering maintenance and upgrade kits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
