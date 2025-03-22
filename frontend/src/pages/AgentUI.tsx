import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AgentCreator from "./AgentCreator";
import AgentInteraction from "./AgentInteraction";
import AgentHistory from "./AgentHistory";
import AgentList from "./AgentList";
import aigentService from "@/services/aigent";

export function AgentUI({ userAccount }: { userAccount: string | null }) {
  const [activeView, setActiveView] = useState<"create" | "interact" | "history">("create");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // Store all agent data including conversations
  const [agentData, setAgentData] = useState<any>({});

  // Fetch user's agents when account changes
  useEffect(() => {
    if (userAccount) {
      fetchUserAgents();
    } else {
      setAgents([]);
      setAgentData({});
    }
  }, [userAccount]);

  const fetchUserAgents = async () => {
    if (!userAccount) return;
    
    setLoading(true);
    try {
      // Use the new endpoint that returns all agents and their conversations
      const response = await aigentService.getUserAgents(userAccount);
      
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

  // Rest of component remains the same
  if (!userAccount) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 border rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Connect Wallet to Use Agents</h2>
        <p className="text-muted-foreground">Please connect your wallet using the button in the navbar to create and interact with agents.</p>
      </div>
    );
  }

  // Get the selected agent's data
  const selectedAgentData = getSelectedAgentData();

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto">
      {/* Sidebar with agent list and navigation */}
      <div className="w-full md:w-64 shrink-0">
        <h2 className="text-xl font-semibold mb-4">Your Agents</h2>
        
        <div className="flex md:flex-col gap-2 mb-6">
          <Button 
            variant={activeView === "create" ? "default" : "outline"} 
            onClick={() => setActiveView("create")}
            className="flex-1 md:flex-none"
          >
            Create New
          </Button>
          <Button 
            variant={activeView === "interact" ? "default" : "outline"} 
            onClick={() => selectedAgent ? setActiveView("interact") : null}
            disabled={!selectedAgent}
            className="flex-1 md:flex-none"
          >
            Chat
          </Button>
          <Button 
            variant={activeView === "history" ? "default" : "outline"} 
            onClick={() => selectedAgent ? setActiveView("history") : null}
            disabled={!selectedAgent}
            className="flex-1 md:flex-none"
          >
            History
          </Button>
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
      <div className="flex-1 border rounded-lg shadow-sm p-6">
        {activeView === "create" && (
          <AgentCreator userAccount={userAccount} onAgentCreated={handleAgentCreated} />
        )}
        
        {activeView === "interact" && selectedAgent && selectedAgentData && (
          <AgentInteraction 
            nftHash={selectedAgent} 
            userAccount={userAccount}
            onHistoryUpdated={fetchUserAgents}
            initialConversation={selectedAgentData.parsed_conversation || []}
          />
        )}
        
        {activeView === "history" && selectedAgent && selectedAgentData && (
          <AgentHistory 
            nftHash={selectedAgent} 
            userAccount={userAccount}
            agentData={selectedAgentData}
          />
        )}
      </div>
    </div>
  );
}

export default AgentUI;