# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an accounting application ("contabilidad") built with Next.js 15.5, React 19, TypeScript, and Tailwind CSS v4. The application manages Spanish accounting (Plan General Contable) including accounts, invoices, journal entries, and VAT management.

## Commands

### Development
```bash
cd conta
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
```

## Data Model

The core accounting data structure is defined in `/README.md` as TypeScript types:

- **Niveles**: Accounting hierarchy levels (Plan General Contable structure)
- **Cuenta**: Main accounts (e.g., 430 Clientes, 400 Proveedores)
- **Subconta**: Sub-accounts for detailed tracking
- **Nif**: Tax identification and address data for entities
- **Saldos**: Monthly balances (debe/haber) per account
- **Asiento**: Journal entries grouping multiple line items
- **Apunte**: Individual line items within journal entries (debe/haber movements)
- **Concepto**: Predefined concepts for accounting entries
- **Factura**: Invoices (issued/received) linked to journal entries
- **Iva**: VAT line items with base, percentage (21%/10%/4%), and amount

Key relationships:
- One Asiento contains multiple Apuntes
- One Factura can have multiple Apuntes and multiple Iva entries
- Accounts use Spanish PGC codes (e.g., 477 IVA Repercutido, 472 IVA Soportado)

## Data Files

- **NIVELES.tsv**: Spanish Chart of Accounts hierarchy (groups 1-9, accounts, sub-accounts)
- **CONCEPTOS.tsv**: Common accounting concepts with typical account mappings and examples

## Architecture

- **Framework**: Next.js 15.5 with App Router
- **UI**: Tailwind CSS v4 with PostCSS, custom fonts (Geist Sans/Mono)
- **TypeScript**: Strict mode enabled, path alias `@/*` maps to `src/*`
- **Project Structure**: Standard Next.js App Router layout
  - `conta/src/app/` - App Router pages and layouts
  - `conta/public/` - Static assets

The app uses Turbopack for faster builds and hot reloading.

## Spanish Accounting Context

This application follows Spanish accounting standards (Plan General Contable):
- Account codes are numeric (3-digit groups: 100s, 200s, etc.)
- VAT accounts: 472 (IVA Soportado/input), 477 (IVA Repercutido/output)
- Common accounts: 430 (Clientes), 400 (Proveedores), 570 (Caja), 572 (Bancos)
- Journal entries must balance (sum of debe = sum of haber)