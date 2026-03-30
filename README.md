# FACTION — Phase 0 Prototype

> Facts first. Arguments second.

## Running the App

**Requirements:** Node.js 18+ and npm

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# Public site:  http://localhost:3000
# Admin panel:  http://localhost:3000/admin
```

---

## What's Built (Phase 0)

### Public Site
- **Homepage** (`/`) — Priority queue showing all Fact Files sorted by votes. Vote button on each topic.
- **Fact File** (`/fact/[slug]`) — Full evidence-based record with four tabs:
  - **Evidence Index** — All primary sources with tier, authority, date, and direct links
  - **Timeline** — Chronological events sourced to specific evidence items
  - **Contested Claims** — Only appears where primary sources genuinely contradict each other
  - **Data Panels** — SVG charts with mandatory methodology notes

### Admin Panel (no auth in Phase 0)
- **Dashboard** (`/admin`) — All Fact Files with edit links
- **Create** (`/admin/new`) — New Fact File form
- **Edit** (`/admin/[slug]`) — Edit meta, manage all content sections
  - Add/remove/verify evidence items
  - Add/remove timeline events
  - Add/remove contested claims
  - Add/remove data panels
- Sub-forms for adding each content type

### Seed Content
One complete Fact File is pre-loaded:
- **Derek Chauvin / George Floyd** (`/fact/derek-chauvin-george-floyd`) — 10 verified primary sources, 13 timeline events, 2 genuine contested claims, resolved status

---

## Data Storage

Phase 0 uses flat JSON files in `/content/fact-files/`. No database required.

Each Fact File = one JSON file named `{slug}.json`.

When you create a Fact File via the admin, a new JSON file is created automatically. When you edit, the JSON is updated in place.

---

## Data Schema

Full TypeScript types in `src/types/index.ts`. Key entities:

| Entity | Description |
|--------|-------------|
| `FactFile` | The core document — one per topic/case |
| `Evidence` | Atomic source unit — must link to official URL |
| `TimelineEvent` | Dated event, linked to evidence IDs |
| `ContestedClaim` | Only when primary sources directly conflict on a factual point |
| `DataPanel` | Chart with mandatory methodology note |

### Source Tiers
- **Tier 1** — Verified official: government documents, court filings, peer-reviewed studies, official data
- **Tier 3** — Community-verified: citizen footage, official social posts — clearly labelled

---

## Phase 0 → Phase 1 Migration Plan

When moving to Phase 1 (user accounts + voting):
1. Set up PostgreSQL (or Supabase)
2. Run migration script to import all JSON files into DB
3. Add NextAuth for email magic link auth
4. Move vote counts from JSON into DB
5. User-gated priority voting replaces the open button

The TypeScript types in `src/types/index.ts` map 1:1 to the future DB schema — no structural changes needed.

---

## Project Structure

```
faction/
├── content/
│   └── fact-files/          ← JSON Fact Files (flat file DB)
├── src/
│   ├── types/index.ts       ← All TypeScript type definitions
│   ├── lib/
│   │   ├── content.ts       ← Read/write JSON files
│   │   └── actions.ts       ← Next.js Server Actions (all writes)
│   ├── components/          ← Shared UI components
│   │   ├── StatusBadge
│   │   ├── TierBadge
│   │   ├── SourceTypeLabel
│   │   ├── EvidenceCard
│   │   ├── FactFileTimeline
│   │   ├── ContestedClaims
│   │   └── DataPanelChart   ← Pure SVG, no external deps
│   └── app/
│       ├── page.tsx         ← Homepage / Priority queue
│       ├── fact/[slug]/     ← Fact File display
│       └── admin/           ← Admin authoring tool
```

---

## Editorial Policies (Phase 0)

These are enforced by the admin UI and must be maintained manually:

1. **Primary sources only** — every evidence URL must link directly to an official domain. No secondhand links, no file uploads.
2. **Neutral descriptions** — evidence descriptions must be ≤100 words, factual, no interpretation or adjectives.
3. **Contested claims threshold** — only add a contested claim if two primary sources directly contradict each other on a specific factual point. Do not manufacture controversy.
4. **Methodology notes** — mandatory on all data panels. Must state what data, what time period, and what is NOT shown.
5. **Reopen threshold** — defined per Fact File. Only new primary source material (not new interpretations) qualifies.

---

## Upcoming (Phase 1)

- [ ] PostgreSQL database + Prisma ORM
- [ ] User accounts (email magic link, rate-limited)
- [ ] User-gated priority voting
- [ ] Case Builder (user-published arguments, sourced claims)
- [ ] Community voting on Cases
- [ ] Case "Outdated" label when Fact File updates post-publication
- [ ] Credential badge system for verified domain experts
- [ ] Search across Fact Files and Evidence Index
