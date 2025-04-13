import React from 'react';
import Hero from './components/Hero';
import Services from './components/Services/Services';
import './Home.css'; 
import Title from './components/Title/Title';
import Languages from './components/Languages/Languages';

const Home = () => {
  return (
    
    <div>
        <Hero/>
        <Title/>
        <Services/>
        <Languages/>
        <div className = "home-description">
            
        </div>
    </div>
  );
};

export default Home;
