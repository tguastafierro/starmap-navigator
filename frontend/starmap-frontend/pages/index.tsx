import '../styles/globals.css';
import type { NextPage, GetServerSideProps } from 'next';
import { Provider } from 'react-redux';
import store from '../redux/store';
import StarMap from '../components/StarMap';
import { StarSystem } from '../types/starTypes';

interface HomePageProps {
  starSystems: StarSystem[];
}

const HomePage: NextPage<HomePageProps> = ({ starSystems }) => {
  return (
    <Provider store={store}>
      <div className="container mx-auto p-4">
        <StarMap starSystems={starSystems} />
      </div>
    </Provider>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('http://localhost:3001/api/star-systems');
  const starSystems = await res.json();

  return {
    props: { starSystems },
  };
};

export default HomePage;
