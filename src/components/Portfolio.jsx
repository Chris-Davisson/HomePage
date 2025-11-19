import React from 'react';
import { Layers, AlertCircle, ArrowRight, Code } from 'lucide-react';

const Portfolio = () => {
    return (
        <section id="portfolio" className="container reveal active">
            <div className="section-header">
                <span className="section-label">Portfolio</span>
                <h2 className="section-title">Selected Works</h2>
            </div>

            <div className="grid">
                {/* Project 1 */}
                <article className="card">
                    <div className="card-icon">
                        <Layers size={24} />
                    </div>
                    <h3>Threat Intelligence Dashboard</h3>
                    <p>Real-time situational awareness dashboard with RBAC. Aggregates multiple intel feeds and normalizes indicators for analysts using React, Node.js, and D3.js.</p>
                    <div className="tags">
                        <span className="tag">React</span>
                        <span className="tag">Node.js</span>
                        <span className="tag">D3.js</span>
                        <span className="tag">Security</span>
                    </div>
                    <div className="card-links">
                        <a href="#" className="link-arrow">Live Demo <ArrowRight size={16} /></a>
                        <a href="#" className="link-arrow">Code <Code size={16} /></a>
                    </div>
                </article>

                {/* Project 2 (Placeholder based on original HTML structure, though only 1 and 3 were visible in snippet) */}
                {/* Assuming Project 3 is Incident Response */}
                <article className="card">
                    <div className="card-icon">
                        <AlertCircle size={24} />
                    </div>
                    <h3>Incident Response Automation</h3>
                    <p>Pipeline that wires Splunk, Python, and Docker to shrink MTTR. Triage rules auto-open tickets and attach evidence bundles for rapid response.</p>
                    <div className="tags">
                        <span className="tag">Splunk</span>
                        <span className="tag">Python</span>
                        <span className="tag">Docker</span>
                        <span className="tag">SOAR</span>
                    </div>
                    <div className="card-links">
                        <a href="#" className="link-arrow">Architecture <ArrowRight size={16} /></a>
                        <a href="#" className="link-arrow">Code <Code size={16} /></a>
                    </div>
                </article>
            </div>
        </section>
    );
};

export default Portfolio;
