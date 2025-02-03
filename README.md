# TradeMint

A decentralized trading platform built on the Stacks blockchain that enables secure peer-to-peer trading of digital assets.

## Features
- Create trade listings with specified assets and prices
- Accept/reject trade offers
- Escrow system for secure trading
- Trade history tracking
- Automatic offer refunds when listings are cancelled
- Listing expiry functionality to automatically close inactive listings

## Usage
The contract provides the following main functions:
- create-listing: Create a new trade listing with an expiry block height
- make-offer: Make an offer on an existing non-expired listing 
- accept-offer: Accept a pending offer before listing expiry
- cancel-listing: Cancel an active listing (automatically refunds any pending offers)
- cancel-offer: Cancel a pending offer
- is-listing-expired: Check if a listing has expired

## Security
The contract implements an escrow system to ensure safe trading between parties. Assets are locked in the contract until the trade is either completed or cancelled. The enhanced escrow system automatically handles refunds when listings are cancelled, protecting buyers from locked funds. The listing expiry mechanism prevents interactions with stale listings and reduces smart contract state bloat.
