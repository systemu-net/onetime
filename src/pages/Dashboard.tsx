import Box from '@/components/Box';
import { Button } from '@/components/elements/button';
import { qrCodeBase64Image } from '@/components/images/qrCodeBase64Image';
import { shortenBase64Image } from '@/components/images/shortenBase64Image';
import { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { pageBase64Image } from '../components/images/pageBase64Image';
import MainLayout from '../components/layouts/MainLayout';
import { LINKS_ROUTE, PAGES_ROUTE, QR_ROUTE } from '../routes';

const tools = [
  { path: LINKS_ROUTE, label: 'Create Short Link', descr: 'Create new short link', image: shortenBase64Image },
  { path: QR_ROUTE, label: 'Make it scannable!', descr: 'Go to QR codes', image: qrCodeBase64Image },
  {
    path: PAGES_ROUTE,
    label: 'Create landing page',
    descr: 'Go to landing pages',
    image: pageBase64Image
  }
];

const DashboardPage = () => {
  const [cookies] = useCookies(['plan']);
  const [isToolsVisible, setIsToolsVisible] = useState(false);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const toolsRef = useRef(null);
  const planRef = useRef(null);

  useEffect(() => {
    const toolsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsToolsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const planObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPlanVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (toolsRef.current) {
      toolsObserver.observe(toolsRef.current);
    }

    if (planRef.current) {
      planObserver.observe(planRef.current);
    }

    return () => {
      if (toolsRef.current) {
        toolsObserver.unobserve(toolsRef.current);
      }
      if (planRef.current) {
        planObserver.unobserve(planRef.current);
      }
    };
  }, []);

  return (
    <MainLayout>
      <h1 className="text-2xl mb-4">Your Tools</h1>
      <div ref={toolsRef} className="grid lg:grid-cols-3 gap-4">
        {tools.map((item, index) => (
          <Link
            key={item.label}
            to={item.path}
            className={`block max-w-sm bg-white border border-gray-200 rounded-md shadow overflow-hidden transition-all duration-700 ease-out hover:shadow-lg ${isToolsVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0'
              }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            {/* Container with flex to split horizontally */}
            <div className="flex h-24 ">
              {/* Left half - Background image */}
              <div className="w-2/3 p-6 flex flex-col justify-center">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-700">
                  {item.label}
                </h5>
                <p className="font-normal text-gray-700 text-sm">
                  {item.descr}
                </p>
              </div>
              {/* Right half - Content */}
              <div
                className="w-1/3 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${item.image})` }}
              >
              </div>
            </div>
          </Link>
        ))}
      </div>
      <h1 className="text-2xl my-4">Plan Details</h1>
      {cookies?.plan && (
        <div
          ref={planRef}
          className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 transition-all duration-700 ease-out ${isPlanVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-8 opacity-0'
            }`}
        >
          <Box className="border hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 gap-3">
              <h2 className="text-lg font-semibold">{cookies.plan.name} plan</h2>
              <Button to={'/_pricing'} className="w-full sm:w-auto">Upgrade</Button>
            </div>
            <div className="mt-4">
              <p className="font-medium">Included in your plan:</p>
              <ul className="mt-2 space-y-2 text-sm">
                {cookies?.plan?.features?.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>&#10003;</span> {feature.used}/{feature.limit}{' '}
                    {feature.name} per month
                  </li>
                ))}
              </ul>
            </div>
          </Box>
        </div>
      )}
    </MainLayout>
  );
};
export default DashboardPage;