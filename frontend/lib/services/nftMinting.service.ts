/**
 * NFT Minting Service
 * Mints NFT tickets for cricket matches and stores transaction hashes
 * @file frontend/lib/services/nftMinting.service.ts
 */

import { ethers } from 'ethers';

/**
 * NFT Metadata structure
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URL or data URI
  attributes: {
    matchId: string;
    team1: string;
    team2: string;
    venue: string;
    date: string;
    matchType: string; // odi, t20, test
    ticketType: string; // standard, vip, premium
    seatNumber?: string;
    section?: string;
  };
  externalUrl: string;
}

/**
 * Minting result with transaction details
 */
export interface MintingResult {
  success: boolean;
  tokenId?: string;
  transactionHash: string;
  blockNumber?: number;
  contractAddress: string;
  metadata: NFTMetadata;
  timestamp: string;
  error?: string;
}

/**
 * NFT Minting Service
 */
class NFTMintingService {
  private contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT || '0x0000000000000000000000000000000000000000';
  private contractABI = [
    // Minimal ABI for minting
    {
      name: 'mint',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'metadataUri', type: 'string' },
      ],
      outputs: [{ name: 'tokenId', type: 'uint256' }],
    },
    {
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'owner', type: 'address' }],
      outputs: [{ name: 'balance', type: 'uint256' }],
    },
    {
      name: 'tokenByIndex',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'index', type: 'uint256' }],
      outputs: [{ name: 'tokenId', type: 'uint256' }],
    },
  ];

  /**
   * Mint NFT ticket
   * @param walletAddress - User's wallet address
   * @param metadata - NFT metadata
   * @param signer - Ethers signer (from wallet)
   * @returns Minting result with transaction hash
   */
  async mintTicket(
    walletAddress: string,
    metadata: NFTMetadata,
    signer?: any
  ): Promise<MintingResult> {
    const timestamp = new Date().toISOString();

    try {
      // Validate inputs
      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        throw new Error('Invalid wallet address');
      }

      if (!metadata || !metadata.name) {
        throw new Error('Invalid metadata');
      }

      // In production implementation:
      // 1. Convert metadata to JSON
      // 2. Upload to IPFS (Pinata/NFT.storage)
      // 3. Get metadata URI
      // 4. Call contract.mint(walletAddress, metadataUri) with signer
      // 5. Wait for transaction confirmation
      // 6. Extract token ID from receipt
      // 7. Save to database with transaction hash

      // For demo: Simulate minting
      const metadataUri = await this.uploadMetadata(metadata);
      const transactionHash = this.generateMockTransactionHash();
      const blockNumber = Math.floor(Math.random() * 1000000) + 1000000;
      const tokenId = Math.floor(Math.random() * 999999) + 1;

      // Simulate contract interaction
      console.log('[NFTMinting] Simulated mint call:', {
        contractAddress: this.contractAddress,
        walletAddress,
        metadataUri,
        transactionHash,
        tokenId,
        blockNumber,
      });

      return {
        success: true,
        tokenId: tokenId.toString(),
        transactionHash,
        blockNumber,
        contractAddress: this.contractAddress,
        metadata,
        timestamp,
      };
    } catch (error) {
      console.error('[NFTMinting] Error minting ticket:', error);
      return {
        success: false,
        transactionHash: '',
        contractAddress: this.contractAddress,
        metadata,
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Batch mint NFT tickets for multiple users
   * @param mints - Array of {walletAddress, metadata} objects
   * @returns Array of minting results
   */
  async batchMintTickets(
    mints: Array<{ walletAddress: string; metadata: NFTMetadata }>
  ): Promise<MintingResult[]> {
    try {
      const results: MintingResult[] = [];

      for (const mint of mints) {
        const result = await this.mintTicket(mint.walletAddress, mint.metadata);
        results.push(result);

        // Add delay between mints to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      return results;
    } catch (error) {
      console.error('[NFTMinting] Error in batch minting:', error);
      throw error;
    }
  }

  /**
   * Upload metadata to IPFS (mock implementation)
   * In production, use Pinata or NFT.storage
   */
  private async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      // In production:
      // const pinata = new PinataSDK({
      //   pinataJwt: process.env.PINATA_JWT,
      // });
      // const upload = await pinata.upload.json(metadata);
      // return `ipfs://${upload.IpfsHash}`;

      // For demo: Return base64 encoded metadata
      const metadataJson = JSON.stringify(metadata);
      const base64 = Buffer.from(metadataJson).toString('base64');
      return `data:application/json;base64,${base64}`;
    } catch (error) {
      console.error('[NFTMinting] Error uploading metadata:', error);
      throw error;
    }
  }

  /**
   * Generate mock transaction hash (for testing)
   */
  private generateMockTransactionHash(): string {
    const randomBytes = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
    ).join('');
    return '0x' + randomBytes;
  }

  /**
   * Get user's NFT tickets
   * @param walletAddress - User's wallet address
   * @returns Array of token IDs
   */
  async getUserNFTTickets(walletAddress: string): Promise<string[]> {
    try {
      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        throw new Error('Invalid wallet address');
      }

      // In production:
      // const contract = new ethers.Contract(this.contractAddress, this.contractABI, provider);
      // const balance = await contract.balanceOf(walletAddress);
      // const tokenIds: string[] = [];
      // for (let i = 0; i < balance; i++) {
      //   const tokenId = await contract.tokenByIndex(i);
      //   tokenIds.push(tokenId.toString());
      // }
      // return tokenIds;

      return [];
    } catch (error) {
      console.error('[NFTMinting] Error getting NFT tickets:', error);
      return [];
    }
  }

  /**
   * Verify NFT ownership
   * @param walletAddress - Wallet to check
   * @param tokenId - Token ID to verify
   * @returns True if wallet owns the NFT
   */
  async verifyNFTOwnership(walletAddress: string, tokenId: string): Promise<boolean> {
    try {
      // In production:
      // const contract = new ethers.Contract(this.contractAddress, this.contractABI, provider);
      // const owner = await contract.ownerOf(tokenId);
      // return owner.toLowerCase() === walletAddress.toLowerCase();

      return true; // Simulated
    } catch (error) {
      console.error('[NFTMinting] Error verifying NFT ownership:', error);
      return false;
    }
  }

  /**
   * Validate NFT metadata format
   */
  validateMetadata(metadata: NFTMetadata): boolean {
    try {
      if (!metadata.name || metadata.name.length === 0) return false;
      if (!metadata.description) return false;
      if (!metadata.attributes) return false;
      if (!metadata.attributes.matchId) return false;
      if (!metadata.attributes.team1 || !metadata.attributes.team2) return false;
      if (!metadata.attributes.date) return false;
      if (!['odi', 't20', 'test'].includes(metadata.attributes.matchType)) return false;

      return true;
    } catch (error) {
      console.error('[NFTMinting] Error validating metadata:', error);
      return false;
    }
  }

  /**
   * Create metadata from match and purchase data
   */
  createMetadata(
    matchId: string,
    team1: string,
    team2: string,
    venue: string,
    matchDate: string,
    matchType: string,
    ticketType: string = 'standard'
  ): NFTMetadata {
    return {
      name: `${team1} vs ${team2} - ${matchType.toUpperCase()} Ticket`,
      description: `Official cricket ticket NFT for ${team1} vs ${team2} match at ${venue}. This ticket grants access to the match.`,
      image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Crect fill='%236D3A6D' width='300' height='400'/%3E%3Ctext x='150' y='100' font-size='20' fill='white' text-anchor='middle'%3E${team1} vs ${team2}%3C/text%3E%3Ctext x='150' y='150' font-size='16' fill='white' text-anchor='middle'%3E${matchDate}%3C/text%3E%3Ctext x='150' y='200' font-size='14' fill='white' text-anchor='middle'%3E${venue}%3C/text%3E%3C/svg%3E`,
      attributes: {
        matchId,
        team1,
        team2,
        venue,
        date: matchDate,
        matchType,
        ticketType,
      },
      externalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/${matchId}`,
    };
  }
}

// Export singleton instance
export const nftMintingService = new NFTMintingService();
