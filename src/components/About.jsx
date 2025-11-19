import React from 'react';

const About = () => {
    return (
        <section id="about" className="container reveal active">
            <div className="section-header">
                <span className="section-label">About Me</span>
                <h2 className="section-title">Bridging the gap between security and engineering</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                    I’m a Master’s candidate in Cyber Defense at Eastern Washington University with a strong background in software engineering.
                    I don't just build software; I ensure it's resilient, secure, and performant. My passion lies in solving complex problems
                    at the intersection of cybersecurity, digital forensics, and full-stack development.
                </p>
            </div>
        </section>
    );
};

export default About;
