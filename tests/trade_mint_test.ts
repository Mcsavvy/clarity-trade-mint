import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

// Previous tests unchanged...

Clarinet.test({
  name: "Test listing cancellation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const buyer = accounts.get('wallet_1')!;
    
    // Create listing
    let block = chain.mineBlock([
      Tx.contractCall('trade-mint', 'create-listing', [
        types.ascii("Test Asset"),
        types.uint(1000),
        types.uint(chain.blockHeight + 100)
      ], deployer.address)
    ]);
    
    const listingId = block.receipts[0].result.expectOk().expectUint();
    
    // Cancel listing
    let cancelBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'cancel-listing', [
        types.uint(listingId)
      ], deployer.address)
    ]);
    
    cancelBlock.receipts[0].result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "Test offer cancellation and refund",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const buyer = accounts.get('wallet_1')!;
    
    // Create listing
    let block = chain.mineBlock([
      Tx.contractCall('trade-mint', 'create-listing', [
        types.ascii("Test Asset"),
        types.uint(1000),
        types.uint(chain.blockHeight + 100)
      ], deployer.address)
    ]);
    
    const listingId = block.receipts[0].result.expectOk().expectUint();
    
    // Make offer
    let offerBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'make-offer', [
        types.uint(listingId)
      ], buyer.address)
    ]);
    
    offerBlock.receipts[0].result.expectOk().expectBool(true);
    
    // Cancel offer
    let cancelBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'cancel-offer', [
        types.uint(listingId)
      ], buyer.address)
    ]);
    
    cancelBlock.receipts[0].result.expectOk().expectBool(true);
  }
});
