// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PSLImpactMarket
 * @notice Main smart contract for PSL Pulse fan engagement platform
 * @dev Handles staking, tipping, and leaderboard management
 */
contract PSLImpactMarket is ReentrancyGuard, AccessControl, Ownable {
    
    // ─────────────── ROLES ───────────────
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // ─────────────── CONSTANTS ───────────────
    uint8 constant PILLAR_COUNT = 4;
    uint256 constant MIN_STAKE = 0.0001 ether; // Minimum stake in WIRE
    
    // ─────────────── STRUCTS ───────────────
    struct Match {
        uint256 matchId;
        uint8 team1;
        uint8 team2;
        uint256 startTime;
        uint256 endTime;
        string venue;
        bool active;
    }
    
    struct Pool {
        uint256 matchId;
        uint8 pillarId;
        uint256 totalStaked;
        uint256 stakeCount;
    }
    
    struct Contribution {
        uint256 totalContributed;
        uint256 stakeCount;
        uint256 tipCount;
    }
    
    // ─────────────── STATE ───────────────
    mapping(uint256 => Match) public matches;
    mapping(bytes32 => Pool) public pools;
    mapping(address => Contribution) public contributions;
    address[] public topContributors;
    
    uint256 public matchCounter;
    uint256 public totalStaked;
    uint256 public totalTipped;
    
    // ─────────────── EVENTS ───────────────
    event Staked(
        uint256 indexed matchId,
        uint8 indexed pillarId,
        address indexed staker,
        uint256 amount
    );
    
    event PlayerTipped(
        uint256 indexed matchId,
        bytes32 indexed playerId,
        address indexed tipper,
        uint256 amount
    );
    
    event InfinityWallUpdated(
        address indexed contributor,
        uint256 totalContributed,
        uint256 rank
    );
    
    event MatchCreated(
        uint256 indexed matchId,
        uint8 team1,
        uint8 team2,
        string venue
    );
    
    event MatchFinalized(
        uint256 indexed matchId
    );
    
    // ─────────────── CONSTRUCTOR ───────────────
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        matchCounter = 0;
    }
    
    // ─────────────── MATCH MANAGEMENT ───────────────
    /**
     * @notice Create a new match
     * @param team1 Team 1 ID
     * @param team2 Team 2 ID
     * @param startTime Unix timestamp for match start
     * @param venue Match venue name
     */
    function createMatch(
        uint8 team1,
        uint8 team2,
        uint256 startTime,
        string memory venue
    ) external onlyRole(ADMIN_ROLE) {
        require(team1 != team2, "Teams must be different");
        require(startTime > block.timestamp, "Start time must be in future");
        
        uint256 matchId = matchCounter++;
        
        matches[matchId] = Match({
            matchId: matchId,
            team1: team1,
            team2: team2,
            startTime: startTime,
            endTime: startTime + 4 hours,
            venue: venue,
            active: true
        });
        
        emit MatchCreated(matchId, team1, team2, venue);
    }
    
    /**
     * @notice Finalize a match (disable further staking)
     * @param matchId Match ID to finalize
     */
    function finalizeMatch(uint256 matchId) external onlyRole(ADMIN_ROLE) {
        require(matches[matchId].active, "Match already finalized");
        matches[matchId].active = false;
        emit MatchFinalized(matchId);
    }
    
    // ─────────────── STAKING ───────────────
    /**
     * @notice Stake WIRE into an impact pool
     * @param matchId Match ID
     * @param pillarId Pillar ID (0-3)
     */
    function stake(uint256 matchId, uint8 pillarId) 
        external 
        payable 
        nonReentrant 
    {
        require(msg.value >= MIN_STAKE, "Stake below minimum");
        require(pillarId < PILLAR_COUNT, "Invalid pillar");
        require(matches[matchId].active, "Match not active");
        require(msg.value > 0, "Cannot stake zero amount");
        
        // Update pool
        bytes32 poolKey = keccak256(abi.encodePacked(matchId, pillarId));
        pools[poolKey].matchId = matchId;
        pools[poolKey].pillarId = pillarId;
        pools[poolKey].totalStaked += msg.value;
        pools[poolKey].stakeCount++;
        
        // Update contributor
        contributions[msg.sender].totalContributed += msg.value;
        contributions[msg.sender].stakeCount++;
        
        totalStaked += msg.value;
        
        // Update leaderboard
        _updateInfinityWall(msg.sender);
        
        emit Staked(matchId, pillarId, msg.sender, msg.value);
    }
    
    // ─────────────── TIPPING ───────────────
    /**
     * @notice Tip a player directly
     * @param matchId Match ID
     * @param playerId Player ID (hashed)
     */
    function tipPlayer(uint256 matchId, bytes32 playerId) 
        external 
        payable 
        nonReentrant 
    {
        require(msg.value >= MIN_STAKE, "Tip below minimum");
        require(matches[matchId].active, "Match not active");
        require(msg.value > 0, "Cannot tip zero amount");
        
        // Update contributor
        contributions[msg.sender].totalContributed += msg.value;
        contributions[msg.sender].tipCount++;
        
        totalTipped += msg.value;
        
        // Update leaderboard
        _updateInfinityWall(msg.sender);
        
        emit PlayerTipped(matchId, playerId, msg.sender, msg.value);
    }
    
    // ─────────────── LEADERBOARD ───────────────
    /**
     * @notice Get top 10 contributors (Infinity Wall)
     * @return Array of top contributor addresses
     */
    function getInfinityWall() external view returns (address[] memory) {
        uint256 limit = topContributors.length > 10 ? 10 : topContributors.length;
        address[] memory wall = new address[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            wall[i] = topContributors[i];
        }
        
        return wall;
    }
    
    /**
     * @notice Get contributor stats
     * @param contributor Address of contributor
     * @return Contribution struct with stats
     */
    function getLeaderboard(address contributor) 
        external 
        view 
        returns (Contribution memory) 
    {
        return contributions[contributor];
    }
    
    /**
     * @notice Get pool data
     * @param matchId Match ID
     * @param pillarId Pillar ID
     * @return Pool struct with data
     */
    function getPool(uint256 matchId, uint8 pillarId) 
        external 
        view 
        returns (Pool memory)
    {
        bytes32 poolKey = keccak256(abi.encodePacked(matchId, pillarId));
        return pools[poolKey];
    }
    
    /**
     * @notice Get match data
     * @param matchId Match ID
     * @return Match struct with data
     */
    function getMatch(uint256 matchId) 
        external 
        view 
        returns (Match memory)
    {
        return matches[matchId];
    }
    
    // ─────────────── INTERNAL ───────────────
    /**
     * @notice Update Infinity Wall (sort top contributors)
     * @param contributor Address to rank
     */
    function _updateInfinityWall(address contributor) internal {
        bool found = false;
        
        // Check if contributor already in leaderboard
        for (uint256 i = 0; i < topContributors.length; i++) {
            if (topContributors[i] == contributor) {
                found = true;
                break;
            }
        }
        
        // Add new contributor if not found
        if (!found) {
            topContributors.push(contributor);
        }
        
        // Simple bubble sort (not optimized for production, but workable for demo)
        for (uint256 i = 0; i < topContributors.length; i++) {
            for (uint256 j = i + 1; j < topContributors.length; j++) {
                if (contributions[topContributors[j]].totalContributed > 
                    contributions[topContributors[i]].totalContributed) {
                    address temp = topContributors[i];
                    topContributors[i] = topContributors[j];
                    topContributors[j] = temp;
                }
            }
        }
        
        // Emit update
        uint256 rank = 1;
        for (uint256 i = 0; i < topContributors.length; i++) {
            if (topContributors[i] == contributor) {
                rank = i + 1;
                break;
            }
        }
        
        emit InfinityWallUpdated(contributor, contributions[contributor].totalContributed, rank);
    }
    
    // ─────────────── ADMIN FUNCTIONS ───────────────
    /**
     * @notice Grant oracle role to address
     * @param account Address to grant oracle role
     */
    function grantOracleRole(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(ORACLE_ROLE, account);
    }
    
    /**
     * @notice Log impact event from oracle
     * @param matchId Match ID
     * @param eventData Event data (sixes, wickets, etc)
     */
    function logImpactEvent(uint256 matchId, string memory eventData) 
        external 
        onlyRole(ORACLE_ROLE) 
    {
        require(matches[matchId].active, "Match not active");
        // Event is just logged for off-chain processing
    }
    
    /**
     * @notice Withdraw contract balance (for payouts)
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    // ─────────────── RECEIVE ───────────────
    receive() external payable {}
}
