import React from 'react';

const TestPages = () => {
    return (
        <div className="container" style={{ paddingTop: '120px' }}>
            <div className="section-header">
                <span className="section-label">The Lab</span>
                <h2 className="section-title">Test Pages</h2>
                <p style={{ color: 'var(--text-muted)' }}>UI components, layout tests, and design system documentation.</p>
            </div>
            <div className="card">
                <h3>UI Components</h3>
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                    <button className="btn btn-primary">Primary Button</button>
                    <button className="btn btn-outline">Outline Button</button>
                </div>
            </div>
        </div>
    );
};

export default TestPages;
