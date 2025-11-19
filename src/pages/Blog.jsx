import React from 'react';

const Blog = () => {
    return (
        <div className="container" style={{ paddingTop: '120px' }}>
            <div className="section-header">
                <span className="section-label">The Lab</span>
                <h2 className="section-title">Security Blog</h2>
                <p style={{ color: 'var(--text-muted)' }}>Deep dives into recent vulnerabilities, CTF writeups, and defense strategies.</p>
            </div>
            <div className="card">
                <h3>Coming Soon</h3>
                <p>Stay tuned for the first article.</p>
            </div>
        </div>
    );
};

export default Blog;
