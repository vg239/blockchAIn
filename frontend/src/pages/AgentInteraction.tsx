import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import aigentService from "@/services/aigent";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
}

interface AgentInteractionProps {
  nftHash: string;
  userAccount: string;
  onHistoryUpdated?: () => void;
  initialConversation?: Array<{question: string, answer: string, timestamp?: string}>;
}

export default function AgentInteraction({ 
  nftHash, 
  userAccount,
  onHistoryUpdated,
  initialConversation = []
}: AgentInteractionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentInfo, setAgentInfo] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Format the initial conversation history when component mounts
  useEffect(() => {
    if (initialConversation && initialConversation.length > 0) {
      const formattedMessages: Message[] = [];
      
      initialConversation.forEach(conv => {
        if (conv.question) {
          formattedMessages.push({
            sender: "user",
            text: conv.question,
            timestamp: conv.timestamp ? new Date(conv.timestamp) : new Date()
          });
        }
        
        if (conv.answer) {
          formattedMessages.push({
            sender: "agent",
            text: conv.answer,
            timestamp: conv.timestamp ? new Date(conv.timestamp) : new Date()
          });
        }
      });
      
      setMessages(formattedMessages);
    } else {
      // If no initial conversation is provided, fetch it
      fetchAgentInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftHash, userAccount, initialConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAgentInfo = async () => {
    setLoading(true);
    try {
      const response = await aigentService.convoHistory(nftHash, userAccount);
      
      // Extract agent info
      setAgentInfo({
        walletAddress: response.wallet_address || "Unknown",
        personality: response.personality?.description || "No personality defined yet",
      });
      
      // Convert conversation history to messages
      if (response.conversations && response.conversations.length > 0) {
        const history: Message[] = [];
        
        response.conversations.forEach((conv: any) => {
          if (conv.question) {
            history.push({
              sender: "user",
              text: conv.question,
              timestamp: conv.timestamp ? new Date(conv.timestamp) : new Date(),
            });
          }
          
          if (conv.answer) {
            history.push({
              sender: "agent",
              text: conv.answer,
              timestamp: conv.timestamp ? new Date(conv.timestamp) : new Date(),
            });
          }
        });
        
        setMessages(history);
      }
    } catch (error) {
      console.error("Failed to fetch agent info:", error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of component remains the same
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    try {
      const response = await aigentService.interactWithAgent(nftHash, userAccount, input);
      
      // Add agent response
      const agentMessage: Message = {
        sender: "agent",
        text: response.response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, agentMessage]);
      
      // Notify parent that history was updated
      if (onHistoryUpdated) {
        onHistoryUpdated();
      }
    } catch (error) {
      console.error("Error getting agent response:", error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "Sorry, I encountered an error while processing your request.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-[600px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Chat with Agent</h2>
          {agentInfo && (
            <p className="text-sm text-gray-600">
              {agentInfo.walletAddress}
            </p>
          )}
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto mb-4 border border-gray-200 rounded-md p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <p className="mb-2">No messages yet.</p>
            <p>Start the conversation by sending a message below.</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                className={`mb-4 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.sender === "user"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  {msg.text}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 resize-none focus:ring-gray-500 focus:border-gray-500 border-gray-300"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <motion.button 
          type="submit" 
          className="h-12 w-12 rounded-md bg-black text-white flex items-center justify-center" 
          disabled={loading}
          whileHover={{ scale: 1.05, backgroundColor: "#333" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}