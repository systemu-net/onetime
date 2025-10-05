import { API_URL } from '@/apis/config';
import FancyButton from '@/components/FancyButton';
import { useCookies } from 'react-cookie';
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
      <h1 className="text-2xl mb-4">Your Dashboards</h1>
      <div className="grid lg:grid-cols-3 gap-4">
        {tools.map((item) => (
          <FancyButton
            to={item.path}
            onClick={handleClickBilling}
            key={item.label}
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight">
              {item.label}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              {item.descr}
            </p>
          </FancyButton>
        ))}
      </div>
    </MainLayout>
  );
};
export default SettingsPage;
