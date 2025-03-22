from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional
from ...web3_agents.main import Web3AgentManager
import json 
import os  

router = APIRouter(prefix="/web3_manager/{user_id}", tags=["web3"])

agent_manager = Web3AgentManager(user_id="{user_id}")
# 
# Request/Response Models
class PromptRequest(BaseModel):
    prompt: str

class AgentRunRequest(BaseModel):
    agent_index: int = 0
    prompt: str
    wallet_id: str
    functions: List[str]

class AgentResponse(BaseModel):
    name: str
    functions: List[str]
    wallet_address: str
    wallet_id: Optional[str] = None
    user_id: str

class CreateAgentsResponse(BaseModel):
    success: bool
    message: str
    agent_count: int
    agents: List[AgentResponse]

class RunAgentResponse(BaseModel):
    success: bool
    result: str

# Routes
@router.post("/create-agents", response_model=CreateAgentsResponse)
async def create_agents(
    request: PromptRequest,
    user_id: str
):
    try:
        agents = agent_manager.create_agents(request.prompt)
        print(f"Created {len(agents)} agents with manager {id(agent_manager)}")
        
        agent_responses = [
            AgentResponse(
                name=f"agent{i+1}",
                functions=agent.function_names,
                wallet_address=agent._get_wallet_address(),
                wallet_id=agent.wallet_id,  # Always send the wallet_id back to the frontend
                user_id=f"{user_id}"  # Include user_id in the response
            )
            for i, agent in enumerate(agents)
        ]
        
        # Define the directory and file path
        dir_path = f"user_data"
        file_path = os.path.join(dir_path, f"{user_id}.json")

        # Create the directory if it doesn't exist
        os.makedirs(dir_path, exist_ok=True)

        # Save agent_responses to a JSON file
        with open(file_path, "w") as json_file:
            json.dump([response.dict() for response in agent_responses], json_file)

        return CreateAgentsResponse(
            success=True,
            message=f"Created {len(agents)} agents",
            agent_count=len(agents),
            agents=agent_responses
        )
    except Exception as e:
        print(f"Error in create_agents route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents", response_model=List[AgentResponse])
async def get_agents(user_id: str):
    try:
        # Define the directory and file path
        dir_path = f"user_data"
        file_path = os.path.join(dir_path, f"{user_id}.json")

        # Check if the file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="No agents found for this user.")

        with open(file_path, "r") as json_file:
            agents_data = json.load(json_file)

        print(f"Getting agents from JSON file for user {user_id}: {len(agents_data)} agents")
        
        responses = [
            AgentResponse(
                name=agent['name'],
                functions=agent['functions'],
                wallet_address=agent['wallet_address'],
                wallet_id=agent['wallet_id'],
                user_id=agent['user_id']
            )
            for agent in agents_data
        ]
        print(f"Returning {len(responses)} agent responses")
        return responses
        
    except Exception as e:
        print(f"Error in get_agents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run-agent", response_model=RunAgentResponse)
async def run_agent(
    request: AgentRunRequest,
    user_id: str
):
    try:
        result = agent_manager.run_agent(request.functions, request.wallet_id, request.agent_index, request.prompt)
        return RunAgentResponse(
            success=True,
            result=result
        )
    except IndexError as e:
        raise HTTPException(status_code=404, detail=f"Agent {request.agent_index} not found")
    except Exception as e:
        print(f"Error running agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
