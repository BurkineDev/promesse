# Finance App — Backend Ledger & Products (MVP)

## Objectif
Base fintech auditable avec ledger double entrée et produits au-dessus :
- Wallet réel (USER_MAIN)
- Épargne flexible (SAVINGS)
- Épargne par objectif verrouillée (GOAL)

## Modèle Ledger (Prisma)
- Account(id, userId?, type)
- LedgerTransaction(id, userId?, type, reference?, idempotencyKey?)
- Entry(id, ledgerTransactionId, accountId, amountMinor, direction)

### Balance
balance(account) = SUM(CREDIT) - SUM(DEBIT)

### Idempotency
LedgerTransaction unique sur (userId, idempotencyKey)

## AccountType
- USER_MAIN : argent réel disponible (source de vérité user)
- SAVINGS : épargne flexible (transfert MAIN↔SAVINGS)
- GOAL : un compte par objectif (transfert MAIN↔GOAL)
- SYSTEM_CLEARING : compte système (cashin/cashout, bridging)
- PLATFORM_REVENUE : futur (frais)

## Flows
### Wallet
- GET /wallet/balance

### Savings (flexible)
- GET /savings/balance
- POST /savings/deposit  (TRANSFER MAIN -> SAVINGS)
- POST /savings/withdraw (TRANSFER SAVINGS -> MAIN)

### Goals (locked)
- POST /goals (crée Goal + account GOAL)
- GET /goals
- GET /goals/:id
- PATCH /goals/:id (targetAmountMinor, targetDate)
- PATCH /goals/:id/archive
- GET /goals/:id/balance
- POST /goals/:id/deposit  (TRANSFER MAIN -> GOAL)
- POST /goals/:id/withdraw (TRANSFER GOAL -> MAIN) interdit avant targetDate (403)
- GET /goals/:id/projection

## Projection
- remainingMinor = max(targetAmountMinor - currentBalance, 0)
- daysRemaining = ceil((targetDate - now)/1 day) si date future sinon 0
- perDayMinor = ceil(remainingMinor / daysRemaining) si daysRemaining>0 sinon 0
- perWeekMinor = ceil(remainingMinor / ceil(daysRemaining/7)) si daysRemaining>0 sinon 0
