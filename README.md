# TradeMint

A decentralized trading platform built on the Stacks blockchain that enables secure peer-to-peer trading of digital assets.

## Features
- Create trade listings with specified assets and prices
- Accept/reject trade offers
- Escrow system for secure trading
- Trade history tracking
- Automatic offer refunds when listings are cancelled
- Listing expiry functionality to automatically close inactive listings
- Cancel listings and offers with automatic refund handling

## Usage
The contract provides the following main functions:
- create-listing: Create a new trade listing with an expiry block height
- make-offer: Make an offer on an existing non-expired listing 
- accept-offer: Accept a pending offer before listing expiry
- cancel-listing: Cancel an active listing (automatically refunds any pending offers)
- cancel-offer: Cancel a pending offer and receive automatic refund
- is-listing-expired: Check if a listing has expired

## Security
The contract implements an escrow system to ensure safe trading between parties. Assets are locked in the contract until the trade is either completed or cancelled. The enhanced escrow system automatically handles refunds when listings or offers are cancelled, protecting buyers from locked funds. The listing expiry mechanism prevents interactions with stale listings and reduces smart contract state bloat.

### Cancellation Mechanics
Both sellers and buyers have the ability to cancel their respective listings and offers:
- Sellers can cancel active listings using cancel-listing
- Buyers can cancel pending offers using cancel-offer
- Cancellation of a listing automatically processes refunds for all pending offers
- Offer cancellation immediately returns the locked funds to the buyer
