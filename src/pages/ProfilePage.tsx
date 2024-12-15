import MainLayout from '../components/layouts/MainLayout';
import {LINKS_ROUTE, QR_ROUTE} from '../routes';
import {ProfileSection} from '../components/sections/ProfileSection';


const ProfilePage = () => {
  return (
    <MainLayout>
      <ProfileSection />
    </MainLayout>
  );
};
export default ProfilePage;
