import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Dock, DockIcon } from "../components/magicui/dock";
import { Home, User, LogIn, LogOut, PlusCircle, Coins, Send, History } from "lucide-react";
import { motion } from "framer-motion";
import AgentCreator from "./AgentCreator";
import AgentInteraction from "./AgentInteraction";
import AgentHistory from "./AgentHistory";
import AgentList from "./AgentList";
import aigentService from "@/services/aigent";
import "../styles/landing.css";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AgentUI({ userAccount }: { userAccount: string | null }) {
  const [activeView, setActiveView] = useState<"create" | "interact" | "history">("create");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(userAccount);
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  // Store all agent data including conversations
  const [agentData, setAgentData] = useState<any>({});

  // Fetch user's agents when account changes
  useEffect(() => {
    if (account) {
      fetchUserAgents();
    } else {
      setAgents([]);
      setAgentData({});
    }
  }, [account]);

  const fetchUserAgents = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      // Use the new endpoint that returns all agents and their conversations
      const response = await aigentService.getUserAgents(account);
      
      if (response && response.agents) {
        setAgents(response.agents.map((agent: any) => ({
          ...agent,
          nft_hash: agent.nft_hash, // Make sure nft_hash is available
        })));
        
        // Store the full response for easy access to conversations
        setAgentData(response);
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Find currently selected agent's data
  const getSelectedAgentData = () => {
    if (!selectedAgent || !agents.length) return null;
    return agents.find(agent => agent.nft_hash === selectedAgent);
  };

  const handleAgentCreated = (nftHash: string) => {
    setSelectedAgent(nftHash);
    setActiveView("interact");
    fetchUserAgents(); // Refresh agent list
  };

  const selectAgent = (nftHash: string) => {
    setSelectedAgent(nftHash);
    setActiveView("interact");
  };

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

  if (!account) {
    return (
      <div className="min-h-screen bg-white relative">
        {/* Dock navigation */}
        <motion.div 
          className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Dock className="dock-nav">
            <DockIcon onClick={() => navigate('/')} className="dock-icon-glow cursor-pointer">
              <Home size={24} className="text-black" />
              <div className="dock-tooltip">Home</div>
            </DockIcon>
            
            <DockIcon onClick={() => navigate('/create')} className="dock-icon-glow cursor-pointer">
              <PlusCircle size={24} className="text-black" />
              <div className="dock-tooltip">Create Agent</div>
            </DockIcon>
            
            <DockIcon onClick={() => navigate('/blend')} className="dock-icon-glow cursor-pointer">
              <Coins size={24} className="text-black" />
              <div className="dock-tooltip">Web3 Blend</div>
            </DockIcon>
            
            <DockIcon 
              onClick={connectWallet} 
              className={`dock-icon-glow cursor-pointer ${connecting ? 'animate-pulse' : ''}`}
            >
              <LogIn size={24} className="text-black" />
              <div className="dock-tooltip">Connect Wallet</div>
            </DockIcon>
          </Dock>
        </motion.div>

        <div className="flex flex-col items-center justify-center h-screen p-6 pt-36">
          <h2 className="mb-4 text-xl font-semibold text-black">Connect Wallet to Use Agents</h2>
          <p className="text-black mb-8">Please connect your wallet to create and interact with AI agents.</p>
          <motion.button 
            onClick={connectWallet} 
            disabled={connecting} 
            className="px-8 py-6 bg-black text-white rounded-md h-12 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </motion.button>
        </div>
      </div>
    );
  }

  // Get the selected agent's data
  const selectedAgentData = getSelectedAgentData();

  return (
    <div className="min-h-screen bg-white">
      {/* Dock navigation */}
      <motion.div 
        className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Dock className="dock-nav">
          <DockIcon onClick={() => navigate('/')} className="dock-icon-glow cursor-pointer">
            <Home size={24} className="text-black" />
            <div className="dock-tooltip">Home</div>
          </DockIcon>
          
          <DockIcon onClick={() => navigate('/create')} className="dock-icon-glow cursor-pointer">
            <PlusCircle size={24} className="text-black" />
            <div className="dock-tooltip">Create Agent</div>
          </DockIcon>
          
          <DockIcon onClick={() => navigate('/blend')} className="dock-icon-glow cursor-pointer">
            <Coins size={24} className="text-black" />
            <div className="dock-tooltip">Web3 Blend</div>
          </DockIcon>
          
          <>
            <DockIcon className="bg-white/20 cursor-default">
              <User size={18} className="text-black" />
              <span className="absolute -bottom-6 text-xs whitespace-nowrap font-bold">
                {formatAddress(account)}
              </span>
            </DockIcon>
            
            <DockIcon onClick={disconnectWallet} className="dock-icon-glow cursor-pointer">
              <LogOut size={24} className="text-black" />
              <div className="dock-tooltip">Disconnect</div>
            </DockIcon>
          </>
        </Dock>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 p-6 pt-36 max-w-7xl mx-auto">
        {/* Sidebar with agent list and navigation */}
        <div className="w-full md:w-64 shrink-0">
          <h2 className="text-xl font-semibold mb-4 text-black">Your Agents</h2>
          
          <div className="flex md:flex-col gap-2 mb-6">
            <motion.button
              className={`justify-start w-full px-3 py-2 rounded-md text-black ${activeView === "create" ? "bg-gray-100" : "bg-white border border-gray-200 hover:border-gray-300"}`}
              onClick={() => setActiveView("create")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <PlusCircle className="mr-2 h-4 w-4 inline" />
              <span>Create Agent</span>
            </motion.button>
            
            <motion.button
              className={`justify-start w-full px-3 py-2 rounded-md text-black ${activeView === "interact" ? "bg-gray-100" : "bg-white border border-gray-200 hover:border-gray-300"}`}
              onClick={() => setActiveView("interact")}
              disabled={!selectedAgent}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Send className="mr-2 h-4 w-4 inline" />
              <span>Interact</span>
            </motion.button>
            
            <motion.button
              className={`justify-start w-full px-3 py-2 rounded-md text-black ${activeView === "history" ? "bg-gray-100" : "bg-white border border-gray-200 hover:border-gray-300"}`}
              onClick={() => setActiveView("history")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <History className="mr-2 h-4 w-4 inline" />
              <span>History</span>
            </motion.button>
          </div>
          
          <Separator className="my-4" />
          
          <AgentList 
            agents={agents}
            selectedAgent={selectedAgent}
            onSelectAgent={selectAgent}
            loading={loading}
          />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 border rounded-lg shadow-sm p-6 border-gray-200">
          {activeView === "create" && (
            <AgentCreator userAccount={account} onAgentCreated={handleAgentCreated} />
          )}
          
          {activeView === "interact" && selectedAgent && selectedAgentData && (
            <AgentInteraction 
              nftHash={selectedAgent} 
              userAccount={account}
              onHistoryUpdated={fetchUserAgents}
              initialConversation={selectedAgentData.parsed_conversation || []}
            />
          )}
          
          {activeView === "history" && selectedAgent && selectedAgentData && (
            <AgentHistory 
              nftHash={selectedAgent} 
              userAccount={account}
              agentData={selectedAgentData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AgentUI;