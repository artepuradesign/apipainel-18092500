import { useState, useEffect, useCallback } from "react";
import { Battery, Shield, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import heroBanner1 from "@/assets/hero-banner.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";

const banners = [
  {
    image: heroBanner1,
    title: "Apple",
    subtitle: "Confira nossa linha de produtos em condições excelentes!",
  },
  {
    image: heroBanner2,
    title: "iPhone",
    subtitle: "Os melhores iPhones com garantia e qualidade!",
  },
  {
    image: heroBanner3,
    title: "MacBook",
    subtitle: "MacBooks revisados por especialistas Apple!",
  },
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  return (
    <section className="relative w-full">
      <div 
        className="relative h-72 sm:h-64 md:h-80 lg:h-96 overflow-hidden cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-1 md:mb-2">
                  {banner.title}
                </h1>
                <p className="text-background/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-xs sm:max-w-md">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows - Hidden on very small screens */}
        <button
          onClick={goToPrev}
          className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-background p-1.5 md:p-2 rounded-full transition-colors items-center justify-center"
          aria-label="Banner anterior"
        >
          <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
        </button>
        <button
          onClick={goToNext}
          className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-background p-1.5 md:p-2 rounded-full transition-colors items-center justify-center"
          aria-label="Próximo banner"
        >
          <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
                index === currentSlide
                  ? "bg-background"
                  : "bg-background/40 hover:bg-background/60"
              }`}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Guarantee badges */}
      <div className="bg-secondary py-3 md:py-4">
        <div className="container">
          <div className="flex items-center justify-center gap-4 md:gap-6 lg:gap-12 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <Battery className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <span className="text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Bateria acima de 80%</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <span className="text-[10px] sm:text-xs md:text-sm whitespace-nowrap">3 meses de garantia</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 md:gap-2 shrink-0">
              <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <span className="text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Revisado por especialistas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
