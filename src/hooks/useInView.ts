import { useState, useEffect, RefObject } from 'react';

export function useInView(ref: RefObject<Element>, options: { once?: boolean; margin?: string } = {}) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (options.once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!options.once) {
          setIsInView(false);
        }
      },
      { rootMargin: options.margin || '0px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options.margin, options.once]);

  return isInView;
}
