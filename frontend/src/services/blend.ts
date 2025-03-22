import axios from 'axios';

export const API_URL = 'http://localhost:8080/blend'; // Change to prod later

// Response types for better type checking
export interface Agent {
  name: string;
  functions: string[];
  wallet_address: string;
  wallet_id: string;
  user_id: string;
  nft_hash?: string;
}

export interface CreateAgentsResponse {
  success: boolean;
  message: string;
  agent_count: number;
  agents: Agent[];
}

export interface RunAgentResponse {
  success?: boolean;
  output?: string;
  result?: any;
  error?: string;
}

export interface GetAgentsResponse {
  agents: Agent[];
}

/**
 * Create agents based on a prompt
 * @param userId - Wallet address of the user
 * @param prompt - Natural language description of the project
 */
const createAgents = async (userId: string, prompt: string): Promise<CreateAgentsResponse> => {
    try {
        console.log("===== BLEND SERVICE CREATE AGENTS =====");
        console.log("User ID (wallet address):", userId);
        console.log("Prompt value:", prompt);
        console.log("Prompt type:", typeof prompt);
        console.log("Prompt length:", prompt.length);
        
        // Log the exact request payload
        const requestPayload = { prompt };
        console.log("Request payload:", requestPayload);
        console.log("API URL:", `${API_URL}/web3_manager/${userId}/create-agents`);
        
        const response = await axios.post(`${API_URL}/web3_manager/${userId}/create-agents`, requestPayload);
        
        console.log("Response status:", response.status);
        console.log("Create agents response data:", response.data);
        console.log("===== END BLEND SERVICE CREATE AGENTS =====");
        
        return response.data as CreateAgentsResponse;
    } catch (error: any) {
        console.error("===== BLEND SERVICE CREATE AGENTS ERROR =====");
        console.error("Error creating agents:", error);
        console.error("Error message:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Request config:", error.config);
        }
        console.error("===== END BLEND SERVICE CREATE AGENTS ERROR =====");
        throw error;
    }
};

/**
 * Run an agent with a specific prompt
 * @param userId - Wallet address of the user
 * @param agent_index - Index of the agent to run
 * @param prompt - Prompt to run the agent with
 * @param wallet_id - Wallet ID associated with the agent
 * @param functions - List of function names that the agent can use
 */
const runAgent = async (
    userId: string, 
    agent_index: number, 
    prompt: string, 
    wallet_id: string, 
    functions: string[]
): Promise<RunAgentResponse> => {
    try {
        console.log("===== BLEND SERVICE RUN AGENT =====");
        console.log("User ID (wallet address):", userId);
        console.log("Agent index:", agent_index);
        console.log("Prompt value:", prompt);
        console.log("Prompt type:", typeof prompt);
        console.log("Prompt length:", prompt.length);
        console.log("Wallet ID:", wallet_id);
        console.log("Functions:", functions);
        
        // Log the exact request payload
        const requestPayload = {
            agent_index,
            prompt,
            wallet_id,
            functions
        };
        console.log("Request payload:", requestPayload);
        console.log("API URL:", `${API_URL}/web3_manager/${userId}/run-agent`);
        
        const response = await axios.post(`${API_URL}/web3_manager/${userId}/run-agent`, requestPayload);
        
        console.log("Response status:", response.status);
        console.log("Run agent response data:", response.data);
        console.log("===== END BLEND SERVICE RUN AGENT =====");
        
        return response.data as RunAgentResponse;
    } catch (error: any) {
        console.error("===== BLEND SERVICE RUN AGENT ERROR =====");
        console.error("Error running agent:", error);
        console.error("Error message:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Request config:", error.config);
        }
        console.error("===== END BLEND SERVICE RUN AGENT ERROR =====");
        throw error;
    }
};

/**
 * Get all agents for a user
 * @param userId - Wallet address of the user
 */
const getAgents = async (userId: string): Promise<GetAgentsResponse> => {
    try {
        console.log("===== BLEND SERVICE GET AGENTS =====");
        console.log("Fetching agents for user:", userId);
        console.log("API URL:", `${API_URL}/web3_manager/${userId}/agents`);
        
        const response = await axios.get(`${API_URL}/web3_manager/${userId}/agents`);
        
        console.log("Response status:", response.status);
        console.log("Get agents response data:", response.data);
        console.log("===== END BLEND SERVICE GET AGENTS =====");
        
        return {
            agents: response.data as Agent[]
        };
    } catch (error: any) {
        console.error("===== BLEND SERVICE GET AGENTS ERROR =====");
        console.error("Error getting agents:", error);
        console.error("Error message:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Request config:", error.config);
        }
        console.error("===== END BLEND SERVICE GET AGENTS ERROR =====");
        throw error;
    }
};

export default { 
    API_URL, 
    createAgents, 
    runAgent, 
    getAgents 
};