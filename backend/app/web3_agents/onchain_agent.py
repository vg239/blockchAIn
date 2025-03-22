from dotenv import load_dotenv
from cdp import *
import os
import json
from phi.model.google import Gemini
from phi.agent import Agent, RunResponse
from cdp.errors import UnsupportedAssetError
from typing import Optional, List, Union
from decimal import Decimal
from pydantic import BaseModel

load_dotenv()

# # Function to get the balance of a specific asset
# def get_balance(asset_id):
#     """
#     Get the balance of a specific asset in the agent's wallet.
    
#     Args:
#         asset_id (str): Asset identifier ("eth", "usdc") or contract address of an ERC-20 token
    
#     Returns:
#         str: A message showing the current balance of the specified asset
#     """
#     balance = agent_wallet.balance(asset_id)
#     return f"Current balance of {asset_id}: {balance}"


def configure_cdp():
    try:
        API_KEY_NAME = os.environ.get("CDP_API_KEY_NAME")
        PRIVATE_KEY = os.environ.get("CDP_PRIVATE_KEY", "")
        
        if not API_KEY_NAME or not PRIVATE_KEY:
            raise ValueError("CDP credentials not found in environment variables")
            
        # Clean up private key - remove any extra quotes and properly handle newlines
        PRIVATE_KEY = PRIVATE_KEY.strip('"').replace('\\n', '\n')
        
        print("Configuring CDP with:")
        print(f"API Key Name: {API_KEY_NAME}")
        print(f"Private Key Length: {len(PRIVATE_KEY)}")
        
        Cdp.configure(API_KEY_NAME, PRIVATE_KEY)
        return True
    except Exception as e:
        print(f"Error configuring CDP: {str(e)}")
        return False

cdp_configured = configure_cdp()    

class OnChainAgents:
    def __init__(self, wallet_id: Optional[str] = None):
        """
        Initialize an OnChainAgent with optional wallet_id.
        If wallet_id is provided, loads existing wallet, else creates new one.
        
        Args:
            wallet_id: Optional ID of existing wallet to load
        """
        if not cdp_configured:
            raise ValueError("CDP configuration failed. Check your credentials.")
        
        self.WalletStorage = "wallet_storage"
        os.makedirs(self.WalletStorage, exist_ok=True)
        
        # Initialize wallet
        self.wallet_id = wallet_id
        self.wallet = self._initialize_wallet(wallet_id)
        
        # Save wallet data after initialization
        if self.wallet:
            wallet_data = self.wallet.export_data()
            self._save_wallet(wallet_data)
    
    def _initialize_wallet(self, wallet_id: Optional[str] = None) -> Wallet:
        """Initialize wallet based on wallet_id or create new one"""
        if wallet_id:
            # Try to load existing wallet
            wallet_data = self._load_wallet(wallet_id)
            if wallet_data:
                try:
                    data = WalletData(
                        wallet_id=wallet_data['wallet_id'],
                        seed=wallet_data['seed']
                    )
                    wallet = Wallet.import_data(data)
                    print(f"Loaded existing wallet: {wallet_id}")
                    return wallet
                except Exception as e:
                    print(f"Error importing wallet data: {str(e)}")
        
        # Create new wallet if no wallet_id or wallet not found
        try:
            wallet = Wallet.create()
            wallet_data = wallet.export_data()
            self.wallet_id = wallet_data.wallet_id
            print(f"Created new wallet: {self.wallet_id}")
            return wallet
        except Exception as e:
            print(f"Error creating new wallet: {str(e)}")
            raise

    def _load_wallet(self, wallet_id: str) -> Optional[dict]:
        """Load wallet data from storage"""
        file_path = os.path.join(self.WalletStorage, f"{wallet_id}.json")
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r') as file:
                    data = json.load(file)
                    print(f"Loaded wallet data for {wallet_id}")
                    return data
            else:
                print(f"No wallet data found for ID: {wallet_id}")
        except Exception as e:
            print(f"Error loading wallet data: {str(e)}")
        return None
    
    def _get_wallet_address(self):
        return self.wallet.default_address.address_id
    
    def _save_wallet(self, wallet_data: WalletData):
        """Save wallet data and update registry"""
        try:
            # Save wallet data
            file_path = os.path.join(self.WalletStorage, f"{wallet_data.wallet_id}.json")
            with open(file_path, 'w') as file:
                json.dump(wallet_data.to_dict(), file)
            
            # Save encrypted seed
            seed_file = os.path.join(self.WalletStorage, f"{wallet_data.wallet_id}_seed.json")
            self.wallet.save_seed(seed_file, encrypt=True)
            
            # Update registry
            self._update_wallet_registry(wallet_data.wallet_id)
            print(f"Wallet {wallet_data.wallet_id} saved successfully")
            
        except Exception as e:
            print(f"Error saving wallet data: {str(e)}")
            raise

    def _update_wallet_registry(self, wallet_id: str):
        """Update the registry of wallet IDs"""
        registry_file = os.path.join(self.WalletStorage, "wallet_registry.txt")
        try:
            existing_ids = set()
            if os.path.exists(registry_file):
                with open(registry_file, 'r') as file:
                    existing_ids = set(file.read().splitlines())
            
            if wallet_id not in existing_ids:
                with open(registry_file, 'a') as file:
                    file.write(f"{wallet_id}\n")
                print(f"Added {wallet_id} to registry")
        except Exception as e:
            print(f"Error updating registry: {str(e)}")

