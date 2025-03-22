from phi.model.google import Gemini
from phi.agent import Agent, RunResponse
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import os
from typing import List, Union
from cdp import *
from cdp.errors import UnsupportedAssetError
from decimal import Decimal
from web3 import Web3


load_dotenv()

class Function(BaseModel):

    task: str = Field(..., description="The task that needs to be done.")
    flow: str = Field(..., description="How the functions will be used to accomplish the task.")
    function: List[str] = Field(..., description="The functions needed to accomplish the task.")


class Functions(BaseModel):
    functions: List[Function] = Field(..., description="The functions that should be added to the web3 application.")


# Contract addresses for Basenames
BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_MAINNET = "0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5"
BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_TESTNET = "0x49aE3cC2e3AA768B1e5654f5D3C6002144A59581"
L2_RESOLVER_ADDRESS_MAINNET = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD"
L2_RESOLVER_ADDRESS_TESTNET = "0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA"


# Function to create registration arguments for Basenames
def create_register_contract_method_args(base_name: str, address_id: str,
                                         is_mainnet: bool) -> dict:
    """
    Create registration arguments for Basenames.
    
    Args:
        base_name (str): The Basename (e.g., "example.base.eth" or "example.basetest.eth")
        address_id (str): The Ethereum address
        is_mainnet (bool): True if on mainnet, False if on testnet
    
    Returns:
        dict: Formatted arguments for the register contract method
    """
    w3 = Web3()

    resolver_contract = w3.eth.contract(abi=l2_resolver_abi)

    name_hash = w3.ens.namehash(base_name)

    address_data = resolver_contract.encode_abi("setAddr",
                                                args=[name_hash, address_id])

    name_data = resolver_contract.encode_abi("setName",
                                             args=[name_hash, base_name])

    register_args = {
        "request": [
            base_name.replace(".base.eth" if is_mainnet else ".basetest.eth",
                              ""),
            address_id,
            "31557600",  # 1 year in seconds
            L2_RESOLVER_ADDRESS_MAINNET
            if is_mainnet else L2_RESOLVER_ADDRESS_TESTNET,
            [address_data, name_data],
            True
        ]
    }

    return register_args


# Function to register a basename
def register_basename(basename: str, amount: float = 0.002):
    """
    Register a basename for the agent's wallet.
    
    Args:
        basename (str): The basename to register (e.g. "myname.base.eth" or "myname.basetest.eth")
        amount (float): Amount of ETH to pay for registration (default 0.002)
    
    Returns:
        str: Status message about the basename registration
    """
    address_id = agent_wallet.default_address.address_id
    is_mainnet = agent_wallet.network_id == "base-mainnet"

    suffix = ".base.eth" if is_mainnet else ".basetest.eth"
    if not basename.endswith(suffix):
        basename += suffix

    register_args = create_register_contract_method_args(
        basename, address_id, is_mainnet)

    try:
        contract_address = (BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_MAINNET
                            if is_mainnet else
                            BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_TESTNET)

        invocation = agent_wallet.invoke_contract(
            contract_address=contract_address,
            method="register",
            args=register_args,
            abi=registrar_abi,
            amount=amount,
            asset_id="eth",
        )
        invocation.wait()
        return f"Successfully registered basename {basename} for address {address_id}"
    except ContractLogicError as e:
        return f"Error registering basename: {str(e)}"
    except Exception as e:
        return f"Unexpected error registering basename: {str(e)}"

class Web3Converter:
    def __init__(self):
        self.functions = {
            "create_token": "Create a new ERC-20 token with a specified name, symbol, and initial supply.",
            "transfer_asset": "Transfer an asset to a specific address, checking balances and handling gasless transfers.",
            "get_balance": "Get the balance of a specific asset in the agent's wallet.",
            "request_eth_from_faucet": "Request ETH from the Base Sepolia testnet faucet.",
            # "generate_art": "Generate art using DALL-E based on a text prompt.",
            "deploy_nft": "Deploy an ERC-721 NFT contract with a specified name, symbol, and base URI.",
            "mint_nft": "Mint an NFT to a specified address from a given contract.",
            "swap_assets": "Swap one asset for another using the trade function, available only on Base Mainnet.",
            # "create_register_contract_method_args": "Create registration arguments for Basenames.",
            # "register_basename": "Register a basename for the agent's wallet."
        }
        self.converter = Agent(
            model=Gemini(model='gemini-2.0-flash-exp', api_key=os.getenv("GEMINI_API_KEY")),
            description=(
                "You are a highly skilled web3 developer with expertise in transitioning web2 applications to web3."
                "Your role is to critically assess the web2 application and recommend essential web3 functionalities only when they are truly needed."
            ),
            instructions=[
                "You will receive a detailed description of a web2 application.",
                f"The current functionalities you can provide are:\n{self.functions}",
                "Evaluate the provided functions and select only those that are necessary for enhancing the web2 application with web3 capabilities.",
                "Keep in mind that you need to give different tasks which can be implemented to bring web3 and the list should contain all the funtions needed to do the task."
                "For each task, list the necessary functions required to accomplish it.",
                "If a task requires only one function, provide just that function's name in the list.",
                "For each recommended function, provide a clear justification for its necessity and explain how it can be effectively integrated into the web3 application.",
            ],
            response_model=Functions,
            debug_mode=True
        )


    def run(self, user_prompt):
        run: RunResponse = self.converter.run(user_prompt)
        self.functions = []
        for funcs in run.content.functions:
            tool = []
            for func in funcs.function:
                tool.append(func)
            self.functions.append(tool)

