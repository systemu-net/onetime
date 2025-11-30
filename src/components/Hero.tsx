import { useEffect, useRef, useState } from 'react';
import HeroImg from '../assets/working_programmer.svg';
import { AnimatedShortTextIcon } from './icons/AnimatedShortTextIcon';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <section ref={heroRef} className="hero">
      <div className="container">
        <div className="flex">
          {/* Image */}
          <div
            className={`hero__image relative transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
          >
            <img src={HeroImg} alt="" />
            <div className=" absolute top-28 lg:top-36 left-[5.7rem] lg:left-36">
              <AnimatedShortTextIcon
                size={48}
                isAnimating={true}
                className="text-violet-600 dark:text-violet-500"
              />
            </div>
          </div>

          {/* Content */}
          <div className="hero__content">
            <h1
              className={`transition-all duration-700 ease-out ${isVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-12 opacity-0'
                }`}
            >
              More than just shorter links
            </h1>
            <p
              className={`text-gray-500 mb-4 transition-all duration-700 ease-out delay-200 ${isVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-12 opacity-0'
                }`}
            >
              Build your brand's recognition and get detailed insights on how
              your links are performing.
            </p>
            <a
              href="#"
              datatype="narrow"
              className={`btn transition-all duration-700 ease-out delay-300 inline-block ${isVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-12 opacity-0'
                }`}
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
