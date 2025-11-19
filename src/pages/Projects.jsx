import React from 'react';

const Projects = () => {
    return (
        <div className="container" style={{ paddingTop: '120px' }}>
            <div className="section-header">
                <span className="section-label">The Lab</span>
                <h2 className="section-title">Side Projects</h2>
                <p style={{ color: 'var(--text-muted)' }}>Experimental tools, coding playgrounds, and open source contributions.</p>
            </div>
            <div className="grid">
                <div className="card">
                    <h3>Color Picker</h3>
                    <p>A simple color picker tool for developers.</p>
                    <a href="/color-picker" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>Try it out</a>
                </div>
            </div>
        </div>
    );
};

export default Projects;
