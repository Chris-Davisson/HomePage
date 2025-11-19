import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState('dark');
    const location = useLocation();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const isHome = location.pathname === '/';

    const getLink = (hash) => {
        return isHome ? hash : `/${hash}`;
    };

    return (
        <header>
            <div className="nav-container">
                <Link to="/" className="brand" onClick={closeMenu}>
                    <img src="/assets/Security_Lock.png" alt="CD" />
                    Christopher Davisson
                </Link>
                <nav>
                    <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`} id="navLinks">
                        <li><a href={getLink('#about')} className="nav-link" onClick={closeMenu}>About</a></li>
                        <li><a href={getLink('#portfolio')} className="nav-link" onClick={closeMenu}>Work</a></li>
                        <li><a href={getLink('#lab')} className="nav-link" onClick={closeMenu}>Lab</a></li>
                        <li><a href={getLink('#skills')} className="nav-link" onClick={closeMenu}>Skills</a></li>
                        <li><a href={getLink('#contact')} className="nav-link" onClick={closeMenu}>Contact</a></li>
                    </ul>
                </nav>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button className="nav-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
