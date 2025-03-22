import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (agents.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md border-gray-200">
        <p className="text-sm text-gray-600">No agents found</p>
        <p className="text-xs text-gray-500 mt-1">
          Create your first agent using the form
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {agents.map((agent, index) => (
        <motion.button
          key={agent.nft_hash}
          className={`w-full justify-start text-left px-3 py-2 rounded-md ${
            selectedAgent === agent.nft_hash 
              ? "bg-black text-white" 
              : "bg-white border border-gray-200 text-black hover:border-gray-300"
          }`}
          onClick={() => onSelectAgent(agent.nft_hash)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="truncate">
            <div className="text-sm font-medium truncate">
              {agent.personality?.description?.substring(0, 20) || `Agent ${agent.nft_hash.substring(0, 4)}`} 
            </div>
            <div className={`text-xs truncate ${
              selectedAgent === agent.nft_hash ? "text-gray-300" : "text-gray-500"
            }`}>
              {agent.nft_hash.substring(0, 8)}...
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}