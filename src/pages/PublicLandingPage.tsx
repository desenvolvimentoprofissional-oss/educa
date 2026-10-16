import { useEffect, Suspense, lazy } from 'react';
import { HeroBanner } from '../components/showcase/HeroBanner';
import { FeaturedCourses } from '../components/showcase/FeaturedCourses';
import { useHomeStore } from '../store/useHomeStore';
import { FadeIn } from '../components/ui/FadeIn';
import { LazyLoadSection } from '../components/ui/LazyLoadSection';

const FeaturedVagas = lazy(() => import('../components/showcase/FeaturedVagas').then(m => ({ default: m.FeaturedVagas })));
const HowItWorks = lazy(() => import('../components/showcase/HowItWorks').then(m => ({ default: m.HowItWorks })));
const SocialProof = lazy(() => import('../components/showcase/SocialProof').then(m => ({ default: m.SocialProof })));
const Institutions = lazy(() => import('../components/showcase/Institutions').then(m => ({ default: m.Institutions })));
const FaqAccordion = lazy(() => import('../components/showcase/FaqAccordion').then(m => ({ default: m.FaqAccordion })));

export function PublicLandingPage() {
  const { fetchHomeData } = useHomeStore();

  useEffect(() => {
    fetchHomeData();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [fetchHomeData]);

  return (
    <div className="flex flex-col flex-grow bg-white text-black min-h-[120vh] relative">
      <HeroBanner />
      
      <div id="cursos">
        <FadeIn delay={0.1}>
          <FeaturedCourses />
        </FadeIn>
      </div>

      <LazyLoadSection id="vagas" height="500px">
        <Suspense fallback={<div className="min-h-[500px] w-full bg-white animate-pulse" />}>
          <FadeIn delay={0.1}>
            <FeaturedVagas />
          </FadeIn>
        </Suspense>
      </LazyLoadSection>
      
      <LazyLoadSection id="jornada" height="400px">
        <Suspense fallback={<div className="min-h-[400px] w-full bg-gray-50 animate-pulse" />}>
          <FadeIn delay={0.1}>
            <HowItWorks />
          </FadeIn>
        </Suspense>
      </LazyLoadSection>
      
      <LazyLoadSection height="300px">
        <Suspense fallback={<div className="min-h-[300px] w-full bg-white animate-pulse" />}>
          <FadeIn delay={0.1}>
            <SocialProof />
          </FadeIn>
        </Suspense>
      </LazyLoadSection>
      
      <LazyLoadSection id="instituicoes" height="300px">
        <Suspense fallback={<div className="min-h-[300px] w-full bg-white animate-pulse" />}>
          <FadeIn delay={0.1}>
            <Institutions />
          </FadeIn>
        </Suspense>
      </LazyLoadSection>
      
      <LazyLoadSection id="perguntas" height="400px">
        <Suspense fallback={<div className="min-h-[400px] w-full bg-white animate-pulse" />}>
          <FadeIn delay={0.1}>
            <FaqAccordion />
          </FadeIn>
        </Suspense>
      </LazyLoadSection>
    </div>
  );
}
