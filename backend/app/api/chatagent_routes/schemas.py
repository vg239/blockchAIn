from pydantic import BaseModel
from typing import List, Dict,Optional

class agentCreation(BaseModel):
    prompt : str
    nftHash : str


# for the case just return normal wallet address
class walletAddress(BaseModel):
    walletAddress : str

class agentInteract(BaseModel):
    prompt : str
    nftHash : str
    userId : str

class agentInteractResponse(BaseModel):
    response : str
    isMetaMask : bool
    walletAddress : Optional[str] = None
    value : Optional[float] = None
    Responses : int

class ChatAuthorization(BaseModel):
    creator: str  # wallet address of creator
    members: List[str]  # list of wallet addresses for members

class ChatAuthorizerMap(BaseModel):
    chatAuthorizerMap: Dict[str, ChatAuthorization]  # map of chat IDs to ChatAuthorization objects