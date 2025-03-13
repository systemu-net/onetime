import Box from '@/components/Box';
import { Button } from '@/components/elements/button';
import FancyButton from '@/components/FancyButton';
import { useCookies } from 'react-cookie';
import MainLayout from '../components/layouts/MainLayout';
import { LINKS_ROUTE, PAGES_ROUTE, QR_ROUTE } from '../routes';

const tools = [
  { path: LINKS_ROUTE, label: 'Shorten It!', descr: 'Create new short link' },
  { path: QR_ROUTE, label: 'Make it scannable!', descr: 'Go to QR codes' },
  {
    path: PAGES_ROUTE,
    label: 'Create landing page',
    descr: 'Go to landing pages',
  },
];

const DashboardPage = () => {
  const [cookies] = useCookies(['plan']);
  return (
    <MainLayout>
      <h1 className="text-2xl mb-4">Your Tools</h1>
      <div className="grid lg:grid-cols-3 gap-4">
        {tools.map((item) => (
          <FancyButton key={item.label} to={item.path}>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-700 dark:text-white">
              {item.label}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              {item.descr}
            </p>
          </FancyButton>
        ))}
      </div>
      <h1 className="text-2xl my-4">Plan Details</h1>
      {cookies?.plan && (
        <div className='w-1/3'>
          <Box className="border mr-2.5">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-semibold">{cookies.plan.name} plan</h2>
              <Button to={'/_pricing'}>Upgrade</Button>
            </div>
            <div className="mt-4">
              <p className="font-medium">Included in your plan:</p>
              <ul className="mt-2 space-y-2 text-sm">
                {cookies?.plan?.features?.map((feature) => (
                  <li className="flex items-center gap-2">
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
