import { API_URL } from '@/apis/config';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';

const tools = [
  { path: '#', label: 'Billing', descr: 'View your billing dashboard' },
];

const SettingsPage = () => {
  const [cookies] = useCookies(['token']);
  const handleClickBilling = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/billings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': cookies.token
        }
      });

      if (response.ok) {
        const { url } = await response.json();

        window.location.href = url;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message); // throw error message if not successful
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <MainLayout>
      <h1 className="text-2xl mb-4 text-gray-700">Your Dashboards</h1>
      <div className="grid lg:grid-cols-3 gap-4">
        {tools.map((item) => (
          <Link
            to={item.path}
            onClick={handleClickBilling}
            key={item.label}
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
    </MainLayout>
  );
};
export default SettingsPage;
