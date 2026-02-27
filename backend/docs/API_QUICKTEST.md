# API Quick Tests (curl)

## Auth token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev2@local.dev","password":"Passw0rd!123"}' | jq -r .accessToken)

## Wallet balance
curl -s http://localhost:3000/wallet/balance -H "Authorization: Bearer $TOKEN" | jq .

## Savings deposit
curl -s -X POST http://localhost:3000/savings/deposit \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"amountMinor":"200","reference":"t","idempotencyKey":"sav-dep-200-x"}' | jq .

## Savings withdraw
curl -s -X POST http://localhost:3000/savings/withdraw \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"amountMinor":"50","reference":"t","idempotencyKey":"sav-wd-50-x"}' | jq .

## Goal projection
GOAL_ID="..."
curl -s http://localhost:3000/goals/$GOAL_ID/projection \
  -H "Authorization: Bearer $TOKEN" | jq .
