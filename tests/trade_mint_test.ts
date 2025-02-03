import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test listing creation with expiry",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const currentBlock = chain.blockHeight;
    const expiryBlock = currentBlock + 100;
    
    let block = chain.mineBlock([
      Tx.contractCall('trade-mint', 'create-listing', [
        types.ascii("Test Asset"),
        types.uint(1000),
        types.uint(expiryBlock)
      ], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk();
    const listingId = block.receipts[0].result.expectOk().expectUint();
    
    let getListingBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'get-listing', [
        types.uint(listingId)
      ], deployer.address)
    ]);
    
    const listing = getListingBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(listing['expiry'], types.uint(expiryBlock));
  }
});

Clarinet.test({
  name: "Test expired listing rejection",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const buyer = accounts.get('wallet_1')!;
    const currentBlock = chain.blockHeight;
    const expiryBlock = currentBlock + 10;
    
    // Create listing
    let block = chain.mineBlock([
      Tx.contractCall('trade-mint', 'create-listing', [
        types.ascii("Test Asset"),
        types.uint(1000),
        types.uint(expiryBlock)
      ], deployer.address)
    ]);
    
    const listingId = block.receipts[0].result.expectOk().expectUint();
    
    // Mine blocks until expiry
    for (let i = 0; i < 11; i++) {
      chain.mineEmptyBlock();
    }
    
    // Attempt to make offer on expired listing
    let offerBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'make-offer', [
        types.uint(listingId)
      ], buyer.address)
    ]);
    
    offerBlock.receipts[0].result.expectErr().expectUint(105); // err-listing-expired
  }
});

// Previous tests unchanged...
