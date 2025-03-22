import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import { AgentUI } from './pages/AgentUI'
import { BlendPage } from './pages/BlendPage'

function App() {
  const [account, setAccount] = useState<string | null>(null);

  // Check if wallet is already connected when app loads
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  // Create a tuple of account state to pass to components
  const accountState: [string | null, React.Dispatch<React.SetStateAction<string | null>>] = [account, setAccount];

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage accountState={accountState} />} />
          <Route 
            path="/create" 
            element={
              <div className="container mx-auto py-8 px-4">
                <AgentUI userAccount={account} />
              </div>
            } 
          />
          <Route 
            path="/blend" 
            element={
              <div className="container mx-auto py-8 px-4">
                <BlendPage userAccount={account} />
              </div>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

// Fix TypeScript error for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}

export default App