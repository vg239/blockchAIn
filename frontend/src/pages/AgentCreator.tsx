import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import aigentService from "@/services/aigent";

interface AgentCreatorProps {
  userAccount: string;
  onAgentCreated: (nftHash: string) => void;
}

export default function AgentCreator({ userAccount, onAgentCreated }: AgentCreatorProps) {
  const [prompt, setPrompt] = useState("");
  const [nftHash, setNftHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || !nftHash) {
      setError("Please provide both an NFT hash and a prompt");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aigentService.createAgents(userAccount, nftHash, prompt);
      console.log("Agent created:", result);
      onAgentCreated(nftHash);
    } catch (err: any) {
      setError(err.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Create a New AI Agent</h2>
      <p className="text-muted-foreground mb-6">
        Create a unique AI agent by providing an NFT hash and a detailed prompt 
        describing the personality and capabilities you want.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nft-hash" className="block mb-2 font-medium">
            NFT Hash
          </label>
          <Input
            id="nft-hash"
            placeholder="Enter the NFT hash for your agent"
            value={nftHash}
            onChange={(e) => setNftHash(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will be used to identify and own your agent
          </p>
        </div>

        <div>
          <label htmlFor="agent-prompt" className="block mb-2 font-medium">
            Agent Prompt
          </label>
          <Textarea
            id="agent-prompt"
            placeholder="Describe your agent's personality, knowledge areas, and how it should respond..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            disabled={loading}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Be specific about knowledge areas, personality traits, and how the agent should interact
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive border border-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Agent...
            </>
          ) : (
            "Create Agent"
          )}
        </Button>
      </form>
    </div>
  );
}