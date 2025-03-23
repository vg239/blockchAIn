// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Web3Bridge
 * @dev A simplified contract for Web2 to Web3 transition
 */
contract Web3Bridge is ReentrancyGuard, Pausable, Ownable {
    // State Variables
    uint256 public protocolFee = 25; // 0.25%
    
    // User Profile System
    struct UserProfile {
        string username;
        string ipfsHash;
        uint256 reputation;
        bool isVerified;
        uint256 createdAt;
    }
    
    // IPFS Content System
    struct Content {
        string title;
        string description;
        string ipfsHash;
        address creator;
        uint256 timestamp;
        ContentType contentType;
        bool isPrivate;
    }
    
    enum ContentType { 
        Document,
        Image, 
        Video, 
        Audio,
        Code,
        Other
    }
    
    // Access Control
    mapping(uint256 => mapping(address => bool)) private contentAccess;
    mapping(address => mapping(string => string)) private userSocialLinks;
    
    // Mappings
    mapping(address => UserProfile) public userProfiles;
    mapping(uint256 => Content) public contents;
    mapping(address => bool) public isRegistered;
    
    // Counters
    uint256 public contentCount;
    
    // Events
    event UserRegistered(address indexed user, string username);
    event ContentUploaded(uint256 indexed contentId, string ipfsHash, address creator);
    event AccessGranted(uint256 indexed contentId, address indexed user);
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event SocialLinkUpdated(address indexed user, string platform, string link);
    
    constructor() Ownable(msg.sender) {}
    
    // User Management
    function registerUser(
        string calldata username,
        string calldata ipfsHash
    ) external {
        require(!isRegistered[msg.sender], "Already registered");
        require(bytes(username).length > 0, "Empty username");
        
        userProfiles[msg.sender] = UserProfile({
            username: username,
            ipfsHash: ipfsHash,
            reputation: 0,
            isVerified: false,
            createdAt: block.timestamp
        });
        
        isRegistered[msg.sender] = true;
        emit UserRegistered(msg.sender, username);
    }
    
    function updateSocialLink(
        string calldata platform,
        string calldata link
    ) external {
        require(isRegistered[msg.sender], "User not registered");
        userSocialLinks[msg.sender][platform] = link;
        emit SocialLinkUpdated(msg.sender, platform, link);
    }
    
    // IPFS Content Management
    function uploadContent(
        string calldata title,
        string calldata description,
        string calldata ipfsHash,
        ContentType contentType,
        bool isPrivate
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(isRegistered[msg.sender], "User not registered");
        
        uint256 newContentId = contentCount;
        contents[newContentId] = Content({
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            creator: msg.sender,
            timestamp: block.timestamp,
            contentType: contentType,
            isPrivate: isPrivate
        });
        
        contentAccess[newContentId][msg.sender] = true;
        contentCount++;
        
        emit ContentUploaded(newContentId, ipfsHash, msg.sender);
        return newContentId;
    }
    
    // Access Management
    function grantAccess(uint256 contentId, address user) external {
        require(contents[contentId].creator == msg.sender, "Not content creator");
        contentAccess[contentId][user] = true;
        emit AccessGranted(contentId, user);
    }
    
    // Reputation System
    function updateReputation(address user, uint256 points) external onlyOwner {
        require(isRegistered[user], "User not registered");
        userProfiles[user].reputation += points;
        emit ReputationUpdated(user, userProfiles[user].reputation);
    }
    
    // View Functions
    function getContentAccess(uint256 contentId, address user) external view returns (bool) {
        return contentAccess[contentId][user];
    }
    
    function getUserProfile(address user) external view returns (
        string memory username,
        string memory ipfsHash,
        uint256 reputation,
        bool isVerified,
        uint256 createdAt
    ) {
        UserProfile storage profile = userProfiles[user];
        return (
            profile.username,
            profile.ipfsHash,
            profile.reputation,
            profile.isVerified,
            profile.createdAt
        );
    }
    
    function getSocialLink(
        address user,
        string calldata platform
    ) external view returns (string memory) {
        return userSocialLinks[user][platform];
    }
    
    // Admin Functions
    function setProtocolFee(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Fee too high"); // Max 1%
        protocolFee = newFee;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency Functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

// 1. Enhanced ERC20 Token Contract
contract RobustToken is ERC20, Ownable, Pausable {
    mapping(address => bool) public blacklisted;
    uint256 public maxSupply;
    
    event Blacklisted(address indexed account, bool status);
    event MintingFinished();
    
    bool public mintingFinished;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply
    ) ERC20(name, symbol) {
        maxSupply = _maxSupply;
    }
    
    modifier canMint() {
        require(!mintingFinished, "Minting is finished");
        _;
    }
    
    function mint(address to, uint256 amount) public onlyOwner canMint {
        require(totalSupply() + amount <= maxSupply, "Would exceed max supply");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    function setBlacklist(address account, bool status) external onlyOwner {
        blacklisted[account] = status;
        emit Blacklisted(account, status);
    }
    
    function finishMinting() public onlyOwner canMint {
        mintingFinished = true;
        emit MintingFinished();
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        require(!blacklisted[from] && !blacklisted[to], "Address is blacklisted");
        super._beforeTokenTransfer(from, to, amount);
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
}

// 2. Enhanced NFT Contract with Metadata
contract EnhancedNFT is ERC721, ERC721Enumerable, Pausable, Ownable {
    using Strings for uint256;
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    string private _baseTokenURI;
    uint256 public maxSupply;
    uint256 public mintPrice;
    bool public publicMintActive;
    
    mapping(uint256 => string) private _tokenURIs;
    
    event MintPriceUpdated(uint256 newPrice);
    event PublicMintStatusUpdated(bool status);
    event BaseURIUpdated(string newBaseURI);
    event TokenURIUpdated(uint256 indexed tokenId, string newUri);
    event MetadataUploaded(uint256 indexed tokenId, string ipfsHash);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721(name, symbol) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
    }

    // Fixed the _exists error by adding this function
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    function mint() public payable whenNotPaused {
        require(publicMintActive, "Public mint is not active");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
    }

    // New function to upload metadata to IPFS and set token URI
    function uploadMetadataToIPFS(
        uint256 tokenId, 
        string memory ipfsHash
    ) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, ipfsHash);
        emit MetadataUploaded(tokenId, ipfsHash);
    }

    // Batch mint function for creators
    function batchMint(uint256 quantity) external payable whenNotPaused {
        require(publicMintActive, "Public mint is not active");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        require(_tokenIds.current() + quantity <= maxSupply, "Would exceed max supply");

        for(uint256 i = 0; i < quantity; i++) {
            _tokenIds.increment();
            _safeMint(msg.sender, _tokenIds.current());
        }
    }
    
    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
        emit MintPriceUpdated(_mintPrice);
    }
    
    function setPublicMintActive(bool _status) external onlyOwner {
        publicMintActive = _status;
        emit PublicMintStatusUpdated(_status);
    }
    
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721: token does not exist");
        _tokenURIs[tokenId] = _tokenURI;
        emit TokenURIUpdated(tokenId, _tokenURI);
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721: token does not exist");
        
        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
        
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        
        return string(abi.encodePacked(base, tokenId.toString()));
    }

    // Royalty support
    uint256 public royaltyPercentage = 250; // 2.5% default royalty
    
    function setRoyaltyPercentage(uint256 _percentage) external onlyOwner {
        require(_percentage <= 1000, "Cannot set royalty higher than 10%");
        royaltyPercentage = _percentage;
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        require(_exists(_tokenId), "Token does not exist");
        return (owner(), (_salePrice * royaltyPercentage) / 10000);
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

// 3. Enhanced Crowdfunding Contract
contract RobustCrowdfunding is ReentrancyGuard, Ownable {
    struct Campaign {
        address creator;
        uint256 goal;
        uint256 pledged;
        uint256 startTime;
        uint256 endTime;
        bool claimed;
        string title;
        string description;
    }
    
    Campaign[] public campaigns;
    mapping(uint256 => mapping(address => uint256)) public pledges;
    
    event CampaignCreated(uint256 indexed campaignId, address creator, uint256 goal);
    event PledgeAdded(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event PledgeWithdrawn(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event CampaignFinalized(uint256 indexed campaignId, bool succeeded, uint256 amount);
    
    function createCampaign(
        uint256 goal,
        uint256 duration,
        string memory title,
        string memory description
    ) external returns (uint256) {
        require(goal > 0, "Goal must be greater than 0");
        require(duration >= 1 days && duration <= 90 days, "Invalid duration");
        
        uint256 campaignId = campaigns.length;
        campaigns.push(Campaign({
            creator: msg.sender,
            goal: goal,
            pledged: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            claimed: false,
            title: title,
            description: description
        }));
        
        emit CampaignCreated(campaignId, msg.sender, goal);
        return campaignId;
    }
    
    function pledge(uint256 campaignId) external payable nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(block.timestamp >= campaign.startTime, "Campaign not started");
        require(block.timestamp <= campaign.endTime, "Campaign ended");
        require(msg.value > 0, "Must pledge something");
        
        pledges[campaignId][msg.sender] += msg.value;
        campaign.pledged += msg.value;
        
        emit PledgeAdded(campaignId, msg.sender, msg.value);
    }
    
    function unpledge(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(block.timestamp <= campaign.endTime, "Campaign ended");
        
        uint256 pledgedAmount = pledges[campaignId][msg.sender];
        require(pledgedAmount > 0, "Nothing pledged");
        
        pledges[campaignId][msg.sender] = 0;
        campaign.pledged -= pledgedAmount;
        
        payable(msg.sender).transfer(pledgedAmount);
        emit PledgeWithdrawn(campaignId, msg.sender, pledgedAmount);
    }
    
    function finalize(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.creator, "Only creator");
        require(block.timestamp > campaign.endTime, "Campaign not ended");
        require(!campaign.claimed, "Already claimed");
        
        campaign.claimed = true;
        
        if (campaign.pledged >= campaign.goal) {
            payable(campaign.creator).transfer(campaign.pledged);
        } else {
            // Refund all pledges if goal not met
            for (uint256 i = 0; i < campaigns.length; i++) {
                address pledger = address(uint160(i)); // Convert index to address
                uint256 pledgedAmount = pledges[campaignId][pledger];
                if (pledgedAmount > 0) {
                    pledges[campaignId][pledger] = 0;
                    payable(pledger).transfer(pledgedAmount);
                }
            }
        }
        
        emit CampaignFinalized(campaignId, campaign.pledged >= campaign.goal, campaign.pledged);
    }
}

// 4. Enhanced Staking Contract
contract RobustStaking is ReentrancyGuard, Pausable, Ownable {
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    uint256 public rewardRate;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;
    
    uint256 public totalSupply;
    uint256 public minimumStake;
    uint256 public lockPeriod;
    mapping(address => uint256) public stakingTime;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    
    constructor(
        address _stakingToken,
        address _rewardToken,
        uint256 _rewardRate,
        uint256 _minimumStake,
        uint256 _lockPeriod
    ) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
        minimumStake = _minimumStake;
        lockPeriod = _lockPeriod;
    }
    
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalSupply);
    }
    
    function earned(address account) public view returns (uint256) {
        return
            ((balances[account] *
                (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }
    
    function stake(uint256 amount) external nonReentrant whenNotPaused updateReward(msg.sender) {
        require(amount >= minimumStake, "Below minimum stake amount");
        totalSupply += amount;
        balances[msg.sender] += amount;
        stakingTime[msg.sender] = block.timestamp;
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Staked(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(
            block.timestamp >= stakingTime[msg.sender] + lockPeriod,
            "Still in lock period"
        );
        
        totalSupply -= amount;
        balances[msg.sender] -= amount;
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }
    
    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(rewardToken.transfer(msg.sender, reward), "Transfer failed");
            emit RewardClaimed(msg.sender, reward);
        }
    }
    
    function setRewardRate(uint256 _rewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}

// 5. Enhanced Voting Contract
contract RobustVoting is Ownable, Pausable {
    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    IERC20 public votingToken;
    uint256 public minimumVotingPower;
    
    event ProposalCreated(uint256 indexed proposalId, string description, uint256 startTime, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower);
    event ProposalExecuted(uint256 indexed proposalId);
    
    constructor(address _votingToken, uint256 _minimumVotingPower) {
        votingToken = IERC20(_votingToken);
        minimumVotingPower = _minimumVotingPower;
    }
    
    function createProposal(
        string memory description,
        uint256 duration
    ) external returns (uint256) {
        require(duration >= 1 days && duration <= 7 days, "Invalid duration");
        require(
            votingToken.balanceOf(msg.sender) >= minimumVotingPower,
            "Insufficient voting power"
        );
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + duration;
        
        emit ProposalCreated(proposalId, description, proposal.startTime, proposal.endTime);
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) external whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 votingPower = votingToken.balanceOf(msg.sender);
        require(votingPower >= minimumVotingPower, "Insufficient voting power");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        emit Voted(proposalId, msg.sender, support, votingPower);
    }
    
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }
}

