import React from 'react';

const Skills = () => {
    return (
        <section id="skills" className="container reveal active">
            <div className="section-header">
                <span className="section-label">Expertise</span>
                <h2 className="section-title">Tools & Technologies</h2>
            </div>

            <div className="skills-grid">
                <div className="skill-item">
                    <h4>Languages</h4>
                    <span>Python, JS, TS, Java</span>
                </div>
                <div className="skill-item">
                    <h4>Frontend</h4>
                    <span>React, Tailwind, Next.js</span>
                </div>
                <div className="skill-item">
                    <h4>Backend</h4>
                    <span>Node.js, Express, Django</span>
                </div>
                <div className="skill-item">
                    <h4>Security</h4>
                    <span>Splunk, Wireshark, Burp Suite</span>
                </div>
                <div className="skill-item">
                    <h4>DevOps</h4>
                    <span>Docker, AWS, Git</span>
                </div>
                <div className="skill-item">
                    <h4>Data</h4>
                    <span>SQL, MongoDB, D3.js</span>
                </div>
            </div>
        </section>
    );
};

export default Skills;
