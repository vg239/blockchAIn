import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AgentListProps {
  agents: any[];
  selectedAgent: string | null;
  onSelectAgent: (nftHash: string) => void;
  loading: boolean;
}

export default function AgentList({ 
  agents, 
  selectedAgent, 
  onSelectAgent,
  loading
}: AgentListProps) {
  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (agents.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md">
        <p className="text-sm text-muted-foreground">No agents found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Create your first agent using the form
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {agents.map((agent) => (
        <Button
          key={agent.nft_hash}
          variant={selectedAgent === agent.nft_hash ? "default" : "outline"}
          className="w-full justify-start text-left"
          onClick={() => onSelectAgent(agent.nft_hash)}
        >
          <div className="truncate">
            <div className="text-sm font-medium truncate">
              {agent.personality?.description?.substring(0, 20) || `Agent ${agent.nft_hash.substring(0, 4)}`} 
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {agent.nft_hash.substring(0, 8)}...
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}