// 6. Enhanced Multi-Signature Wallet
contract RobustMultiSigWallet is ReentrancyGuard {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }
    
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public numConfirmationsRequired;
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }
    
    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "Tx does not exist");
        _;
    }
    
    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "Tx already executed");
        _;
    }
    
    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Tx already confirmed");
        _;
    }
    
    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "Owners required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _owners.length,
            "Invalid number of confirmations"
        );
        
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");
            
            isOwner[owner] = true;
            owners.push(owner);
        }
        
        numConfirmationsRequired = _numConfirmationsRequired;
    }
    
    receive() external payable {}
    
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner {
        uint256 txIndex = transactions.length;
        
        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );
        
        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }
    
    function confirmTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;
        
        emit ConfirmTransaction(msg.sender, _txIndex);
    }
    
    function executeTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        nonReentrant
    {
        Transaction storage transaction = transactions[_txIndex];
        
        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "Cannot execute tx"
        );
        
        transaction.executed = true;
        
        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        require(success, "Tx failed");
        
        emit ExecuteTransaction(msg.sender, _txIndex);
    }
    
    function revokeConfirmation(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        
        require(isConfirmed[_txIndex][msg.sender], "Tx not confirmed");
        
        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;
        
        emit RevokeConfirmation(msg.sender, _txIndex);
    }
}

