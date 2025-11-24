import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer'; // Debes crear este componente

const MainLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* Aquí se renderizarán las páginas públicas */}
      </main>
      <Footer />
    </>
  );
};
export default MainLayout;