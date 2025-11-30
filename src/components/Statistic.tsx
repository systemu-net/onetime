import { useEffect, useRef, useState } from 'react';
import BrandImage from '../assets/icon-brand-recognition.svg';
import DetailedImage from '../assets/icon-detailed-records.svg';
import CustomizableImage from '../assets/icon-fully-customizable.svg';
import Card from './Card';

const Statistic = () => {
  const [isVisible, setIsVisible] = useState([false, false, false]);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((card, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible((prev) => {
            const updated = [...prev];
            updated[index] = entry.isIntersecting; // Set true when entering, false when exiting
            return updated;
          });
        },
        { threshold: 0.3 }
      );

      if (card) {
        observer.observe(card);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <section className="statistics">
      <div className="container">
        <div className="statistics__title">
          <h2>Advanced Statistics</h2>
          <p>
            Track how your links are performing across the web with our advanced
            statistics dashboard.
          </p>
        </div>

        {/* Cards */}
        <div className="statistics__cards">
          {/* Card 1 */}
          <div
            ref={(el) => (cardRefs.current[0] = el!)}
            className={`transition-all duration-700 ease-out delay-0 ${isVisible[0] ? 'translate-x-0 opacity-100' : '-translate-y-12 opacity-0'
              }`}
          >
            <Card
              image={BrandImage}
              className="brand"
              title={'Brand Recognition'}
              description="Boost your brand recognition with each click. Generic links don’t mean a thing. Branded links help instil confidence in your content."
              alt="Brand Recognition"
            />
          </div>

          {/* Card 2 */}
          <div
            ref={(el) => (cardRefs.current[1] = el!)}
            className={`transition-all duration-700 ease-out delay-150 ${isVisible[1] ? 'translate-x-0 opacity-100' : '-translate-y-12 opacity-0'
              }`}
          >
            <Card
              image={DetailedImage}
              className="detailed"
              title={'Detailed Records'}
              description="Gain insights into who is clicking your links. Knowing when and where people engage with your content helps inform better decisions."
              alt="Detailed Records"
            />
          </div>

          {/* Card 3 */}
          <div
            ref={(el) => (cardRefs.current[2] = el!)}
            className={`transition-all duration-700 ease-out delay-300 ${isVisible[2] ? 'translate-x-0 opacity-100' : '-translate-y-12 opacity-0'
              }`}
          >
            <Card
              image={CustomizableImage}
              title={'Fully Customizable'}
              description="Improve brand awareness and content discoverability through customizable links, supercharging audience engagement."
              alt="Fully Customizable"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistic;
