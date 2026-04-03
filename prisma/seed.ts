import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hash } from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const passwordHash = await hash("omega2026", 10);
  await prisma.user.upsert({
    where: { email: "admin@omegahomes.com" },
    update: {},
    create: {
      email: "admin@omegahomes.com",
      passwordHash,
      name: "Omega Admin",
      role: "admin",
    },
  });

  // Project
  const project = await prisma.project.upsert({
    where: { slug: "the-ridge-lot-18" },
    update: {},
    create: {
      name: "The Ridge — Lot 18",
      slug: "the-ridge-lot-18",
      client: "Fernando Cruz",
      address: "1677 N Elk Ridge Lane, Alpine, UT 84004",
      standard: "High-End / Luxury",
      matterportUrl: "https://my.matterport.com/show/?m=PqVuSaDQ5wX&play=1&qs=1",
      published: true,
    },
  });

  // Helper to create section + items
  async function createSection(
    name: string,
    slug: string,
    subtitle: string,
    sortOrder: number,
    items: {
      name: string;
      category?: string;
      roomLocation?: string;
      finishType?: string;
      vendorName?: string;
      vendorContact?: string;
      vendorRef?: string;
      specs: { label: string; value: string }[];
    }[]
  ) {
    const section = await prisma.section.upsert({
      where: { projectId_slug: { projectId: project.id, slug } },
      update: {},
      create: { projectId: project.id, name, slug, subtitle, sortOrder },
    });

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const item = await prisma.item.create({
        data: {
          sectionId: section.id,
          name: it.name,
          category: it.category,
          roomLocation: it.roomLocation,
          finishType: it.finishType,
          vendorName: it.vendorName,
          vendorContact: it.vendorContact,
          vendorRef: it.vendorRef,
          sortOrder: i,
        },
      });
      for (let j = 0; j < it.specs.length; j++) {
        await prisma.itemSpec.create({
          data: {
            itemId: item.id,
            label: it.specs[j].label,
            value: it.specs[j].value,
            sortOrder: j,
          },
        });
      }
    }
  }

  // ═══ SECTION 1: MAIN LEVEL KITCHEN ═══
  await createSection("Main Level Kitchen", "main-level-kitchen", "Polished Gold · Custom Cabinetry · Premium Workstation", 0, [
    {
      name: "Main Kitchen Cabinets", category: "Cabinetry", roomLocation: "Main Kitchen",
      vendorName: "Brian Ranck Design", vendorContact: "Brian Ranck",
      specs: [
        { label: "Type", value: "Full custom — 15 pages of detailed elevations & layouts" },
        { label: "Designer", value: "Brian Ranck, 348 E 12300 S, Draper, UT" },
        { label: "Phone", value: "(801) 809-8833" },
        { label: "Finish", value: "High-End (Matte / Gloss / Wood Veneer TBD)" },
        { label: "Standard", value: "Luxury" },
        { label: "Reference", value: "Alpine 2 V006 — Pages 13–27 (M1)" },
      ],
    },
    {
      name: "Kitchen Countertops", category: "Countertop", roomLocation: "Main Kitchen",
      specs: [
        { label: "Material", value: "Granite / Quartz / Marble (selection pending)" },
        { label: "Color", value: "TBD" },
        { label: "Finish", value: "Polished or Honed" },
      ],
    },
    {
      name: "Professional Spring Pull-Down Faucet", category: "Faucet", roomLocation: "Main Kitchen",
      finishType: "Polished Gold", vendorName: "SW Plumbing Supply", vendorContact: "Jen Henry", vendorRef: "S5114485",
      specs: [
        { label: "Finish", value: "Polished Gold" },
        { label: "Type", value: "Professional-grade spring pull-down" },
        { label: "Features", value: "Dual spray mode, high-arc design" },
      ],
    },
    {
      name: "Wall-Mount Pot Filler", category: "Faucet", roomLocation: "Main Kitchen",
      finishType: "Polished Gold", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Finish", value: "Polished Gold" },
        { label: "Mount", value: "Wall-mounted, articulating dual-joint arm" },
        { label: "Style", value: "Traditional with cross handles" },
      ],
    },
    {
      name: "Premium Stainless Steel Workstation Sink", category: "Sink", roomLocation: "Main Kitchen",
      vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Material", value: "Stainless steel" },
        { label: "Accessories", value: "Cutting board, 2 colanders, 2 bottom grids, drain covers" },
        { label: "Features", value: "Integrated ledge system for accessories" },
      ],
    },
    {
      name: "Round Bar / Prep Sink", category: "Sink", roomLocation: "Main Kitchen",
      finishType: "Polished Gold", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Type", value: "Round stainless steel undermount" },
        { label: "Faucet", value: "Polished Gold pull-down bar faucet" },
      ],
    },
    {
      name: "Garbage Disposal & Drain Flange", category: "Disposal", roomLocation: "Main Kitchen",
      vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Disposal", value: "InSinkErator" },
        { label: "Flange", value: "Polished Gold disposal flange" },
      ],
    },
    {
      name: "Medium Drum Pendant (V1YC)", category: "Lighting", roomLocation: "Kitchen Island x3",
      finishType: "Rustic Brass", vendorName: "Nova Lighting", vendorRef: "42121138",
      specs: [
        { label: "Model", value: "V1YC" },
        { label: "Qty", value: "3 (over island)" },
        { label: "Finish", value: "Rustic Brass" },
        { label: "Style", value: "Traditional, Rustic, Industrial" },
        { label: "Height", value: '19.75"' },
        { label: "Width", value: '15.25"' },
        { label: "Bulb", value: "1 per pendant" },
      ],
    },
    {
      name: "Appliance Package", category: "Appliance", roomLocation: "Main Kitchen",
      specs: [
        { label: "Level", value: "Premium / Luxury" },
        { label: "Brand", value: "TBD" },
      ],
    },
  ]);

  // ═══ SECTION 2: PANTRY ═══
  await createSection("Main Level Pantry", "main-level-pantry", "Black Onyx Finish", 1, [
    {
      name: "Pantry Faucet & Sink", category: "Faucet & Sink", roomLocation: "Pantry",
      finishType: "Black Onyx", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Sink", value: 'Stainless steel single bowl — 30"L x 17"W x 9"D' },
        { label: "Faucet", value: "Black Onyx pull-down with side soap dispenser" },
        { label: "Disposal", value: "InSinkErator · Black Onyx flange" },
      ],
    },
  ]);

  // ═══ SECTION 3: BASEMENT KITCHENETTE ═══
  await createSection("Basement Kitchenette", "basement-kitchenette", "Matte Black · Modern Minimalist", 2, [
    {
      name: "Basement Kitchen Cabinets", category: "Cabinetry", roomLocation: "Basement Kitchen",
      vendorName: "Brian Ranck Design",
      specs: [
        { label: "Design", value: "Full custom layout — 8 pages" },
        { label: "Reference", value: "Alpine 2 V006, Pages 3–10 (B1)" },
      ],
    },
    {
      name: '33" Workstation Sink', category: "Sink", roomLocation: "Basement Kitchen",
      finishType: "Matte Black", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Size", value: '33" x 19" x 9.5"' },
        { label: "Accessories", value: "Cutting board, colander, drying rack, bottom grid, cloth" },
        { label: "Disposal", value: "Evergrind E202" },
      ],
    },
    {
      name: "Modern Pull-Down Faucet", category: "Faucet", roomLocation: "Basement Kitchen",
      finishType: "Matte Black", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Finish", value: "Matte Black" },
        { label: "Features", value: "Touch sensor activation, modern U-shape" },
      ],
    },
    {
      name: "Pendant 1Lt (340636J0)", category: "Lighting", roomLocation: "Basement Kitchen x4",
      finishType: "Black", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Black" },
        { label: "Style", value: "Mid-Century" },
        { label: "Bulb", value: "1 x 75W" },
        { label: "Height", value: '17.75"' },
      ],
    },
  ]);

  // ═══ SECTION 4: MASTER SUITE ═══
  await createSection("Master Suite", "master-suite", "Polished & Brushed Nickel · Spa-Level Luxury", 3, [
    {
      name: "67\" x 32\" Freestanding Fluted Tub", category: "Bathtub", roomLocation: "Master Bath",
      finishType: "Polished & Brushed Nickel", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Size", value: '67" x 32"' },
        { label: "Style", value: "Fluted exterior, smooth white interior" },
        { label: "Tub Filler", value: "Wall-mount, Polished/Brushed Nickel" },
      ],
    },
    {
      name: "Master Vanity — Double Sink", category: "Sink & Faucet", roomLocation: "Master Bath",
      finishType: "Polished & Brushed Nickel", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Sinks", value: "2x undermount rectangular, white ceramic" },
        { label: "Faucets", value: "2x widespread with fluted handles" },
        { label: "Finish", value: "Polished & Brushed Nickel" },
      ],
    },
    {
      name: "Multi-Head Shower System", category: "Shower System", roomLocation: "Master Bath",
      finishType: "Polished & Brushed Nickel", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Valves", value: "3x PosiTemp pressure-balance valves" },
        { label: "Rain Heads", value: "2x stationary, wall-mount" },
        { label: "Handshower", value: "1x on slide bar" },
        { label: "Finish", value: "Polished & Brushed Nickel" },
      ],
    },
    {
      name: "Master Bath Vanity Cabinetry", category: "Cabinetry", roomLocation: "Master Bath",
      vendorName: "Brian Ranck Design",
      specs: [
        { label: "Design", value: "Custom — 3 pages of layouts" },
        { label: "Reference", value: "Alpine 2 V006, Pages 36–38 (M8)" },
      ],
    },
    {
      name: "Large Adjustable Pendant (Y2Q1)", category: "Lighting", roomLocation: "Master Bath x4",
      finishType: "Heritage Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Heritage Brass with Clear Glass" },
        { label: "Style", value: "Traditional, Glam" },
        { label: "Height", value: '17"' },
        { label: "Width", value: '5"' },
      ],
    },
    {
      name: "12-Light Crystal Drum Chandelier (405VWEX)", category: "Lighting", roomLocation: "Over Master Tub",
      finishType: "Aged Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Aged Brass" },
        { label: "Style", value: "Contemporary" },
        { label: "Bulbs", value: "12 x 60W" },
        { label: "Size", value: '16.75"H x 18"W' },
      ],
    },
    {
      name: "Geneva Large Chandelier (7072T3A)", category: "Lighting", roomLocation: "Master Bedroom",
      finishType: "Burnished Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Burnished Brass" },
        { label: "Style", value: "Mid-Century Rustic" },
        { label: "Bulbs", value: "8 x 60W" },
        { label: "Size", value: '14.88"H x 42"W x 42"L' },
      ],
    },
    {
      name: "Geneva Large Pendant (706TQ2Q)", category: "Lighting", roomLocation: "Master Bedroom x2",
      finishType: "Burnished Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Burnished Brass" },
        { label: "Style", value: "Mid-Century Rustic" },
        { label: "Size", value: '13.75"H x 7"W' },
        { label: "Bulb", value: "1 x 60W" },
      ],
    },
    {
      name: "Anholt 4-Light Semi-Flush (ALG36)", category: "Lighting", roomLocation: "Master Closet",
      finishType: "Noble Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Noble Brass" },
        { label: "Style", value: "Modern" },
        { label: "Bulbs", value: "4 x 60W" },
        { label: "Size", value: '15.50"H x 16.50"W' },
      ],
    },
    {
      name: "Walk-In Closet System", category: "Cabinetry", roomLocation: "Master Closet",
      vendorName: "Brian Ranck Design",
      specs: [
        { label: "Design", value: "Custom walk-in — 2 pages" },
        { label: "Reference", value: "Alpine 2 V006, Pages 39–40 (M9)" },
      ],
    },
  ]);

  // ═══ SECTION 5: POWDER BATH ═══
  await createSection("Powder Bath", "powder-bath", "Polished Gold · Malachite Accents · Black Herringbone", 4, [
    {
      name: "Wall-Mount Faucet with Malachite Handles", category: "Faucet", roomLocation: "Powder Bath",
      finishType: "Polished Gold", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Finish", value: "Polished Gold" },
        { label: "Handles", value: "Malachite (green natural stone) inlays" },
        { label: "Mount", value: "Wall-mounted widespread" },
      ],
    },
    {
      name: "Black Herringbone Vessel Sink", category: "Sink", roomLocation: "Powder Bath",
      finishType: "Matte Black", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Type", value: "Rectangular vessel, drop-in" },
        { label: "Pattern", value: "Black herringbone embossed texture" },
        { label: "Finish", value: "Matte black" },
      ],
    },
    {
      name: "Powder Bath Vanity", category: "Cabinetry", roomLocation: "Powder Bath",
      vendorName: "Brian Ranck Design",
      specs: [{ label: "Reference", value: "Alpine 2 V006, Pages 41–43 (M10)" }],
    },
    {
      name: "Medium Three Light Vanity (9ZW1Q)", category: "Lighting", roomLocation: "Powder Bath",
      finishType: "Lacquered Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Lacquered Brass" },
        { label: "Style", value: "Transitional" },
        { label: "Size", value: '11.75"H x 24"W x 7.25" ext' },
        { label: "Bulbs", value: "3 x 5W" },
      ],
    },
  ]);

  // ═══ SECTION 6: GUEST BATHROOMS ═══
  await createSection("Guest Bathrooms", "guest-bathrooms", "Bunk · Bath #3 · Bath #5 · Bath #6 Fireplace", 5, [
    {
      name: "Bunk Bath — Full Suite", category: "Bathroom Suite", roomLocation: "Bunk Bath",
      finishType: "Brushed Nickel", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Faucets", value: "2x single-handle, Brushed Nickel" },
        { label: "Sinks", value: "2x undermount rectangular" },
        { label: "Shower", value: "Square head, wall-mount" },
        { label: "Tub", value: "Alcove bathtub, white" },
      ],
    },
    {
      name: "Bathroom #3 — Bronzed Gold", category: "Bathroom Suite", roomLocation: "Bathroom #3",
      finishType: "Bronzed Gold", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Faucet", value: "Single-handle gooseneck, Bronzed Gold" },
        { label: "Sink", value: "Blue vessel sink (custom)" },
        { label: "Shower", value: "Round oversized rain head + valve" },
      ],
    },
    {
      name: "Bathroom #5 — Full Matte Black", category: "Bathroom Suite", roomLocation: "Bathroom #5",
      finishType: "Matte Black", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Faucets", value: "2x single-handle, Matte Black" },
        { label: "Sinks", value: "2x undermount rectangular" },
        { label: "Shower", value: "Square head + valve, Matte Black" },
        { label: "Tub", value: "Alcove, white" },
      ],
    },
    {
      name: "Bathroom #6 — Dual Tone (Fireplace Bath)", category: "Bathroom Suite", roomLocation: "Bathroom #6",
      finishType: "Matte Black & Brushed Gold", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Faucet", value: "Tall vessel, Matte Black" },
        { label: "Sink", value: "Round metal vessel, Brushed Gold" },
        { label: "Shower", value: "Square head + valve, Brushed Gold" },
        { label: "Tub", value: "Alcove, white, Brushed Gold spout" },
      ],
    },
    {
      name: "Additional Bath — Artisan", category: "Bathroom Suite", roomLocation: "Additional Bath",
      vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Sink", value: "Black & tan display vessel" },
        { label: "Faucet", value: "Brass widespread with industrial cross handles" },
        { label: "Finish", value: "TBD" },
      ],
    },
    {
      name: "Gerber Viper — All Bathrooms", category: "Toilet", roomLocation: "All Bathrooms",
      vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Brand", value: "Gerber Viper" },
        { label: "Height", value: "Comfort height" },
        { label: "Seat", value: "Soft-close" },
        { label: "Color", value: "White" },
      ],
    },
  ]);

  // ═══ SECTION 7: GREAT ROOM & LIVING ═══
  await createSection("Great Room & Living", "great-room-living", "Statement Lighting · Fireplaces · Wood Ceiling", 6, [
    {
      name: "Piaf Grande Two-Tier Chandelier", category: "Lighting", roomLocation: "Great Room",
      finishType: "Natural Steel & Wood", vendorName: "Nova Lighting",
      specs: [
        { label: "Model", value: "60KLZ43 (TOB5453 by Visual Comfort)" },
        { label: "Designer", value: "Thomas O'Brien" },
        { label: "Style", value: "Casual — steel bars, wood/metal hubs, conical shades" },
        { label: "Width", value: '58"' },
        { label: "Bulbs", value: "12" },
      ],
    },
    {
      name: "Main Fireplace with Built-In Cabinetry", category: "Fireplace", roomLocation: "Great Room",
      vendorName: "Brian Ranck Design",
      specs: [
        { label: "Fuel", value: "Gas (gas line installed)" },
        { label: "Surround", value: "Custom built-in cabinetry (M5)" },
        { label: "Design", value: "Alpine 2 V006, Page 59" },
      ],
    },
    {
      name: "Secondary Fireplace with Built-In", category: "Fireplace",
      vendorName: "Brian Ranck Design",
      specs: [
        { label: "Fuel", value: "Gas" },
        { label: "Surround", value: "Custom built-in cabinetry (M7)" },
        { label: "Design", value: "Alpine 2 V006, Page 60" },
      ],
    },
    {
      name: "Wood Plank Ceiling", category: "Ceiling", roomLocation: "Great Room",
      finishType: "Natural Oak",
      specs: [
        { label: "Material", value: "Oak planks" },
        { label: "Color", value: "Natural / Light Blonde" },
        { label: "Finish", value: "Wire-brushed / Matte" },
        { label: "Coverage", value: "Full great room ceiling" },
      ],
    },
    {
      name: "Large Twelve Light Linear (9LTDA)", category: "Lighting", roomLocation: "Dining Room",
      finishType: "Weathered Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Weathered Brass" },
        { label: "Style", value: "Transitional, Industrial" },
        { label: "Bulbs", value: "12" },
        { label: "Size", value: '35.75"H x 60.25"W' },
      ],
    },
    {
      name: "Crown Point 13-Light Multi Pendant (349FY6H)", category: "Lighting", roomLocation: "Entry",
      finishType: "Brushed Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Brushed Brass" },
        { label: "Style", value: "Art Deco, Contemporary" },
        { label: "Size", value: '44"H x 32"W' },
        { label: "Features", value: "Organic teardrop glass, tiered metal frame" },
      ],
    },
    {
      name: "Crown Point 9-Light (349FX6M)", category: "Lighting", roomLocation: "Stairs",
      finishType: "Brushed Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Brushed Brass" },
        { label: "Style", value: "Art Deco, Contemporary" },
        { label: "Size", value: '11.25"H x 19.25"W' },
      ],
    },
    {
      name: "DEMAREST Wall Sconce (AC996)", category: "Lighting", roomLocation: "Stairs x2",
      finishType: "Aged Brass / Distressed Bronze", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Aged Brass / Distressed Bronze" },
        { label: "Style", value: "Essential" },
        { label: "Size", value: '18.75"H x 7.75"W x 10" ext' },
      ],
    },
    {
      name: '18" Cabinet Maker\'s Picture Light (60KLU9U)', category: "Lighting", roomLocation: "Entry x4 · Loft x2",
      vendorName: "Nova Lighting",
      specs: [
        { label: "Qty", value: "6 total (4 Entry/Hall + 2 Loft)" },
        { label: "Style", value: "Casual" },
        { label: "Size", value: '3.50"H x 18"W x 8.25" ext' },
      ],
    },
    {
      name: "Office & Piano Room Cabinetry", category: "Cabinetry", roomLocation: "Office / Piano Room",
      vendorName: "Brian Ranck Design",
      specs: [
        { label: "Design", value: "Built-in shelving & desk" },
        { label: "Reference", value: "Alpine 2 V006, Pages 28-29, 57 (M2)" },
      ],
    },
    {
      name: "Mango Wood Drum Semi Flush (9RQ1T)", category: "Lighting", roomLocation: "Piano Room",
      finishType: "Matte Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Matte Brass" },
        { label: "Material", value: "Handcrafted reversed-flute mango wood, Nordic Wood" },
        { label: "Style", value: "Transitional" },
        { label: "Size", value: '8.25"H x 20"W' },
      ],
    },
    {
      name: "MARIPOSA 3LT Semi-Flush (9PTMC)", category: "Lighting", roomLocation: "Office",
      finishType: "Matte Black / Aged Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Matte Black with Aged Brass accents" },
        { label: "Bulbs", value: "3 x 60W" },
        { label: "Size", value: '16.25"H x 19.50"W' },
      ],
    },
    {
      name: "Bar Cabinetry & Shelving", category: "Cabinetry", roomLocation: "Bar",
      vendorName: "Brian Ranck Design",
      specs: [
        { label: "Design", value: "Full bar layout — 3 pages" },
        { label: "Reference", value: "Alpine 2 V006, Pages 33-35 (M6)" },
      ],
    },
    {
      name: "Mud Room Storage", category: "Cabinetry", roomLocation: "Mud Room",
      vendorName: "Brian Ranck Design",
      specs: [
        { label: "Design", value: "Custom storage + optional alternate design" },
        { label: "Reference", value: "Alpine 2 V006, Pages 30-32, 58 (M3)" },
      ],
    },
  ]);

  // ═══ SECTION 8: BASEMENT & UTILITY ═══
  await createSection("Basement & Utility", "basement-utility", "Rec Room · Bedroom · Gym · Laundry", 7, [
    {
      name: "Debi Wall Sconce (A8AMP)", category: "Lighting", roomLocation: "Rec Room x4",
      finishType: "Aged Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Aged Brass" },
        { label: "Style", value: "Transitional, Everyday Modern" },
        { label: "Size", value: '12.75"H x 7.50"W x 8.75" ext' },
      ],
    },
    {
      name: "3-Light Ceiling Light (80403TW)", category: "Lighting", roomLocation: "Basement Bedroom",
      finishType: "Matte Black & Natural Brass", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Matte Black & Natural Brass" },
        { label: "Bulbs", value: "3 x 60W" },
        { label: "Size", value: '10.50"H x 16"W' },
      ],
    },
    {
      name: 'Streaming 52" LED Ceiling Fan (DA5P)', category: "Ceiling Fan", roomLocation: "Gym",
      finishType: "Midnight Black", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Midnight Black" },
        { label: "Style", value: "Modern" },
        { label: "Width", value: '52"' },
        { label: "Features", value: "LED integrated, remote" },
      ],
    },
    {
      name: "Semi-Flush Conv (AQ4DH)", category: "Lighting", roomLocation: "Laundry Room",
      finishType: "Textured Black", vendorName: "Nova Lighting",
      specs: [
        { label: "Finish", value: "Textured Black" },
        { label: "Style", value: "Luxe, Contemporary, Modern Mountain" },
        { label: "Size", value: '15.37"H x 19"W' },
      ],
    },
    {
      name: "Laundry Sink & Faucet", category: "Sink & Faucet", roomLocation: "Laundry",
      finishType: "Polished Nickel", vendorName: "SW Plumbing Supply",
      specs: [
        { label: "Sink", value: 'Composite 33" x 22"' },
        { label: "Faucet", value: "Polished Nickel pull-down + bar faucet" },
      ],
    },
    {
      name: "Additional Cabinetry & Built-Ins", category: "Cabinetry",
      vendorName: "Brian Ranck Design",
      specs: [
        { label: "B2-4", value: "Basement bathroom floating vanities (8')" },
        { label: "B5", value: "Linen closet & desk" },
        { label: "B6", value: "Basement laundry cabinetry" },
        { label: "U1", value: "Upper laundry — 6 pages of layouts" },
        { label: "U2-4", value: "Upper bathroom vanities" },
      ],
    },
    {
      name: "Bathroom Vanity Lighting Package", category: "Lighting",
      vendorName: "Nova Lighting",
      specs: [
        { label: "Bed Bath", value: 'Camile (608U6UG) Aged Brass · 7"H x 25"W' },
        { label: "Hall Bath", value: '3 Light Vanity (CLFDZ) Transitional · 11.25"H x 24"W' },
        { label: "Base Bath", value: 'Geneva 3-Light (706TQZU) Burnished Brass · 8.88"H x 22.50"W' },
        { label: "Base 1/2", value: '3 Light Vanity (CLFE1) Transitional · 11.25"H x 24"W' },
        { label: "Base Bed", value: 'Ravik 24" (9XVZ4) Legacy Brass · 10.50"H x 24"W' },
        { label: "Bath Up", value: 'LED Mirror (A4C08) 24"x36" Front/Back Lit, Flat Black' },
      ],
    },
  ]);

  // ═══ SECTION 9: EXTERIOR ═══
  await createSection("Exterior", "exterior", "Envelope · Cladding · Exterior Lighting", 8, [
    { name: "Exterior Doors", category: "Doors", specs: [{ label: "Material", value: "TBD" }, { label: "Type", value: "TBD" }] },
    { name: "Windows & Patio Doors", category: "Windows", specs: [{ label: "Frame", value: "Black (confirmed in construction photos)" }, { label: "Glass", value: "Double Glazed (expected)" }] },
    { name: "Roof Material", category: "Roofing", specs: [{ label: "Type", value: "TBD" }, { label: "Material", value: "TBD" }] },
    { name: "Stucco", category: "Cladding", specs: [{ label: "Type", value: "TBD" }, { label: "Texture", value: "TBD" }, { label: "Color", value: "TBD" }] },
    { name: "Siding / Shake", category: "Cladding", specs: [{ label: "Material", value: "TBD" }, { label: "Finish", value: "TBD" }] },
    { name: "Soffit / Fascia / Gutters", category: "Trim", specs: [{ label: "Material", value: "TBD" }, { label: "Color", value: "TBD" }] },
    { name: "Masonry / Stone", category: "Masonry", specs: [{ label: "Type", value: "TBD" }, { label: "Application", value: "TBD" }] },
    { name: "Garage Doors & Openers", category: "Doors", specs: [{ label: "Type", value: "TBD" }, { label: "Material", value: "TBD" }] },
    {
      name: "Two Light Lantern (4030RAQ)", category: "Lighting", roomLocation: "Garage x6 · Front x4",
      finishType: "Transitional", vendorName: "Nova Lighting",
      specs: [
        { label: "Qty", value: "10 total (6 Garage + 4 Front)" },
        { label: "Style", value: "Transitional" },
        { label: "Size", value: '22"H x 12.50"W x 11.625" ext' },
        { label: "Bulbs", value: "2 per fixture" },
      ],
    },
    {
      name: "Two Light Lantern (4030RAN)", category: "Lighting", roomLocation: "Balcony x2 · Patio x6",
      finishType: "Transitional", vendorName: "Nova Lighting",
      specs: [
        { label: "Qty", value: "8 total (2 Balcony + 6 Patio)" },
        { label: "Style", value: "Transitional" },
        { label: "Size", value: '19"H x 10"W x 11.875" ext' },
      ],
    },
    {
      name: "46W LED 4FT Wrap Light", category: "Lighting", roomLocation: "Garage Interior x10",
      finishType: "White", vendorName: "Nova Lighting",
      specs: [
        { label: "Model", value: "773503 (30721FP)" },
        { label: "Finish", value: "White" },
        { label: "Features", value: "5 CCT selectable, Dimmable, JA8" },
      ],
    },
  ]);

  // ═══ SECTION 10: OUTDOOR & RECREATION ═══
  await createSection("Outdoor & Recreation", "outdoor-recreation", "Pool · Deck · Landscape · Golf · SPA · Pickleball · Grill", 9, [
    { name: "Swimming Pool", category: "Pool", specs: [{ label: "Type", value: "TBD" }, { label: "Heating", value: "TBD" }] },
    {
      name: "Deck — VUBA Stone Coating", category: "Deck",
      vendorName: "Cowboy Concrete Coatings",
      specs: [
        { label: "Material", value: "VUBA Stone (resin-bound natural aggregate)" },
        { label: "Finish", value: "Polyurethane clear coat, UV-stable" },
        { label: "Properties", value: "Seamless, porous, slip-resistant, cooler than stone" },
        { label: "Warranty", value: "5 years · Re-coat every 4-5 years" },
        { label: "Post-Install", value: "No walk 48h, no furniture 4-5 days, no rugs 90 days" },
      ],
    },
    { name: "Landscaping", category: "Landscaping", specs: [{ label: "Style", value: "TBD" }, { label: "Elements", value: "TBD" }] },
    { name: "Golf Simulator", category: "Recreation", specs: [{ label: "Included", value: "Yes" }, { label: "Specs", value: "TBD" }] },
    { name: "SPA Sauna", category: "Wellness", specs: [{ label: "Type", value: "TBD" }, { label: "Capacity", value: "TBD" }] },
    { name: "Pickleball Court", category: "Court", specs: [{ label: "Surface", value: "TBD" }, { label: "Finish", value: "TBD" }] },
    { name: "Built-in Grill Station", category: "Outdoor Kitchen", specs: [{ label: "Included", value: "Yes" }, { label: "Type", value: "TBD" }, { label: "Material", value: "TBD" }] },
    { name: "Retaining Walls", category: "Structural", specs: [{ label: "Type", value: "TBD" }, { label: "Material", value: "TBD" }] },
    { name: "Fence", category: "Perimeter", specs: [{ label: "Type", value: "TBD" }, { label: "Material", value: "TBD" }] },
  ]);

  // ═══ SECTION 11: FLOORING & FINISHES ═══
  await createSection("Flooring & Interior Finishes", "flooring-finishes", "Hardwood · Carpet · Paint · Hardware · Doors · Railing", 10, [
    {
      name: "Hardwood Flooring", category: "Flooring", finishType: "Natural Oak",
      specs: [
        { label: "Wood", value: "Oak" },
        { label: "Color", value: "Natural / Light Blonde" },
        { label: "Finish", value: "Wire-brushed / Matte" },
        { label: "Areas", value: "Main living spaces + great room ceiling" },
      ],
    },
    { name: "Carpet", category: "Flooring", specs: [{ label: "Type", value: "TBD" }, { label: "Areas", value: "Bedrooms" }] },
    { name: "Court Flooring & Finishing", category: "Flooring", specs: [{ label: "Type", value: "TBD" }, { label: "Usage", value: "Sports / Decorative" }] },
    { name: "Interior Painting", category: "Paint", specs: [{ label: "Type", value: "TBD" }, { label: "Colors", value: "TBD" }, { label: "Finish", value: "Matte / Satin / Semi-gloss (per room)" }] },
    { name: "Walls & Insulation", category: "Walls", specs: [{ label: "Walls", value: "Drywall / Masonry (TBD per area)" }, { label: "Insulation", value: "Walls & attic (TBD)" }] },
    { name: "Interior Doors", category: "Doors", specs: [{ label: "Material", value: "TBD" }, { label: "Style", value: "TBD" }] },
    { name: "Interior Railing", category: "Railing", specs: [{ label: "Material", value: "Glass / Metal / Wood (TBD)" }, { label: "Style", value: "TBD" }] },
    { name: "Finish Carpentry & Baseboards", category: "Carpentry", specs: [{ label: "Level", value: "High-End" }, { label: "Baseboard", value: "Model, height, finish TBD" }] },
    { name: "Door & Cabinet Hardware", category: "Hardware", specs: [{ label: "Finish", value: "TBD (brass tones to complement lighting)" }, { label: "Style", value: "TBD" }] },
    {
      name: "Mirrors & Shower Enclosures", category: "Glass",
      vendorName: "Nova Lighting",
      specs: [
        { label: "Type", value: "TBD" },
        { label: "LED Mirror", value: '24"x36" Front & Back Lit (A4C08), Flat Black frame' },
      ],
    },
    {
      name: "LED Bulb Package", category: "Bulbs",
      vendorName: "Nova Lighting",
      specs: [
        { label: "Standard", value: "34x LED9A19/B60W/830 — 3000K warm white" },
        { label: "Candelabra", value: "100x 4W B11 3000K Filament E12 — Clear, dimmable" },
      ],
    },
  ]);

  // ═══ SECTION 12: TILE COLLECTION ═══
  await createSection("Tile Collection", "tile-collection", "21 Selections · Daltile / American Olean / Marazzi", 11, [
    { name: "Negro Marquina 12x12 Honed", category: "Tile", specs: [{ label: "Material", value: "Black marble" }, { label: "Size", value: "12x12" }, { label: "Finish", value: "Honed" }, { label: "Area", value: "80 SF" }, { label: "SKU", value: "MARNEGMAR 9999712904" }] },
    { name: "Hypnotic XL Bella HN", category: "Tile", specs: [{ label: "Material", value: "Large format honed marble" }, { label: "SKU", value: "M342" }, { label: "Area", value: "36.72 SF" }] },
    { name: "Oriental White 12x12 Honed", category: "Tile", specs: [{ label: "Material", value: "Classic white marble" }, { label: "Size", value: "12x12" }, { label: "Finish", value: "Honed" }, { label: "Area", value: "80 SF" }] },
    { name: "Lana Jolly Glossy", category: "Tile", specs: [{ label: "Type", value: "Trim/accent piece" }, { label: "SKU", value: "S1/212J ZL07S1/212JGL" }, { label: "Area", value: "11.75 CD" }] },
    { name: "Charcoal Hexagon 1.5 Matte", category: "Tile", specs: [{ label: "Shape", value: "Hexagon 1.5\"" }, { label: "Finish", value: "Matte" }, { label: "Color", value: "Charcoal" }, { label: "Area", value: "21.06 SF" }] },
    { name: "Matte Artic 2x20 Undulated", category: "Tile", specs: [{ label: "Size", value: "2x20 Rectangle" }, { label: "Finish", value: "Matte, undulated texture" }, { label: "Color", value: "Arctic white" }, { label: "Area", value: "125.76 SF" }] },
    { name: "Stable 2x8 Fluted Glossy", category: "Tile", specs: [{ label: "Size", value: "2x8 Rectangle" }, { label: "Finish", value: "Glossy, fluted texture" }, { label: "Area", value: "124.80 SF" }] },
    { name: "Glass & Stone Baroness Bijou", category: "Tile", specs: [{ label: "Type", value: "Glass & stone mosaic" }, { label: "SKU", value: "RP07" }, { label: "Finish", value: "Premium blend" }, { label: "Area", value: "70.07 SF" }] },
    { name: "Flat Pebble Harbor", category: "Tile", specs: [{ label: "Type", value: "Natural pebble mosaic" }, { label: "SKU", value: "PB21" }, { label: "Area", value: "11.76 SF" }] },
    { name: "Panaro Blend S", category: "Tile", specs: [{ label: "Type", value: "Polished blend mosaic" }, { label: "SKU", value: "DA90" }, { label: "Size", value: "5/8x1" }, { label: "Area", value: "30 SF" }] },
    { name: "Salt 12x24 Layer Microban", category: "Tile", specs: [{ label: "Size", value: "12x24 Rectangle" }, { label: "Features", value: "Microban antimicrobial" }, { label: "Area", value: "529 SF" }] },
    { name: "Dune 1x3 Matte Microban", category: "Tile", specs: [{ label: "Type", value: "Off-set mosaic accent" }, { label: "Features", value: "Microban" }, { label: "Finish", value: "Matte" }, { label: "Area", value: "20.24 SF" }] },
    { name: "Blu 2x6 Glossy", category: "Tile", specs: [{ label: "Size", value: "2x6 Rectangle" }, { label: "Finish", value: "Glossy" }, { label: "Color", value: "Vibrant blue" }, { label: "Area", value: "95.92 SF" }] },
    { name: "Patchwork Illusive PL", category: "Tile", specs: [{ label: "Material", value: "Patterned marble" }, { label: "SKU", value: "M343" }, { label: "Finish", value: "Polished" }, { label: "Area", value: "157.20 SF" }] },
    { name: "Pyramid Angelite GL", category: "Tile", specs: [{ label: "Type", value: "Glass accent strip" }, { label: "SKU", value: "AR48" }, { label: "Size", value: "1/2x6" }, { label: "Area", value: "4.85 SF" }] },
    { name: "Alicante IV 8x8", category: "Tile", specs: [{ label: "Type", value: "Patterned cement tile" }, { label: "SKU", value: "CVB-P-716" }, { label: "Size", value: "8x8" }, { label: "Area", value: "150.21 SF" }] },
    { name: "Dove Grey 6x24 Matte", category: "Tile", specs: [{ label: "Size", value: "6x24 Rectangle" }, { label: "Finish", value: "Matte" }, { label: "Color", value: "Dove Grey" }, { label: "Area", value: "260.40 SF" }] },
    { name: "White Desert 12x24 Woven Textured", category: "Tile", specs: [{ label: "Size", value: "12x24 Rectangle" }, { label: "Finish", value: "Woven texture" }, { label: "Color", value: "White Desert" }, { label: "Area", value: "153.18 SF" }] },
    { name: "Balance Daphne White", category: "Tile", specs: [{ label: "Type", value: "Decorative mosaic" }, { label: "Color", value: "White" }, { label: "Area", value: "20.70 SF" }] },
    { name: "Volakas HN 12x24", category: "Tile", specs: [{ label: "Material", value: "Premium Volakas marble" }, { label: "SKU", value: "M345" }, { label: "Size", value: '12x24 · 3/8" thick' }, { label: "Area", value: "196 SF" }] },
    { name: "Naval 12x24 Stepwise Matte", category: "Tile", specs: [{ label: "Size", value: "12x24 Rectangle" }, { label: "Finish", value: "Stepwise Matte" }, { label: "Color", value: "Naval (dark)" }, { label: "Area", value: "70.40 SF" }] },
  ]);

  console.log("Seed completed! Created project with 12 sections and all items.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
