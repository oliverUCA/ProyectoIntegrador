import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

const CarouselContext = createContext(null);

const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('Los controles Carousel deben usarse dentro de Carousel.');
  return context;
};

function Carousel({ className, opts, plugins, children, ...props }) {
  const [carouselRef, api] = useEmblaCarousel({ axis: 'x', ...opts }, plugins);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((emblaApi) => {
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return undefined;
    const initialFrame = requestAnimationFrame(() => onSelect(api));
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => {
      cancelAnimationFrame(initialFrame);
      api.off('reInit', onSelect);
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollNext();
    }
  };

  return (
    <CarouselContext.Provider value={{ carouselRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext }}>
      <div
        className={cn('relative', className)}
        onKeyDownCapture={handleKeyDown}
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, children, ...props }) {
  const { carouselRef } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div className={cn('flex touch-pan-y', className)} {...props}>{children}</div>
    </div>
  );
}

function CarouselItem({ className, ...props }) {
  return <div role="group" aria-roledescription="slide" className={cn('min-w-0 shrink-0 grow-0 basis-auto', className)} {...props} />;
}

function CarouselPrevious({ className, ...props }) {
  const { canScrollPrev, scrollPrev } = useCarousel();
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn('absolute left-0 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full border-orange-700 bg-orange-700 text-white hover:bg-orange-800 hover:text-white', className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label="Ver categorías anteriores"
      {...props}
    >
      <ArrowLeft aria-hidden="true" />
    </Button>
  );
}

function CarouselNext({ className, ...props }) {
  const { canScrollNext, scrollNext } = useCarousel();
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn('absolute right-0 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full border-orange-700 bg-orange-700 text-white hover:bg-orange-800 hover:text-white', className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label="Ver categorías siguientes"
      {...props}
    >
      <ArrowRight aria-hidden="true" />
    </Button>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };