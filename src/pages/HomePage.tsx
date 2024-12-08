import Boost from '../components/Boost'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Shorten from '../components/Shorten'
import Statistic from '../components/Statistic'
import Sidebar from '../components/Sidebar'

const HomePage = () => {
  return (
    <div className=''>
      <Sidebar />
      <div className='m-auto'>
        <Header />
        <Hero />

        <Shorten />

        <Statistic />

        <Footer />
      </div>
    </div>
  )
}

export default HomePage
