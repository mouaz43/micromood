import { Routes, Route, Link } from 'react-router-dom';
import LiveSky from './components/LiveSky';
import TopNav from './components/TopNav';
import Home from './pages/Home';
import Explore from './pages/Explore';
import About from './pages/About';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div className="app">
      <LiveSky />
      <TopNav />
      <nav className="page" style={{paddingTop:0}}>
        <div className="panel" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/about">About</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}