// 7. Enhanced TimeLock Contract
contract RobustTimeLock is ReentrancyGuard, Ownable {
    struct Lock {
        uint256 amount;
        uint256 unlockTime;
        bool withdrawn;
    }
    
    mapping(address => Lock[]) public locks;
    uint256 public minimumLockTime;
    uint256 public maximumLockTime;
    
    event Locked(address indexed user, uint256 amount, uint256 unlockTime);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor(uint256 _minimumLockTime, uint256 _maximumLockTime) {
        require(_minimumLockTime > 0, "Invalid minimum lock time");
        require(_maximumLockTime > _minimumLockTime, "Invalid maximum lock time");
        minimumLockTime = _minimumLockTime;
        maximumLockTime = _maximumLockTime;
    }
    
    function lock(uint256 _unlockTime) external payable nonReentrant {
        require(msg.value > 0, "Must lock some ETH");
        require(
            _unlockTime >= block.timestamp + minimumLockTime,
            "Lock time too short"
        );
        require(
            _unlockTime <= block.timestamp + maximumLockTime,
            "Lock time too long"
        );
        
        locks[msg.sender].push(
            Lock({
                amount: msg.value,
                unlockTime: _unlockTime,
                withdrawn: false
            })
        );
        
        emit Locked(msg.sender, msg.value, _unlockTime);
    }
    
    function withdraw(uint256 _lockIndex) external nonReentrant {
        Lock storage userLock = locks[msg.sender][_lockIndex];
        require(!userLock.withdrawn, "Already withdrawn");
        require(block.timestamp >= userLock.unlockTime, "Still locked");
        
        userLock.withdrawn = true;
        payable(msg.sender).transfer(userLock.amount);
        
        emit Withdrawn(msg.sender, userLock.amount);
    }
    
    function getUserLocks(address _user) external view returns (Lock[] memory) {
        return locks[_user];
    }
}

