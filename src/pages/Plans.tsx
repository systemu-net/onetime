import { Heading } from '@/components/elements/heading';
import Pricing from '@/components/Pricing';
import MainLayout from '../components/layouts/MainLayout';

const PlansPage = () => {
  return (
    <MainLayout>
      <Heading className="px-4 sm:px-6 lg:px-8" >Your plans</Heading>
      <div className='px-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900 mt-4 mb-4'>
        <Pricing inline={true} />
      </div>

    </MainLayout>
  );
};

export default PlansPage;
