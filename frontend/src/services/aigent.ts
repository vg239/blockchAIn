import axios from 'axios';
// Remove the crypto import as we'll use the Web Crypto API
// import * as crypto from 'crypto';

const API_URL = 'http://localhost:8080/aigent';

interface ConvoHistoryOptions {
  limit?: number;
  offset?: number;
}

export interface CreateAgentParams {
  name: string;
  description: string;
  instructions: string;
  nft_url?: string;
}

export interface CreatePromptParams {
  name: string;
  description: string;
  prompt: string;
}

export interface Agent {
  nft_hash: string;
  name: string;
  description: string;
  instructions: string;
  nft_url?: string;
  user_id: string;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  user_id: string;
}

/**
 * Generate SHA256 hash from wallet address
 * @param walletAddress - Wallet address to hash
 */
const generateNftHash = (walletAddress: string): string => {
  // Since we can't use async/await in a synchronous function,
  // we'll use a deterministic algorithm that mimics a hash
  
  // Function to generate a deterministic hash-like string
  const simpleHash = (str: string): string => {
    let hash = 0;
    if (str.length === 0) return hash.toString(16);
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert the hash to a hex string and ensure it's positive
    let hexString = Math.abs(hash).toString(16);
    
    // Pad the string to ensure it's at least 64 characters (similar to SHA-256 output)
    while (hexString.length < 64) {
      // Use the existing hash to generate more characters
      const nextChar = Math.abs(hash + hexString.length).toString(16).charAt(0);
      hexString += nextChar;
    }
    
    return hexString;
  };
  
  // Generate a consistent hash-like string from the wallet address
  return simpleHash(walletAddress);
};

/**
 * Create a new agent
 * @param userId - Wallet address of the user
 * @param prompt - Prompt to create the agent with
 */
const createAgent = async (userId: string, prompt: string) => {
  try {
    // Generate NFT hash from wallet address
    const nftHash = generateNftHash(userId);
    
    console.log("===== AIGENT SERVICE CREATE AGENT =====");
    console.log("User ID:", userId);
    console.log("Prompt (raw):", prompt);
    console.log("Generated NFT hash:", nftHash);
    
    // Log the exact request payload we're sending to the backend
    const requestPayload = {
      prompt,
      nftHash
    };
    console.log("Request payload:", requestPayload);
    
    // The API only requires prompt and nftHash
    const response = await axios.post(`${API_URL}/create-agent/${userId}`, requestPayload);
    
    console.log("API URL:", `${API_URL}/create-agent/${userId}`);
    console.log("Create agent response:", response.data);
    console.log("Response status:", response.status);
    console.log("===== END AIGENT SERVICE CREATE AGENT =====");
    
    // Return a minimal agent object
    const agent: Agent = {
      nft_hash: nftHash,
      name: "AI Agent",
      description: prompt,
      instructions: prompt,
      user_id: userId
    };
    
    // Combine response data with our agent object if needed
    if (response.data && typeof response.data === 'object') {
      return {
        ...agent,
        ...response.data
      };
    }
    
    return agent;
  } catch (error: any) {
    console.error("===== AIGENT SERVICE CREATE AGENT ERROR =====");
    console.error("Error creating agent:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Request config:", error.config);
    }
    console.error("===== END AIGENT SERVICE CREATE AGENT ERROR =====");
    throw error;
  }
};

/**
 * Interact with an agent
 * @param nftHash - NFT hash of the agent
 * @param userId - Wallet address of the user
 * @param prompt - Prompt to send to the agent
 */
const interactWithAgent = async (nftHash: string, userId: string, prompt: string) => {
  try {
    console.log("Interacting with agent:", nftHash);
    console.log("User ID:", userId);
    console.log("Prompt:", prompt);
    
    const response = await axios.post(`${API_URL}/agent-interact/${nftHash}/${userId}`, {
      prompt,
      nftHash,
      userId
    });
    
    console.log("Interaction response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error interacting with agent:", error);
    throw error;
  }
};

/**
 * Get conversation history with an agent
 * @param nftHash - NFT hash of the agent
 * @param userId - Wallet address of the user
 * @param options - Pagination options
 */
const convoHistory = async (nftHash: string, userId: string, options: ConvoHistoryOptions = {}) => {
  try {
    console.log("Getting conversation history for agent:", nftHash);
    console.log("User ID:", userId);
    console.log("Options:", options);
    
    const response = await axios.get(`${API_URL}/conversation-history/${nftHash}/${userId}`, {
      params: options
    });
    
    console.log("History response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting conversation history:", error);
    throw error;
  }
};

/**
 * Get all agents for a user
 * @param userId - Wallet address of the user
 */
const getUserAgents = async (userId: string) => {
  try {
    console.log("Getting agents for user:", userId);
    
    const response = await axios.get(`${API_URL}/user-agents/${userId}`);
    
    console.log("Get user agents response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting user agents:", error);
    throw error;
  }
};

/**
 * Create a new prompt
 * @param userId - Wallet address of the user
 * @param promptParams - Prompt parameters
 */
const createPrompt = async (userId: string, promptParams: CreatePromptParams) => {
  try {
    console.log("Creating prompt for user:", userId);
    console.log("Prompt params:", promptParams);
    
    const response = await axios.post(`${API_URL}/create-prompt/${userId}`, promptParams);
    
    console.log("Create prompt response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating prompt:", error);
    throw error;
  }
};

/**
 * Get all prompts for a user
 * @param userId - Wallet address of the user
 */
const getPrompts = async (userId: string) => {
  try {
    console.log("Getting prompts for user:", userId);
    
    const response = await axios.get(`${API_URL}/prompts/${userId}`);
    
    console.log("Get prompts response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting prompts:", error);
    throw error;
  }
};

/**
 * Run an agent with a prompt
 * @param userId - Wallet address of the user
 * @param agentNftHash - NFT hash of the agent
 * @param promptId - ID of the prompt
 */
const runAgentWithPrompt = async (userId: string, agentNftHash: string, promptId: string) => {
  try {
    console.log("Running agent with prompt for user:", userId);
    console.log("Agent NFT hash:", agentNftHash);
    console.log("Prompt ID:", promptId);
    
    const response = await axios.post(`${API_URL}/run-agent/${userId}`, {
      nftHash: agentNftHash,
      promptId
    });
    
    console.log("Run agent response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error running agent with prompt:", error);
    throw error;
  }
};

const aigentService = {
  createAgent,
  interactWithAgent,
  convoHistory,
  getUserAgents,
  createPrompt,
  getPrompts,
  runAgentWithPrompt,
  generateNftHash
};

export default aigentService;