import axios from 'axios';

const API_URL = 'http://localhost:8080/aigent';

interface ConvoHistoryOptions {
  limit?: number;
  offset?: number;
}

export const createAgents = async (userId: string, nftHash: string, prompt: string) => {
    try{
        console.log("Sending the request with the userId: ", userId, "and the nftHash: ", nftHash, "and the prompt: ", prompt);
        const response = await axios.post(`${API_URL}/create-agent/${userId}`, {
            nftHash,
            prompt
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating agents: ", error);
        throw error;
    }
};

export const interactWithAgent = async (nftHash: string, userId: string, prompt: string) => {
    try{
        const response = await axios.post(`${API_URL}/agent-interact/${nftHash}/${userId}`, {
            nftHash,
            userId,
            prompt
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error interacting with agent: ", error);
        throw error;
    }
};

export const convoHistory = async (nftHash: string, userId: string, options: ConvoHistoryOptions = {}) => {
    try{
        const response = await axios.get(`${API_URL}/conversation-history/${nftHash}/${userId}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting conversation history: ", error);
        throw error;
    }
};

export const getUserAgents = async (userId: string) => {
    try {
        const response = await axios.get(`${API_URL}/user-agents/${userId}`);
        console.log("User agents data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting user agents: ", error);
        throw error;
    }
};

// Named export as a group for backwards compatibility
export const aigentService = {
  createAgents,
  interactWithAgent,
  convoHistory,
  getUserAgents
};



// Default export
export default aigentService;