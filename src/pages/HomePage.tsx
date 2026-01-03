import Footer from '../components/Footer';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Shorten from '../components/Shorten';
import Statistic from '../components/Statistic';

const HomePage = () => {
  return (
    <div className="dark:bg-zinc-900">
      <div>
        <Header />
        <Hero />

        <Shorten />

        <Statistic />

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
