import {Link} from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import {LINKS_ROUTE, QR_ROUTE} from '../routes';

const tools = [
  {path: LINKS_ROUTE, label: 'Shorten It!', descr: 'Create new short link'},
  {path: QR_ROUTE, label: 'Make it scannable!!', descr: 'Go to QR codes'},
];

const DashboardPage = () => {
  return (
    <MainLayout>
      <h1 className="text-2xl mb-4 text-gray-700">Your Tools</h1>
      <div className="grid grid-cols-3 gap-4">
        {tools.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="block max-w-sm p-6 bg-white border border-gray-200 rounded-md shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-700 dark:text-white">
              {item.label}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              {item.descr}
            </p>
          </Link>
        ))}
      </div>
    </MainLayout>
  );
};
export default DashboardPage;
