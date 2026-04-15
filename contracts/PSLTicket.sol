// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PSLTicket
 * @notice ERC-721 NFT tickets for PSL Pulse matches
 * @dev Issues tiered match access tickets
 */
contract PSLTicket is ERC721, Ownable, AccessControl {
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    enum TicketTier {
        GENERAL,    // 0 - General admission
        PREMIUM,    // 1 - Premium seating
        VIP,        // 2 - VIP lounge
        HOSPITALITY // 3 - Hospitality suite
    }
    
    struct Ticket {
        uint256 ticketId;
        uint256 matchId;
        TicketTier tier;
        uint256 purchasePrice;
        uint256 mintedAt;
    }
    
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => mapping(TicketTier => uint256)) public tierCapacity;
    mapping(uint256 => mapping(TicketTier => uint256)) public tierMinted;
    
    uint256 private tokenIdCounter;
    
    // Default tier prices (in WIRE)
    uint256 public constant GENERAL_PRICE = 0.05 ether;
    uint256 public constant PREMIUM_PRICE = 0.15 ether;
    uint256 public constant VIP_PRICE = 0.5 ether;
    uint256 public constant HOSPITALITY_PRICE = 1.0 ether;
    
    // Default capacity per match
    uint256 public constant GENERAL_CAPACITY = 1000;
    uint256 public constant PREMIUM_CAPACITY = 500;
    uint256 public constant VIP_CAPACITY = 100;
    uint256 public constant HOSPITALITY_CAPACITY = 50;
    
    event TicketMinted(
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 matchId,
        TicketTier tier,
        uint256 price
    );
    
    event TicketBurned(
        uint256 indexed tokenId
    );
    
    constructor() ERC721("PSL Ticket", "PSLTICKET") Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        tokenIdCounter = 0;
    }
    
    /**
     * @notice Initialize match capacity
     * @param matchId Match ID
     */
    function initializeMatch(uint256 matchId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tierCapacity[matchId][TicketTier.GENERAL] = GENERAL_CAPACITY;
        tierCapacity[matchId][TicketTier.PREMIUM] = PREMIUM_CAPACITY;
        tierCapacity[matchId][TicketTier.VIP] = VIP_CAPACITY;
        tierCapacity[matchId][TicketTier.HOSPITALITY] = HOSPITALITY_CAPACITY;
    }
    
    /**
     * @notice Buy a ticket (mint)
     * @param matchId Match ID
     * @param tier Tier (0-3)
     */
    function buyTicket(uint256 matchId, TicketTier tier) 
        external 
        payable 
    {
        require(matchId > 0, "Invalid match ID");
        require(uint8(tier) < 4, "Invalid tier");
        
        // Check capacity
        uint256 capacity = tierCapacity[matchId][tier];
        uint256 minted = tierMinted[matchId][tier];
        require(minted < capacity, "Tier sold out");
        
        // Check payment
        uint256 requiredPrice = _getTierPrice(tier);
        require(msg.value >= requiredPrice, "Insufficient payment");
        
        // Mint ticket
        uint256 tokenId = tokenIdCounter++;
        
        tickets[tokenId] = Ticket({
            ticketId: tokenId,
            matchId: matchId,
            tier: tier,
            purchasePrice: msg.value,
            mintedAt: block.timestamp
        });
        
        tierMinted[matchId][tier]++;
        
        _safeMint(msg.sender, tokenId);
        
        emit TicketMinted(msg.sender, tokenId, matchId, tier, msg.value);
    }
    
    /**
     * @notice Get ticket tier
     * @param tokenId Token ID
     * @return Tier (0-3)
     */
    function tierOf(uint256 tokenId) external view returns (TicketTier) {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        return tickets[tokenId].tier;
    }
    
    /**
     * @notice Get ticket data
     * @param tokenId Token ID
     * @return Ticket struct
     */
    function getTicket(uint256 tokenId) external view returns (Ticket memory) {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        return tickets[tokenId];
    }
    
    /**
     * @notice Get tier price
     * @param tier Tier ID
     * @return Price in WIRE
     */
    function getTierPrice(TicketTier tier) external pure returns (uint256) {
        return _getTierPrice(tier);
    }
    
    /**
     * @notice Burn a ticket
     * @param tokenId Token ID to burn
     */
    function burnTicket(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Not ticket owner");
        _burn(tokenId);
        emit TicketBurned(tokenId);
    }
    
    /**
     * @notice Get available capacity for tier
     * @param matchId Match ID
     * @param tier Tier ID
     * @return Available capacity
     */
    function getAvailableCapacity(uint256 matchId, TicketTier tier) 
        external 
        view 
        returns (uint256) 
    {
        uint256 capacity = tierCapacity[matchId][tier];
        uint256 minted = tierMinted[matchId][tier];
        return capacity > minted ? capacity - minted : 0;
    }
    
    /**
     * @notice Withdraw contract balance
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    // ─────────────── INTERNAL ───────────────
    function _getTierPrice(TicketTier tier) internal pure returns (uint256) {
        if (tier == TicketTier.GENERAL) return GENERAL_PRICE;
        if (tier == TicketTier.PREMIUM) return PREMIUM_PRICE;
        if (tier == TicketTier.VIP) return VIP_PRICE;
        if (tier == TicketTier.HOSPITALITY) return HOSPITALITY_PRICE;
        return 0;
    }
    
    // Required for AccessControl + ERC721
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // ─────────────── RECEIVE ───────────────
    receive() external payable {}
}