def load_agent(wallet_id: Optional[str] = None, functions: Optional[List[str]] = None) -> OnChainAgents:
    """
    Load or create an OnChainAgent and equip it with specified functions.
    
    Args:
        wallet_id: Optional ID of existing wallet to load
        functions: List of function names to equip the agent with
    
    Returns:
        OnChainAgents: Initialized agent with specified functions
    """
    try:
        # Create/load the agent
        agent = OnChainAgents(wallet_id=wallet_id)

        # Function to create a new ERC-20 token
        def create_token(name, symbol, initial_supply):
            """
            Create a new ERC-20 token.
            
            Parameters:
            name (str): The name of the token
            symbol (str): The symbol of the token
            initial_supply (int): The initial supply of tokens and should be input as integers
            
            Returns:
            str: A message confirming the token creation with details
            """
            print(type(initial_supply))
            initial_supply = int(initial_supply)
            print(type(initial_supply))
            deployed_contract = agent.wallet.deploy_token(name, symbol, initial_supply)
            deployed_contract.wait()
            return f"Token {name} ({symbol}) created with initial supply of {initial_supply} and contract address {deployed_contract.contract_address}"


        # Function to transfer assets
        def transfer_asset(amount, asset_id, destination_address):
            """
            Transfer an asset to a specific address.
            
            Parameters:
            amount (Union[int, float, Decimal]): Amount to transfer
            asset_id (str): Asset identifier ("eth", "usdc") or contract address of an ERC-20 token
            destination_address (str): Recipient's address
            
            Returns:
            str: A message confirming the transfer or describing an error
            """
            try:
                # Check if we're on Base Mainnet and the asset is USDC for gasless transfer
                is_mainnet = agent.wallet.network_id == "base-mainnet"
                is_usdc = asset_id.lower() == "usdc"
                gasless = is_mainnet and is_usdc

                # For ETH and USDC, we can transfer directly without checking balance
                if asset_id.lower() in ["eth", "usdc"]:
                    transfer = agent.wallet.transfer(amount,
                                                    asset_id,
                                                    destination_address,
                                                    gasless=gasless)
                    transfer.wait()
                    gasless_msg = " (gasless)" if gasless else ""
                    return f"Transferred {amount} {asset_id}{gasless_msg} to {destination_address}"

                # For other assets, check balance first
                try:
                    balance = agent.wallet.balance(asset_id)
                except UnsupportedAssetError:
                    return f"Error: The asset {asset_id} is not supported on this network. It may have been recently deployed. Please try again in about 30 minutes."

                if balance < amount:
                    return f"Insufficient balance. You have {balance} {asset_id}, but tried to transfer {amount}."

                transfer = agent.wallet.transfer(amount, asset_id, destination_address)
                transfer.wait()
                return f"Transferred {amount} {asset_id} to {destination_address}"
            except Exception as e:
                return f"Error transferring asset: {str(e)}. If this is a custom token, it may have been recently deployed. Please try again in about 30 minutes, as it needs to be indexed by CDP first."


        # Function to get the balance of a specific asset
        def get_balance(asset_id):
            """
            Get the balance of a specific asset in the agent's wallet.
            
            Parameters:
            asset_id (str): Asset identifier ("eth", "usdc") or contract address of an ERC-20 token
            
            Returns:
            str: A message showing the current balance of the specified asset.
            """
            balance = agent.wallet.balance(asset_id)
            return f"Current balance of {asset_id}: {balance}"

        # Function to request ETH from the faucet (testnet only)
        def request_eth_from_faucet():
            """
            Request ETH from the Base Sepolia testnet faucet.
            
            Returns:
            str: Status message about the faucet request
            """
            if agent.wallet.network_id == "base-mainnet":
                return "Error: The faucet is only available on Base Sepolia testnet."

            faucet_tx = agent.wallet.faucet()
            return f"Requested ETH from faucet. Transaction: {faucet_tx}"


        # # Function to generate art using DALL-E (requires separate OpenAI API key)
        # def generate_art(prompt):
        #     """
        #     Generate art using DALL-E based on a text prompt.
            
        #     Args:
        #         prompt (str): Text description of the desired artwork
            
        #     Returns:
        #         str: Status message about the art generation, including the image URL if successful
        #     """
        #     try:
        #         client = OpenAI()
        #         response = client.images.generate(
        #             model="dall-e-3",
        #             prompt=prompt,
        #             size="1024x1024",
        #             quality="standard",
        #             n=1,
        #         )

        #         image_url = response.data[0].url
        #         return f"Generated artwork available at: {image_url}"

        #     except Exception as e:
        #         return f"Error generating artwork: {str(e)}"


        # Function to deploy an ERC-721 NFT contract
        def deploy_nft(name, symbol, base_uri):
            """
            Deploy an ERC-721 NFT contract.
            
            Parameters:
            name (str): Name of the NFT collection
            symbol (str): Symbol of the NFT collection
            base_uri (str): Base URI for token metadata
            
            Returns:
            str: Status message about the NFT deployment, including the contract address
            """
            try:
                deployed_nft = agent.wallet.deploy_nft(name, symbol, base_uri)
                deployed_nft.wait()
                contract_address = deployed_nft.contract_address

                return f"Successfully deployed NFT contract '{name}' ({symbol}) at address {contract_address} with base URI: {base_uri}"

            except Exception as e:
                return f"Error deploying NFT contract: {str(e)}"


        # Function to mint an NFT
        def mint_nft(contract_address, mint_to):
            """
            Mint an NFT to a specified address.
            
            Parameters:
            contract_address (str): Address of the NFT contract
            mint_to (str): Address to mint NFT to
            
            Returns:
            str: Status message about the NFT minting
            """
            try:
                mint_args = {"to": mint_to, "quantity": "1"}

                mint_invocation = agent.wallet.invoke_contract(
                    contract_address=contract_address, method="mint", args=mint_args)
                mint_invocation.wait()

                return f"Successfully minted NFT to {mint_to}"

            except Exception as e:
                return f"Error minting NFT: {str(e)}"


        # Function to swap assets (only works on Base Mainnet)
        def swap_assets(amount: Union[int, float, Decimal], from_asset_id: str,
                        to_asset_id: str):
            """
            Swap one asset for another using the trade function.
            This function only works on Base Mainnet.

            Parameters:
            amount (Union[int, float, Decimal]): Amount of the source asset to swap
            from_asset_id (str): Source asset identifier
            to_asset_id (str): Destination asset identifier

            Returns:
            str: Status message about the swap
            """
            if agent.wallet.network_id != "base-mainnet":
                return "Error: Asset swaps are only available on Base Mainnet. Current network is not Base Mainnet."

            try:
                trade = agent.wallet.trade(amount, from_asset_id, to_asset_id)
                trade.wait()
                return f"Successfully swapped {amount} {from_asset_id} for {to_asset_id}"
            except Exception as e:
                return f"Error swapping assets: {str(e)}"
            
        # Define available tools
        available_tools = {
            'get_balance': get_balance,
            'transfer_asset': transfer_asset,
            'request_eth_from_faucet': request_eth_from_faucet,
            'deploy_nft': deploy_nft,
            'mint_nft': mint_nft,
            'swap_assets': swap_assets,
            'create_token': create_token,
            # Add other tools as needed
        }
        
        # Get the requested functions
        if functions:
            tool_list = []
            for func_name in functions:
                if func_name in available_tools:
                    tool_list.append(available_tools[func_name])
                else:
                    print(f"Warning: Function {func_name} not found")
            
            # Create the agent with the tools
            agent.function_names = functions
            agent.agent = Agent(
                model=Gemini(
                    model="gemini-2.0-flash-exp",
                    api_key=os.environ.get("GEMINI_API_KEY")
                ),
                tools=tool_list
            )
            print(f"Agent equipped with functions: {functions}")
        
        return agent
        
    except Exception as e:
        print(f"Error loading agent: {str(e)}")
        raise

def ask_agent(agent: OnChainAgents, prompt: str) -> str:
    """
    Run an agent with a prompt
    
    Args:
        agent: The OnChainAgent to run
        prompt: The prompt to run the agent with
    
    Returns:
        str: The agent's response
    """
    try:
        if not hasattr(agent, 'agent'):
            raise ValueError("Agent not initialized with functions")
        response: RunResponse = agent.agent.run(prompt)
        return response.content
    except Exception as e:
        return f"Error running agent: {str(e)}"
    
# agent = load_agent(functions=["get_balance"])
# print(run_agent(agent, "What is the balance of eth in my wallet?"))