import React, { useState } from 'react';
import menuBars from './menu_bars.png';
import { Link } from 'react-router-dom';

function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className={isOpen ? 'isOpen' : ''}>
        <button onClick={() => setIsOpen(!isOpen)} style={{backgroundColor: 'transparent', border: 'none'}}><img src={menuBars} alt="Menu Bars" style={{maxWidth: '60px', height: 'auto'}} /></button>
        {isOpen && (
            <>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/addDBData">Add to Database</Link></li>
                    <li><Link to="/kwicIndex">KWIC Index</Link></li>
                </ul>
            </>
        )}
    </nav>
  );
}

export default NavigationBar;