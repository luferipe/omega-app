/**
 * Fill item descriptions strictly from data found in documentos/ source files.
 * Items without source data are left untouched.
 *
 * Sources:
 *  - Omega - The Ridge 18 High End.pdf  (Hansen Lighting estimate #42121138)
 *  - omega (2).pdf                       (SW Plumbing supply spec sheet S5114485)
 *  - Invoice_INV22739.pdf                (Alpine Fireplaces invoice)
 *  - item.txt / item2.txt                (Cowboy Concrete / Vuba Stone deck estimate)
 *  - Alpine 2 V006.pdf                   (Distinctive Cabinetry quote, Brian Ranck)
 *
 * Run with: npx tsx scripts/fill-descriptions.ts [--dry]
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DRY = process.argv.includes("--dry");

/**
 * Each entry: exact item name -> description sourced verbatim from one of the docs.
 * No item is described unless its data is literally present in the source files.
 */
const DESCRIPTIONS: Record<string, string> = {
  // ============ Hansen Lighting (Estimate #42121138) ============
  "46W LED 4FT Wrap Light":
    "773503 46W LED 4ft wrap light, 5 CCT, dimmable, JA8 compliant (model 30721FP-QT). White finish. Specified for Garage Interior. Hansen estimate #42121138.",

  "Two Light Lantern (4030RAQ)":
    "Two-light lantern, model 4030RAQ. Transitional style. Two-bulb. Dimensions: 22\" tall × 12.5\" wide × 11.625\" extension. Used at Garage Exterior and Front Exterior. Hansen estimate #42121138.",

  "Two Light Lantern (4030RAN)":
    "Two-light lantern, model 4030RAN. Transitional style. Two-bulb. Dimensions: 19\" tall × 10\" wide × 11.875\" extension. Used at Balcony and Basement Patio. Hansen estimate #42121138.",

  "Piaf Grande Two-Tier Chandelier":
    "Piaf Grande Two-Tier Chandelier (60KLZ43). Casual style, 12 bulbs, 58\" wide. Specified for the Great Room. Hansen estimate #42121138.",

  "Large Twelve Light Linear (9LTDA)":
    "Large twelve-light linear fixture (9LTDA). Weathered Brass finish. Transitional / Industrial style. 12 bulbs. Dimensions: 35.75\" tall × 60.25\" wide × 3\" length. Specified for the Dining Room. Hansen estimate #42121138.",

  "Medium Drum Pendant (V1YC)":
    "Medium drum pendant (V1YC). Rustic Brass finish. Traditional / Rustic / Industrial style. 1 bulb. Dimensions: 19.75\" tall × 15.25\" wide × 15.25\" length. Three units specified for the Kitchen Island. Hansen estimate #42121138.",

  "Crown Point 13-Light Multi Pendant (349FY6H)":
    "Crown Point 13-light, 32-inch multi-pendant (349FY6H). Brushed Brass finish. Art Deco / Contemporary style. Dimensions: 44\" tall × 32\" wide. Specified for the Entry. Hansen estimate #42121138.",

  "Crown Point 9-Light (349FX6M)":
    "Crown Point 9-light, 19-inch multi-pendant (349FX6M). Brushed Brass finish. Art Deco / Contemporary style. Dimensions: 11.25\" tall × 19.25\" wide. Specified for the Stairs. Hansen estimate #42121138.",

  "Geneva Large Chandelier (7072T3A)":
    "Geneva Large Chandelier (7072T3A). Burnished Brass finish. Mid-Century Rustic style. 8 bulbs, 60W. Dimensions: 14.88\" tall × 42\" wide × 42\" length. Specified for the Master Bedroom. Hansen estimate #42121138.",

  "Geneva Large Pendant (706TQ2Q)":
    "Geneva Large Pendant (706TQ2Q-QT). Burnished Brass finish. Mid-Century Rustic style. 1 bulb, 60W. Dimensions: 13.75\" tall × 7\" wide × 7\" length. Two units specified for the Master Bedroom. Hansen estimate #42121138.",

  "Large Adjustable Pendant (Y2Q1)":
    "Large adjustable pendant (Y2Q1). Heritage Brass with Clear glass. Traditional / Glam style. 1 bulb. Dimensions: 17\" tall × 5\" wide × 5\" length. Four units specified for the Master Bathroom. Hansen estimate #42121138.",

  "12-Light Crystal Drum Chandelier (405VWEX)":
    "12-light, 18\" sleek aged-brass banded crystal drum chandelier (405VWEX). Aged Brass finish. Contemporary style. 12 bulbs, 60W. Dimensions: 16.75\" tall × 18\" wide. Specified for the Master Tub. Hansen estimate #42121138.",

  "Anholt 4-Light Semi-Flush (ALG36)":
    "Anholt 4-light convertible semi-flush or pendant (ALG36). Noble Brass finish. Modern style. 4 bulbs, 60W. Dimensions: 15.5\" tall × 16.5\" wide × 16.5\" length. Specified for the Master Closet. Hansen estimate #42121138.",

  "Medium Three Light Vanity (9ZW1Q)":
    "Medium three-light vanity fixture (9ZW1Q). Lacquered Brass finish. Transitional style. 3 bulbs, 5W. Dimensions: 11.75\" tall × 24\" wide × 7.25\" length. Specified for the Main Powder Bath. Hansen estimate #42121138.",

  "18\" Cabinet Maker's Picture Light (60KLU9U)":
    "18\" Cabinet Maker's picture light (60KLU9U). Casual style, 2-bulb. Dimensions: 3.5\" tall × 18\" wide × 8.25\" extension. Four units for Entry & Main Hall, two units for Loft. Hansen estimate #42121138.",

  "DEMAREST Wall Sconce (AC996)":
    "DEMAREST wall sconce (AC996). Aged Brass / Distressed Bronze finish. Essential style. 1 bulb. Dimensions: 18.75\" tall × 7.75\" wide × 7.75\" length × 10\" extension. Two units specified for the Stairs. Hansen estimate #42121138.",

  "Debi Wall Sconce (A8AMP)":
    "Debi wall sconce (A8AMP). Aged Brass finish. Transitional Essentials / Everyday Modern style. 1 bulb. Dimensions: 12.75\" tall × 7.5\" wide × 8.75\" extension. Four units specified for the Basement Rec Room and Piano Room. Hansen estimate #42121138.",

  "Mango Wood Drum Semi Flush (9RQ1T)":
    "20\" W × 8.25\" H 4-light reversed-flute handcrafted Mango Wood drum semi-flush in Nordic Wood (9RQ1T). Matte Brass finish. Transitional style. 4 bulbs, 60W. Hansen estimate #42121138.",

  "MARIPOSA 3LT Semi-Flush (9PTMC)":
    "MARIPOSA 3LT semi-flush (9PTMC). Matte Black with Aged Brass finish. 3 bulbs, 60W. Dimensions: 16.25\" tall × 19.5\" wide. Specified for the Office. Hansen estimate #42121138.",

  "Semi-Flush Conv (AQ4DH)":
    "P350203-031 3-60W medium semi-flush convertible (AQ4DH). Textured Black finish. Luxe / Contemporary / Modern Mountain style. 3 bulbs. Dimensions: 15.37\" tall × 19\" wide × 19\" length. Specified for the Laundry Room. Hansen estimate #42121138.",

  "Pendant 1Lt (340636J0)":
    "1-light pendant (340636J0). Black finish. Mid-Century style. 1 bulb, 75W. 17.75\" tall. Four units specified for the Basement Kitchen & Island. Hansen estimate #42121138.",

  "Streaming 52\" LED Ceiling Fan (DA5P)":
    "Streaming 52\" LED ceiling fan (DA5P). Midnight Black finish. Modern style. 52\" wide. Specified for the Gym. Hansen estimate #42121138.",

  "3-Light Ceiling Light (80403TW)":
    "3-light ceiling light in Matte Black and Natural Brass (80403TW). 3 bulbs, 60W. Dimensions: 10.5\" tall × 16\" wide × 16\" length. Specified for the Basement Bedroom. Hansen estimate #42121138.",

  "Bathroom Vanity Lighting Package":
    "Bathroom vanity lighting package per Hansen estimate #42121138: Camile Bath & Vanity (608U6UG) for Bed Bath Up — Aged Brass; 3-Light Vanity (CLFDZ) for Hall Bath Up; Geneva 3-Light Vanity (706TQZU) for Basement Bed Bath — Burnished Brass; 3-Light Vanity (CLFE1) for Basement 1/2 Bath; Ravik 24\" 3-Light Vanity (9XVZ4) for Basement Bed Bath — Legacy Brass; Front Lit & Back Lit Combine Mirror 24\"×36\" with 3000/4000/5000K (A4C08) — Flat Black, for Bath Up.",

  "LED Bulb Package":
    "LED Bulb Package per Hansen estimate #42121138: 34× LED9A19/B60W/830/1P standard bulbs (3071ZJL-QT) at $1.40 each, and 100× 776201 4W LED B11 3000K Filament E12 dimmable candelabra bulbs (30721FE-QT, Clear) at $3.25 each.",

  // ============ SW Plumbing Supply (Spec sheet S5114485) ============
  "Professional Spring Pull-Down Faucet":
    "Professional spring pull-down kitchen faucet for the Main Level Kitchen. Polished Gold finish. SW Plumbing supply spec sheet S5114485.",

  "Wall-Mount Pot Filler":
    "Wall-mount pot filler for the Main Level Kitchen. Polished Gold finish. SW Plumbing supply spec sheet S5114485.",

  "Premium Stainless Steel Workstation Sink":
    "Premium stainless steel workstation sink for the Main Level Kitchen. Paired with Polished Gold finish faucet hardware. SW Plumbing supply spec sheet S5114485.",

  "Round Bar / Prep Sink":
    "Round bar / prep sink for the Main Level Kitchen. Polished Gold finish hardware. SW Plumbing supply spec sheet S5114485.",

  "Pantry Faucet & Sink":
    "Pantry faucet and sink for the Main Level Pantry. Black Onyx finish. SW Plumbing supply spec sheet S5114485.",

  "Wall-Mount Faucet with Malachite Handles":
    "Wall-mount lavatory faucet with malachite handles for the Powder Bath. Polished Gold finish. SW Plumbing supply spec sheet S5114485.",

  "Black Herringbone Vessel Sink":
    "Black herringbone vessel sink for the Powder Bath, paired with the polished-gold wall-mount faucet. SW Plumbing supply spec sheet S5114485.",

  "67\" x 32\" Freestanding Fluted Tub":
    "67\" × 32\" freestanding fluted bathtub for the Master Suite. Polished and Brushed Nickel hardware finish. Includes wall-mounted tub filler. SW Plumbing supply spec sheet S5114485.",

  "Master Vanity — Double Sink":
    "Master Suite double-sink vanity: 2 sinks with faucets, 1 wall tub filler. Polished and Brushed Nickel finish. SW Plumbing supply spec sheet S5114485.",

  "Multi-Head Shower System":
    "Master Suite multi-head shower system: 3 PosiTemp valves, 2 stationary heads from wall, 1 hand-shower on slide bar. Polished and Brushed Nickel finish. SW Plumbing supply spec sheet S5114485.",

  "Laundry Sink & Faucet":
    "Laundry sink and faucet. Composite 33\" × 22\" sink. Polished Nickel finish. SW Plumbing supply spec sheet S5114485.",

  "Bunk Bath — Full Suite":
    "Bunk Bath full plumbing suite. Brushed Nickel finish. SW Plumbing supply spec sheet S5114485.",

  "Bathroom #3 — Bronzed Gold":
    "Bathroom #3 plumbing suite. Bronzed Gold finish. Includes blue vessel sink (not depicted on the spec sheet). SW Plumbing supply spec sheet S5114485.",

  "Bathroom #5 — Full Matte Black":
    "Bathroom #5 plumbing suite. Full Matte Black finish. SW Plumbing supply spec sheet S5114485.",

  "Bathroom #6 — Dual Tone (Fireplace Bath)":
    "Bathroom #6 (Fireplace Bath) plumbing suite. Dual-tone Matte Black & Brushed Gold finish. SW Plumbing supply spec sheet S5114485.",

  "Additional Bath — Artisan":
    "Additional bath plumbing suite. Finish TBD; faucet TBD. Display sink in Black and Tan. SW Plumbing supply spec sheet S5114485.",

  "Gerber Viper — All Bathrooms":
    "Gerber Viper water closet — comfort height with soft-close seat. Specified for all bathrooms in the residence. SW Plumbing supply spec sheet S5114485.",

  "Modern Pull-Down Faucet":
    "Modern pull-down kitchen faucet for the Basement Kitchenette. Matte Black finish. SW Plumbing supply spec sheet S5114485.",

  "33\" Workstation Sink":
    "33\" workstation sink for the Basement Kitchenette. Matte Black finish hardware pairing. SW Plumbing supply spec sheet S5114485.",

  // ============ Alpine 2 / Distinctive Cabinetry (Brian Ranck) ============
  "Office & Piano Room Cabinetry":
    "Office / Piano Room cabinetry (M2.Office-Piano Room). Designed by Brian Ranck of Distinctive Cabinetry, 348 East 12300 South, Draper UT 84020 (801-809-8833). Cabinet materials and installation: $19,974. Quote dated 3/31/2026.",

  "Main Fireplace with Built-In Cabinetry":
    "Main fireplace built-in cabinetry (M5.Fireplace). Designed by Brian Ranck of Distinctive Cabinetry, 348 East 12300 South, Draper UT 84020 (801-809-8833). Cabinet materials and installation: $21,329. Quote dated 3/31/2026.",

  "Secondary Fireplace with Built-In":
    "Secondary fireplace built-in cabinetry (M7.Fireplace). Designed by Brian Ranck of Distinctive Cabinetry, 348 East 12300 South, Draper UT 84020 (801-809-8833). Cabinet materials and installation: $7,544. Quote dated 3/31/2026.",

  "Additional Cabinetry & Built-Ins":
    "Additional basement cabinetry and built-ins per Distinctive Cabinetry (Brian Ranck) quote dated 3/31/2026: B5.Linnen & Desk — $6,045 cabinet materials and installation; B6.Laundry — $4,272 cabinet materials and installation. Showroom: 348 East 12300 South, Draper UT 84020 (801-809-8833).",

  // ============ Cowboy Concrete Coatings / Vuba Stone (item.txt) ============
  "Deck — VUBA Stone Coating":
    "Vuba Stone deck coating from Cowboy Concrete Coatings (Estimate #Marcos – Omega, March 17, 2026; total $4,367). Hand-troweled rubber/stone composite installed over an existing solid surface (the upper deck already waterproofed with the roofer's membrane). Naturally porous; minor imperfections and waves are inherent to the installation process. 5-year warranty against inferior workmanship and materials ($249 deductible). Re-coat of Rubber Stone Polyurethane required approximately every 4–5 years depending on UV exposure. Annual exterior pressure-wash recommended.",
};

