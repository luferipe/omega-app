# Plan: New Category Structure & Item Re-Cadastration

**Date:** 2026-04-06
**Goal:** Replace the existing flat 36-category list with the new 8-group hierarchical structure, deduplicate existing items, recategorize them, and add missing items found in `documentos/` PDFs.

---

## 1. Current state (assessment)

- **Database:** 292 items, 36 flat categories, 1 project (`The Ridge — Lot 18`).
- **Problem:** Massive duplication. Most items appear 2–3× per section (seed scripts ran multiple times). E.g. `Main Kitchen Cabinets` appears 3× in `Main Level Kitchen`.
- **Existing categories** (flat list): Appliance, Built-in Grill Station, Cabinet, Carpet, Countertop, Court Finishing, Deck, Electrical Fixtures, Exterior Door, Finish Carpentry, Fireplace, Garage Doors, Golf Simulator, Hardware, Hardwood Floor, Heating/Air Conditioning, Interior Doors, Interior Railing, Landscaping, Masonry Materials, Mirrors/Shower Enclosure, Painting, Pickleball Court, Plumbing Fixtures, Roof Material/Labor, Siding/Shake, Soffit/Facia/Gutters, SPA Sauna, Stucco, Swimming Pool, Tile Material, Windows/Patio Doors (+ children for Finish Carpentry & Landscaping).
- **Existing item.category strings** don't match the new taxonomy (e.g. "Lighting", "Tile", "Faucet", "Sink", "Cabinetry") — most need remapping.

---

## 2. Target category tree

```
1. Exterior Finishes
   ├── Roofing Materials
   ├── Siding & Shake
   ├── Stucco
   ├── Soffit, Fascia & Gutters
   ├── Exterior Doors
   ├── Windows & Patio Doors
   ├── Garage Doors
   ├── Decking
   ├── Built-In Grill Station
   └── Masonry & Stonework

2. Interior Finishes
   ├── Interior Doors
   ├── Interior Railings
   ├── Finish Carpentry
   ├── Baseboards & Casing
   ├── Wall Finishes
   ├── Fireplace
   ├── Door & Cabinet Hardware
   ├── Mirrors & Shower Enclosures
   └── Electrical Fixtures

3. Flooring
   ├── Hardwood Flooring
   ├── Carpet
   └── Tile Flooring

4. Kitchen & Bath
   ├── Cabinets
   ├── Countertops
   ├── Plumbing Fixtures
   └── Appliances

5. Mechanical & Systems
   └── HVAC System (Heating & Air Conditioning)

6. Paint & Wall Finishes
   ├── Interior Paint
   └── Exterior Paint

7. Outdoor & Landscaping
   ├── Landscaping
   ├── Fence
   ├── Retaining Walls
   ├── Swimming Pool
   └── Outdoor Pickleball Court

8. Recreation & Specialty Features
   ├── Spa
   ├── Sauna
   ├── Indoor Pickleball Court
   └── Golf Simulator
```

Total: **8 parents, 35 subcategories**.

---

## 3. Item → category mapping rules

These are heuristics for re-tagging existing items by their `name` and old `category`:

| Old category / name pattern              | New (parent / sub)                          |
| ---------------------------------------- | ------------------------------------------- |
| `Lighting`, sconce, pendant, chandelier  | Interior Finishes / Electrical Fixtures     |
| `Bulbs`                                  | Interior Finishes / Electrical Fixtures     |
| `Ceiling Fan`                            | Interior Finishes / Electrical Fixtures     |
| `Tile`, `Tile Collection`                | Flooring / Tile Flooring                    |
| `Flooring` + "Hardwood"                  | Flooring / Hardwood Flooring                |
| `Flooring` + "Carpet"                    | Flooring / Carpet                           |
| `Flooring` + "Court"                     | Outdoor & Landscaping / Outdoor Pickleball Court |
| `Cabinetry`, "Cabinets"                  | Kitchen & Bath / Cabinets                   |
| `Countertop`                             | Kitchen & Bath / Countertops                |
| `Faucet`, `Sink`, `Sink & Faucet`, `Disposal`, `Bathtub`, `Shower System`, `Toilet`, `Bathroom Suite` | Kitchen & Bath / Plumbing Fixtures |
| `Appliance`                              | Kitchen & Bath / Appliances                 |
| `Fireplace`                              | Interior Finishes / Fireplace               |
| `Glass` (mirrors/shower)                 | Interior Finishes / Mirrors & Shower Enclosures |
| `Hardware`                               | Interior Finishes / Door & Cabinet Hardware |
| `Carpentry`, "Finish Carpentry & Baseboards" | Interior Finishes / Baseboards & Casing |
| `Walls`, "Walls & Insulation"            | Interior Finishes / Wall Finishes           |
| `Ceiling`, "Wood Plank Ceiling"          | Interior Finishes / Wall Finishes           |
| `Doors` + "Interior"                     | Interior Finishes / Interior Doors          |
| `Doors` + "Exterior"                     | Exterior Finishes / Exterior Doors          |
| `Doors` + "Garage"                       | Exterior Finishes / Garage Doors            |
| `Railing` + "Interior"                   | Interior Finishes / Interior Railings       |
| `Roofing`                                | Exterior Finishes / Roofing Materials       |
| `Cladding` + "Stucco"                    | Exterior Finishes / Stucco                  |
| `Cladding` + "Siding"                    | Exterior Finishes / Siding & Shake          |
| `Trim` (soffit/fascia/gutters)           | Exterior Finishes / Soffit, Fascia & Gutters |
| `Masonry`                                | Exterior Finishes / Masonry & Stonework     |
| `Windows`                                | Exterior Finishes / Windows & Patio Doors   |
| `Deck`                                   | Exterior Finishes / Decking                 |
| `Outdoor Kitchen` (Built-in Grill)       | Exterior Finishes / Built-In Grill Station  |
| `Pool`                                   | Outdoor & Landscaping / Swimming Pool       |
| `Court` (Pickleball)                     | Outdoor & Landscaping / Outdoor Pickleball Court |
| `Wellness` (SPA Sauna) — split           | Recreation / Spa  + Recreation / Sauna      |
| `Recreation` (Golf Simulator)            | Recreation & Specialty / Golf Simulator     |
| `Landscaping`                            | Outdoor & Landscaping / Landscaping         |
| `Perimeter` (Fence)                      | Outdoor & Landscaping / Fence               |
| `Structural` (Retaining Walls)           | Outdoor & Landscaping / Retaining Walls     |
| `Paint` + "Interior"                     | Paint & Wall Finishes / Interior Paint      |

