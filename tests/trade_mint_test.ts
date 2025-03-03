import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test complete trading flow",
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
    
    // Verify escrow balance
    const contractBalance = chain.getAssetsMaps().assets["STX"][deployer.address];
    assertEquals(contractBalance, 1000);
    
    // Accept offer
    let acceptBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'accept-offer', [
        types.uint(listingId),
        types.principal(buyer.address)
      ], deployer.address)
    ]);
    
    acceptBlock.receipts[0].result.expectOk().expectBool(true);
  }
});

// Add more comprehensive tests...
