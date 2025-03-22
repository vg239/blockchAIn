import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import aigentService from "@/services/aigent";

interface AgentHistoryProps {
  nftHash: string;
  userAccount: string;
  agentData?: any; // New prop to accept pre-fetched agent data
}

export default function AgentHistory({ nftHash, userAccount, agentData }: AgentHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [agentInfo, setAgentInfo] = useState<any | null>(null);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (agentData) {
      // If we have agent data, use it
      processAgentData();
    } else {
      // Otherwise, fetch it
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftHash, userAccount, page, agentData]);

  // Process agent data passed from parent
  const processAgentData = () => {
    if (!agentData) return;
    
    // Extract conversation history from parsed_conversation
    const conversations = agentData.parsed_conversation || [];
    
    // Calculate pagination
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setHistory(conversations.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(conversations.length / ITEMS_PER_PAGE));
    
    // Set agent info
    setAgentInfo({
      walletAddress: agentData.address || "Unknown",
      personality: (agentData.personality && agentData.personality.description) || "No personality defined",
      concepts: (agentData.personality && agentData.personality.concepts) || [],
    });
  };

  // Fallback to fetch history if no agent data is provided
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await aigentService.convoHistory(nftHash, userAccount, {
        offset: page * 10,
        limit: 10,
      });
      
      setHistory(response.conversations || []);
      setTotalPages(Math.ceil((response.total_conversations || 0) / 10));
      
      // Extract agent info if available
      if (!agentInfo && response) {
        setAgentInfo({
          walletAddress: response.wallet_address || "Unknown",
          personality: response.personality?.description || "No personality defined",
          concepts: response.personality?.concepts || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Conversation History</h2>
      
      {agentInfo && (
        <div className="mb-6 p-4 rounded-lg border">
          <h3 className="font-semibold text-lg mb-2">Agent Profile</h3>
          <p className="text-sm mb-1">
            <span className="font-medium">Address:</span> {agentInfo.walletAddress}
          </p>
          <p className="text-sm mb-3">
            <span className="font-medium">Personality:</span> {agentInfo.personality}
          </p>
          
          {agentInfo.concepts?.length > 0 && (
            <div>
              <span className="font-medium text-sm">Knowledge Areas:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {agentInfo.concepts.map((concept: string, i: number) => (
                  <span 
                    key={i}
                    className="px-2 py-1 bg-muted text-xs rounded-full"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">No conversation history found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-3">
                <h3 className="font-medium">User</h3>
                <p>{item.question}</p>
                <span className="text-xs text-muted-foreground">
                  {item.timestamp ? new Date(item.timestamp).toLocaleString() : "No timestamp"}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-medium">Agent</h3>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="flex items-center px-3">
                Page {page + 1} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}