// 8. Enhanced DEX Contract
contract RobustDEX is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    
    struct Pool {
        uint256 token0Balance;
        uint256 token1Balance;
        uint256 totalShares;
        mapping(address => uint256) shares;
    }
    
    mapping(address => mapping(address => Pool)) public pools;
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public feePercent = 30; // 0.3%
    
    event PoolCreated(address indexed token0, address indexed token1);
    event LiquidityAdded(
        address indexed provider,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 shares
    );
    event LiquidityRemoved(
        address indexed provider,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 shares
    );
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    function createPool(address token0, address token1) external {
        require(token0 != token1, "Same tokens");
        require(
            address(pools[token0][token1].totalShares) == address(0),
            "Pool exists"
        );
        
        pools[token0][token1].totalShares = 0;
        emit PoolCreated(token0, token1);
    }
    
    function addLiquidity(
        address token0,
        address token1,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    ) external nonReentrant whenNotPaused returns (uint256 shares) {
        Pool storage pool = pools[token0][token1];
        
        require(amount0Desired >= amount0Min, "Insufficient token0");
        require(amount1Desired >= amount1Min, "Insufficient token1");
        
        if (pool.totalShares == 0) {
            shares = Math.sqrt(amount0Desired.mul(amount1Desired)).sub(MINIMUM_LIQUIDITY);
            _mintShares(address(0), MINIMUM_LIQUIDITY, pool);
        } else {
            uint256 share0 = amount0Desired.mul(pool.totalShares).div(pool.token0Balance);
            uint256 share1 = amount1Desired.mul(pool.totalShares).div(pool.token1Balance);
            shares = Math.min(share0, share1);
        }
        
        require(shares > 0, "Insufficient liquidity minted");
        
        _mintShares(msg.sender, shares, pool);
        
        SafeERC20.safeTransferFrom(
            IERC20(token0),
            msg.sender,
            address(this),
            amount0Desired
        );
        SafeERC20.safeTransferFrom(
            IERC20(token1),
            msg.sender,
            address(this),
            amount1Desired
        );
        
        pool.token0Balance = pool.token0Balance.add(amount0Desired);
        pool.token1Balance = pool.token1Balance.add(amount1Desired);
        
        emit LiquidityAdded(
            msg.sender,
            token0,
            token1,
            amount0Desired,
            amount1Desired,
            shares
        );
    }
    
    function removeLiquidity(
        address token0,
        address token1,
        uint256 shares,
        uint256 amount0Min,
        uint256 amount1Min
    ) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        Pool storage pool = pools[token0][token1];
        require(shares > 0, "Invalid shares");
        require(pool.shares[msg.sender] >= shares, "Insufficient shares");
        
        amount0 = shares.mul(pool.token0Balance).div(pool.totalShares);
        amount1 = shares.mul(pool.token1Balance).div(pool.totalShares);
        
        require(amount0 >= amount0Min, "Insufficient token0 output");
        require(amount1 >= amount1Min, "Insufficient token1 output");
        
        _burnShares(msg.sender, shares, pool);
        
        SafeERC20.safeTransfer(IERC20(token0), msg.sender, amount0);
        SafeERC20.safeTransfer(IERC20(token1), msg.sender, amount1);
        
        pool.token0Balance = pool.token0Balance.sub(amount0);
        pool.token1Balance = pool.token1Balance.sub(amount1);
        
        emit LiquidityRemoved(msg.sender, token0, token1, amount0, amount1, shares);
    }
    
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input amount");
        Pool storage pool = pools[tokenIn][tokenOut];
        
        uint256 amountInWithFee = amountIn.mul(1000 - feePercent).div(1000);
        amountOut = _getAmountOut(amountInWithFee, pool.token0Balance, pool.token1Balance);
        
        require(amountOut >= minAmountOut, "Insufficient output amount");
        
        SafeERC20.safeTransferFrom(
            IERC20(tokenIn),
            msg.sender,
            address(this),
            amountIn
        );
        SafeERC20.safeTransfer(IERC20(tokenOut), msg.sender, amountOut);
        
        pool.token0Balance = pool.token0Balance.add(amountIn);
        pool.token1Balance = pool.token1Balance.sub(amountOut);
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    function _getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 numerator = amountIn.mul(reserveOut);
        uint256 denominator = reserveIn.add(amountIn);
        
        return numerator.div(denominator);
    }
    
    function _mintShares(
        address to,
        uint256 shares,
        Pool storage pool
    ) internal {
        pool.totalShares = pool.totalShares.add(shares);
        pool.shares[to] = pool.shares[to].add(shares);
    }
    
    function _burnShares(
        address from,
        uint256 shares,
        Pool storage pool
    ) internal {
        pool.totalShares = pool.totalShares.sub(shares);
        pool.shares[from] = pool.shares[from].sub(shares);
    }
}

