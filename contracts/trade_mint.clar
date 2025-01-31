;; TradeMint - Decentralized Trading Platform

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-listing-not-found (err u101))
(define-constant err-invalid-status (err u102))
(define-constant err-insufficient-balance (err u103))
(define-constant err-no-active-offer (err u104))

;; Data Variables
(define-map listings
    uint
    {
        seller: principal,
        asset: (string-ascii 32),
        price: uint,
        status: (string-ascii 10)
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

(define-private (refund-active-offer (listing-id uint) (buyer principal))
    (let
        (
            (offer (unwrap! (map-get? offers {listing-id: listing-id, buyer: buyer}) err-no-active-offer))
        )
        (if (is-eq (get status offer) "pending")
            (begin
                (try! (stx-transfer? (get amount offer) contract-owner buyer))
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
(define-public (create-listing (asset (string-ascii 32)) (price uint))
    (let
        (
            (listing-id (try! (increment-nonce)))
        )
        (map-insert listings
            listing-id
            {
                seller: tx-sender,
                asset: asset,
                price: price,
                status: "active"
            }
        )
        (ok listing-id)
    )
)

(define-public (make-offer (listing-id uint))
    (let
        (
            (listing (unwrap! (map-get? listings listing-id) err-listing-not-found))
        )
        (if (is-eq (get status listing) "active")
            (begin
                (try! (stx-transfer? (get price listing) tx-sender contract-owner))
                (map-set offers
                    {listing-id: listing-id, buyer: tx-sender}
                    {
                        amount: (get price listing),
                        status: "pending"
                    }
                )
                (ok true)
            )
            err-invalid-status
        )
    )
)

(define-public (accept-offer (listing-id uint) (buyer principal))
    (let
        (
            (listing (unwrap! (map-get? listings listing-id) err-listing-not-found))
            (offer (unwrap! (map-get? offers {listing-id: listing-id, buyer: buyer}) err-not-authorized))
        )
        (if (and
                (is-eq (get seller listing) tx-sender)
                (is-eq (get status listing) "active")
                (is-eq (get status offer) "pending")
            )
            (begin
                (try! (stx-transfer? (get amount offer) contract-owner (get seller listing)))
                (map-set listings listing-id
                    (merge listing {status: "completed"})
                )
                (map-set offers
                    {listing-id: listing-id, buyer: buyer}
                    (merge offer {status: "completed"})
                )
                (ok true)
            )
            err-not-authorized
        )
    )
)

(define-public (cancel-listing (listing-id uint))
    (let
        (
            (listing (unwrap! (map-get? listings listing-id) err-listing-not-found))
        )
        (if (and
                (is-eq (get seller listing) tx-sender)
                (is-eq (get status listing) "active")
            )
            (begin
                (try! (refund-active-offer listing-id tx-sender))
                (map-set listings listing-id
                    (merge listing {status: "cancelled"})
                )
                (ok true)
            )
            err-not-authorized
        )
    )
)

(define-public (cancel-offer (listing-id uint))
    (let
        (
            (offer (unwrap! (map-get? offers {listing-id: listing-id, buyer: tx-sender}) err-not-authorized))
        )
        (if (is-eq (get status offer) "pending")
            (begin
                (try! (stx-transfer? (get amount offer) contract-owner tx-sender))
                (map-set offers
                    {listing-id: listing-id, buyer: tx-sender}
                    (merge offer {status: "cancelled"})
                )
                (ok true)
            )
            err-invalid-status
        )
    )
)

;; Read Only Functions
(define-read-only (get-listing (listing-id uint))
    (ok (map-get? listings listing-id))
)

(define-read-only (get-offer (listing-id uint) (buyer principal))
    (ok (map-get? offers {listing-id: listing-id, buyer: buyer}))
)
