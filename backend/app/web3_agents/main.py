from .converter_agent import Web3Converter
from .onchain_agent import OnChainAgents, load_agent, ask_agent
from typing import List, Optional

class Web3AgentManager:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.web3_converter = Web3Converter()
        self.agents: List[OnChainAgents] = []
        self._instance_id = id(self)
        print(f"Initialized Web3AgentManager with ID: {self._instance_id}")
        
    def initialize_agents(self, function_names: List[str], wallet_id: Optional[str] = None) -> OnChainAgents:
        """Initialize agents based on wallet_id, function_names, and optionally wallet_address"""
        if wallet_id:
            # Load existing agent using wallet_address
            agent = load_agent(wallet_id=wallet_id, functions=function_names)
            agent.wallet_id = wallet_id
            print(f"Initialized existing agent with wallet address: {wallet_id}")
        else:
            # Create a new agent
            agent = load_agent(functions=function_names)
            print(f"Initialized new agent with wallet ID: {wallet_id} and functions: {function_names}")

        return agent

    def create_agents(self, prompt: str) -> List[OnChainAgents]:
        """Create agents based on the prompt"""
        try:
            print(f"Creating agents with manager {self._instance_id}")
            self.web3_converter.run(prompt)
            agent_counter = 1
            
            functions = self.web3_converter.functions
            print(f"\nAvailable functions for manager {self._instance_id}:", functions)
            
            # Clear existing agents
            self.agents = []
            
            # Create a list to store all created agents
            created_agents = []
            
            for func_list in functions:
                try:
                    if isinstance(func_list, list):
                        agent_name = f"agent{agent_counter}"
                        # Create a new agent and append it to the list
                        agent = self.initialize_agents(function_names=func_list)
                        created_agents.append(agent)
                        agent_counter += 1
                except Exception as e:
                    print(f"Error creating agent: {str(e)}")
                    continue
            
            # Update the class's agents list with all created agents
            self.agents = created_agents
            
            print(f"\nManager {self._instance_id} created {len(self.agents)} agents")
            return self.agents
            
        except Exception as e:
            print(f"Error in create_agents: {str(e)}")
            raise
    
    def run_agent(self, functions:List[str], wallet_id: str, agent_index: int, prompt: str) -> str:
        """Run a specific agent with the given prompt"""
        agent = self.initialize_agents(function_names=functions, wallet_id=wallet_id)            
        return ask_agent(agent, prompt)
    
    def get_agents(self) -> List[OnChainAgents]:
        """Get all created agents"""
        return self.agents