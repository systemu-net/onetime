import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import { LINKS_ROUTE, PAGES_ROUTE, QR_ROUTE } from '../routes';

const tools = [
  { path: LINKS_ROUTE, label: 'Shorten It!', descr: 'Create new short link' },
  { path: QR_ROUTE, label: 'Make it scannable!', descr: 'Go to QR codes' },
  { path: PAGES_ROUTE, label: 'Create landing page', descr: 'Go to landing pages' },
];

const DashboardPage = () => {
  const [cookies] = useCookies(['plan']);
  const handleUpgrade = (e) => {
    e.preventDefault();
    window.location.href = '/_pricing';
  }

  return (
    <MainLayout>
      <h1 className="text-2xl mb-4 text-gray-700">Your Tools</h1>
      <div className="grid lg:grid-cols-3 gap-10">
        {tools.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="block max-w-sm p-6 bg-white border border-gray-200 rounded-md shadow hover:bg-gray-100"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-700">
              {item.label}
            </h5>
            <p className="font-normal text-gray-700">
              {item.descr}
            </p>
          </Link>
        ))}
      </div>
      <h1 className="text-2xl my-4 text-gray-700">Plan Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-80 border">
        <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-semibold">{cookies.plan.name} plan</h2>
            <button onClick={handleUpgrade} className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700">Upgrade</button>
        </div>
        <div className="mt-4">
            <p className="font-medium">Included in your plan:</p>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              {cookies.plan.features.map((feature) => (
                <li className="flex items-center gap-2"><span>&#10003;</span> {feature.used}/{feature.limit} {feature.name} per month</li>
              ))}
            </ul>
        </div>
    </div>
    </MainLayout>
  );
};
export default DashboardPage;
