import ShortenForm from '../components/elements/ShortenForm';
import MainLayout from '../components/layouts/MainLayout';
import {LinksList} from '../components/sections/LinksList';

const LinksPage = () => {
  return (
    <MainLayout>
      <ShortenForm />
      <h1 className="text-2xl my-4 pt-4 text-gray-700">Thinly links</h1>
      <LinksList />
    </MainLayout>
  );
};
export default LinksPage;
