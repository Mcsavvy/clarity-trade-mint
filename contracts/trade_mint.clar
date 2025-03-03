;; TradeMint - Decentralized Trading Platform

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-listing-not-found (err u101))
(define-constant err-invalid-status (err u102))
(define-constant err-insufficient-balance (err u103))
(define-constant err-no-active-offer (err u104))
(define-constant err-listing-expired (err u105))
(define-constant err-duplicate-offer (err u106))

;; Data Variables
(define-map listings
    uint
    {
        seller: principal,
        asset: (string-ascii 32),
        price: uint,
        status: (string-ascii 10),
        expiry: uint,
        offer-count: uint
    }
)

(define-map offers
    {listing-id: uint, buyer: principal}
    {
        amount: uint,
        status: (string-ascii 10)
    }
)

(define-data-var listing-nonce uint u0)

;; Private Functions
(define-private (increment-nonce)
    (begin
        (var-set listing-nonce (+ (var-get listing-nonce) u1))
        (ok (var-get listing-nonce))
    )
)

(define-private (is-listing-active (listing-id uint))
    (let
        (
            (listing (unwrap! (map-get? listings listing-id) false))
            (current-block (get-block-height))
        )
        (and
            (is-eq (get status listing) "active")
            (< current-block (get expiry listing))
        )
    )
)

(define-private (refund-active-offer (listing-id uint) (buyer principal))
    (let
        (
            (offer (unwrap! (map-get? offers {listing-id: listing-id, buyer: buyer}) err-no-active-offer))
        )
        (if (is-eq (get status offer) "pending")
            (begin
                (try! (as-contract (stx-transfer? (get amount offer) tx-sender buyer)))
                (map-set offers
                    {listing-id: listing-id, buyer: buyer}
                    (merge offer {status: "refunded"})
                )
                (ok true)
            )
            (ok false)
        )
    )
)

;; Public Functions  
(define-public (create-listing (asset (string-ascii 32)) (price uint) (expiry uint))
    (let
        (
            (listing-id (try! (increment-nonce)))
            (current-block (get-block-height))
        )
        (asserts! (> expiry current-block) err-listing-expired)
        (asserts! (> price u0) err-invalid-status)
        (map-insert listings
            listing-id
            {
                seller: tx-sender,
                asset: asset,
                price: price,
                status: "active",
                expiry: expiry,
                offer-count: u0
            }
        )
        (ok listing-id)
    )
)

(define-public (make-offer (listing-id uint))
    (let
        (
            (listing (unwrap! (map-get? listings listing-id) err-listing-not-found))
            (price (get price listing))
            (existing-offer (map-get? offers {listing-id: listing-id, buyer: tx-sender}))
        )
        (asserts! (is-listing-active listing-id) err-listing-expired)
        (asserts! (is-none existing-offer) err-duplicate-offer)
        (asserts! (>= (stx-get-balance tx-sender) price) err-insufficient-balance)
        (try! (stx-transfer? price tx-sender (as-contract tx-sender)))
        (map-set offers
            {listing-id: listing-id, buyer: tx-sender}
            {amount: price, status: "pending"}
        )
        (map-set listings listing-id
            (merge listing {offer-count: (+ (get offer-count listing) u1)})
        )
        (ok true)
    )
)

;; ... [rest of the contract remains unchanged]
