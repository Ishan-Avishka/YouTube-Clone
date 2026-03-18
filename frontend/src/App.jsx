import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import WatchVideo from './pages/WatchVideo';
import UploadVideo from './pages/UploadVideo';
import Channel from './pages/Channel';
import { useState } from 'react';
import './App.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar onMenuClick={() => setSidebarOpen(p => !p)} />
          <div className="app-body">
            <Sidebar isOpen={sidebarOpen} />
            <main className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/watch/:id" element={<WatchVideo />} />
                <Route path="/upload" element={<UploadVideo />} />
                <Route path="/channel/:name" element={<Channel />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
