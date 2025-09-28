import CryptoJS from 'crypto-js';
import { BlockchainSARecord } from '../types/SA';

// Simple blockchain implementation for demonstration
// In production, you would use a real blockchain network like Ethereum
export class SimpleBlockchain {
  private chain: Block[] = [];
  private difficulty = 2; // Mining difficulty

  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock(): Block {
    return new Block(0, Date.now(), 'Genesis Block', '0');
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock: Block): string {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock.hash;
  }

  createSABlock(saRecord: BlockchainSARecord): Block {
    const blockData = {
      ...saRecord,
      timestamp: Date.now()
    };
    return new Block(this.chain.length, Date.now(), blockData, this.getLatestBlock().hash);
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getBlockByHash(hash: string): Block | null {
    return this.chain.find(block => block.hash === hash) || null;
  }

  getAllBlocks(): Block[] {
    return [...this.chain];
  }
}

export class Block {
  public nonce: number = 0;
  public hash: string;

  constructor(
    public index: number,
    public timestamp: number,
    public data: any,
    public previousHash: string
  ) {
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return CryptoJS.SHA256(
      this.index + 
      this.previousHash + 
      this.timestamp + 
      JSON.stringify(this.data) + 
      this.nonce
    ).toString();
  }

  mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join('0');
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Block mined: ${this.hash}`);
  }
}

// Singleton blockchain instance
export const blockchain = new SimpleBlockchain();