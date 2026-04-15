// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ImpactBadge
 * @notice ERC-721 NFT reward badges for PSL Pulse contributors
 * @dev Issued to top contributors per pillar
 */
contract ImpactBadge is ERC721, Ownable, AccessControl {
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    struct Badge {
        uint256 badgeId;
        uint256 matchId;
        uint8 pillarId;
        uint256 mintedAt;
        string metadataURI;
    }
    
    mapping(uint256 => Badge) public badges;
    uint256 private tokenIdCounter;
    
    event BadgeMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        uint8 pillarId,
        uint256 matchId
    );
    
    event BadgeBurned(
        uint256 indexed tokenId
    );
    
    constructor() ERC721("PSL Impact Badge", "PSLBADGE") Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        tokenIdCounter = 0;
    }
    
    /**
     * @notice Mint a badge for a contributor
     * @param to Recipient address
     * @param pillarId Pillar ID (0-3)
     * @param matchId Match ID
     * @param uri Metadata URI (IPFS)
     */
    function mintBadge(
        address to,
        uint8 pillarId,
        uint256 matchId,
        string memory uri
    ) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "Invalid recipient");
        require(pillarId < 4, "Invalid pillar");
        
        uint256 tokenId = tokenIdCounter++;
        
        badges[tokenId] = Badge({
            badgeId: tokenId,
            matchId: matchId,
            pillarId: pillarId,
            mintedAt: block.timestamp,
            metadataURI: uri
        });
        
        _safeMint(to, tokenId);
        
        emit BadgeMinted(to, tokenId, pillarId, matchId);
    }
    
    /**
     * @notice Get pillar for a badge
     * @param tokenId Token ID
     * @return Pillar ID
     */
    function pillarOf(uint256 tokenId) external view returns (uint8) {
        require(_ownerOf(tokenId) != address(0), "Badge does not exist");
        return badges[tokenId].pillarId;
    }
    
    /**
     * @notice Get badge metadata
     * @param tokenId Token ID
     * @return Badge struct
     */
    function getBadge(uint256 tokenId) external view returns (Badge memory) {
        require(_ownerOf(tokenId) != address(0), "Badge does not exist");
        return badges[tokenId];
    }
    
    /**
     * @notice Get token URI for metadata
     * @param tokenId Token ID
     * @return Metadata URI
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Badge does not exist");
        return badges[tokenId].metadataURI;
    }
    
    /**
     * @notice Burn a badge
     * @param tokenId Token ID to burn
     */
    function burnBadge(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Not badge owner");
        _burn(tokenId);
        emit BadgeBurned(tokenId);
    }
    
    /**
     * @notice Grant minter role
     * @param account Address to grant role
     */
    function grantMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
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
}