// 9. Enhanced Escrow Contract
contract RobustEscrow is ReentrancyGuard {
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE, REFUNDED }
    
    struct Trade {
        address payable buyer;
        address payable seller;
        uint256 amount;
        uint256 deadline;
        State state;
        bool buyerConfirmed;
        bool sellerConfirmed;
    }
    mapping(uint256 => Trade) public trades;
    uint256 public tradeCounter;
    uint256 public platformFee;
    address payable public feeCollector;
    
    event TradeCreated(uint256 indexed tradeId, address buyer, address seller, uint256 amount);
    event PaymentReceived(uint256 indexed tradeId, uint256 amount);
    event DeliveryConfirmed(uint256 indexed tradeId, address confirmedBy);
    event TradeCompleted(uint256 indexed tradeId);
    event TradeRefunded(uint256 indexed tradeId);
    event FeeUpdated(uint256 newFee);
    
    constructor(uint256 _platformFee, address payable _feeCollector) {
        require(_platformFee <= 100, "Fee too high"); // Max 1%
        platformFee = _platformFee;
        feeCollector = _feeCollector;
    }
    
    function createTrade(address payable _seller, uint256 _deadline) external payable nonReentrant {
        require(msg.value > 0, "Payment required");
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_seller != msg.sender, "Cannot trade with self");
        
        uint256 tradeId = tradeCounter++;
        trades[tradeId] = Trade({
            buyer: payable(msg.sender),
            seller: _seller,
            amount: msg.value,
            deadline: _deadline,
            state: State.AWAITING_DELIVERY,
            buyerConfirmed: false,
            sellerConfirmed: false
        });
        
        emit TradeCreated(tradeId, msg.sender, _seller, msg.value);
        emit PaymentReceived(tradeId, msg.value);
    }
    
    function confirmDelivery(uint256 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer || msg.sender == trade.seller, "Unauthorized");
        require(trade.state == State.AWAITING_DELIVERY, "Invalid state");
        
        if (msg.sender == trade.buyer) {
            trade.buyerConfirmed = true;
        } else {
            trade.sellerConfirmed = true;
        }
        
        emit DeliveryConfirmed(_tradeId, msg.sender);
        
        if (trade.buyerConfirmed && trade.sellerConfirmed) {
            _completeTrade(_tradeId);
        }
    }
    
    function refund(uint256 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer, "Only buyer can refund");
        require(trade.state == State.AWAITING_DELIVERY, "Invalid state");
        require(block.timestamp >= trade.deadline, "Deadline not reached");
        
        trade.state = State.REFUNDED;
        trade.buyer.transfer(trade.amount);
        
        emit TradeRefunded(_tradeId);
    }
    
    function _completeTrade(uint256 _tradeId) private {
        Trade storage trade = trades[_tradeId];
        trade.state = State.COMPLETE;
        
        uint256 fee = (trade.amount * platformFee) / 10000;
        uint256 sellerAmount = trade.amount - fee;
        
        trade.seller.transfer(sellerAmount);
        feeCollector.transfer(fee);
        
        emit TradeCompleted(_tradeId);
    }
}

