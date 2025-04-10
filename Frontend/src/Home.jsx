import React from 'react';
import Hero from './components/Hero';
import About from './components/AboutUs';
import './Home.css'; 

const Home = () => {
  return (
    
    <div>
        <Hero/>
        <div className = "home-description">
            <h3>Our Mission</h3>
            <p>Through technology and compassion, we strive to improve communication, reduce wait times, and make healthcare more accessible and efficient for our communities. Whether you need a primary care doctor or specialist, we have appointments available close to work or home.</p>
            <h3> Languages we can work with includes </h3>
                <p>Arabic Spanish</p>
        </div>
    </div>
  );
};

export default Home;
