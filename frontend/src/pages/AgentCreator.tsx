import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import aigentService, { Agent } from "@/services/aigent";
import { motion } from "framer-motion";

interface AgentCreatorProps {
  userAccount: string;
  onAgentCreated: (nftHash: string) => void;
}

export default function AgentCreator({ userAccount, onAgentCreated }: AgentCreatorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      setError("Please provide a prompt for your agent");
      return;
    }

    if (!userAccount) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("===== AGENT CREATOR SUBMIT =====");
      console.log("User wallet address:", userAccount);
      console.log("Prompt value from form:", prompt);
      console.log("Prompt type:", typeof prompt);
      console.log("Prompt length:", prompt.length);
      console.log("Prompt trimmed length:", prompt.trim().length);
      
      // Use the createAgent function with just userId and prompt
      console.log("Calling aigentService.createAgent with:");
      console.log("- userId:", userAccount);
      console.log("- prompt:", prompt);
      
      const result = await aigentService.createAgent(userAccount, prompt) as Agent;
      
      console.log("Agent created result:", result);
      console.log("Result type:", typeof result);
      console.log("Result NFT hash:", result.nft_hash);
      console.log("===== END AGENT CREATOR SUBMIT =====");
      
      // NFT hash is generated inside the service
      if (result && result.nft_hash) {
        onAgentCreated(result.nft_hash);
      } else {
        throw new Error("NFT hash not returned from server");
      }
    } catch (err: any) {
      console.error("===== AGENT CREATOR ERROR =====");
      console.error("Error creating agent:", err);
      console.error("Error message:", err.message);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      console.error("===== END AGENT CREATOR ERROR =====");
      setError(err.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-black">Create a New AI Agent</h2>
      <p className="text-gray-600 mb-6">
        Create a unique AI agent by providing a detailed prompt describing the personality and capabilities you want.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="agent-prompt" className="block mb-2 font-medium text-black">
            Agent Prompt
          </label>
          <Textarea
            id="agent-prompt"
            placeholder="Describe your agent's personality, knowledge areas, and how it should respond..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            disabled={loading}
            className="resize-none focus:ring-gray-500 focus:border-gray-500 border-gray-300"
          />
          <p className="text-xs text-gray-500 mt-1">
            Be specific about knowledge areas, personality traits, and how the agent should interact
          </p>
        </div>

        {userAccount && (
          <div className="p-3 rounded-md bg-gray-100 border border-gray-200">
            <p className="text-sm">
              <span className="font-medium">Wallet Address:</span> {userAccount}
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium">NFT Hash Status:</span>{" "}
              <span className="text-xs">Automatically generated from your wallet address</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              The NFT hash is securely generated from your wallet address for security and consistency
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-md bg-gray-100 border border-gray-300 text-gray-800">
            {error}
          </div>
        )}

        <motion.button
          type="submit"
          className="w-full bg-black hover:bg-gray-800 text-white transition-colors p-3 rounded-md h-12 flex items-center justify-center"
          disabled={loading || !userAccount}
          whileHover={{ scale: 1.02, backgroundColor: "#333" }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Agent...
            </>
          ) : (
            "Create Agent"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}