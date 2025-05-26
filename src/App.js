import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Timer from './components/CountdownTimer';
import Home from './pages/home';
import Navbar from './components/navbar';
import Table from './pages/table';
import Admin from './pages/admin';
import Footer from './components/footer';
import Guestbook from './pages/chatbox';
import Results from './pages/results';
import Bets from './pages/bets';
import History from './pages/history';
import Stats from './pages/stats';
import Rules from './pages/rules';
import Loading from './components/loading'; // Import the Loading component
import pitch from './images/pitc.jpeg'; // Ensure this is the correct path to your image

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleImageLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000); // Ensure the loading screen is shown for at least 3 seconds
    };

    const img = new Image();
    img.src = pitch;
    img.onload = handleImageLoad;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      img.onload = null; // Cleanup in case the component unmounts
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const containerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '5%',
    marginTop: isMobile ? '15%' : '5%',
  };

  return (
    <Router>
      <AnimatePresence>
        {isLoading ? (
          <Loading onLoaded={() => setIsLoading(false)} key="loading" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div className="container" style={containerStyle}>
              <Timer />
              <hr style={{ color: 'white' }}></hr>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/table" element={<Table />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/results" element={<Results />} />
                <Route path="/guestbook" element={<Guestbook />} />
                <Route path="/bets" element={<Bets />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/history" element={<History />} />
              </Routes>
            </div>
            <Footer />
          </div>
        )}
      </AnimatePresence>
    </Router>
  );
}

export default App;