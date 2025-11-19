import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Portfolio from '../components/Portfolio';
import Lab from '../components/Lab';
import Skills from '../components/Skills';
import Contact from '../components/Contact';

const Home = () => {
    return (
        <>
            <Hero />
            <About />
            <Portfolio />
            <Lab />
            <Skills />
            <Contact />
        </>
    );
};

export default Home;
