# TradeMint

A decentralized trading platform built on the Stacks blockchain that enables secure peer-to-peer trading of digital assets.

## Features
- Create trade listings with specified assets and prices
- Accept/reject trade offers
- Escrow system for secure trading
- Trade history tracking

## Usage
The contract provides the following main functions:
- create-listing: Create a new trade listing
- make-offer: Make an offer on an existing listing 
- accept-offer: Accept a pending offer
- cancel-listing: Cancel an active listing
- cancel-offer: Cancel a pending offer

## Security
The contract implements an escrow system to ensure safe trading between parties. Assets are locked in the contract until the trade is either completed or cancelled.