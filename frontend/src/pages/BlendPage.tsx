import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import blendService from "@/services/blend";

export function BlendPage({ userAccount }: { userAccount: string | null }) {
  const [activeTab, setActiveTab] = useState<'create' | 'interact'>('create');
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [prompt, setPrompt] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);

  // Fetch agents when user account changes
  useEffect(() => {
    if (userAccount) {
      fetchAgents();
    }
  }, [userAccount]);

  const fetchAgents = async () => {
    if (!userAccount) return;
    
    try {
      // You'll need to implement this endpoint in your backend
      const response = await fetch(`${blendService.API_URL}/web3_manager/${userAccount}/agents`);
      const data = await response.json();
      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleCreateAgent = async () => {
    if (!userAccount || !prompt) return;
    
    setLoading(true);
    try {
      const result = await blendService.createAgents(prompt, userAccount);
      console.log("Created agents:", result);
      
      // Refresh agent list
      await fetchAgents();
      
      // Clear prompt
      setPrompt('');
      
      // Switch to interact tab if agents were created
      if (result.agents && result.agents.length > 0) {
        setSelectedAgent(result.agents[0]);
        setActiveTab('interact');
      }
    } catch (error) {
      console.error("Error creating agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAgent = async () => {
    if (!selectedAgent || !agentPrompt) return;
    
    setLoading(true);
    try {
      // Add user message to chat
      setMessages(prev => [...prev, { sender: 'user', text: agentPrompt }]);
      
      const result = await blendService.runAgent(
        userAccount,
        0, // Default to first agent
        agentPrompt,
        selectedAgent.wallet_id,
        selectedAgent.functions
      );
      
      // Add agent's response to chat
      setMessages(prev => [...prev, { sender: 'agent', text: result.result }]);
      
      // Clear input
      setAgentPrompt('');
    } catch (error) {
      console.error("Error running agent:", error);
      
      // Add error message
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'system', 
          text: 'An error occurred while communicating with the agent.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!userAccount) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-muted-foreground">Please connect your wallet to use the Blend service</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Web3 Agent Blend Service</h1>
      
      <div className="flex mb-6">
        <Button 
          variant={activeTab === 'create' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('create')}
          className="mr-2"
        >
          Create Agents
        </Button>
        <Button 
          variant={activeTab === 'interact' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('interact')}
          disabled={agents.length === 0}
        >
          Run Agent
        </Button>
      </div>
      
      {activeTab === 'create' ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create Web3 Agents</h2>
          <p className="text-muted-foreground">
            Describe your web2 application in detail, and we'll recommend essential web3 functionalities.
          </p>
          
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your application in detail..."
            rows={6}
            className="w-full"
          />
          
          <Button 
            onClick={handleCreateAgent} 
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Agents...
              </>
            ) : (
              "Create Web3 Agents"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Run Agent</h2>
            
            {agents.length > 0 && (
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Select Agent:</span>
                <select 
                  className="border rounded p-1"
                  value={selectedAgent?.wallet_id || ''}
                  onChange={(e) => {
                    const agent = agents.find(a => a.wallet_id === e.target.value);
                    setSelectedAgent(agent);
                    setMessages([]);
                  }}
                >
                  {agents.map((agent) => (
                    <option key={agent.wallet_id} value={agent.wallet_id}>
                      {agent.name} - {agent.functions.join(', ')}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {selectedAgent && (
            <>
              <div className="border rounded-md p-4 mb-4">
                <h3 className="font-medium mb-1">Selected Agent</h3>
                <p className="text-sm mb-1"><span className="font-medium">Name:</span> {selectedAgent.name}</p>
                <p className="text-sm mb-1"><span className="font-medium">Wallet Address:</span> {selectedAgent.wallet_address}</p>
                <p className="text-sm mb-3"><span className="font-medium">Functions:</span> {selectedAgent.functions.join(', ')}</p>
                <p className="text-xs text-muted-foreground">
                  Note: This agent needs Base ETH to execute transactions. Make sure you've funded the agent's wallet.
                </p>
              </div>
              
              <div className="border rounded-md p-4 mb-4 h-64 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages yet. Start the conversation below.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`${
                          msg.sender === 'user' 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : msg.sender === 'system'
                            ? 'bg-destructive text-destructive-foreground mx-auto'
                            : 'bg-muted mr-auto'
                        } p-3 rounded-lg max-w-[80%]`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex">
                <Input
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  placeholder="Enter your prompt for the agent..."
                  className="flex-1 mr-2"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleRunAgent();
                    }
                  }}
                />
                <Button 
                  onClick={handleRunAgent}
                  disabled={loading || !agentPrompt.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BlendPage;