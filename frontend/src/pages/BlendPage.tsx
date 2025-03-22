import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Home, User, LogIn, LogOut, PlusCircle, Coins } from "lucide-react";
import blendService from "@/services/blend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Dock, DockIcon } from "../components/magicui/dock";
import { motion } from "framer-motion";
import "../styles/landing.css";
import aigentService from "@/services/aigent";

export function BlendPage({ userAccount }: { userAccount: string | null }) {
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [account, setAccount] = useState<string | null>(userAccount);
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();
  
  // Prompt states
  const [promptName, setPromptName] = useState("");
  const [promptDescription, setPromptDescription] = useState("");
  const [promptText, setPromptText] = useState("");
  
  // Agent states
  const [agentName, setAgentName] = useState("");
  const [agentNFTUrl, setAgentNFTUrl] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [agentInstructions, setAgentInstructions] = useState("");
  
  // Runner states
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // fetch agents when account changes
  useEffect(() => {
    if (account) {
      fetchAgents();
      fetchPrompts();
    } else {
      setAgents([]);
      setPrompts([]);
    }
  }, [account]);

  const fetchAgents = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      const response = await aigentService.getUserAgents(account);
      if (response && response.agents) {
        setAgents(response.agents);
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrompts = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      const response = await aigentService.getPrompts(account);
      if (response && response.prompts) {
        setPrompts(response.prompts);
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    if (!account || !agentName || !agentDescription || !agentInstructions) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      setLoading(true);
      const response = await aigentService.createAgent(account, {
        name: agentName,
        description: agentDescription,
        instructions: agentInstructions,
        nft_url: agentNFTUrl || undefined,
      });
      
      if (response && response.nft_hash) {
        alert(`Agent created with NFT hash: ${response.nft_hash}`);
        // Reset form
        setAgentName("");
        setAgentDescription("");
        setAgentInstructions("");
        setAgentNFTUrl("");
        // Refresh agents
        fetchAgents();
      }
    } catch (error) {
      console.error("Failed to create agent:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async () => {
    if (!account || !promptName || !promptDescription || !promptText) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      setLoading(true);
      const response = await aigentService.createPrompt(account, {
        name: promptName,
        description: promptDescription,
        prompt: promptText,
      });
      
      if (response && response.success) {
        alert("Prompt created successfully");
        // Reset form
        setPromptName("");
        setPromptDescription("");
        setPromptText("");
        // Refresh prompts
        fetchPrompts();
      }
    } catch (error) {
      console.error("Failed to create prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  const runAgent = async () => {
    if (!account || !selectedAgent || !selectedPrompt) {
      alert("Please select an agent and a prompt");
      return;
    }
    
    try {
      setLoading(true);
      const response = await aigentService.runAgentWithPrompt(
        account,
        selectedAgent,
        selectedPrompt
      );
      
      if (response) {
        // Display the result
        const newMessage = {
          role: "agent",
          content: response.response,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (error) {
      console.error("Failed to run agent:", error);
      // Display error message
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Failed to run agent. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen relative">
        {/* Dock navigation */}
        <motion.div 
          className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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

        <div className="flex flex-col items-center justify-center h-screen p-6">
          <h2 className="mb-4 text-xl font-semibold text-black">Connect Wallet to Access Web3 Blend</h2>
          <p className="text-black mb-8">Please connect your wallet to create and run AI agents with prompts.</p>
          <Button onClick={connectWallet} disabled={connecting} className="px-8 py-6 text-black">
            {connecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Dock navigation */}
      <motion.div 
        className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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

      <div className="p-6 pt-24 max-w-6xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-black">Web3 Blend</h2>
            <p className="text-black">Create and run prompts with your AI agents</p>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create Agent</TabsTrigger>
                <TabsTrigger value="prompt">Create Prompt</TabsTrigger>
                <TabsTrigger value="run">Run Agent</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Agent Name</label>
                    <Input
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="My AI Agent"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">NFT Image URL (Optional)</label>
                    <Input
                      value={agentNFTUrl}
                      onChange={(e) => setAgentNFTUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Description</label>
                    <Textarea
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                      placeholder="Describe your agent's purpose and capabilities..."
                      className="w-full h-24"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Instructions</label>
                    <Textarea
                      value={agentInstructions}
                      onChange={(e) => setAgentInstructions(e.target.value)}
                      placeholder="Detailed instructions for how your agent should behave..."
                      className="w-full h-36"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={createAgent} 
                  disabled={loading || !agentName || !agentDescription || !agentInstructions}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Agent"
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="prompt" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Prompt Name</label>
                    <Input
                      value={promptName}
                      onChange={(e) => setPromptName(e.target.value)}
                      placeholder="My Prompt"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Description</label>
                    <Textarea
                      value={promptDescription}
                      onChange={(e) => setPromptDescription(e.target.value)}
                      placeholder="Describe what this prompt does..."
                      className="w-full h-24"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Prompt Text</label>
                    <Textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Write your prompt here..."
                      className="w-full h-36"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={createPrompt} 
                  disabled={loading || !promptName || !promptDescription || !promptText}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Prompt"
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="run" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Select Agent</label>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">-- Select an Agent --</option>
                      {agents.map((agent) => (
                        <option key={agent.nft_hash} value={agent.nft_hash}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Select Prompt</label>
                    <select
                      value={selectedPrompt}
                      onChange={(e) => setSelectedPrompt(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">-- Select a Prompt --</option>
                      {prompts.map((prompt) => (
                        <option key={prompt.id} value={prompt.id}>
                          {prompt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <Button 
                  onClick={runAgent} 
                  disabled={loading || !selectedAgent || !selectedPrompt}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" /> Running...
                    </>
                  ) : (
                    "Run Agent with Prompt"
                  )}
                </Button>
                
                {messages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-black">Results</h3>
                    <ScrollArea className="h-64 w-full border rounded-md p-4 bg-muted/20">
                      <div className="space-y-4">
                        {messages.map((msg, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              msg.role === "agent"
                                ? "bg-primary/10 ml-4"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm font-semibold mb-1 text-black">
                              {msg.role === "agent" ? "Agent" : "System"}
                            </p>
                            <p className="text-sm whitespace-pre-wrap text-black">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-black">
              Connected as: <span className="font-medium text-black">{formatAddress(account)}</span>
            </div>
            <Button variant="outline" onClick={disconnectWallet} className="text-black">
              Disconnect
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default BlendPage;