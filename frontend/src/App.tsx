import './App.css'
import { useState, useEffect } from 'react'
import { Navbar } from './components/custom/Navbar'
import { AgentUI } from './pages/AgentUI'
import { BlendPage }  from './pages/BlendPage'

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'aigent' | 'blend'>('aigent');

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    };

    checkWalletConnection();
    
    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
      } else {
        setAccount(accounts[0]);
      }
    };
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  return (
    <div>
      <Navbar account={account} setAccount={setAccount} />
      
      <div className="container mx-auto mt-24 px-4">
        <div className="mb-6 border-b pb-4">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('aigent')}
              className={`px-4 py-2 font-medium rounded-md ${
                activeTab === 'aigent' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-transparent hover:bg-muted'
              }`}
            >
              AI Agents
            </button>
            <button 
              onClick={() => setActiveTab('blend')}
              className={`px-4 py-2 font-medium rounded-md ${
                activeTab === 'blend' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-transparent hover:bg-muted'
              }`}
            >
              Web3 Blend
            </button>
          </div>
        </div>
        
        {activeTab === 'aigent' ? (
          <AgentUI userAccount={account} />
        ) : (
          <BlendPage userAccount={account} />
        )}
      </div>
    </div>
  )
}

export default App