// 10. Enhanced Subscription Contract
contract RobustSubscription is Ownable, Pausable, ReentrancyGuard {
    struct Plan {
        string name;
        uint256 price;
        uint256 duration;
        bool active;
        mapping(address => bool) whitelist;
    }
    
    struct Subscription {
        uint256 planId;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }
    
    mapping(uint256 => Plan) public plans;
    mapping(address => Subscription) public subscriptions;
    uint256 public planCount;
    
    event PlanCreated(uint256 indexed planId, string name, uint256 price, uint256 duration);
    event PlanUpdated(uint256 indexed planId, uint256 price, uint256 duration, bool active);
    event Subscribed(address indexed subscriber, uint256 indexed planId, uint256 startTime, uint256 endTime);
    event SubscriptionCancelled(address indexed subscriber, uint256 indexed planId);
    event WhitelistUpdated(uint256 indexed planId, address indexed user, bool status);
    
    constructor() {
        // Initialize with a default plan
        _createPlan("Basic", 0.1 ether, 30 days);
    }
    
    function createPlan(
        string memory _name,
        uint256 _price,
        uint256 _duration
    ) external onlyOwner {
        _createPlan(_name, _price, _duration);
    }
    
    function _createPlan(
        string memory _name,
        uint256 _price,
        uint256 _duration
    ) private {
        require(_duration > 0, "Invalid duration");
        uint256 planId = planCount++;
        Plan storage plan = plans[planId];
        plan.name = _name;
        plan.price = _price;
        plan.duration = _duration;
        plan.active = true;
        
        emit PlanCreated(planId, _name, _price, _duration);
    }
    
    function updatePlan(
        uint256 _planId,
        uint256 _price,
        uint256 _duration,
        bool _active
    ) external onlyOwner {
        Plan storage plan = plans[_planId];
        require(_duration > 0, "Invalid duration");
        
        plan.price = _price;
        plan.duration = _duration;
        plan.active = _active;
        
        emit PlanUpdated(_planId, _price, _duration, _active);
    }
    
    function subscribe(uint256 _planId) external payable nonReentrant whenNotPaused {
        Plan storage plan = plans[_planId];
        require(plan.active, "Plan not active");
        require(msg.value == plan.price, "Incorrect payment");
        
        if (!plan.whitelist[address(0)]) {
            require(plan.whitelist[msg.sender], "Not whitelisted");
        }
        
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + plan.duration;
        
        if (subscriptions[msg.sender].active) {
            require(subscriptions[msg.sender].planId == _planId, "Already subscribed to different plan");
            endTime = subscriptions[msg.sender].endTime + plan.duration;
        }
        
        subscriptions[msg.sender] = Subscription({
            planId: _planId,
            startTime: startTime,
            endTime: endTime,
            active: true
        });
        
        emit Subscribed(msg.sender, _planId, startTime, endTime);
    }
    
    function cancelSubscription() external nonReentrant {
        Subscription storage sub = subscriptions[msg.sender];
        require(sub.active, "No active subscription");
        
        sub.active = false;
        // Optional: Implement refund logic for remaining time
        
        emit SubscriptionCancelled(msg.sender, sub.planId);
    }
    
    function updateWhitelist(
        uint256 _planId,
        address _user,
        bool _status
    ) external onlyOwner {
        plans[_planId].whitelist[_user] = _status;
        emit WhitelistUpdated(_planId, _user, _status);
    }
    
    function isSubscribed(address _user) external view returns (bool) {
        Subscription storage sub = subscriptions[_user];
        return sub.active && sub.endTime > block.timestamp;
    }
    
    function getSubscriptionDetails(address _user)
        external
        view
        returns (
            uint256 planId,
            uint256 startTime,
            uint256 endTime,
            bool active
        )
    {
        Subscription storage sub = subscriptions[_user];
        return (sub.planId, sub.startTime, sub.endTime, sub.active);
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}