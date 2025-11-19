import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Terminal, FlaskConical, ArrowRight } from 'lucide-react';

const Lab = () => {
    return (
        <section id="lab" className="container reveal active">
            <div className="section-header">
                <span className="section-label">The Lab</span>
                <h2 className="section-title">Experiments & Thoughts</h2>
            </div>

            <div className="grid">
                <Link to="/blog" className="card" style={{ textDecoration: 'none', borderColor: 'var(--secondary)' }}>
                    <div className="card-icon" style={{ color: 'var(--secondary)', background: 'var(--secondary-glow)' }}>
                        <BookOpen size={24} />
                    </div>
                    <h3>Security Blog</h3>
                    <p>Deep dives into recent vulnerabilities, CTF writeups, and defense strategies.</p>
                    <span className="link-arrow">Read Articles <ArrowRight size={16} /></span>
                </Link>

                <Link to="/projects" className="card" style={{ textDecoration: 'none', borderColor: 'var(--accent)' }}>
                    <div className="card-icon" style={{ color: 'var(--accent)', background: 'rgba(192, 132, 252, 0.1)' }}>
                        <Terminal size={24} />
                    </div>
                    <h3>Side Projects</h3>
                    <p>Experimental tools, coding playgrounds, and open source contributions.</p>
                    <span className="link-arrow">Explore <ArrowRight size={16} /></span>
                </Link>

                <Link to="/tests" className="card" style={{ textDecoration: 'none', borderColor: 'var(--text-muted)' }}>
                    <div className="card-icon" style={{ color: 'var(--text)', background: 'rgba(255, 255, 255, 0.05)' }}>
                        <FlaskConical size={24} />
                    </div>
                    <h3>Test Pages</h3>
                    <p>UI components, layout tests, and design system documentation.</p>
                    <span className="link-arrow">View Tests <ArrowRight size={16} /></span>
                </Link>
            </div>
        </section>
    );
};

export default Lab;
