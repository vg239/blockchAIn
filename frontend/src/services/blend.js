//this is the file to be used for the blending and for web2 to web3 functions

import axios from 'axios';

const API_URL = 'http://localhost:8000/blend'; //change to prod later

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
//create agents will return 

/*
{
  "success": true,
  "message": "string",
  "agent_count": 0,
  "agents": [
    {
      "name": "string",
      "functions": [
        "string"
      ],
      "wallet_address": "string",
      "wallet_id": "string", //this is to be used while using the run agent function make sure not to use the wallet address
      "user_id": "string"
    }
  ]
}
*/


//here the userId is the wallet of the user
//the agent will only run once you give it some wallet balance make sure to give it some base eth
//the prompt will be given by the user 
//functions will be returned as a list in the create agents functions and here functions which will be sent will be a list of strings only
/*
{
  "agent_index": 0,
  "prompt": "string",
  "wallet_id": "string",
  "functions": [
    "string"
  ]
}

*/ 
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

export default {createAgents, runAgent};