import React from 'react';

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <p>&copy; {new Date().getFullYear()} Christopher Davisson. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
