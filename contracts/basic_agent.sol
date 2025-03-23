// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 1. Basic ERC20 Token Contract
contract BasicToken {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;
    uint256 public totalSupply;
    string public name;
    string public symbol;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}

// 2. Basic NFT Contract
contract BasicNFT {
    mapping(uint256 => address) public tokenOwner;
    mapping(address => uint256) public ownerTokenCount;
    uint256 public totalSupply;
    
    event Transfer(address indexed from, address indexed to, uint256 tokenId);
    
    function mint() public {
        uint256 tokenId = totalSupply + 1;
        tokenOwner[tokenId] = msg.sender;
        ownerTokenCount[msg.sender] += 1;
        totalSupply += 1;
        emit Transfer(address(0), msg.sender, tokenId);
    }
}

// 3. Simple Crowdfunding Contract
contract Crowdfunding {
    address public creator;
    uint256 public goal;
    uint256 public endTime;
    mapping(address => uint256) public contributions;
    uint256 public totalRaised;
    
    constructor(uint256 _goal, uint256 _duration) {
        creator = msg.sender;
        goal = _goal;
        endTime = block.timestamp + _duration;
    }
    
    function contribute() public payable {
        require(block.timestamp < endTime, "Campaign ended");
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
    }
}

// 4. Basic Staking Contract
contract Staking {
    mapping(address => uint256) public stakedBalances;
    mapping(address => uint256) public stakingTimestamp;
    
    function stake() public payable {
        require(msg.value > 0, "Cannot stake 0");
        stakedBalances[msg.sender] += msg.value;
        stakingTimestamp[msg.sender] = block.timestamp;
    }
    
    function withdraw() public {
        uint256 balance = stakedBalances[msg.sender];
        require(balance > 0, "No staked amount");
        stakedBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }
}

// 5. Simple Voting Contract
contract Voting {
    mapping(address => bool) public hasVoted;
    mapping(uint256 => uint256) public voteCounts;
    uint256 public proposalCount;
    
    function vote(uint256 proposalId) public {
        require(!hasVoted[msg.sender], "Already voted");
        require(proposalId <= proposalCount, "Invalid proposal");
        hasVoted[msg.sender] = true;
        voteCounts[proposalId] += 1;
    }
}

// 6. Multi-Signature Wallet
contract MultiSigWallet {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public required;
    
    struct Transaction {
        address to;
        uint256 value;
        bool executed;
    }
    
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    
    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required number");
        
        for (uint256 i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        required = _required;
    }
}

// 7. Time Lock Contract
contract TimeLock {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lockTime;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
        lockTime[msg.sender] = block.timestamp + 1 weeks;
    }
    
    function withdraw() public {
        require(block.timestamp >= lockTime[msg.sender], "Lock time not expired");
        uint256 balance = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }
}

// 8. Simple DEX Contract
contract SimpleDEX {
    mapping(address => mapping(address => uint256)) public tokens;
    
    function deposit(address token, uint256 amount) public {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        tokens[msg.sender][token] += amount;
    }
    
    function withdraw(address token, uint256 amount) public {
        require(tokens[msg.sender][token] >= amount, "Insufficient balance");
        tokens[msg.sender][token] -= amount;
        require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
    }
}

// 9. Escrow Contract
contract Escrow {
    address public buyer;
    address public seller;
    address public arbiter;
    uint256 public amount;
    bool public isApproved;
    
    constructor(address _seller, address _arbiter) payable {
        buyer = msg.sender;
        seller = _seller;
        arbiter = _arbiter;
        amount = msg.value;
    }
    
    function approve() public {
        require(msg.sender == arbiter, "Only arbiter can approve");
        isApproved = true;
        payable(seller).transfer(amount);
    }
}

// 10. Subscription Contract
contract Subscription {
    struct Plan {
        uint256 price;
        uint256 duration;
    }
    
    mapping(address => uint256) public subscriptionEndTime;
    Plan public plan;
    
    constructor(uint256 _price, uint256 _duration) {
        plan = Plan(_price, _duration);
    }
    
    function subscribe() public payable {
        require(msg.value == plan.price, "Incorrect payment amount");
        subscriptionEndTime[msg.sender] = block.timestamp + plan.duration;
    }
    
    function isSubscribed(address user) public view returns (bool) {
        return subscriptionEndTime[user] > block.timestamp;
    }
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}