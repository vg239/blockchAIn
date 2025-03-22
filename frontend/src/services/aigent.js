import axios from 'axios';

const API_URL = 'http://localhost:8000/aigent';

//here again the userId is the wallet of the user
//nft hash is what you ll get a nft hash from the initial pinata thing 
//prompt is the prompt you want to give to the agent
const createAgents = async (userId, nftHash, prompt) => {
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
//this will return a simple wallet address for the ai agent use that everytime to use to talk with it
//again send this some address before initially for the agent to be able to interact with the user
//the mapping for everything wrt nfthash and the user has been done in backend (can be checked in maps.json and the conversation.json proeprly)

const interactWithAgent = async (nftHash, userId, prompt) => {
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
//use the response from here like response.data.response (check every logs proeprly while mapping)

const convoHistory = async (nftHash, userId) => {
    try{
        const response = await axios.get(`${API_URL}/conversation-history/${nftHash}/${userId}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting conversation history: ", error);
        throw error;
    }
};
//check the logs for the data schema (no pydantic wall for now)

export default {createAgents, interactWithAgent, convoHistory};