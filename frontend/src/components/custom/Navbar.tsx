import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function Navbar({ 
  account, 
  setAccount 
}: { 
  account: string | null; 
  setAccount: (account: string | null) => void 
}) {
  const [connecting, setConnecting] = useState(false);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      setConnecting(true);
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            blockchAIn
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Create Agent
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            My Agents
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Docs
          </a>
        </nav>

        {/* Wallet Connection Button */}
        <div>
          {account ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 border rounded-full text-xs bg-muted">
                {formatAddress(account)}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connectWallet}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;