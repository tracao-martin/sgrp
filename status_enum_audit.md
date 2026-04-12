# Status Enum Audit

## DB enum (actual in PostgreSQL):
novo, contatado, qualificado, desqualificado, convertido

## Drizzle schema enum:
novo, em_contato, qualificado, convertido, perdido

## Frontend uses:
novo, em_contato, qualificado, convertido, desqualificado, aposentado

## Mismatch:
- DB has "contatado" but schema says "em_contato"
- DB has "desqualificado" but schema says "perdido"
- Frontend uses "aposentado" which doesn't exist in DB
- Need to sync all three: DB enum, Drizzle schema, backend validation, frontend

## Fix plan:
1. Update Drizzle schema to match DB: novo, contatado, qualificado, desqualificado, convertido
2. Add "aposentado" to DB enum via ALTER TYPE
3. Update backend z.enum validators
4. Update frontend status references
