import React from 'react';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';

const Contact = () => {
    return (
        <section id="contact" className="container reveal active">
            <div className="contact-card">
                <h2 className="section-title">Let's Connect</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    Whether you have a question, a project in mind, or just want to say hi, I'll try my best to get back to you!
                </p>
                <div className="contact-links">
                    <a href="mailto:hello@example.com" className="btn btn-primary">
                        <Mail size={20} /> Say Hello
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                        <Github size={20} /> GitHub
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                        <Linkedin size={20} /> LinkedIn
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Contact;