Items whose names contain "All Bathrooms", "Vanity", "Pendant", etc. follow the most specific rule by old category first.

---

## 4. Deduplication strategy

For each section, keep the **first occurrence** of each `(normalized name)` and delete the rest, including their specs and images. Normalization: trim, lowercase, collapse whitespace.

Expected reduction: 292 items → ~100 unique items.

---

## 5. New items from `documentos/`

Most of the documentos PDFs (`Omega - The Ridge 18 High End.pdf`, `omega (2).pdf`) contain items already represented in the database (Hansen lighting, SW Plumbing fixtures). The genuinely new items to add:

| Source                              | Item                                          | Section            | New category                          |
| ----------------------------------- | --------------------------------------------- | ------------------ | ------------------------------------- |
| `Invoice_INV22739` (Alpine Fireplaces) | Kozy 72" Callaway Linear Fireplace (Main)   | Great Room & Living | Interior Finishes / Fireplace        |
| `Invoice_INV22739`                  | Kozy 72" Callaway Linear Fireplace (Basement) | Basement & Utility | Interior Finishes / Fireplace        |
| `item.txt` / `item2.txt` (Vuba Stone) | Vuba Stone Deck Coating (already in DB as "Deck — VUBA Stone Coating") | Outdoor & Recreation | already covered |
| `Alpine 2 V006.pdf` (cabinetry)     | Cabinet pricing per room — already covered by existing "Cabinets" entries; add quote totals as specs |  |  |

The Hansen lighting PDF will be cross-referenced to enrich existing lighting items with finish/dimensions (already in DB but verify).

The Alpine 2 cabinetry PDF only contains drawings + pricing per room (e.g. M5.Fireplace $21,329, M2.Office-Piano $19,974). These prices can be added as specs to existing cabinet items.

---

## 6. Execution steps

1. **Create planning doc** ✅ (this file)
2. **Write reseed script** (`scripts/reseed-categories-and-items.ts`) that:
   a. Deletes all existing categories
   b. Creates new 8-group tree
   c. Iterates all items, deduplicates by `(sectionId, normalized name)`
   d. Maps each surviving item's old category string → new categoryId via `MAPPING_RULES`
   e. Updates `category` (denormalized string) to `Parent / Sub`
   f. Logs unmapped items at the end for manual review
3. **Run script in dry-run mode** first (log only, no writes)
4. **Run for real**, capture output
5. **Verify** via /admin/categories page and /catalog/the-ridge-lot-18
6. **Add net-new items** from Alpine Fireplaces invoice (2 fireplace items with vendor info & price specs)
7. **Commit & deploy**

---

## 7. Risks & mitigations

- **Risk:** A category mapping is wrong → items end up in the wrong subcategory.
  **Mitigation:** Dry-run first; print a summary table grouped by `(old → new)`.
- **Risk:** Deletion of duplicates loses unique image/spec data.
  **Mitigation:** When picking the "first occurrence", prefer items that have images and specs.
- **Risk:** Cascade delete on Category drops `categoryId` from items via SetNull. We'll re-set after recreating.
  **Mitigation:** Reseed sequence: delete categories → recreate categories → reassign items.

---

## 8. What is *not* in scope

- Renaming sections of the project
- Editing item descriptions (only category/categoryId changes)
- Changing the project itself
- Building a new admin UI for items (the existing `/admin/...` flow already handles items)
