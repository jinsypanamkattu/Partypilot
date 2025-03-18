import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import HeroCarousel from './HeroCarousel';

function MainLayout({ children }) {
  return (
    <div className="main-layout">
     <Navbar />
     <HeroCarousel />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;