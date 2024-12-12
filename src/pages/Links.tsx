import Hero from '../components/Hero';
import MainLayout from '../components/layouts/MainLayout';
import Shorten from '../components/Shorten';

const LinksPage = () => {
  return (
    <MainLayout>
      <h1 className="text-2xl mb-4 text-gray-700">Thinly links</h1>

      <Hero />

      <Shorten />
    </MainLayout>
  );
};
export default LinksPage;
