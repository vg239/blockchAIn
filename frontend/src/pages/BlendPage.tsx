import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Home, User, LogIn, LogOut, PlusCircle, Coins, ArrowRightCircle, Box, Sparkles } from "lucide-react";
import blendService, { Agent as BlendAgent } from "@/services/blend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardFooter, CardDescription, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Dock, DockIcon } from "../components/magicui/dock";
import { motion } from "framer-motion";
import "../styles/landing.css";

export function BlendPage({ userAccount }: { userAccount: string | null }) {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<BlendAgent[]>([]);
  const [account, setAccount] = useState<string | null>(userAccount);
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();
  
  // Web3 Blend states
  const [simplePrompt, setSimplePrompt] = useState("");
  const [isCreatingAgents, setIsCreatingAgents] = useState(false);
  const [createdAgents, setCreatedAgents] = useState<BlendAgent[]>([]);
  const [creationError, setCreationError] = useState<string | null>(null);
  
  // Agent runner states
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number | null>(null);
  const [runPrompt, setRunPrompt] = useState("");
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [runResults, setRunResults] = useState<any>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<any>(null);
  
  // For storing agent functions
  const [selectedAgentFunctions, setSelectedAgentFunctions] = useState<string[]>([]);
  const [selectedAgentWalletId, setSelectedAgentWalletId] = useState<string>("");
  const [selectedAgentNftHash, setSelectedAgentNftHash] = useState<string>("");

  // fetch agents when account changes
  useEffect(() => {
    if (account) {
      console.log("Account detected, fetching agents for:", account);
      fetchAgents();
    } else {
      console.log("No account detected, clearing agent data");
      setAgents([]);
      setCreatedAgents([]);
    }
  }, [account]);

  const fetchAgents = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      console.log("Fetching agents for wallet address:", account);
      
      // Get agents from blend service
      const blendResponse = await blendService.getAgents(account);
      console.log("Blend service agents response:", blendResponse);
      
      if (blendResponse && blendResponse.agents) {
        setCreatedAgents(blendResponse.agents);
        setAgents(blendResponse.agents);
      }
    } catch (error) {
      console.error("Failed to fetch blend agents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Web3 Blend - Create agents from simple prompt
  const createWeb3Agents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !simplePrompt) return;
    
    setIsCreatingAgents(true);
    setCreationError(null);
    
    console.log("===== CREATING WEB3 AGENTS =====");
    console.log("User Wallet:", account);
    console.log("Prompt:", simplePrompt);
    
    try {
      const response = await blendService.createAgents(account, simplePrompt);
      console.log("Blend Service Response:", response);
      
      const newAgents = response.agents || [];
      setCreatedAgents(newAgents);
      setAgents(agents.concat(newAgents));
      
      console.log("Created Agents:", newAgents);
      console.log("===== WEB3 AGENTS CREATED SUCCESSFULLY =====");
    } catch (error: any) {
      console.error("===== ERROR CREATING WEB3 AGENTS =====");
      console.error("Error:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      setCreationError(error.message || "Failed to create agents");
    } finally {
      setIsCreatingAgents(false);
    }
  };

  // Run an agent with the selected index
  const runAgentByIndex = async (index: number) => {
    if (!account || !runPrompt) {
      alert("Please connect wallet and enter a prompt");
      return;
    }
    
    setIsRunningAgent(true);
    setRunError(null);
    
    console.log("===== RUNNING WEB3 AGENT =====");
    console.log("User Wallet:", account);
    console.log("Selected Agent Index:", index);
    console.log("Selected Agent:", agents[index]);
    console.log("Prompt:", runPrompt);
    console.log("Wallet ID:", account);
    
    try {
      const selectedAgent = agents[index];
      const functions = ["get_historical_price", "get_token_info"];
      
      console.log("Calling blend.runAgent with:");
      console.log("- userId:", account);
      console.log("- agentIndex:", index);
      console.log("- prompt:", runPrompt);
      console.log("- walletId:", account);
      console.log("- functions:", functions);
      
      const response = await blendService.runAgent(
        account,
        index,
        runPrompt,
        account,
        functions
      );
      
      console.log("Agent Run Response:", response);
      if (response && response.result) {
        setRunResult(response.result);
      }
      console.log("===== WEB3 AGENT RUN SUCCESSFULLY =====");
    } catch (error: any) {
      console.error("===== ERROR RUNNING WEB3 AGENT =====");
      console.error("Error:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      setRunError(error.message || "Failed to run agent");
    } finally {
      setIsRunningAgent(false);
    }
  };

  // Handle agent selection for running
  const handleAgentSelection = (index: number, agent: BlendAgent) => {
    console.log("Selected agent at index:", index, agent);
    setSelectedAgentIndex(index);
    setSelectedAgentFunctions(agent.functions || []);
    setSelectedAgentWalletId(agent.wallet_id || "");
    
    // Check if we have a matching agent with an NFT hash
    if (agent.wallet_id && agents.length > 0) {
      const matchingAgent = agents.find(a => a.wallet_id === agent.wallet_id);
      if (matchingAgent) {
        console.log("Found matching agent with NFT hash:", matchingAgent.nft_hash);
        setSelectedAgentNftHash(matchingAgent.nft_hash);
      } else {
        setSelectedAgentNftHash("");
      }
    } else {
      setSelectedAgentNftHash("");
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    try {
      setConnecting(true);
      console.log("Attempting to connect wallet");
      
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Connected to wallet:", accounts[0]);
        setAccount(accounts[0]);
      } else {
        console.error("MetaMask not detected");
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
    console.log("Disconnecting wallet");
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
            <p className="text-black">Create and interact with Web3 agents using natural language</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Agents Section */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-black">Step 1: Create Web3 Agents</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Generate specialized agents for your Web3 project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">
                          Describe Your Web3 Project
                        </label>
                        <Textarea
                          value={simplePrompt}
                          onChange={(e) => setSimplePrompt(e.target.value)}
                          placeholder="Example: my defi dapp for nft minting"
                          className="w-full h-24"
                        />
                      </div>
                      
                      <Button 
                        onClick={createWeb3Agents} 
                        disabled={isCreatingAgents || !simplePrompt}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        {isCreatingAgents ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" /> Generating Agents...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2" size={18} /> Generate Web3 Agents
                          </>
                        )}
                      </Button>
                      
                      {creationError && (
                        <div className="p-3 rounded-md bg-red-50 border border-red-200 mt-2">
                          <p className="text-sm text-red-600">{creationError}</p>
                        </div>
                      )}
                      
                      <div className="p-3 rounded-md bg-slate-100 dark:bg-slate-800">
                        <p className="text-sm">
                          <span className="font-medium">Wallet Address:</span> {account}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">NFT Hash Status:</span>{" "}
                          <span className="text-xs">Automatically generated from your wallet address</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          The NFT hash is securely generated and used to identify your agents
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              
                {/* Run Agent Section */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-black">Step 2: Run Agent</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Select an agent and provide a prompt to run it
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">Select Agent</label>
                        <select
                          value={selectedAgentIndex !== null ? selectedAgentIndex : ""}
                          onChange={(e) => {
                            const index = parseInt(e.target.value);
                            if (!isNaN(index) && createdAgents[index]) {
                              handleAgentSelection(index, createdAgents[index]);
                            } else {
                              setSelectedAgentIndex(null);
                              setSelectedAgentFunctions([]);
                              setSelectedAgentWalletId("");
                              setSelectedAgentNftHash("");
                            }
                          }}
                          className="w-full p-2 border rounded-md"
                          disabled={createdAgents.length === 0}
                        >
                          <option value="">-- Select an Agent --</option>
                          {createdAgents.map((agent, index) => (
                            <option key={index} value={index}>
                              {agent.name || `Agent #${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">Your Prompt</label>
                        <Textarea
                          value={runPrompt}
                          onChange={(e) => setRunPrompt(e.target.value)}
                          placeholder="Enter instructions for the agent..."
                          className="w-full h-24"
                          disabled={selectedAgentIndex === null}
                        />
                      </div>
                      
                      <Button 
                        onClick={() => runAgentByIndex(selectedAgentIndex as number)} 
                        disabled={isRunningAgent || selectedAgentIndex === null || !runPrompt}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                      >
                        {isRunningAgent ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" /> Running...
                          </>
                        ) : (
                          <>
                            <ArrowRightCircle className="mr-2" size={18} /> Run Agent
                          </>
                        )}
                      </Button>
                      
                      {runError && (
                        <div className="p-3 rounded-md bg-red-50 border border-red-200 mt-2">
                          <p className="text-sm text-red-600">{runError}</p>
                        </div>
                      )}
                      
                      {runResult && (
                        <div className="p-3 rounded-md bg-green-50 border border-green-200 mt-2">
                          <p className="text-sm font-medium mb-1 text-green-800">Agent Response:</p>
                          <pre className="text-sm text-green-700 whitespace-pre-wrap bg-white p-2 rounded border border-green-100">
                            {typeof runResult === 'object' ? JSON.stringify(runResult, null, 2) : runResult}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Agent Display Section */}
              {createdAgents.length > 0 && (
                <Card className="shadow-sm mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-black">Your Web3 Agents</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {createdAgents.length} agent{createdAgents.length !== 1 ? "s" : ""} generated for your project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {createdAgents.map((agent, index) => (
                          <Card key={index} 
                               className={`overflow-hidden border-2 ${
                                 selectedAgentIndex === index 
                                   ? 'border-blue-400' 
                                   : 'hover:border-blue-400 border-gray-200'
                               } transition-all cursor-pointer`} 
                               onClick={() => handleAgentSelection(index, agent)}>
                            <div className={`p-4 ${selectedAgentIndex === index ? 'bg-blue-50' : ''}`}>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-black flex items-center">
                                  <Box className="mr-2" size={16} />
                                  {agent.name || `Agent #${index + 1}`}
                                </h3>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}