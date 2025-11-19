import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Projects from './pages/Projects';
import TestPages from './pages/TestPages';
import ColorPicker from './pages/ColorPicker';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tests" element={<TestPages />} />
        <Route path="color-picker" element={<ColorPicker />} />
      </Route>
    </Routes>
  );
}

export default App;
