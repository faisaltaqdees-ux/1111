# NFT Contract Deployment Guide

## Overview
To mint and manage NFT tickets, you need to deploy an ERC-721 NFT contract to WireFluid Testnet (Chain ID: 92533).

## Option 1: Deploy via Remix IDE (Easiest - 5 minutes)

### Step 1: Open Remix IDE
1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new file: `KittyPawsTicketNFT.sol`

### Step 2: Paste Contract Code
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract KittyPawsTicketNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    struct TicketMetadata {
        string matchId;
        uint256 quantity;
        string seatSection;
        uint256 purchaseDate;
    }
    
    mapping(uint256 => TicketMetadata) public ticketMetadata;
    mapping(address => uint256[]) public userTickets;
    
    event TicketMinted(
        address indexed buyer,
        uint256 indexed tokenId,
        string matchId,
        uint256 quantity
    );
    
    constructor() ERC721("KittyPaws Cricket Tickets", "KPCT") {}
    
    function mintTicket(
        address to,
        string memory matchId,
        uint256 quantity,
        string memory seatSection
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        
        ticketMetadata[tokenId] = TicketMetadata(
            matchId,
            quantity,
            seatSection,
            block.timestamp
        );
        
        userTickets[to].push(tokenId);
        
        emit TicketMinted(to, tokenId, matchId, quantity);
        return tokenId;
    }
    
    function getUserTickets(address user) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return userTickets[user];
    }
    
    function getTicketMetadata(uint256 tokenId)
        public
        view
        returns (TicketMetadata memory)
    {
        return ticketMetadata[tokenId];
    }
}
```

### Step 3: Compile the Contract
1. Click "Solidity Compiler" tab
2. Select version `0.8.x`
3. Click "Compile KittyPawsTicketNFT.sol"

### Step 4: Deploy to WireFluid Testnet

#### Setup MetaMask for WireFluid:
1. Open MetaMask
2. Add Custom Network:
   - **Network Name**: WireFluid Testnet
   - **RPC URL**: https://rpc.wirefluid.io
   - **Chain ID**: 92533
   - **Currency Symbol**: WIRE
   - **Block Explorer**: https://testnet.wirescan.io

#### Deployment Steps:
1. In Remix, click "Deploy & Run Transactions" tab
2. Select "Injected Provider - MetaMask"
3. Ensure MetaMask is connected to WireFluid Testnet
4. Click "Deploy"
5. Approve transaction in MetaMask
6. **Copy the contract address** from the deployment confirmation

### Step 5: Add Contract Address to .env.local
```bash
NEXT_PUBLIC_NFT_CONTRACT=0x[your-contract-address]
```

---

## Option 2: Deploy via Hardhat (Advanced - 20 minutes)

###Step 1: Setup Hardhat Project
```bash
npm install --save-dev hardhat @openzeppelin/contracts ethers dotenv
npx hardhat
# Select: Create a basic sample project
```

### Step 2: Create Contract File
Create `contracts/KittyPawsTicketNFT.sol` with the solidity code above.

### Step 3: Create Deployment Script
`scripts/deploy.js`:
```javascript
const hre = require("hardhat");

async function main() {
  const KittyPawsTicketNFT = await hre.ethers.getContractFactory("KittyPawsTicketNFT");
  const nft = await KittyPawsTicketNFT.deploy();
  
  await nft.deployed();
  
  console.log("NFT Contract deployed to:", nft.address);
  console.log("Add this to .env.local:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT=${nft.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Step 4: Configure Hardhat
`hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    wirefluid: {
      url: "https://rpc.wirefluid.io",
      chainId: 92533,
      accounts: [process.env.PRIVATE_KEY || ""],
    }
  }
};
```

### Step 5: Deploy
```bash
npx hardhat run scripts/deploy.js --network wirefluid
```

---

## Verify Contract on Wirescan

### Option 1: Via Remix
1. In Remix, click "Solidity Compiler" → "Publish to IPFS"
2. This generates a verification code
3. Go to Wirescan ([testnet.wirescan.io](https://testnet.wirescan.io))
4. Paste contract address
5. Click "Verify and Publish"
6. Paste contract code

### Option 2: Via Hardhat
```bash
npm install --save-dev hardhat-etherscan
```

Then in deployment script, after deployment:
```javascript
await hre.run("verify:verify", {
  address: nft.address,
  constructorArguments: [],
});
```

---

## Next Steps: Mint Tickets via API

Once deployed, update your payment confirm endpoint:

```typescript
// app/api/blockchain/payment/confirm/route.ts

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT;
const ADMIN_PRIVATE_KEY = process.env.NFT_ADMIN_KEY; // Require this

// After payment confirmation:
const provider = new ethers.JsonRpcProvider(WIREFLUID_RPC);
const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, wallet);

// Mint ticket NFT
const tx = await nftContract.mintTicket(
  userAddress,
  matchId,
  quantity,
  seatSection
);

const receipt = await tx.wait();
return { nftTokenId: receipt.events[0].args.tokenId };
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MetaMask shows wrong chain | Make sure you're connected to WireFluid (Chain 92533) |
| Transaction reverts | Ensure you have enough WIRE for gas (~0.0001 WIRE per mint) |
| .env.local not loading | Restart Next.js dev server after adding NEXT_PUBLIC_NFT_CONTRACT |
| Contract address wrong | Copy from Remix deployment confirmation, not from MetaMask |

---

## Testing the NFT Minting

### Step 1: Add to .env.local
```
NEXT_PUBLIC_NFT_CONTRACT=0x[your-address]
NFT_ADMIN_KEY=0x[your-private-key]  # Only for server-side
```

### Step 2: Buy a Ticket
1. Visit `/tickets` page
2. Select match and quantity
3. Click "Buy Tickets"
4. Complete WIRE transfer (you'll be prompted by MetaMask)
5. View transaction hash
6. Check payment address for WIRE received: `0x85edFCCff20a3617FaD9E69EEe69b196640627E4`

###Step 3: Verify NFT Minted
- Go to [Wirescan](https://testnet.wirescan.io)
- Search your wallet address
- You should see NFT transfers if minting is working

---

## Getting Test WIRE Tokens

Visit [WireFluid Faucet](https://faucet.wirefluid.io) to get free WIRE tokens for testing.

---

## Support

- **WireFluid Docs**: https://docs.wirefluid.io
- **Wirescan Explorer**: https://testnet.wirescan.io  
- **OpenZeppelin Docs**: https://docs.openzeppelin.com
- **Remix IDE**: https://remix.ethereum.org