async function main() {
  console.log(`\n${DRY ? "[DRY RUN]" : "[LIVE]"} Filling descriptions...\n`);

  const items = await prisma.item.findMany({
    select: { id: true, name: true, description: true },
  });

  const wanted = new Set(Object.keys(DESCRIPTIONS));
  let updated = 0;
  let skippedAlreadySet = 0;
  let notInDb: string[] = [];

  for (const item of items) {
    const desc = DESCRIPTIONS[item.name];
    if (!desc) continue;
    wanted.delete(item.name);

    if (item.description && item.description.trim().length > 0) {
      console.log(`  = ${item.name} (already has description, skipped)`);
      skippedAlreadySet++;
      continue;
    }

    if (!DRY) {
      await prisma.item.update({
        where: { id: item.id },
        data: { description: desc },
      });
    }
    console.log(`  + ${item.name}`);
    updated++;
  }

  notInDb = Array.from(wanted);

  console.log("\n=== Summary ===");
  console.log(`Descriptions updated:           ${updated}`);
  console.log(`Already had description:        ${skippedAlreadySet}`);
  console.log(`Source-mapped but not in DB:    ${notInDb.length}`);
  if (notInDb.length > 0) {
    console.log("  → " + notInDb.join("\n  → "));
  }

  const totalItems = await prisma.item.count();
  const withDesc = await prisma.item.count({ where: { description: { not: null } } });
  console.log(`\nDB now: ${withDesc}/${totalItems} items have descriptions.`);
  console.log(`${DRY ? "DRY RUN — nothing written." : "Done."}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
