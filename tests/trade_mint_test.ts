import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test listing creation and retrieval",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('trade-mint', 'create-listing', [
        types.ascii("Test Asset"),
        types.uint(1000)
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
    assertEquals(listing['seller'], deployer.address);
    assertEquals(listing['asset'], "Test Asset");
    assertEquals(listing['price'], types.uint(1000));
    assertEquals(listing['status'], "active");
  }
});

Clarinet.test({
  name: "Test offer creation and acceptance flow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const buyer = accounts.get('wallet_1')!;
    
    // Create listing
    let block = chain.mineBlock([
      Tx.contractCall('trade-mint', 'create-listing', [
        types.ascii("Test Asset"),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    const listingId = block.receipts[0].result.expectOk().expectUint();
    
    // Make offer
    let offerBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'make-offer', [
        types.uint(listingId)
      ], buyer.address)
    ]);
    
    offerBlock.receipts[0].result.expectOk();
    
    // Accept offer
    let acceptBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'accept-offer', [
        types.uint(listingId),
        types.principal(buyer.address)
      ], deployer.address)
    ]);
    
    acceptBlock.receipts[0].result.expectOk();
    
    // Verify listing status
    let getListingBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'get-listing', [
        types.uint(listingId)
      ], deployer.address)
    ]);
    
    const listing = getListingBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(listing['status'], "completed");
  }
});

Clarinet.test({
  name: "Test automatic offer refund on listing cancellation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const buyer = accounts.get('wallet_1')!;
    
    // Create listing
    let block = chain.mineBlock([
      Tx.contractCall('trade-mint', 'create-listing', [
        types.ascii("Test Asset"),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    const listingId = block.receipts[0].result.expectOk().expectUint();
    
    // Make offer
    let offerBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'make-offer', [
        types.uint(listingId)
      ], buyer.address)
    ]);
    
    offerBlock.receipts[0].result.expectOk();
    
    // Cancel listing
    let cancelBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'cancel-listing', [
        types.uint(listingId)
      ], deployer.address)
    ]);
    
    cancelBlock.receipts[0].result.expectOk();
    
    // Verify offer status
    let getOfferBlock = chain.mineBlock([
      Tx.contractCall('trade-mint', 'get-offer', [
        types.uint(listingId),
        types.principal(buyer.address)
      ], deployer.address)
    ]);
    
    const offer = getOfferBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(offer['status'], "refunded");
  }
});
