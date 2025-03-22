import axios from 'axios';

export const API_URL = 'http://localhost:8080/blend'; // Change to prod later

//send the prompt as a string and the wallet as the user id to be used for creating the agents
const createAgents = async (prompt, userId) => {
    try{
        console.log("Sending the request with the prompt: ", prompt, "and the user id: ", userId);
        const response = await axios.post(`${API_URL}/web3_manager/${userId}/create-agents`, {
            prompt,
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating agents: ", error);
        throw error;
    }
};

const runAgent = async (userId, agent_index, prompt, wallet_id, functions) => {
    try{
        console.log("Sending the request with the agent index: ", agent_index, "and the prompt: ", prompt, "and the wallet id: ", wallet_id, "and the functions: ", functions);
        const response = await axios.post(`${API_URL}/web3_manager/${userId}/run-agent`, {
            agent_index,
            prompt,
            wallet_id,
            functions //this is a list of strings which would have been sent before use agent index as how it is returned according to indexing starting from 1
            });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error running agent: ", error);
        throw error;
    }
};

// Function to get all agents for a user
const getAgents = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/web3_manager/${userId}/agents`);
        return response.data;
    } catch (error) {
        console.error("Error getting agents:", error);
        throw error;
    }
};

export default {API_URL, createAgents, runAgent, getAgents};