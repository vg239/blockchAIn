import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentDetailsProps {
  agent: {
    name: string;
    wallet_address: string;
    wallet_id: string;
    functions: string[];
    user_id: string;
  };
}

export function AgentDetails({ agent }: AgentDetailsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{agent.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium">Wallet Address:</span>
            <p className="text-sm font-mono break-all">{agent.wallet_address}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium">Wallet ID:</span>
            <p className="text-sm font-mono break-all">{agent.wallet_id}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium">Owner:</span>
            <p className="text-sm font-mono break-all">{agent.user_id}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium">Functions:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {agent.functions.map((func, idx) => (
                <Badge key={idx} variant="secondary">{func}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AgentDetails;