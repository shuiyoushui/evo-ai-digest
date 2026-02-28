import { useState, useEffect, useCallback } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export interface BannerSlide {
  id: string;
  title: string;
  cta: string;
  link: string;
  active: boolean;
  gradient: string;
}

// Simulating data fetched from Admin Config
export const defaultBannerSlides: BannerSlide[] = [
  {
    id: "b1",
    title: "上架 Agent Hunt 即可免费瓜分万亿曝光",
    cta: "立即体验",
    link: "#",
    active: true,
    gradient: "from-blue-600/90 via-indigo-600/80 to-violet-700/90",
  },
  {
    id: "b2",
    title: "CSDN 创作者计划 — 加入 AI 流量扶持计划",
    cta: "了解详情",
    link: "#",
    active: true,
    gradient: "from-emerald-600/90 via-teal-600/80 to-cyan-700/90",
  },
  {
    id: "b3",
    title: "Vibe Coding 时代 — 非程序员的顶级工具推荐",
    cta: "查看推荐",
    link: "#",
    active: true,
    gradient: "from-amber-600/90 via-orange-600/80 to-rose-700/90",
  },
];

interface HomeBannerProps {
  slides?: BannerSlide[];
}

export function HomeBanner({ slides = defaultBannerSlides }: HomeBannerProps) {
  const activeSlides = slides.filter((s) => s.active);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

  // Auto-play
  useEffect(() => {
    if (!api || activeSlides.length <= 1) return;
    const interval = setInterval(() => api.scrollNext(), 4500);
    return () => clearInterval(interval);
  }, [api, activeSlides.length]);

  const goTo = useCallback((i: number) => api?.scrollTo(i), [api]);

  if (activeSlides.length === 0) return null;

  return (
    <div className="mb-6">
      <Carousel opts={{ loop: true }} setApi={setApi} className="relative group">
        <CarouselContent>
          {activeSlides.map((slide, i) => (
            <CarouselItem key={slide.id}>
              <div
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${slide.gradient} aspect-[3/1] flex items-center`}
              >
                {/* Abstract tech pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-white/8 blur-2xl" />
                  <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-l from-white/5 to-transparent" />
                  {/* Grid lines */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`grid-${i}`} width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.3" opacity="0.3" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#grid-${i})`} />
                  </svg>
                </div>

                <div className="relative z-10 px-8 md:px-12 lg:px-16 w-full">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight max-w-2xl drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <Button
                    size="sm"
                    className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm gap-1.5"
                  >
                    {slide.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 border-white/20 text-white hover:bg-black/60" />
        <CarouselNext className="right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 border-white/20 text-white hover:bg-black/60" />

        {/* Dots */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {activeSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </div>
  );
}
