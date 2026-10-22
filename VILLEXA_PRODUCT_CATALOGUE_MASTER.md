# VILLEXA HAUTE ÉBÉNISTERIE & ARCHITECTURE
## Complete Master Product Catalogue & Manual Admin Onboarding Guide

> **Document Type:** Master Product Catalogue & Operational Manual  
> **Prepared For:** Manual Administration & Web Showroom Population  
> **Catalogue Scope:** 32 Concept Masterpieces across 8 Architectural Categories  
> **Currency Baseline:** Indian Rupee (INR — ₹)  
> **Classification Note:** All items listed are concept designs conceived for the VILLEXA digital showroom. Physical dimensions, estimated production weights, and provisional pricing represent architectural specifications and are labeled for workshop confirmation prior to manufacturing.

---

## Table of Contents

1. [Manual Admin Onboarding Workflow](#1-manual-admin-onboarding-workflow)
   - 1.1 [Prerequisites & Navigation Map](#11-prerequisites--navigation-map)
   - 1.2 [Step-by-Step Population Protocol](#12-step-by-step-population-protocol)
   - 1.3 [Admin Form Fields Reference Guide](#13-admin-form-fields-reference-guide)
   - 1.4 [Media Asset Specifications & Formatting Standards](#14-media-asset-specifications--formatting-standards)
2. [Category Master Sheets (8 Categories)](#2-category-master-sheets)
   - 2.1 [Living Room](#category-1-living-room)
   - 2.2 [Bedroom](#category-2-bedroom)
   - 2.3 [Dining](#category-3-dining)
   - 2.4 [Workspace](#category-4-workspace)
   - 2.5 [Lighting](#category-5-lighting)
   - 2.6 [Entryway](#category-6-entryway)
   - 2.7 [Objects & Decor](#category-7-objects--decor)
   - 2.8 [Outdoor](#category-8-outdoor)
3. [Master Product Inventory Table (32 Products)](#3-master-product-inventory-table)
4. [Detailed Product Specification Sheets & Media Checklists](#4-detailed-product-specification-sheets)
   - [Living Room Creations (VLX-LR-001 to VLX-LR-004)](#living-room-creations)
   - [Bedroom Creations (VLX-BD-005 to VLX-BD-008)](#bedroom-creations)
   - [Dining Room Creations (VLX-DN-009 to VLX-DN-012)](#dining-room-creations)
   - [Workspace Creations (VLX-WS-013 to VLX-WS-016)](#workspace-creations)
   - [Lighting Creations (VLX-LT-017 to VLX-LT-020)](#lighting-creations)
   - [Entryway Creations (VLX-EW-021 to VLX-EW-024)](#entryway-creations)
   - [Objects & Decor Creations (VLX-DC-025 to VLX-DC-028)](#objects--decor-creations)
   - [Outdoor Creations (VLX-OD-029 to VLX-OD-032)](#outdoor-creations)
5. [Final Showroom Launch Checklist](#5-final-showroom-launch-checklist)

---

# 1. Manual Admin Onboarding Workflow

This guide provides the exact operational procedure to populate your VILLEXA digital showroom via the custom administrative portal. Follow this sequential order to ensure zero data orphaned references.

### 1.1 Prerequisites & Navigation Map

Access the administration portal via the authorized URL:
* **Admin Dashboard:** `/admin`
* **Category Management:** `/admin/categories`
* **Product Catalog:** `/admin/products`
* **New Product Editor:** `/admin/products/new`

```
┌─────────────────────────────────────────────────────────────────┐
│                    VILLEXA ADMIN WORKFLOW                       │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1: Create 8 Categories at /admin/categories                │
│          (Generates category IDs required for product links)    │
│                                                                 │
│  STEP 2: Enter Products Category-by-Category (/admin/products)  │
│          Tab 1: General & Pricing (Copy text, SKU, price)       │
│          Tab 2: Photography (Upload cover + gallery views)      │
│          Tab 3: Showcase Video (Optional MP4 asset)             │
│          Tab 4: 3D GLB Model (Optional binary .glb)             │
│          Tab 5: 360° Sequence (Optional turntable frames)       │
│                                                                 │
│  STEP 3: Click "Save as Draft"                                  │
│                                                                 │
│  STEP 4: Click "Preview on Site" to inspect live layout         │
│                                                                 │
│  STEP 5: Click "Publish to Showroom" when verified              │
└─────────────────────────────────────────────────────────────────┘
```

---

### 1.2 Step-by-Step Population Protocol

#### Step 1: Create Categories First
1. Navigate to **Categories** (`/admin/categories`).
2. Input the **Category Name**, **Slug**, and **Description** from [Section 2: Category Master Sheets](#2-category-master-sheets).
3. Set the **Display Sort Order** (0 through 7).
4. *(Optional)* Upload a curated **Category Cover Image** (recommended ratio `16:9`, min 1920×1080px).
5. Click **Save Category**. Repeat for all 8 categories before creating products.

#### Step 2: Create Products Category-by-Category
1. Navigate to **Creations** (`/admin/products`) and click **Create Creation** (`+` button).
2. You will see five dedicated tabs:
   * **General & Pricing:** Identification, taxonomy, descriptions, dimensions, and pricing.
   * **Photography:** Multi-image gallery upload and primary card designation.
   * **Showcase Video:** Short cinematic video clip and poster thumbnail.
   * **3D GLB Model:** Interactive Three.js WebGL binary model.
   * **360° Sequence:** High-resolution turntable scrub frames.

#### Step 3: Populate General & Pricing Fields
* Copy the verified **Product Name**, **Slug (URL)**, and **SKU Code** from Section 4.
* Select the corresponding **Category** from the dropdown.
* Copy the **Short Editorial Summary** (displayed on catalogue cards and preview hero).
* Copy the **Full Architectural Description** (displayed in product details).
* Enter the **Regular Price** in INR (numeric only, e.g., `450000`).
* Select **Currency**: Use your store currency setting.
* Ensure **Display price publicly on website** is checked (or select **Enquiry-Only product** if you prefer bespoke client consultations).
* Copy **Materials Specification** and enter **Architectural Dimensions** (Width, Depth, Height, Seat Height in cm).
* Select **Preferred Primary Viewer Mode** (`Standard High-Res Gallery`, `Interactive 3D GLB Model Viewer`, `360-Degree Photographic Turntable`, or `Showcase Video`).

#### Step 4: Upload Photography & Designate Primary Card
1. Click the **Photography** tab.
2. Click **Upload Photos** and select your processed images (`cover` + 3 to 5 gallery shots).
3. The uploaded images appear as cards. Find your intended main catalog shot and click **Set Primary** (the card badge turns gold: `Primary Card`).
4. Use the `←` and `→` arrows to organize the viewing sequence from grand exterior silhouette down to textural close-ups.

#### Step 5: Upload Extended Media (Only When Verified Assets Exist)
* **Showcase Video:** Switch to **Showcase Video** tab, upload MP4/WebM file (max 100MB), and upload a matching video poster image.
* **3D GLB Model:** Switch to **3D GLB Model** tab, upload the standalone binary `.glb` model (max 50MB). The built-in Three.js canvas will render an immediate interactive WebGL preview where you can test rotation and scale.
* **360° Turntable Sequence:** Switch to **360° Sequence** tab, upload 24 or 36 sequential frames named sequentially (e.g. `frame-01.webp` to `frame-24.webp`). Test the interactive scrubber slider.

#### Step 6: Save as Draft & Verify
1. Click **Save as Draft** in the top navigation bar.
2. An eye icon button **Preview on Site** will appear next to the header. Click it to open `/product/[slug]` in a new tab.
3. Verify typography, line breaks, dimensions display, pricing format, and gallery interactions.

#### Step 7: Final Publishing
1. Return to the editor tab.
2. Click **Publish to Showroom**.
3. The product is promoted from the private draft vault to the public CDN and instantly listed across the public showroom, category filters, and search index.

---

### 1.3 Admin Form Fields Reference Guide

The following table maps the exact fields in the VILLEXA admin interface to the catalogue data provided in this document:

| Admin Screen Location | Exact Admin Field Label | Field Type / Format | Catalogue Mapping Source |
| :--- | :--- | :--- | :--- |
| **Header Bar** | Status Action Buttons | Button (`Save as Draft` / `Publish to Showroom`) | Use `Save as Draft` first |
| **Tab 1: General & Pricing** | Product Name * | Text input | Product Identity: Name |
| **Tab 1: General & Pricing** | Slug (URL) * | Text input (lowercase, hyphens) | Product Identity: URL Slug |
| **Tab 1: General & Pricing** | SKU Code * | Text input (unique string) | Product Identity: SKU |
| **Tab 1: General & Pricing** | Category | Select dropdown | Category Master Sheet |
| **Tab 1: General & Pricing** | Collection | Select dropdown | "None / Standalone" |
| **Tab 1: General & Pricing** | Short Editorial Summary | Textarea (2 lines) | Product Identity: Short Description |
| **Tab 1: General & Pricing** | Full Architectural Description | Textarea (4+ lines) | Product Identity: Full Description |
| **Tab 1: General & Pricing** | Regular Price (Numeric) | Number (e.g. `850000`) | Product Info: Suggested Price (INR) |
| **Tab 1: General & Pricing** | Currency | Select dropdown (`USD`, `EUR`, `INR`, etc.) | Set according to showroom config |
| **Tab 1: General & Pricing** | Display price publicly | Checkbox (Default: Checked) | Checked for catalog showcase |
| **Tab 1: General & Pricing** | Enquiry-Only product | Checkbox (Default: Unchecked) | Check if price upon request |
| **Tab 1: General & Pricing** | Materials Specification * | Textarea | Product Info: Material Specification |
| **Tab 1: General & Pricing** | Unit | Dropdown (`Centimeters (cm)` / `Inches`) | `Centimeters (cm)` |
| **Tab 1: General & Pricing** | Width / Depth / Height / Seat H | 4 Number inputs | Product Info: Dimensions (cm) |
| **Tab 1: General & Pricing** | Preferred Primary Viewer Mode | Dropdown (`gallery`, `glb_3d`, `video`, etc.)| Media Requirements: Preferred Viewer |
| **Tab 2: Photography** | Upload Photos | Multi-file file picker | Media Requirements: Gallery Assets |
| **Tab 2: Photography** | Set Primary | Card action button | Media Requirements: Cover Image |
| **Tab 3: Showcase Video** | Upload Showcase Video | File picker (`.mp4`, `.webm` < 100MB) | Media Requirements: Video Asset |
| **Tab 3: Showcase Video** | Upload Video Poster | File picker (`.webp`, `.jpg`) | Video Poster Thumbnail |
| **Tab 4: 3D GLB Viewer** | Upload .GLB Model | File picker (`.glb` < 50MB) | Media Requirements: 3D Model Asset |
| **Tab 5: 360° Sequence** | Upload Sequence Frames | Multi-file file picker (ordered frames) | Media Requirements: 360 Turntable |

---

### 1.4 Media Asset Specifications & Formatting Standards

To preserve the aesthetic standards of the showroom, prepare your visual assets according to these parameters before uploading:

* **Primary Product Photography (Cover & Gallery):**
  * **Aspect Ratio:** `4:3` (Recommended for architectural furniture) or `1:1` (Square for objects/lighting).
  * **Resolution:** Minimum `2400 × 1800 px` (Standard high-DPI retina display).
  * **Format:** WebP (85–90% quality) or lossless JPEG.
  * **Background / Grading:** Neutral studio backdrop (`#F8F6F1` warm alabaster or soft natural architectural environment with diffused directional shadows).
* **Cinematic Showcase Video:**
  * **Resolution:** 1080p (`1920 × 1080 px`) or 4K (`3840 × 2160 px`).
  * **Codec:** H.264 / AAC inside `.mp4` container or VP9 inside `.webm`.
  * **Duration:** 8 to 20 seconds seamless loop (panning joinery details, natural light transitions).
  * **File Size:** Under 35MB for optimal CDN streaming.
* **Interactive 3D Architectural Models:**
  * **Format:** Strictly binary `.glb` (self-contained embedded textures and buffers).
  * **Geometry Budget:** 30,000 to 90,000 polygons (quad-dominant or clean triangulated mesh).
  * **Textures:** PBR Workflow (BaseColor, Metallic-Roughness, Normal map in 2048×2048 px WebP/PNG).
  * **Pivot & Origin:** Centered on base plane `(0, 0, 0)` with realistic metric scale (`1 unit = 1 meter`).

---

# 2. Category Master Sheets

Each of the eight categories has been curated to anchor the VILLEXA design identity.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              VILLEXA CATEGORY TAXONOMY                                 │
├───────┬──────────────────┬──────────────────────┬─────────────┬─────────────┬──────────┤
│ Order │ Category Name    │ Suggested URL Slug   │ Code Prefix │ Subtitle    │ Products │
├───────┼──────────────────┼──────────────────────┼─────────────┼─────────────┼──────────┤
│   0   │ Living Room      │ living-room          │ VLX-LR      │ Monoliths   │    4     │
│   1   │ Bedroom          │ bedroom              │ VLX-BD      │ Sanctuaries │    4     │
│   2   │ Dining           │ dining               │ VLX-DN      │ Convivial   │    4     │
│   3   │ Workspace        │ workspace            │ VLX-WS      │ Executive   │    4     │
│   4   │ Lighting         │ lighting             │ VLX-LT      │ Luminaires  │    4     │
│   5   │ Entryway         │ entryway             │ VLX-EW      │ Thresholds  │    4     │
│   6   │ Objects & Decor  │ objects-decor        │ VLX-DC      │ Artifacts   │    4     │
│   7   │ Outdoor          │ outdoor              │ VLX-OD      │ Open-Air    │    4     │
└───────┴──────────────────┴──────────────────────┴─────────────┴─────────────┴──────────┘
```

---

### Category 1: Living Room
* **Category Name:** Living Room
* **Suggested URL Slug:** `living-room`
* **Short Display Subtitle:** Monolithic Comfort & Sculptural Silhouettes
* **Category Description:** Architectural seating, low-profile travertine cocktail tables, and sculptural credenzas crafted from French walnut, patinated bronze, and virgin Italian wool bouclé. Designed as monumental centerpieces for high-ceiling contemporary residences.
* **Assigned Products:**
  1. Aurelia Monolith Curved Sofa (`VLX-LR-001`)
  2. Tivoli Travertine Cantilever Coffee Table (`VLX-LR-002`)
  3. Brera Sculpted Velvet Barrel Lounge Chair (`VLX-LR-003`)
  4. Navona Smoked Glass & Cast Bronze Console (`VLX-LR-004`)
* **Suggested Category Cover Image Asset:** `cat-cover-living-room.webp` (Wide architectural salon view featuring travertine floors, natural linen drapery, and low-slung seating).
* **Recommended Display Order:** `0`

---

### Category 2: Bedroom
* **Category Name:** Bedroom
* **Suggested URL Slug:** `bedroom`
* **Short Display Subtitle:** Restorative Architectural Sanctuaries
* **Category Description:** Low-profile platform beds with integrated floating nightstands, acoustic upholstered bouclé headboards, and solid timber armoires engineered for tranquility and tactile warmth.
* **Assigned Products:**
  5. Elysian Floating Platform Bed with Acoustic Headboard (`VLX-BD-005`)
  6. Somme Fluted Walnut Nightstand Pair (`VLX-BD-006`)
  7. Velluto Bouclé Low Chaise Lounge (`VLX-BD-007`)
  8. Palladio Architectural Armoire & Dresser (`VLX-BD-008`)
* **Suggested Category Cover Image Asset:** `cat-cover-bedroom.webp` (Quiet morning light across minimalist bouclé bedding and fluted timber wall paneling).
* **Recommended Display Order:** `1`

---

### Category 3: Dining
* **Category Name:** Dining
* **Suggested URL Slug:** `dining`
* **Short Display Subtitle:** Monumental Tables & Convivial Splendor
* **Category Description:** Statement dining monoliths sculpted from vein-matched Calacatta Viola and Nero Marquina marble, paired with ergonomic solid-oak seating and bronze-accented bar credenzas.
* **Assigned Products:**
  9. Calacatta Viola Monolithic Oval Dining Table (`VLX-DN-009`)
  10. Sessile Sculpted Oak Dining Chair (`VLX-DN-010`)
  11. Quadrant Bronze & Travertine Credenza (`VLX-DN-011`)
  12. Vesper Bar Cabinet with Patinated Brass Lining (`VLX-DN-012`)
* **Suggested Category Cover Image Asset:** `cat-cover-dining.webp` (An expansive dining hall centered on a stone oval table with soft directional lighting).
* **Recommended Display Order:** `2`

---

### Category 4: Workspace
* **Category Name:** Workspace
* **Suggested URL Slug:** `workspace`
* **Short Display Subtitle:** Disciplined Form & Executive Precision
* **Category Description:** Cantilevered executive desks, hand-stitched Tuscan saddle leather seating, and modular timber libraries designed for executive reflection and architectural balance.
* **Assigned Products:**
  13. Cantilever Executive Desk in Smoked Oak & Leather (`VLX-WS-013`)
  14. Ergona Haute Saddle Leather Director Chair (`VLX-WS-014`)
  15. Modular Architectural Bookcase with Integrated Uplighting (`VLX-WS-015`)
  16. Minimalist File Credenza in Fluted Bronze (`VLX-WS-016`)
* **Suggested Category Cover Image Asset:** `cat-cover-workspace.webp` (A serene study overlooking private gardens with dark timber millwork and minimalist desk).
* **Recommended Display Order:** `3`

---

### Category 5: Lighting
* **Category Name:** Lighting
* **Suggested URL Slug:** `lighting`
* **Short Display Subtitle:** Sculptural Luminaires & Atmospheric Radiance
* **Category Description:** Translucent Spanish alabaster chandeliers, hand-blown Murano smoked glass table vessels, and hand-rubbed unlacquered brass floor totems casting warm, atmospheric light.
* **Assigned Products:**
  17. Solstice Alabaster & Burnished Brass Chandelier (`VLX-LT-017`)
  18. Monolith Travertine Floor Lamp with Raw Linen Shade (`VLX-LT-018`)
  19. Eclipse Cast Bronze Articulated Wall Sconce (`VLX-LT-019`)
  20. Aura Smoked Mouth-Blown Glass Table Luminaire (`VLX-LT-020`)
* **Suggested Category Cover Image Asset:** `cat-cover-lighting.webp` (Dramatic chiaroscuro composition highlighting warm light glowing through honed alabaster).
* **Recommended Display Order:** `4`

---

### Category 6: Entryway
* **Category Name:** Entryway
* **Suggested URL Slug:** `entryway`
* **Short Display Subtitle:** Grand Thresholds & First Impressions
* **Category Description:** Architectural benches sculpted from solid basalt, monolithic full-length cast bronze mirrors, and fluted timber consoles crafted to define the transition between exterior and interior.
* **Assigned Products:**
  21. Torus Sculpted Stone Entry Bench (`VLX-EW-021`)
  22. Horizon Monolithic Full-Length Bronze Mirror (`VLX-EW-022`)
  23. Arc Fluted Oak Entry Console Table (`VLX-EW-023`)
  24. Columnar Marble Valet Stand & Coat Totem (`VLX-EW-024`)
* **Suggested Category Cover Image Asset:** `cat-cover-entryway.webp` (A double-height entry gallery featuring a stone bench and floor-standing patinated bronze mirror).
* **Recommended Display Order:** `5`

---

### Category 7: Objects & Decor
* **Category Name:** Objects & Decor
* **Suggested URL Slug:** `objects-decor`
* **Short Display Subtitle:** Hand-Honed Artifacts & Tactile Accents
* **Category Description:** Monolithic stone vessels hand-carved from Roman travertine, brutalist cast bronze candelabra, and heavy woven virgin wool throws designed as collectible sculptural centerpieces.
* **Assigned Products:**
  25. Pietra Hand-Carved Travertine Vessel (`VLX-DC-025`)
  26. Brutalist Cast Bronze Sculptural Candelabra (`VLX-DC-026`)
  27. Ombra Nero Marquina Marble Catchall Tray (`VLX-DC-027`)
  28. Dune Textural Heavy Wool Throw & Cushion Suite (`VLX-DC-028`)
* **Suggested Category Cover Image Asset:** `cat-cover-objects-decor.webp` (Still-life vignette of carved stone vessels and patinated bronze vessels on a rough limestone plinth).
* **Recommended Display Order:** `6`

---

### Category 8: Outdoor
* **Category Name:** Outdoor
* **Suggested URL Slug:** `outdoor`
* **Short Display Subtitle:** Weather-Resilient Architectural Living
* **Category Description:** Grade-A reclaimed teak deep lounge seating, hand-carved volcanic basalt dining tables, and marine-grade woven rope sunloungers built to age gracefully under sun and sea breeze.
* **Assigned Products:**
  29. Ravello Teak & Perennials Rope Deep Lounge Sofa (`VLX-OD-029`)
  30. Taormina Lava Stone & Powdercoated Aluminum Dining Table (`VLX-OD-030`)
  31. Positano Sculpted Teak Sunlounger with Marine Cushion (`VLX-OD-031`)
  32. Cava Ceramic & Teak Outdoor Occasional Table Trio (`VLX-OD-032`)
* **Suggested Category Cover Image Asset:** `cat-cover-outdoor.webp` (Cliffside terrace overlooking the Mediterranean with teak lounge furniture in late afternoon golden light).
* **Recommended Display Order:** `7`

---

# 3. Master Product Inventory Table

The table below summarizes the 32 creations in spreadsheet format. *(A ready-to-import CSV version is provided alongside this document as `VILLEXA_PRODUCT_INVENTORY_TABLE.csv`)*.

| # | SKU | Product Name | Category | Suggested Price (INR) | Primary Materials | Dimensions W×D×H (cm) | Viewer Mode | Availability Status |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **01** | `VLX-LR-001` | Aurelia Monolith Curved Sofa | Living Room | ₹9,50,000 | Italian Bouclé, Solid French Walnut | 280 × 115 × 74 (SH 42) | `glb_3d` | Made to Order (8–10 wks) |
| **02** | `VLX-LR-002` | Tivoli Travertine Cantilever Coffee Table | Living Room | ₹3,85,000 | Roman Travertine, Bronze Glass | 160 × 90 × 36 | `sequence_360` | Atelier Commission |
| **03** | `VLX-LR-003` | Brera Sculpted Velvet Barrel Lounge Chair | Living Room | ₹2,75,000 | Emerald Cotton Velvet, Patinated Brass | 88 × 84 × 76 (SH 43) | `gallery` | In Stock (2–3 wks) |
| **04** | `VLX-LR-004` | Navona Smoked Glass & Cast Bronze Console | Living Room | ₹4,20,000 | Cast Bronze Plinth, Smoked Glass | 190 × 42 × 82 | `gallery` | Made to Order (6–8 wks) |
| **05** | `VLX-BD-005` | Elysian Floating Platform Bed | Bedroom | ₹8,90,000 | Virgin Wool Bouclé, American Walnut | 225 × 215 × 110 (SH 32)| `glb_3d` | Made to Order (8–10 wks) |
| **06** | `VLX-BD-006` | Somme Fluted Walnut Nightstand Pair | Bedroom | ₹2,90,000 | French Walnut, Calacatta Marble Top | 62 × 46 × 52 | `gallery` | Made to Order (4–6 wks) |
| **07** | `VLX-BD-007` | Velluto Bouclé Low Chaise Lounge | Bedroom | ₹3,40,000 | Italian Wool Bouclé, Bronze Glides | 175 × 78 × 68 (SH 38) | `sequence_360` | Made to Order (6–8 wks) |
| **08** | `VLX-BD-008` | Palladio Architectural Armoire & Dresser | Bedroom | ₹11,50,000| Smoked Oak, Saddle Leather Interior | 140 × 60 × 205 | `video` | Atelier Commission |
| **09** | `VLX-DN-009` | Calacatta Viola Oval Dining Table | Dining | ₹14,80,000| Calacatta Viola Marble, Steel Subframe| 260 × 120 × 75 | `glb_3d` | Atelier Commission |
| **10** | `VLX-DN-010` | Sessile Sculpted Oak Dining Chair | Dining | ₹1,45,000 | Solid French Oak, Saddle Leather Seat | 54 × 56 × 81 (SH 46) | `sequence_360` | Made to Order (4–6 wks) |
| **11** | `VLX-DN-011` | Quadrant Bronze & Travertine Credenza | Dining | ₹7,60,000 | Navona Travertine, Patinated Bronze | 220 × 52 × 78 | `gallery` | Made to Order (8–10 wks) |
| **12** | `VLX-DN-012` | Vesper Bar Cabinet with Patinated Brass | Dining | ₹6,80,000 | Ebonized Oak, Antiqued Mirror, Brass | 110 × 50 × 165 | `video` | Atelier Commission |
| **13** | `VLX-WS-013` | Cantilever Executive Desk | Workspace | ₹8,20,000 | Smoked European Oak, Tuscan Leather | 220 × 95 × 75 | `glb_3d` | Atelier Commission |
| **14** | `VLX-WS-014` | Ergona Haute Saddle Leather Director Chair| Workspace | ₹3,10,000 | Hand-Stitched Leather, Bronze Frame | 66 × 68 × 98 (SH 47) | `sequence_360` | Made to Order (6–8 wks) |
| **15** | `VLX-WS-015` | Modular Architectural Bookcase | Workspace | ₹12,40,000| Fluted Walnut, Bronze Uprights, LED | 280 × 40 × 240 | `gallery` | Bespoke Project |
| **16** | `VLX-WS-016` | Minimalist File Credenza in Fluted Bronze | Workspace | ₹4,90,000 | Solid Oak, Acid-Etched Bronze Panels | 160 × 48 × 72 | `gallery` | Made to Order (6–8 wks) |
| **17** | `VLX-LT-017` | Solstice Alabaster & Brass Chandelier | Lighting | ₹5,80,000 | Spanish Alabaster, Burnished Brass | 135 × 135 × 85 | `glb_3d` | Atelier Commission |
| **18** | `VLX-LT-018` | Monolith Travertine Floor Lamp | Lighting | ₹2,20,000 | Honed Roman Travertine, Raw Linen | 40 × 40 × 172 | `gallery` | Made to Order (4–6 wks) |
| **19** | `VLX-LT-019` | Eclipse Cast Bronze Articulated Wall Sconce| Lighting | ₹1,35,000 | Solid Lost-Wax Cast Bronze | 24 × 18 × 48 | `sequence_360` | In Stock (2–3 wks) |
| **20** | `VLX-LT-020` | Aura Smoked Mouth-Blown Glass Luminaire | Lighting | ₹1,65,000 | Murano Smoked Glass, Spun Brass Base | 32 × 32 × 44 | `gallery` | In Stock (2–3 wks) |
| **21** | `VLX-EW-021` | Torus Sculpted Stone Entry Bench | Entryway | ₹4,40,000 | Monolithic Volcanic Basalt / Sandstone | 180 × 50 × 44 (SH 44) | `glb_3d` | Atelier Commission |
| **22** | `VLX-EW-022` | Horizon Full-Length Bronze Mirror | Entryway | ₹3,60,000 | Cast Bronze Frame, Ultra-Clear Glass | 90 × 8 × 220 | `gallery` | Made to Order (4–6 wks) |
| **23** | `VLX-EW-023` | Arc Fluted Oak Entry Console Table | Entryway | ₹3,15,000 | Solid White Oak, Honed Marble Inset | 170 × 38 × 84 | `gallery` | Made to Order (6–8 wks) |
| **24** | `VLX-EW-024` | Columnar Marble Valet Stand & Coat Totem | Entryway | ₹1,95,000 | Nero Marquina Marble, Brushed Brass | 38 × 38 × 182 | `sequence_360` | In Stock (2–3 wks) |
| **25** | `VLX-DC-025` | Pietra Hand-Carved Travertine Vessel | Objects & Decor | ₹95,000 | Natural Cavity Unfilled Travertine | 34 × 34 × 42 | `sequence_360` | In Stock (1–2 wks) |
| **26** | `VLX-DC-026` | Brutalist Cast Bronze Candelabra | Objects & Decor | ₹1,20,000 | Sand-Cast Architectural Bronze | 28 × 20 × 45 | `gallery` | In Stock (1–2 wks) |
| **27** | `VLX-DC-027` | Ombra Nero Marquina Catchall Tray | Objects & Decor | ₹65,000 | Hand-Chiseled Nero Marquina Marble | 42 × 26 × 5 | `gallery` | In Stock (1–2 wks) |
| **28** | `VLX-DC-028` | Dune Textural Heavy Wool Throw & Cushions | Objects & Decor | ₹85,000 | Organic Alpine Wool, Goose Feather | 200 × 160 × 2 | `gallery` | In Stock (1–2 wks) |
| **29** | `VLX-OD-029` | Ravello Teak & Rope Deep Lounge Sofa | Outdoor | ₹8,40,000 | Grade-A Burmese Teak, Perennials Fabric| 250 × 105 × 72 (SH 38) | `glb_3d` | Made to Order (8–10 wks) |
| **30** | `VLX-OD-030` | Taormina Lava Stone Outdoor Dining Table | Outdoor | ₹9,90,000 | Glazed Etna Basalt, Marine Aluminum | 240 × 110 × 75 | `video` | Atelier Commission |
| **31** | `VLX-OD-031` | Positano Sculpted Teak Sunlounger | Outdoor | ₹3,20,000 | Solid Teak, QuickDry Core, Marine Brass| 205 × 76 × 32 (Max 88) | `sequence_360` | Made to Order (4–6 wks) |
| **32** | `VLX-OD-032` | Cava Ceramic & Teak Occasional Trio | Outdoor | ₹2,60,000 | Frost-Proof Ceramic, Solid Teak Base | 75 × 75 × 42 (Largest) | `gallery` | Made to Order (4–6 wks) |

---

# 4. Detailed Product Specification Sheets

Every product has a dedicated sheet containing all copy, taxonomy, technical specifications, and a manual upload checklist.

---

## Living Room Creations

### Product 01: Aurelia Monolith Curved Sofa
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Aurelia Monolith Curved Sofa
* **SKU:** `VLX-LR-001`
* **URL Slug:** `aurelia-monolith-curved-sofa`
* **Category:** Living Room
* **Short Description:** An organic serpentine statement sofa draped in textured Italian wool bouclé with a sculpted French walnut plinth base.
* **Detailed Premium Description:** Conceived as a grand architectural gesture for salon living spaces, the Aurelia Monolith Curved Sofa breaks away from rigid geometry. Its gently undulating serpentine silhouette fosters intimate conversation while anchoring open-plan living zones. Handcrafted in our Brianza atelier over a precision-engineered kiln-dried European hardwood frame, the seating core incorporates multi-density memory foams and pocketed micro-springs for supportive, low-slung comfort. Upholstered in tactile virgin wool bouclé sourced from historic Biella mills, the piece rests on an integrated French walnut plinth base with invisible shadowline detailing.

#### Product Information
* **Suggested Price:** ₹9,50,000 INR *(Provisional concept pricing; subject to fabric grade)*
* **Primary Material:** Virgin Wool Bouclé (92% Wool, 8% Polyamide) & Kiln-Dried European Beech Subframe
* **Finish:** Matte natural hand-rubbed wax on walnut plinth; unstained open-grain finish
* **Colour:** Warm Alabaster White (Bouclé) / Warm Cognac Walnut (Plinth)
* **Architectural Dimensions:**
  * Width: 280 cm
  * Depth: 115 cm
  * Height: 74 cm
  * Seat Height: 42 cm
* **Estimated Weight:** 115 kg *[Provisional workshop estimate — to be verified on prototype]*
* **Key Features:**
  * Double-curved serpentine silhouette designed for 360-degree floating room placement
  * Concealed acoustic dampening layer within backrest core
  * Hand-matched continuous French walnut perimeter plinth with 15mm floor shadow gap
  * Certified high-resilience fire-retardant internal multi-density foam
* **Care Instructions:** Professional dry clean only. Regular gentle vacuuming with upholstery attachment along textile grain. Protect plinth from prolonged direct sunlight and moisture.
* **Availability Status:** Made to Order (Lead time: 8 to 10 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `glb_3d` (Interactive 3D GLB Model Viewer)
* **Demonstration Video:** **Highly Recommended** — A slow 15-second tracking camera sweep illustrating the continuous serpentine curvature and bouclé textile pile.
* **3D GLB/GLTF Model:** **Required** — Essential for visualizing the sweeping 3D form from arbitrary camera angles.
* **360° Sequence:** Optional alternative if 3D model is unavailable.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-lr-001-cover.webp` (Aspect ratio: `4:3`, min `2400×1800 px`)
  * Gallery View 1 (Direct Front Elevation): `vlx-lr-001-gallery-front.webp`
  * Gallery View 2 (3/4 Isometric Curvature): `vlx-lr-001-gallery-angle.webp`
  * Gallery View 3 (Macro Texture & Plinth Shadowline): `vlx-lr-001-gallery-detail.webp`
  * Gallery View 4 (Architectural Living Space Context): `vlx-lr-001-gallery-context.webp`
  * Showcase Video: `vlx-lr-001-showcase.mp4` & Poster: `vlx-lr-001-video-poster.webp`
  * 3D Binary Model: `vlx-lr-001-model.glb`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and designated as "Primary Card"
  * [ ] Gallery View 1 uploaded
  * [ ] Gallery View 2 uploaded
  * [ ] Gallery View 3 uploaded
  * [ ] Gallery View 4 uploaded
  * [ ] Video file uploaded with matching poster thumbnail
  * [ ] 3D GLB file uploaded and tested in interactive viewer
  * [ ] Draft saved and verified via "Preview on Site"
  * [ ] Published to live showroom

---

### Product 02: Tivoli Travertine Cantilever Coffee Table
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Tivoli Travertine Cantilever Coffee Table
* **SKU:** `VLX-LR-002`
* **URL Slug:** `tivoli-travertine-cantilever-coffee-table`
* **Category:** Living Room
* **Short Description:** A geometric dialogue between raw Roman travertine stone blocks and a floating tempered bronze glass surface.
* **Detailed Premium Description:** Celebrating tectonic honesty and geological permanence, the Tivoli Low Table pairs raw, porous Roman travertine stone quarried from historic Tivoli deposits with precision-cut industrial bronze glass. Two monolithic stone plinths are positioned in asymmetrical tension, supporting a thick cantilevered tempered bronze glass top that allows light to penetrate into the stone’s unfilled fissures and organic sedimentary strata. Each block is carved with matte chamfered edges, showcasing natural cavities and subtle cream-and-sand tonal variations.

#### Product Information
* **Suggested Price:** ₹3,85,000 INR *(Provisional concept pricing)*
* **Primary Material:** Natural Roman Travertine (Unfilled Cavities) & 15mm Tempered Bronze Glass
* **Finish:** Honed ultra-matte stone finish; pencil-polished glass edges
* **Colour:** Earthy Cream / Warm Sand Travertine with Smoked Bronze Glass
* **Architectural Dimensions:**
  * Width: 160 cm
  * Depth: 90 cm
  * Height: 36 cm
  * Seat Height: 0 cm (Non-seating)
* **Estimated Weight:** 138 kg *[Provisional workshop estimate — to be verified on prototype]*
* **Key Features:**
  * Asymmetrical dual-monolith base cut from single travertine slab for tonal harmony
  * Heavy 15mm tempered cantilevered bronze glass resting on invisible silicone dampening pads
  * Hand-beveled safety perimeter edges on stone and glass elements
  * Unfilled open-pored travertine texture preserving ancient geological formations
* **Care Instructions:** Clean stone surfaces with pH-neutral stone soap and microfibre cloth. Wipe spills immediately. Avoid acidic liquids (lemon, vinegar, wine). Clean glass with ammonia-free glass cleaner.
* **Availability Status:** Atelier Commission (Lead time: 6 to 8 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `sequence_360` (360-Degree Turntable)
* **Demonstration Video:** Optional — Sunlight refraction through bronze glass onto stone.
* **3D GLB/GLTF Model:** Recommended — Demonstrates glass transparency and cantilever physics.
* **360° Sequence:** **Highly Recommended** — Allows client to rotate the asymmetrical stone plinths.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-lr-002-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Top Down Cantilever Elevation): `vlx-lr-002-gallery-overhead.webp`
  * Gallery View 2 (Low Angle Plinth Texture): `vlx-lr-002-gallery-plinth.webp`
  * Gallery View 3 (Macro Stone Porosity & Glass Edge): `vlx-lr-002-gallery-detail.webp`
  * Gallery View 4 (Room Vignette with Low Seating): `vlx-lr-002-gallery-room.webp`
  * 360 Turntable Frames: `vlx-lr-002-frame-01.webp` through `vlx-lr-002-frame-24.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photographs uploaded and ordered
  * [ ] 360 sequence frames (24 frames) uploaded and scrubber tested
  * [ ] Draft saved and verified via "Preview on Site"
  * [ ] Published to showroom

---

### Product 03: Brera Sculpted Velvet Barrel Lounge Chair
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Brera Sculpted Velvet Barrel Lounge Chair
* **SKU:** `VLX-LR-003`
* **URL Slug:** `brera-sculpted-velvet-barrel-lounge-chair`
* **Category:** Living Room
* **Short Description:** An enveloping barrel armchair hand-tailored in deep emerald cotton velvet with patinated brass inset base.
* **Detailed Premium Description:** Drawing inspiration from 1950s Milanese modernism, the Brera Lounge Chair envelopes the sitter in an unbroken cocoon of architectural comfort. The continuous curved backrest sweeps seamlessly into integrated armrests, hand-tailored in lustrous Italian cotton velvet with double-stitched perimeter piping. At its foundation, a recessed circular base in antiqued brushed brass creates a floating visual stance while concealing a smooth, heavy-duty 360-degree silent return swivel mechanism.

#### Product Information
* **Suggested Price:** ₹2,75,000 INR *(Provisional concept pricing)*
* **Primary Material:** 100% Italian Cotton Velvet, High-Resilience Foam, Cast Brass
* **Finish:** Hand-rubbed antiqued brass base with protective micro-crystalline wax
* **Colour:** Deep Emerald Forest Green (Velvet) / Burnished Warm Brass (Base)
* **Architectural Dimensions:**
  * Width: 88 cm
  * Depth: 84 cm
  * Height: 76 cm
  * Seat Height: 43 cm
* **Estimated Weight:** 38 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Hidden 360-degree internal silent swivel bearing with auto-memory return
  * Hand-tufted internal lumbar curve for ergonomic lower back support
  * High-density molded foam shell reinforced with internal tubular steel skeleton
  * Liquid-repellent nanotechnology treatment pre-applied to cotton velvet fibers
* **Care Instructions:** Brush velvet pile weekly using soft horsehair brush in pile direction. Vacuum lightly. Blot spills immediately with clean dry cotton cloth. Do not rub.
* **Availability Status:** In Stock / Limited Batch (Lead time: 2 to 3 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery` (Standard High-Res Gallery)
* **Demonstration Video:** Recommended — Showing the silent swivel return mechanism.
* **3D GLB/GLTF Model:** Optional.
* **360° Sequence:** Recommended — Showcasing the wrap-around barrel curves.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-lr-003-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Front Profile): `vlx-lr-003-gallery-front.webp`
  * Gallery View 2 (3/4 Swivel Angle): `vlx-lr-003-gallery-angle.webp`
  * Gallery View 3 (Piping Detail & Velvet Nap Macro): `vlx-lr-003-gallery-macro.webp`
  * Gallery View 4 (Rear View Highlighting Barrel Form): `vlx-lr-003-gallery-rear.webp`
* **Manual Media Upload Checklist:**
  * [ ] Primary cover photo uploaded
  * [ ] 4 high-resolution gallery angles uploaded
  * [ ] Draft saved and checked in live preview
  * [ ] Published to showroom

---

### Product 04: Navona Smoked Glass & Cast Bronze Console
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Navona Smoked Glass & Cast Bronze Console
* **SKU:** `VLX-LR-004`
* **URL Slug:** `navona-smoked-glass-cast-bronze-console`
* **Category:** Living Room
* **Short Description:** A slender architectural console table balanced upon hand-cast sand-textured bronze pylons and smoked glass.
* **Detailed Premium Description:** Engineered to provide a graceful silhouette against gallery walls or behind freestanding sofas, the Navona Console balances material mass and transparency. Two monumental pylons, hand-cast in recycled bronze using ancient sand-casting techniques, display raw molten textures and subtle charcoal-patinated tones. They cradle a 190cm floating surface of 19mm heavy smoked float glass with pencil-polished radius corners, creating a light-refracting horizon for curated art objects.

#### Product Information
* **Suggested Price:** ₹4,20,000 INR *(Provisional concept pricing)*
* **Primary Material:** Sand-Cast Architectural Bronze & 19mm Tempered Smoked Glass
* **Finish:** Acid-etched charcoal bronze patina with hand-waxed buffing
* **Colour:** Smoked Charcoal Bronze / Translucent Umber Smoked Glass
* **Architectural Dimensions:**
  * Width: 190 cm
  * Depth: 42 cm
  * Height: 82 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 82 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Solid sand-cast bronze legs displaying unique organic casting fissures and textures
  * Extra-thick 19mm tempered smoked glass top rated for up to 60 kg distributed display load
  * Concealed micro-leveling brass feet for uneven heritage parquet or stone flooring
  * Modular knock-down construction with precision stainless internal threaded anchors
* **Care Instructions:** Dust bronze with soft dry microfibre cloth. Never use chemical brass polishers on patinated bronze. Clean smoked glass with isopropyl-based glass cleaner.
* **Availability Status:** Made to Order (Lead time: 6 to 8 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional.
* **3D GLB/GLTF Model:** Recommended — Excellent geometry for WebGL specular reflection.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-lr-004-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Elevation Silhouette): `vlx-lr-004-gallery-elevation.webp`
  * Gallery View 2 (Cast Bronze Sand-Texture Macro): `vlx-lr-004-gallery-bronze.webp`
  * Gallery View 3 (Top Surface Perspective with Decor): `vlx-lr-004-gallery-styling.webp`
  * Gallery View 4 (Corner Joinery & Glass Edge Chamfer): `vlx-lr-004-gallery-joinery.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and designated as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

## Bedroom Creations

### Product 05: Elysian Floating Platform Bed
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Elysian Floating Platform Bed with Acoustic Headboard
* **SKU:** `VLX-BD-005`
* **URL Slug:** `elysian-floating-platform-bed`
* **Category:** Bedroom
* **Short Description:** A low-profile architectural platform bed with cantilevered floating base and sound-dampening bouclé headboard.
* **Detailed Premium Description:** Designed as a sanctuary centerpoint, the Elysian Platform Bed embodies architectural minimalism. The low-profile platform appears to float weightlessly above the bedroom floor, enabled by a heavy-gauge recessed steel subframe. The extra-wide headboard extends beyond the mattress perimeter, incorporating sound-absorbing acoustic foam cores enveloped in soft Italian virgin wool bouclé. Two solid American walnut floating night tables are seamlessly integrated into the headboard wings, featuring concealed dimmable LED warm downlighting and hidden touch-latch charging bays.

#### Product Information
* **Suggested Price:** ₹8,90,000 INR *(Provisional concept pricing for King Size)*
* **Primary Material:** Solid American Walnut, Powdercoated Steel Chassis, Acoustic Bouclé
* **Finish:** Matte organic satin lacquer on walnut; raw bouclé textile
* **Colour:** Natural Walnut / Oatmeal Bouclé / Matte Black Underchassis
* **Architectural Dimensions:**
  * Width: 225 cm (Platform base) / 310 cm (Including integrated headboard wings)
  * Depth: 215 cm
  * Height: 110 cm (Headboard top)
  * Seat Height: 32 cm (Mattress platform top)
* **Estimated Weight:** 152 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Structural steel cantilever core engineered for zero creaking and lifetime rigidity
  * Multi-layer acoustic felt and memory foam headboard core reducing room reverberation
  * Integrated dual walnut floating side tables with concealed wireless inductive charging
  * Recessed 2700K warm ambient under-bed nightlight strip with touch proximity sensor
* **Care Instructions:** Vacuum headboard with gentle brush attachment. Condition walnut surfaces annually with natural beeswax. Avoid abrasive detergents.
* **Availability Status:** Made to Order (Lead time: 8 to 10 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `glb_3d` (Interactive 3D GLB Model Viewer)
* **Demonstration Video:** Recommended — Showing integrated touch lighting and floating nightstand drawers.
* **3D GLB/GLTF Model:** **Required** — Allows spatial inspection of floating cantilever physics.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-bd-005-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Headboard Perspective): `vlx-bd-005-gallery-headboard.webp`
  * Gallery View 2 (Floating Under-Chassis Elevation): `vlx-bd-005-gallery-floating.webp`
  * Gallery View 3 (Integrated Nightstand & Walnut Joinery): `vlx-bd-005-gallery-table.webp`
  * Gallery View 4 (Night Mood Lighting Demonstration): `vlx-bd-005-gallery-night.webp`
  * 3D Binary Model: `vlx-bd-005-model.glb`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photographs uploaded and sequenced
  * [ ] 3D GLB model uploaded and verified in canvas
  * [ ] Draft saved and inspected on live preview
  * [ ] Published to showroom

---

### Product 06: Somme Fluted Walnut Nightstand Pair
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Somme Fluted Walnut Nightstand Pair
* **SKU:** `VLX-BD-006`
* **URL Slug:** `somme-fluted-walnut-nightstands`
* **Category:** Bedroom
* **Short Description:** A matched pair of freestanding bedside pedestals featuring precision three-dimensional fluted walnut and honed marble tops.
* **Detailed Premium Description:** Sold as a mirrored left-and-right pair, the Somme Nightstands bring tactile refinement to the bedside. Each pedestal is enveloped in precision CNC-milled vertical fluting cut from solid French walnut, creating rich shadow play across the curved tambour profile. The top surface features an inset tray of honed Calacatta Viola marble with a raised protective border. Inside, soft-close Austrian Blumotion drawer slides glide effortlessly, revealing an interior lined in supple cognac Italian leather.

#### Product Information
* **Suggested Price:** ₹2,90,000 INR *(Provisional concept pricing for pair)*
* **Primary Material:** Solid French Walnut, Honed Calacatta Viola Marble, Italian Leather Lining
* **Finish:** Hand-applied low-sheen polyurethane seal on walnut; honed anti-stain marble seal
* **Colour:** Warm French Walnut / Deep Plum & White Calacatta Marble
* **Architectural Dimensions:**
  * Width: 62 cm (each)
  * Depth: 46 cm
  * Height: 52 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 28 kg per unit (56 kg pair) *[Provisional workshop estimate]*
* **Key Features:**
  * Continuous vertical grain alignment across drawer face and curved fluted side panels
  * Inset honed marble top resistant to glass condensation and perfumes
  * Full-extension soft-close Blumotion concealed drawer hardware with 30 kg weight rating
  * Rear cable pass-through port with matching walnut magnetic cover
* **Care Instructions:** Clean marble with stone soap. Wipe timber with damp cloth and dry immediately. Treat leather interior annually with neutral leather balsam.
* **Availability Status:** Made to Order (Lead time: 4 to 6 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional — Drawer soft-close action.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Recommended — Showcasing the curved fluted tambour circumference.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-bd-006-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Pair Arranged in Symmetry): `vlx-bd-006-gallery-pair.webp`
  * Gallery View 2 (Open Drawer Showing Leather Lining): `vlx-bd-006-gallery-drawer.webp`
  * Gallery View 3 (Top Inset Calacatta Marble Tray Macro): `vlx-bd-006-gallery-marble.webp`
  * Gallery View 4 (Fluting Texture & Shadowplay Close-Up): `vlx-bd-006-gallery-fluting.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover photo uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 07: Velluto Bouclé Low Chaise Lounge
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Velluto Bouclé Low Chaise Lounge
* **SKU:** `VLX-BD-007`
* **URL Slug:** `velluto-boucle-low-chaise-lounge`
* **Category:** Bedroom
* **Short Description:** An ergonomic sculptured reading chaise upholstered in ivory virgin bouclé with patinated bronze glides.
* **Detailed Premium Description:** Tailored for reading alcoves and bedroom suites, the Velluto Chaise Lounge follows the natural contours of the reclining body. The continuous s-curve form eliminates pressure points, offering weightless lumbar and leg support. Upholstered in heavy-weight Italian virgin wool bouclé with reinforced internal stitching, the silhouette is anchored by low patinated bronze blade glides that reflect ambient bedroom light.

#### Product Information
* **Suggested Price:** ₹3,40,000 INR *(Provisional concept pricing)*
* **Primary Material:** Virgin Wool Bouclé, Molded Ergonomic Polyurethane, Cast Bronze
* **Finish:** Matte natural wool; hand-aged bronze glides
* **Colour:** Ivory Alabaster Bouclé / Dark Patinated Bronze
* **Architectural Dimensions:**
  * Width: 175 cm
  * Depth: 78 cm
  * Height: 68 cm
  * Seat Height: 38 cm
* **Estimated Weight:** 44 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Orthopedically contoured steel-reinforced internal core for lumbar decompression
  * Seamless upholstery with no visible front tufting or horizontal breaks
  * Heavy solid bronze blade glides fitted with floor-protection felt inserts
  * Includes matching cylindrical bouclé bolster pillow with bronze weighted retaining strap
* **Care Instructions:** Professional dry cleaning recommended. Spot treat with dry foam cleaner. Vacuum regularly with gentle textile nozzle.
* **Availability Status:** Made to Order (Lead time: 6 to 8 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `sequence_360` (360-Degree Turntable)
* **Demonstration Video:** Recommended — Showing recline comfort and ergonomic curves.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** **Highly Recommended** — Captures the full ergonomic profile from all angles.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-bd-007-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Side Recline Contour): `vlx-bd-007-gallery-side.webp`
  * Gallery View 2 (3/4 Front Angled View): `vlx-bd-007-gallery-angle.webp`
  * Gallery View 3 (Bolster Pillow & Bronze Strap Detail): `vlx-bd-007-gallery-bolster.webp`
  * Gallery View 4 (Bedroom Window Vignette Setting): `vlx-bd-007-gallery-room.webp`
  * 360 Turntable Frames: `vlx-bd-007-frame-01.webp` through `vlx-bd-007-frame-24.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and designated as primary
  * [ ] 4 gallery photographs uploaded
  * [ ] 360 turntable frames uploaded and verified
  * [ ] Draft saved and inspected
  * [ ] Published to showroom

---

### Product 08: Palladio Architectural Armoire & Dresser
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Palladio Architectural Armoire & Dresser
* **SKU:** `VLX-BD-008`
* **URL Slug:** `palladio-architectural-armoire-dresser`
* **Category:** Bedroom
* **Short Description:** A monumental tall wardrobe cabinet in smoked oak with bookmatched door panels and saddle leather interior linings.
* **Detailed Premium Description:** Standing as an architectural monument within the bedroom, the Palladio Armoire reinterprets classical Italian cabinetmaking. Four tall doors crafted from bookmatched European smoked oak open 180 degrees on custom knife hinges. The interior reveals a wardrobe sanctuary: shelves lined in warm saddle leather, solid cedar wood drawers that naturally deter moths, integrated 3000K warm LED illumination with motion sensors, and burnished bronze hanging rods.

#### Product Information
* **Suggested Price:** ₹11,50,000 INR *(Provisional concept pricing)*
* **Primary Material:** European Smoked Oak, Solid Lebanese Cedar, Tuscan Saddle Leather, Bronze
* **Finish:** Deep smoked fumed oak with protective organic oil finish; satin bronze fittings
* **Colour:** Espresso Smoked Oak / Caramel Leather / Brushed Bronze
* **Architectural Dimensions:**
  * Width: 140 cm
  * Depth: 60 cm
  * Height: 205 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 195 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Precision bookmatched door leaves cut from sequential veneers of a single oak tree
  * Aromatic solid cedar drawer interiors for natural wool and cashmere preservation
  * Dual-door magnetic proximity sensors triggering warm 3000K diffused interior vertical LED lighting
  * Internal pull-out valet trays with velvet jewelry dividers and leather watch cushions
* **Care Instructions:** Clean exterior with dry lint-free cloth. Recondition exterior oak with mineral oil once every two years. Keep interior cedar unsealed; sand lightly with 400-grit paper every 3 years to revive cedar aroma.
* **Availability Status:** Atelier Commission (Lead time: 10 to 12 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `video` (Showcase Video)
* **Demonstration Video:** **Required** — Dramatic opening of the tall doors revealing the interior LED lighting illumination and cedar drawers.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-bd-008-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Doors Closed Architectural Front View): `vlx-bd-008-gallery-closed.webp`
  * Gallery View 2 (Doors Open 180° Showing Illuminated Interior): `vlx-bd-008-gallery-open.webp`
  * Gallery View 3 (Cedar Drawer & Saddle Leather Pull Detail): `vlx-bd-008-gallery-drawer.webp`
  * Gallery View 4 (Knife Hinge & Smoked Oak Grain Macro): `vlx-bd-008-gallery-hinge.webp`
  * Video Showcase: `vlx-bd-008-showcase.mp4` & Poster: `vlx-bd-008-video-poster.webp`
* **Manual Media Upload Checklist:**
  * [ ] Primary cover card uploaded
  * [ ] 4 interior/exterior gallery photos uploaded
  * [ ] Video file and poster image uploaded
  * [ ] Draft saved and verified via "Preview on Site"
  * [ ] Published to showroom

---

## Dining Room Creations

### Product 09: Calacatta Viola Oval Dining Table
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Calacatta Viola Monolithic Oval Dining Table
* **SKU:** `VLX-DN-009`
* **URL Slug:** `calacatta-viola-oval-dining-table`
* **Category:** Dining
* **Short Description:** A monolithic 8-to-10 person dining table carved from rare bookmatched Calacatta Viola marble upon dual fluted stone pedestals.
* **Detailed Premium Description:** The pinnacle of culinary theater and material grandeur, this dining table is sculpted from hand-selected Italian Calacatta Viola marble from Apuan Alps quarries. Characterized by dramatic Cabernet Sauvignon veining meandering across a creamy white crystalline ground, the 260cm oval top features an organic beveled bullnose edge. It rests atop two heavy fluted marble columns, engineered with an internal steel spine to ensure absolute stability while maximizing knee clearance for 10 seated guests.

#### Product Information
* **Suggested Price:** ₹14,80,000 INR *(Provisional concept pricing)*
* **Primary Material:** Natural Calacatta Viola Marble, Heavy Structural Steel Chassis
* **Finish:** Hand-honed satin matte stone finish with oleophobic anti-stain impregnating barrier
* **Colour:** Deep Wine Cabernet Purple / Creamy Alabaster White
* **Architectural Dimensions:**
  * Width: 260 cm
  * Depth: 120 cm
  * Height: 75 cm
  * Seat Height: 0 cm (Under-table clearance: 72 cm)
* **Estimated Weight:** 285 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Sculpted from a single extraction block with continuous bookmatched vein alignment across top
  * Dual fluted column pedestals placed to maximize guest seating comfort with no corner leg obstruction
  * Professional stone sealer pre-applied to resist wine, citrus, and hot oil staining
  * Hidden stainless steel leveler pins adjustable up to 25mm for uneven stone floors
* **Care Instructions:** Clean with damp microfibre cloth and specialized marble cleaner. Use trivets under hot cookware. Wipe spills promptly. Reapply stone impregnator annually.
* **Availability Status:** Atelier Commission (Lead time: 10 to 12 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `glb_3d` (Interactive 3D GLB Model Viewer)
* **Demonstration Video:** Highly Recommended — Dynamic light reflections across the marble veining.
* **3D GLB/GLTF Model:** **Required** — Essential for client review of marble pedestal proportions and table overhang.
* **360° Sequence:** Optional alternative.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-dn-009-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Overhead Vein Pattern Perspective): `vlx-dn-009-gallery-overhead.webp`
  * Gallery View 2 (Low Profile Angle Showing Fluted Pedestals): `vlx-dn-009-gallery-pedestals.webp`
  * Gallery View 3 (Beveled Bullnose Edge & Stone Texture Macro): `vlx-dn-009-gallery-edge.webp`
  * Gallery View 4 (Full Dining Room Setting with 8 Chairs): `vlx-dn-009-gallery-setting.webp`
  * 3D Binary Model: `vlx-dn-009-model.glb`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] 3D GLB model uploaded and tested in viewer
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 10: Sessile Sculpted Oak Dining Chair
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Sessile Sculpted Oak Dining Chair
* **SKU:** `VLX-DN-010`
* **URL Slug:** `sessile-sculpted-oak-dining-chair`
* **Category:** Dining
* **Short Description:** A tactile solid French oak dining chair with steam-bent backrest and hand-stitched saddle leather seat pad.
* **Detailed Premium Description:** Striking a delicate balance between sculptural lightness and uncompromising strength, the Sessile Dining Chair honors traditional joinery. Carved from sustainably harvested French oak, the continuous crest rail is steam-bent by hand, cradling the user's upper back in comfort. The seat consists of vegetable-tanned Tuscan saddle leather that patinates with age, suspended over high-density natural latex foam.

#### Product Information
* **Suggested Price:** ₹1,45,000 INR *(Provisional concept pricing per chair)*
* **Primary Material:** Solid French Sessile Oak, Vegetable-Tanned Saddle Leather
* **Finish:** Matte natural white oil finish on oak; aniline dyed leather
* **Colour:** Natural Nordic Oak / Warm Saddle Tan Leather
* **Architectural Dimensions:**
  * Width: 54 cm
  * Depth: 56 cm
  * Height: 81 cm
  * Seat Height: 46 cm
* **Estimated Weight:** 8.5 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Steam-bent solid oak backrest shaped without visible metal fasteners
  * Hand-burnished saddle leather seat with contrasting saddle stitch detailing
  * Mortise-and-tenon reinforced corner joinery designed for commercial hospitality durability
  * Protective nylon/felt dual-surface glides pre-installed on legs
* **Care Instructions:** Clean oak with damp cloth. Nourish leather twice yearly with pure neatsfoot oil or beeswax leather conditioner. Avoid placing directly beside radiator heat.
* **Availability Status:** Made to Order (Lead time: 4 to 6 weeks; minimum order 4 units)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `sequence_360` (360-Degree Turntable)
* **Demonstration Video:** Optional.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** **Highly Recommended** — Shows the steam-bent back curve and tapered legs.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-dn-010-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Front View): `vlx-dn-010-gallery-front.webp`
  * Gallery View 2 (Rear View Highlighting Steam-Bent Joinery): `vlx-dn-010-gallery-rear.webp`
  * Gallery View 3 (Saddle Stitch & Leather Texture Macro): `vlx-dn-010-gallery-leather.webp`
  * Gallery View 4 (Group of 6 Chairs Surrounding Dining Table): `vlx-dn-010-gallery-group.webp`
  * 360 Turntable Frames: `vlx-dn-010-frame-01.webp` through `vlx-dn-010-frame-24.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photographs uploaded
  * [ ] 360 frames uploaded and tested
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 11: Quadrant Bronze & Travertine Credenza
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Quadrant Bronze & Travertine Credenza
* **SKU:** `VLX-DN-011`
* **URL Slug:** `quadrant-bronze-travertine-credenza`
* **Category:** Dining
* **Short Description:** A low architectural dining sideboard framed in patinated bronze with Roman travertine top and fluted timber doors.
* **Detailed Premium Description:** The Quadrant Credenza provides practical banquet storage while presenting an architectural facade. A solid 30mm thick slab of Navona travertine sits atop an acid-etched patinated bronze structural frame. Four flush soft-close doors feature vertical tactile fluting cut from dark ebonized oak. Inside, the credenza is fitted with dual felt-lined silverware drawers, adjustable wine glass racks, and integrated electrical cable management for warming plates.

#### Product Information
* **Suggested Price:** ₹7,60,000 INR *(Provisional concept pricing)*
* **Primary Material:** Navona Travertine, Ebonized European Oak, Hand-Patinated Bronze
* **Finish:** Matte honed stone; wire-brushed ebonized oak; satin clear lacquer on bronze
* **Colour:** Warm Ivory Navona Travertine / Charcoal Ebonized Oak / Deep Bronze
* **Architectural Dimensions:**
  * Width: 220 cm
  * Depth: 52 cm
  * Height: 78 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 165 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Heavy 30mm honed travertine top with drip-free perimeter water-chamfer
  * Four soft-close doors with integrated German Blum push-to-open latch mechanisms
  * Felt-lined internal cutlery drawer with solid walnut customizable dividers
  * Ventilated rear back panel accommodating AV equipment or bespoke wine refrigeration units
* **Care Instructions:** Protect stone from citrus and wine stains. Clean bronze with dry duster. Wipe timber doors with dry microfibre cloth along the fluting lines.
* **Availability Status:** Made to Order (Lead time: 8 to 10 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional — Showing touch-latch opening and interior drawers.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-dn-011-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Front Closed View): `vlx-dn-011-gallery-front.webp`
  * Gallery View 2 (Doors Open Showing Cutlery Drawers & Wine Shelves): `vlx-dn-011-gallery-interior.webp`
  * Gallery View 3 (Travertine Top & Patinated Bronze Edge Macro): `vlx-dn-011-gallery-stone.webp`
  * Gallery View 4 (Fluted Ebonized Oak Texture Detail): `vlx-dn-011-gallery-timber.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 12: Vesper Bar Cabinet with Patinated Brass
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Vesper Bar Cabinet with Patinated Brass Lining
* **SKU:** `VLX-DN-012`
* **URL Slug:** `vesper-patinated-brass-bar-cabinet`
* **Category:** Dining
* **Short Description:** A tall cocktail cabinet clad in ebonized oak opening to reveal an antiqued mirror and warm brass mixology station.
* **Detailed Premium Description:** Designed as a theatrical reveal for cocktail hour, the Vesper Bar Cabinet is disguised in an understated monolithic monolith of wire-brushed ebonized oak with cast bronze pulls. Opening its double bi-fold doors reveals a glowing interior lined in hand-hammered antiqued unlacquered brass, smoked antiqued mirror glass, and solid bronze stemware hanging rails. A pull-out marble cocktail mixing tray provides an impervious surface for spirits and citrus preparation.

#### Product Information
* **Suggested Price:** ₹6,80,000 INR *(Provisional concept pricing)*
* **Primary Material:** Wire-Brushed Ebonized Oak, Unlacquered Patinated Brass, Nero Marquina Marble
* **Finish:** Matte ebonized exterior; mirror-burnished antiqued brass interior
* **Colour:** Matte Black Ebonized Oak / Warm Glowing Brass / Polished Black Marble
* **Architectural Dimensions:**
  * Width: 110 cm
  * Depth: 50 cm
  * Height: 165 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 122 kg *[Provisional workshop estimate]*
* **Key Features:**
  * 180-degree wrap-around bi-fold doors maximizing interior access in compact dining spaces
  * Retractable Nero Marquina marble cocktail preparation shelf on heavy-duty slides
  * Concealed micro-switch activating 2700K ambient LED uplighting when doors open
  * Stemware rack accommodating up to 24 crystal wine glasses and champagne flutes
* **Care Instructions:** Clean interior brass with specialized brass cream or leave unsealed for organic patina. Wipe marble shelf dry after drink preparation. Clean mirror glass with lint-free cloth.
* **Availability Status:** Atelier Commission (Lead time: 8 to 10 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `video` (Showcase Video)
* **Demonstration Video:** **Highly Recommended** — Opening the bi-fold doors to reveal the glowing brass interior and cocktail shelf.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-dn-012-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Doors Closed Minimalist Stance): `vlx-dn-012-gallery-closed.webp`
  * Gallery View 2 (Doors Open Revealing Illuminated Brass Interior): `vlx-dn-012-gallery-open.webp`
  * Gallery View 3 (Pull-Out Nero Marquina Shelf & Glass Rack Detail): `vlx-dn-012-gallery-shelf.webp`
  * Gallery View 4 (Cast Bronze Handle & Wire-Brushed Oak Macro): `vlx-dn-012-gallery-handle.webp`
  * Video Showcase: `vlx-dn-012-showcase.mp4` & Poster: `vlx-dn-012-video-poster.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Video showcase uploaded with matching poster
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

## Workspace Creations

### Product 13: Cantilever Executive Desk
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Cantilever Executive Desk in Smoked Oak & Leather
* **SKU:** `VLX-WS-013`
* **URL Slug:** `cantilever-executive-desk-smoked-oak`
* **Category:** Workspace
* **Short Description:** A monolithic executive desk featuring an asymmetrical cantilevered writing surface and inlaid saddle leather blotter.
* **Detailed Premium Description:** Redefining executive authority through architectural minimalism, this desk pairs a heavy smoked European oak pedestal with a floating cantilevered wing. The desktop features an inset blotter of full-grain Tuscan saddle leather, blind-embossed with subtle perimeter scoring. Integrated beneath the desk surface is a concealed magnetic access channel for power routing, high-speed data cables, and a flush pop-up wireless device charger.

#### Product Information
* **Suggested Price:** ₹8,20,000 INR *(Provisional concept pricing)*
* **Primary Material:** Smoked European Oak, Full-Grain Tuscan Saddle Leather, Steel Core
* **Finish:** Deep smoked fumed oak with matte protective wax; natural aniline leather
* **Colour:** Smoked Charcoal Oak / Espresso Brown Saddle Leather
* **Architectural Dimensions:**
  * Width: 220 cm
  * Depth: 95 cm
  * Height: 75 cm
  * Seat Height: 0 cm (Knee clearance height: 71 cm)
* **Estimated Weight:** 148 kg *[Provisional workshop estimate]*
* **Key Features:**
  * 120cm cantilever wing supported by an internal welded structural steel bridge
  * Full-grain saddle leather desk pad soft to touch for handwriting and laptop use
  * Built-in biometric fingerprint locking drawer for passports and confidential files
  * Seamless concealed wire-management conduit with hidden magnetic walnut access plates
* **Care Instructions:** Wipe oak with dry microfibre cloth. Condition leather blotter twice yearly with saddle cream. Avoid writing directly on paper without desk pad to prevent embossing impressions.
* **Availability Status:** Atelier Commission (Lead time: 8 to 10 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `glb_3d` (Interactive 3D GLB Model Viewer)
* **Demonstration Video:** Recommended — Showing the hidden cable management and cantilever.
* **3D GLB/GLTF Model:** **Required** — Crucial for viewing the cantilevered suspension and pedestal volume.
* **360° Sequence:** Optional alternative.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-ws-013-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Front Executive Perspective): `vlx-ws-013-gallery-front.webp`
  * Gallery View 2 (Working Side Perspective Showing Leather Inset & Drawers): `vlx-ws-013-gallery-worker.webp`
  * Gallery View 3 (Cantilever Suspension Profile & Steel Joint): `vlx-ws-013-gallery-cantilever.webp`
  * Gallery View 4 (Leather Blotter & Concealed Cable Port Macro): `vlx-ws-013-gallery-leather.webp`
  * 3D Binary Model: `vlx-ws-013-model.glb`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] 3D GLB model uploaded and verified
  * [ ] Draft saved and verified via live preview
  * [ ] Published to showroom

---

### Product 14: Ergona Haute Saddle Leather Director Chair
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Ergona Haute Saddle Leather Director Chair
* **SKU:** `VLX-WS-014`
* **URL Slug:** `ergona-saddle-leather-director-chair`
* **Category:** Workspace
* **Short Description:** An ergonomic executive swivel chair upholstered in hand-stitched saddle leather with a sculptural cast bronze 5-star base.
* **Detailed Premium Description:** Bridging haute craftsmanship and ergonomic science, the Ergona Director Chair avoids standard plastic executive chair aesthetics. The contoured seat and backrest are sculpted from multi-density cold-cured foam wrapped in full-grain vegetable-tanned saddle leather. Its custom pneumatic lift, tilt tension mechanism, and 5-star castor base are cast from solid architectural bronze with a hand-burnished oil finish.

#### Product Information
* **Suggested Price:** ₹3,10,000 INR *(Provisional concept pricing)*
* **Primary Material:** Full-Grain Tuscan Saddle Leather, Cast Architectural Bronze, Cold-Cured Foam
* **Finish:** Hand-burnished oil finish on bronze; natural vegetable-tanned leather
* **Colour:** Saddle Tan or Noir Black Leather / Antique Bronze Base
* **Architectural Dimensions:**
  * Width: 66 cm
  * Depth: 68 cm
  * Height: 98–108 cm (Pneumatic height adjustable)
  * Seat Height: 45–55 cm
* **Estimated Weight:** 26 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Italian synchronized tilt-recline mechanism with 4 locking positions and lumbar tension control
  * Solid cast bronze 5-star base with concealed dual-wheel soft urethane castors for hardwood floors
  * Hand-stitched saddle leather armrests with ergonomic padded forearm inserts
  * Pneumatic gas cylinder tested to BIFMA commercial durability standards
* **Care Instructions:** Clean leather with damp cloth; apply neutral leather balm annually. Clean bronze base with dry cloth. Do not use chemical solvents on castors.
* **Availability Status:** Made to Order (Lead time: 6 to 8 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `sequence_360` (360-Degree Turntable)
* **Demonstration Video:** Optional — Showing pneumatic lift and tilt mechanism.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** **Highly Recommended** — Shows 360-degree rotation and bronze base details.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-ws-014-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Front Elevation): `vlx-ws-014-gallery-front.webp`
  * Gallery View 2 (Rear View Highlighting Saddle Stitching & Spine): `vlx-ws-014-gallery-rear.webp`
  * Gallery View 3 (Cast Bronze 5-Star Base & Gas Lift Macro): `vlx-ws-014-gallery-base.webp`
  * Gallery View 4 (Padded Armrest & Leather Grain Close-Up): `vlx-ws-014-gallery-armrest.webp`
  * 360 Turntable Frames: `vlx-ws-014-frame-01.webp` through `vlx-ws-014-frame-24.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] 360 sequence uploaded and tested
  * [ ] Draft saved and checked
  * [ ] Published to showroom

---

### Product 15: Modular Architectural Bookcase
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Modular Architectural Bookcase with Integrated Uplighting
* **SKU:** `VLX-WS-015`
* **URL Slug:** `modular-architectural-bookcase-uplighting`
* **Category:** Workspace
* **Short Description:** A wall-spanning architectural shelving system in fluted French walnut with patinated bronze vertical uprights and integrated warm LED uplighting.
* **Detailed Premium Description:** Serving as both functional library and room divider, this modular bookcase features floor-to-ceiling tension uprights cast from patinated architectural bronze. Thick floating shelves of solid French walnut incorporate warm 2700K concealed LED channel uplighting that illuminates literature, ceramics, and sculpture without visible wire clutter. The lower tiers include four soft-close cabinet modules with fluted walnut door fronts.

#### Product Information
* **Suggested Price:** ₹12,40,000 INR *(Provisional concept pricing for 3-bay unit)*
* **Primary Material:** Solid French Walnut, Cast Bronze Uprights, Frosted Acrylic Diffusers
* **Finish:** Matte natural walnut wax finish; dark patinated bronze
* **Colour:** Natural Walnut / Antiqued Bronze Uprights
* **Architectural Dimensions:**
  * Width: 280 cm (3-bay composition)
  * Depth: 40 cm
  * Height: 240 cm (Configurable ceiling mount up to 320 cm)
  * Seat Height: 0 cm
* **Estimated Weight:** 210 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Floor-to-ceiling or wall-anchored modular structural system customizable in 90cm increments
  * Inset 2700K warm LED light strips with diffused lenses integrated into the rear of every shelf
  * Lower enclosed credenza bays for private storage and AV housing
  * Precision machined bronze shelf-support brackets allowing 50mm height adjustment
* **Care Instructions:** Dust shelves regularly with microfibre duster. Wipe timber with damp cloth. Ensure power supply is switched off before cleaning light diffusers.
* **Availability Status:** Bespoke Architectural Project (Lead time: 10 to 12 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Recommended — Slow pan with lights on showing shadow and illumination depth.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-ws-015-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Full 3-Bay Wall Elevation): `vlx-ws-015-gallery-full.webp`
  * Gallery View 2 (Night View with Integrated LED Uplighting Active): `vlx-ws-015-gallery-lit.webp`
  * Gallery View 3 (Bronze Upright & Shelf Bracket Machining Macro): `vlx-ws-015-gallery-bracket.webp`
  * Gallery View 4 (Fluted Base Cabinet Doors & Storage Detail): `vlx-ws-015-gallery-doors.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 16: Minimalist File Credenza in Fluted Bronze
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Minimalist Credenza File Credenza in Fluted Bronze
* **SKU:** `VLX-WS-016`
* **URL Slug:** `fluted-bronze-office-credenza`
* **Category:** Workspace
* **Short Description:** A low executive filing credenza featuring acid-etched fluted bronze front panels and an ebony oak casing.
* **Detailed Premium Description:** Transforming utilitarian office storage into an architectural art piece, this low credenza combines ebonized European oak with handcrafted acid-etched bronze panels. Behind the tactile bronze doors lie heavy-duty soft-close file drawers capable of holding A4 and legal-size architectural folios, as well as an integrated central safe cavity for personal valuables and hard-drive backups.

#### Product Information
* **Suggested Price:** ₹4,90,000 INR *(Provisional concept pricing)*
* **Primary Material:** Ebonized European Oak, Hand-Fluted Architectural Bronze, Heavy Steel Rails
* **Finish:** Matte ebonized oil on oak; acid-etched and wax-sealed bronze
* **Colour:** Matte Charcoal Black / Weathered Antique Bronze
* **Architectural Dimensions:**
  * Width: 160 cm
  * Depth: 48 cm
  * Height: 72 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 98 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Two heavy-duty filing drawers with reinforced suspension glides supporting up to 50 kg each
  * Two lateral cupboard compartments with adjustable shelves and interior leather linings
  * Push-to-open seamless mechanism eliminating visible knobs or handles
  * Cable access port on top surface for printer or desk lamp placement
* **Care Instructions:** Clean bronze panels with dry soft cloth. Wipe wood casing with damp cloth. Vacuum interior file glides periodically to ensure smooth travel.
* **Availability Status:** Made to Order (Lead time: 6 to 8 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional — Showing drawer opening and file storage.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-ws-016-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Front Facade Elevation): `vlx-ws-016-gallery-front.webp`
  * Gallery View 2 (Open Drawers Showing Heavy-Duty Filing Glides): `vlx-ws-016-gallery-open.webp`
  * Gallery View 3 (Acid-Etched Fluted Bronze Panel Texture Macro): `vlx-ws-016-gallery-bronze.webp`
  * Gallery View 4 (Corner Detail & Top Cable Port): `vlx-ws-016-gallery-corner.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and designated as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

## Lighting Creations

### Product 17: Solstice Alabaster & Brass Chandelier
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Solstice Alabaster & Burnished Brass Chandelier
* **SKU:** `VLX-LT-017`
* **URL Slug:** `solstice-alabaster-burnished-brass-chandelier`
* **Category:** Lighting
* **Short Description:** A monumental tiered mobile chandelier featuring hand-turned Spanish alabaster discs suspended on burnished brass arms.
* **Detailed Premium Description:** Serving as a suspended architectural sculpture, the Solstice Chandelier celebrates stone in weightless flight. Six hand-turned discs of translucent Spanish alabaster, each possessing unique cloudy veining, are balanced on counterweighted arms of solid burnished brass. Concealed warm 2400K LED modules illuminate the alabaster from within, transforming the stone discs into glowing celestial orbs without glare.

#### Product Information
* **Suggested Price:** ₹5,80,000 INR *(Provisional concept pricing)*
* **Primary Material:** Natural Spanish Alabaster, Solid Lost-Wax Cast Brass, Dimmable LED Modules
* **Finish:** Hand-burnished wax on brass; honed silky matte alabaster
* **Colour:** Milky White / Amber Alabaster with Warm Burnished Brass
* **Architectural Dimensions:**
  * Width: 135 cm
  * Depth: 135 cm
  * Height: 85 cm (Supplied with custom drop rod extendable to 240 cm)
  * Seat Height: 0 cm
* **Estimated Weight:** 34 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Translucent natural alabaster acting as a warm natural optical diffuser
  * Dimmable architectural warm-tone LEDs (2400K, CRI 96+) with 50,000-hour rated lifespan
  * Balanced counterweighted brass pivot joints allowing gentle custom arm configuration
  * Compatible with leading smart home dimming systems (Lutron, DALI, Casambi)
* **Care Instructions:** Turn off power prior to cleaning. Dust alabaster discs gently with dry microfibre cloth. Do not use liquids on unsealed alabaster stone. Wipe brass with dry cloth.
* **Availability Status:** Atelier Commission (Lead time: 6 to 8 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `glb_3d` (Interactive 3D GLB Model Viewer)
* **Demonstration Video:** **Highly Recommended** — Slow rotation showing the glowing alabaster discs and warm light dispersion.
* **3D GLB/GLTF Model:** **Required** — Essential for visualizing the suspended multi-tier mobile from 360-degree angles.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-lt-017-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Underside Perspective Lit): `vlx-lt-017-gallery-underside.webp`
  * Gallery View 2 (Side Elevation Silhouette In High Ceiling Room): `vlx-lt-017-gallery-room.webp`
  * Gallery View 3 (Macro Texture of Illuminated Alabaster Disc): `vlx-lt-017-gallery-alabaster.webp`
  * Gallery View 4 (Precision Machined Brass Canopy & Drop Rod Detail): `vlx-lt-017-gallery-canopy.webp`
  * 3D Binary Model: `vlx-lt-017-model.glb`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] 3D GLB model uploaded and verified
  * [ ] Draft saved and verified via live preview
  * [ ] Published to showroom

---

### Product 18: Monolith Travertine Floor Lamp
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Monolith Travertine Floor Lamp with Raw Linen Shade
* **SKU:** `VLX-LT-018`
* **URL Slug:** `monolith-travertine-floor-lamp`
* **Category:** Lighting
* **Short Description:** A tall sculptural floor lamp featuring a fluted Roman travertine stone base and an oversized raw Belgian linen drum shade.
* **Detailed Premium Description:** Grounding interior living spaces with calm geological presence, this floor lamp rises from a solid block of Roman travertine carved with deep vertical flutes. A central burnished brass stem supports an oversized cylindrical shade woven from unbleached Belgian linen. When illuminated, light cascades downward across the carved stone ridges, creating rhythmic linear shadows while casting warm diffused illumination upward and outward.

#### Product Information
* **Suggested Price:** ₹2,20,000 INR *(Provisional concept pricing)*
* **Primary Material:** Natural Roman Travertine, Solid Brass Stem, 100% Belgian Linen
* **Finish:** Honed open-pore travertine; satin unlacquered brass
* **Colour:** Warm Sand Travertine / Natural Ecru Linen
* **Architectural Dimensions:**
  * Width: 40 cm (Base: 24 cm diameter; Shade: 40 cm diameter)
  * Depth: 40 cm
  * Height: 172 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 42 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Heavy solid travertine base ensuring absolute stability against tipping
  * Rotary dimmer switch machined from solid brass positioned on the central stem
  * Dual E27 ceramic lamp sockets rated up to 100W equivalent warm LED
  * Fabric-sheathed twisted brown braided power cord with cast brass foot plug
* **Care Instructions:** Dust linen shade with dry soft bristle brush or lint roller. Dust travertine base with dry microfibre cloth. Disconnect from power outlet before changing bulbs.
* **Availability Status:** Made to Order (Lead time: 4 to 6 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional — Showing the dimming effect across stone flutes.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Recommended — Shows the fluted circumference of the travertine base.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-lt-018-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Full Height Standing Elevation Lit): `vlx-lt-018-gallery-lit.webp`
  * Gallery View 2 (Full Height Standing Elevation Unlit): `vlx-lt-018-gallery-unlit.webp`
  * Gallery View 3 (Fluted Travertine Base & Brass Dimmer Macro): `vlx-lt-018-gallery-base.webp`
  * Gallery View 4 (Belgian Linen Weave & Diffuser Texture Close-Up): `vlx-lt-018-gallery-shade.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 19: Eclipse Cast Bronze Articulated Wall Sconce
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Eclipse Cast Bronze Articulated Wall Sconce
* **SKU:** `VLX-LT-019`
* **URL Slug:** `eclipse-cast-bronze-wall-sconce`
* **Category:** Lighting
* **Short Description:** An articulated architectural wall lamp sculpted in lost-wax cast bronze with indirect halo illumination.
* **Detailed Premium Description:** Designed to wash vertical stone or plaster walls in indirect radiance, the Eclipse Sconce resembles a brutalist sculpture. Sand-cast in solid bronze, its circular concave reflector dish pivots 45 degrees, allowing the user to redirect the light beam. A central bronze disc conceals the warm LED light source, casting a halo of light across the sand-cast metal texture without creating direct glare.

#### Product Information
* **Suggested Price:** ₹1,35,000 INR *(Provisional concept pricing)*
* **Primary Material:** Lost-Wax Sand-Cast Architectural Bronze, Optical LED Engine
* **Finish:** Hand-aged charcoal bronze with warm golden highlighted edges
* **Colour:** Deep Charcoal Patinated Bronze with Golden Undertones
* **Architectural Dimensions:**
  * Width: 24 cm
  * Depth: 18 cm (Max projection from wall)
  * Height: 48 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 7.5 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Heavy sand-cast bronze reflector plate with unique organic casting surface variations
  * Precision friction swivel knuckle allowing 45-degree angle articulation
  * Integrated 2700K 12W warm LED module with 95+ Color Rendering Index (CRI)
  * Standard hardwire junction box mount with concealed mounting screws
* **Care Instructions:** Clean with dry cloth. Do not apply liquid metal polish to the patinated bronze finish. Turn off power breaker before installation or inspection.
* **Availability Status:** In Stock / Small Batch (Lead time: 2 to 3 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `sequence_360` (360-Degree Turntable)
* **Demonstration Video:** Optional.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** **Highly Recommended** — Shows the concave reflector plate and pivot articulation.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-lt-019-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Wall Elevation Lit Showing Halo Effect): `vlx-lt-019-gallery-lit.webp`
  * Gallery View 2 (Angled Articulation Side Profile): `vlx-lt-019-gallery-profile.webp`
  * Gallery View 3 (Cast Bronze Sand Texture Macro Close-Up): `vlx-lt-019-gallery-bronze.webp`
  * Gallery View 4 (Pair Installed Flanking Architectural Doorway): `vlx-lt-019-gallery-pair.webp`
  * 360 Turntable Frames: `vlx-lt-019-frame-01.webp` through `vlx-lt-019-frame-24.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] 360 sequence uploaded and verified
  * [ ] Draft saved and checked
  * [ ] Published to showroom

---

### Product 20: Aura Smoked Glass Table Luminaire
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Aura Smoked Mouth-Blown Glass Table Luminaire
* **SKU:** `VLX-LT-020`
* **URL Slug:** `aura-smoked-glass-table-luminaire`
* **Category:** Lighting
* **Short Description:** A mouth-blown smoked Murano glass table lamp resting on a spun brass pedestal with a soft gradient glow.
* **Detailed Premium Description:** Celebrating the heritage of Venetian glassblowing, each Aura Table Luminaire is individually mouth-blown by master glass artisans. The asymmetrical glass dome features a gradient smoke tint transitioning from deep charcoal at the crown to clear crystal at the base. It sits upon a hand-spun burnished brass pedestal that houses a warm internal LED engine and a knurled touch-dimmer wheel.

#### Product Information
* **Suggested Price:** ₹1,65,000 INR *(Provisional concept pricing)*
* **Primary Material:** Hand-Blown Murano Crystal Glass, Solid Spun Brass
* **Finish:** Glossy smoked gradient crystal glass; burnished satin brass pedestal
* **Colour:** Smoked Umber Charcoal / Warm Satin Brass
* **Architectural Dimensions:**
  * Width: 32 cm
  * Depth: 32 cm
  * Height: 44 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 6.2 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Hand-blown freeform glass dome ensuring no two lamps share identical bubbles or smoke gradient
  * Integrated knurled brass step-less touch dimmer dial (10% to 100% brightness range)
  * 2200K ultra-warm ambient LED light source reminiscent of candlelight
  * Weighted spun-brass plinth fitted with protective scratch-resistant felt base
* **Care Instructions:** Clean glass dome with microfibre cloth and gentle glass cleaner. Do not submerge brass base in water. Avoid abrasive cleaning pads.
* **Availability Status:** In Stock (Lead time: 2 to 3 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional — Showing touch-dimmer light gradient transitions.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-lt-020-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Table Elevation Lit in Low Light): `vlx-lt-020-gallery-lit.webp`
  * Gallery View 2 (Daylight Unlit View Showing Smoked Glass Gradient): `vlx-lt-020-gallery-unlit.webp`
  * Gallery View 3 (Knurled Brass Dimmer Switch & Base Macro): `vlx-lt-020-gallery-brass.webp`
  * Gallery View 4 (Console Table Styling Vignette with Books): `vlx-lt-020-gallery-styling.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

## Entryway Creations

### Product 21: Torus Sculpted Stone Entry Bench
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Torus Sculpted Stone Entry Bench
* **SKU:** `VLX-EW-021`
* **URL Slug:** `torus-sculpted-stone-entry-bench`
* **Category:** Entryway
* **Short Description:** A monolithic entryway bench carved from solid basalt with dual cylindrical pillar supports and a honed seating plane.
* **Detailed Premium Description:** Serving as a tactile threshold between exterior arrivals and interior sanctuary, the Torus Entry Bench is chiseled from dense volcanic basalt stone. Two massive cylindrical stone columns support a thick stone slab with hand-honed chamfered perimeter edges. The seating plane offers a cool, tactile surface for removing footwear, designed to withstand wet coats and outdoor footwear without degradation.

#### Product Information
* **Suggested Price:** ₹4,40,000 INR *(Provisional concept pricing)*
* **Primary Material:** Natural Volcanic Basalt Stone
* **Finish:** Fine-honed silky matte top surface; rough-chiseled textured column plinths
* **Colour:** Deep Charcoal Basalt Grey / Wet Slate Black
* **Architectural Dimensions:**
  * Width: 180 cm
  * Depth: 50 cm
  * Height: 44 cm
  * Seat Height: 44 cm
* **Estimated Weight:** 240 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Monolithic structural stone construction with zero wood or metal components to warp or corrode
  * Water-resistant stone impregnating treatment safe for damp coats and wet umbrellas
  * Heavy mass preventing displacement in high-traffic residential or hospitality lobbies
  * Optional magnetic saddle leather seat runner available upon bespoke request
* **Care Instructions:** Clean with clean water and stone-safe pH-neutral soap. Basalt is impervious to most stains. Avoid heavy impact with sharp metal tools.
* **Availability Status:** Atelier Commission (Lead time: 8 to 10 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `glb_3d` (Interactive 3D GLB Model Viewer)
* **Demonstration Video:** Optional.
* **3D GLB/GLTF Model:** **Required** — Showcases the heavy basalt mass and cylindrical plinth geometry.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-ew-021-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Front Architectural Elevation): `vlx-ew-021-gallery-front.webp`
  * Gallery View 2 (Low Angle Showing Cylindrical Pillar Supports): `vlx-ew-021-gallery-angle.webp`
  * Gallery View 3 (Chiseled vs Honed Basalt Texture Contrast Macro): `vlx-ew-021-gallery-texture.webp`
  * Gallery View 4 (Grand Minimalist Entry Foyer Setting): `vlx-ew-021-gallery-foyer.webp`
  * 3D Binary Model: `vlx-ew-021-model.glb`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] 3D GLB model uploaded and verified in canvas
  * [ ] Draft saved and verified via live preview
  * [ ] Published to showroom

---

### Product 22: Horizon Monolithic Full-Length Bronze Mirror
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Horizon Monolithic Full-Length Bronze Mirror
* **SKU:** `VLX-EW-022`
* **URL Slug:** `horizon-monolithic-bronze-mirror`
* **Category:** Entryway
* **Short Description:** A towering 220cm floor-standing mirror framed in heavy patinated bronze with an ultra-clear low-iron glass reflection.
* **Detailed Premium Description:** The Horizon Floor Mirror commands attention in entryway halls, reflecting spatial volume and natural light. Its monumental 220cm frame is sand-cast in solid bronze with subtle stepped outer reveals and hand-rubbed patination. Using 6mm ultra-clear low-iron float glass with silver backing, it provides distortion-free full-length reflections. An integrated heavy steel rear kickstand allows secure floor-leaning placement, while pre-drilled brackets support flush wall anchoring.

#### Product Information
* **Suggested Price:** ₹3,60,000 INR *(Provisional concept pricing)*
* **Primary Material:** Solid Sand-Cast Architectural Bronze, 6mm Low-Iron Optiwhite Mirror Glass
* **Finish:** Hand-aged antique bronze patina; distortion-free silvered mirror
* **Colour:** Deep Charcoal Bronze / Crystal Clear Reflection
* **Architectural Dimensions:**
  * Width: 90 cm
  * Depth: 8 cm (Frame depth; leans out 25–35 cm when using floor kickstand)
  * Height: 220 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 68 kg *[Provisional workshop estimate]*
* **Key Features:**
  * 220cm architectural height allowing uncompromised full-body head-to-toe viewing
  * Low-iron glass eliminating the green edge tint common to standard mirror glass
  * Heavy anti-tip seismic wall tether cable kit included for residential safety
  * Heavy felt base pads preventing floor marring on polished parquet or marble
* **Care Instructions:** Clean mirror face with ammonia-free glass cleaner sprayed directly onto microfibre cloth. Wipe bronze frame with dry duster only.
* **Availability Status:** Made to Order (Lead time: 4 to 6 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-ew-022-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Full Height Frontal Elevation): `vlx-ew-022-gallery-front.webp`
  * Gallery View 2 (Angled Perspective Showing Bronze Frame Depth): `vlx-ew-022-gallery-angle.webp`
  * Gallery View 3 (Cast Bronze Corner Stepped Reveal Macro): `vlx-ew-022-gallery-corner.webp`
  * Gallery View 4 (Entryway Gallery Vignette with Entry Bench): `vlx-ew-022-gallery-context.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 23: Arc Fluted Oak Entry Console Table
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Arc Fluted Oak Entry Console Table
* **SKU:** `VLX-EW-023`
* **URL Slug:** `arc-fluted-oak-entry-console-table`
* **Category:** Entryway
* **Short Description:** A slender half-moon console table with fluted French oak tambour legs and a honed Calacatta marble inset key tray.
* **Detailed Premium Description:** Designed specifically for narrow foyers and gallery hallways, the Arc Console features a graceful semi-elliptical arc footprint that avoids blocking foot traffic. Two semi-circular fluted pedestal legs of solid French oak support a floating oak top. A central shallow recessed tray carved from honed Calacatta Viola marble provides an organized landing for car keys, fountain pens, and correspondence.

#### Product Information
* **Suggested Price:** ₹3,15,000 INR *(Provisional concept pricing)*
* **Primary Material:** Solid French White Oak, Inset Calacatta Viola Marble Tray
* **Finish:** Matte natural white oil on oak; honed anti-stain sealed marble
* **Colour:** Pale Natural White Oak / Plum & Cream Calacatta Viola Marble
* **Architectural Dimensions:**
  * Width: 170 cm
  * Depth: 38 cm (Shallow footprint optimized for hallways)
  * Height: 84 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 48 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Shallow 38cm depth specifically engineered for hallway and entryway passage
  * Hand-carved inset marble catchall tray flush with oak perimeter
  * Two concealed push-to-open shallow drawers integrated into the curved apron for mail
  * Wall-anchoring stabilization hardware included to prevent tipping
* **Care Instructions:** Dust with dry cloth. Clean marble tray with stone cleaner. Oil timber with natural wood wax once every two years.
* **Availability Status:** Made to Order (Lead time: 6 to 8 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional — Showing shallow mail drawers opening.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-ew-023-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Elevation Front Silhouette): `vlx-ew-023-gallery-front.webp`
  * Gallery View 2 (Overhead View Showing Inset Marble Key Tray): `vlx-ew-023-gallery-top.webp`
  * Gallery View 3 (Fluted Oak Tambour Pedestal Leg Macro): `vlx-ew-023-gallery-leg.webp`
  * Gallery View 4 (Entry Foyer Vignette with Mirror and Key Catchall): `vlx-ew-023-gallery-foyer.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 24: Columnar Marble Valet Stand & Coat Totem
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Columnar Marble Valet Stand & Coat Totem
* **SKU:** `VLX-EW-024`
* **URL Slug:** `columnar-marble-valet-coat-totem`
* **Category:** Entryway
* **Short Description:** A freestanding coat totem featuring a heavy cylindrical Nero Marquina marble base and satin brass garment pegs.
* **Detailed Premium Description:** Elevating the humble coat rack into a sculpture, the Columnar Valet features a solid 38cm diameter cylindrical base carved from Nero Marquina marble with crisp white veins. Rising from this stable anchor is a slender vertical mast of unlacquered brushed brass. Six staggered sculptural brass pegs are radiused to prevent coat and hat creasing, complemented by an integrated umbrella drainage ring at the stone base.

#### Product Information
* **Suggested Price:** ₹1,95,000 INR *(Provisional concept pricing)*
* **Primary Material:** Solid Nero Marquina Marble, Heavy Unlacquered Spun Brass
* **Finish:** Honed satin marble; brushed satin brass with protective micro-crystalline wax
* **Colour:** Deep Noir Black Marble with White Veins / Warm Satin Brass
* **Architectural Dimensions:**
  * Width: 38 cm (Base diameter) / 44 cm (Max peg spread)
  * Depth: 38 cm
  * Height: 182 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 52 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Heavy 38kg marble counterweight base ensuring stability even when loaded with heavy winter overcoats
  * Six CNC-machined solid brass pegs with smooth rounded tips protecting cashmere coats
  * Integrated recessed drip bowl within the marble plinth to hold damp umbrellas
  * Scratch-resistant felt base protecting polished entryway marble and timber floors
* **Care Instructions:** Wipe marble dry if umbrellas deposit water. Dust brass pegs with microfibre cloth. Avoid abrasive detergents on brass.
* **Availability Status:** In Stock / Limited Batch (Lead time: 2 to 3 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `sequence_360` (360-Degree Turntable)
* **Demonstration Video:** Optional.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** **Highly Recommended** — Shows the radial arrangement of coat pegs around the central mast.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-ew-024-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Full Height Elevation): `vlx-ew-024-gallery-full.webp`
  * Gallery View 2 (Nero Marquina Marble Cylindrical Plinth Macro): `vlx-ew-024-gallery-base.webp`
  * Gallery View 3 (Machined Brass Garment Peg & Joinery Close-Up): `vlx-ew-024-gallery-pegs.webp`
  * Gallery View 4 (Styled with Overcoat & Hat in Entry Foyer): `vlx-ew-024-gallery-styled.webp`
  * 360 Turntable Frames: `vlx-ew-024-frame-01.webp` through `vlx-ew-024-frame-24.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] 360 turntable frames uploaded and verified
  * [ ] Draft saved and checked
  * [ ] Published to showroom

---

## Objects & Decor Creations

### Product 25: Pietra Hand-Carved Travertine Vessel
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Pietra Hand-Carved Travertine Vessel
* **SKU:** `VLX-DC-025`
* **URL Slug:** `pietra-hand-carved-travertine-vessel`
* **Category:** Objects & Decor
* **Short Description:** An organic sculptural vessel chiseled from a single block of Roman travertine with unfilled natural cavities.
* **Detailed Premium Description:** Carved by master stone artisans in Tivoli, Italy, each Pietra Vessel is sculpted from a single solid block of Roman travertine. Celebrating ancient geologic time, the stone retains its natural cavities, fissures, and sandy sedimentary layers. Its asymmetrical, hand-hollowed basin functions as a centerpiece bowl for fruit, seasonal botanical branches, or as a standalone collectible art object.

#### Product Information
* **Suggested Price:** ₹95,000 INR *(Provisional concept pricing)*
* **Primary Material:** Natural Roman Travertine (Unfilled Cavities)
* **Finish:** Raw chiseled exterior; smooth hand-honed interior basin
* **Colour:** Natural Earth Warm Sand / Cream Travertine
* **Architectural Dimensions:**
  * Width: 34 cm
  * Depth: 34 cm
  * Height: 42 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 18 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Sculpted from a single block of stone with zero glued joints
  * Organic textured chisel marks on exterior perimeter contrasting with smooth honed interior
  * Natural water-repellent stone sealant applied to internal basin for fresh floral branches
  * Hand-numbered limited studio production edition
* **Care Instructions:** Rinse interior with warm water; wipe dry. Avoid acidic liquids. Do not place in dishwasher. Dust exterior with soft bristle brush.
* **Availability Status:** In Stock (Lead time: 1 to 2 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `sequence_360` (360-Degree Turntable)
* **Demonstration Video:** Optional.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** **Highly Recommended** — Shows the organic asymmetrical chiseling from every perspective.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-dc-025-cover.webp` (`1:1` Square, `2400×2400 px`)
  * Gallery View 1 (Direct Eye-Level Studio Profile): `vlx-dc-025-gallery-eye.webp`
  * Gallery View 2 (Angled Down Looking Into Hollowed Interior): `vlx-dc-025-gallery-interior.webp`
  * Gallery View 3 (Macro Texture of Natural Travertine Cavities): `vlx-dc-025-gallery-texture.webp`
  * Gallery View 4 (Coffee Table Centerpiece Vignette with Botanical): `vlx-dc-025-gallery-styling.webp`
  * 360 Turntable Frames: `vlx-dc-025-frame-01.webp` through `vlx-dc-025-frame-24.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] 360 sequence uploaded and verified
  * [ ] Draft saved and checked
  * [ ] Published to showroom

---

### Product 26: Brutalist Cast Bronze Sculptural Candelabra
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Brutalist Cast Bronze Sculptural Candelabra
* **SKU:** `VLX-DC-026`
* **URL Slug:** `brutalist-cast-bronze-candelabra`
* **Category:** Objects & Decor
* **Short Description:** A five-candle architectural candelabra sand-cast in solid bronze with a raw textured patina.
* **Detailed Premium Description:** Drawing inspiration from brutalist architecture, this candelabra is hand-cast in molten bronze using traditional sand-molds. The textured surface displays raw slag marks, crystallization cooling lines, and charcoal patination. Five cylindrical candle holders rise at varying geometric heights, creating a dynamic dance of flickering candlelight when dinner is served.

#### Product Information
* **Suggested Price:** ₹1,20,000 INR *(Provisional concept pricing)*
* **Primary Material:** Solid Sand-Cast Architectural Bronze
* **Finish:** Fire-patinated dark bronze with raw sand-cast texture
* **Colour:** Charcoal Black Bronze with Burnished Golden Highlights
* **Architectural Dimensions:**
  * Width: 28 cm
  * Depth: 20 cm
  * Height: 45 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 9.2 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Heavy solid bronze casting providing high stability against tipping
  * Sockets sized for standard 22mm tapered beeswax or paraffin candles
  * Removable candle socket drip inserts for easy wax cleanup
  * Protective cork bottom pad preventing scratching on polished dining surfaces
* **Care Instructions:** Remove cooled candle wax with warm water and soft cloth. Do not use sharp metal knives to scrape wax. Dust with dry cloth.
* **Availability Status:** In Stock (Lead time: 1 to 2 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional — Showing flickering candlelight illumination.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-dc-026-cover.webp` (`1:1` Square, `2400×2400 px`)
  * Gallery View 1 (Lit Candles in Dark Atmosphere): `vlx-dc-026-gallery-lit.webp`
  * Gallery View 2 (Daylight Unlit Architectural Silhouette): `vlx-dc-026-gallery-unlit.webp`
  * Gallery View 3 (Sand-Casting Slag Texture & Candle Cup Macro): `vlx-dc-026-gallery-macro.webp`
  * Gallery View 4 (Dining Table Centerpiece Setting with Linens): `vlx-dc-026-gallery-dining.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and designated as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 27: Ombra Nero Marquina Marble Catchall Tray
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Ombra Nero Marquina Marble Catchall Tray
* **SKU:** `VLX-DC-027`
* **URL Slug:** `ombra-nero-marquina-catchall-tray`
* **Category:** Objects & Decor
* **Short Description:** A monolithic rectangular catchall tray hand-chiseled from a single block of Spanish Nero Marquina marble.
* **Detailed Premium Description:** Carved from intense black Spanish Nero Marquina marble with crisp white calcite veining, the Ombra Catchall brings order to desks, coffee tables, and vanity counters. The exterior rim features hand-chiseled rough edges, contrasting with the silky hand-honed interior basin. The heavy mass prevents sliding when keys, timepieces, or jewelry are placed within.

#### Product Information
* **Suggested Price:** ₹65,000 INR *(Provisional concept pricing)*
* **Primary Material:** Natural Spanish Nero Marquina Marble
* **Finish:** Hand-chiseled rough border; silky honed interior basin
* **Colour:** Deep Jet Black Marble with Vivid White Lightning Veins
* **Architectural Dimensions:**
  * Width: 42 cm
  * Depth: 26 cm
  * Height: 5 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 7.8 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Carved from a single solid block of authentic Spanish marble
  * Heavy non-slip presence ideal for high-use entry consoles and bedside nightstands
  * Full-coverage velvet base lining protecting fine wood and glass furniture tops
  * Each piece features a unique, random natural calcite marble veining signature
* **Care Instructions:** Wipe clean with damp cloth. Avoid contact with perfumes or acidic colognes which can etch polished marble. Recondition with neutral stone wax.
* **Availability Status:** In Stock (Lead time: 1 to 2 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional.
* **3D GLB/GLTF Model:** Optional.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-dc-027-cover.webp` (`1:1` Square, `2400×2400 px`)
  * Gallery View 1 (Direct Overhead Top-Down Perspective): `vlx-dc-027-gallery-top.webp`
  * Gallery View 2 (Angled Perspective with Chiseled Edge Shadows): `vlx-dc-027-gallery-angle.webp`
  * Gallery View 3 (Macro Texture of White Calcite Vein & Honed Basin): `vlx-dc-027-gallery-vein.webp`
  * Gallery View 4 (Styled on Executive Desk with Fountain Pen and Watch): `vlx-dc-027-gallery-desk.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 28: Dune Textural Heavy Wool Throw & Cushions
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Dune Textural Heavy Wool Throw & Architectural Cushions
* **SKU:** `VLX-DC-028`
* **URL Slug:** `dune-textural-wool-throw-cushions`
* **Category:** Objects & Decor
* **Short Description:** A heavy tactile throw blanket hand-woven from un-dyed virgin Alpine wool accompanied by two architectural box-cushions.
* **Detailed Premium Description:** Hand-woven on traditional wooden shuttle looms in northern Italy, this textile ensemble brings tactile warmth to minimalist seating. Woven from 100% pure un-dyed Alpine virgin wool, the throw features a three-dimensional waffle-dune weave with generous hand-twisted fringe tassels. It is accompanied by two matching 50×50cm architectural box-cushions filled with cruelty-free European goose down and feather cores.

#### Product Information
* **Suggested Price:** ₹85,000 INR *(Provisional concept pricing for suite)*
* **Primary Material:** 100% Un-Dyed Virgin Alpine Wool, 90/10 Goose Down/Feather Fill
* **Finish:** Unwashed raw natural lanolin-rich wool; concealed YKK metal zippers
* **Colour:** Natural Oatmeal Sand / Heathered Warm Ecru
* **Architectural Dimensions:**
  * Width: 200 cm (Throw) / 50 cm (Cushions)
  * Depth: 160 cm (Throw) / 50 cm (Cushions)
  * Height: 2 cm (Throw) / 18 cm (Cushion loft)
  * Seat Height: 0 cm
* **Estimated Weight:** 4.2 kg (Ensemble) *[Provisional workshop estimate]*
* **Key Features:**
  * Un-dyed natural wool preserving natural stain-repelling lanolin oils
  * Substantial 750 gsm heavy-gauge weave offering soothing thermal drape
  * Cushion covers removable via hidden zipper placket for professional cleaning
  * Certified OEKO-TEX Standard 100 chemical-free production
* **Care Instructions:** Dry clean only. Fluff cushions daily to maintain down loft. Air wool throw outdoors in indirect shade to refresh fibers naturally.
* **Availability Status:** In Stock (Lead time: 1 to 2 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional — Showing softness, drape, and down cushion recovery.
* **3D GLB/GLTF Model:** Optional.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-dc-028-cover.webp` (`1:1` Square, `2400×2400 px`)
  * Gallery View 1 (Throw Draped Sculpturally over Aurelia Sofa): `vlx-dc-028-gallery-drape.webp`
  * Gallery View 2 (Folded Ensemble Showing Waffle Texture & Fringe): `vlx-dc-028-gallery-folded.webp`
  * Gallery View 3 (Macro Weave Density & Twisted Wool Fringe): `vlx-dc-028-gallery-macro.webp`
  * Gallery View 4 (Cushions Styled in Modern Minimalist Living Room): `vlx-dc-028-gallery-cushions.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

## Outdoor Creations

### Product 29: Ravello Teak & Rope Deep Lounge Sofa
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Ravello Teak & Perennials Rope Deep Lounge Sofa
* **SKU:** `VLX-OD-029`
* **URL Slug:** `ravello-teak-rope-lounge-sofa`
* **Category:** Outdoor
* **Short Description:** An outdoor deep lounge sofa in Grade-A sustainable Burmese teak with hand-woven weatherproof rope backrest and QuickDry cushions.
* **Detailed Premium Description:** Conceived for coastal cliffside terraces and pool pavilions, the Ravello Sofa brings salon luxury outdoors. Built from kiln-dried Grade-A teak rich in natural protective oils, the frame withstands intense UV, salt air, and rain. The backrest is hand-strung with marine-grade woven Italian polyolefin rope. The deep lounge cushions feature reticulated QuickDry foam cores that allow water to drain instantly, upholstered in bleach-cleanable Perennials outdoor performance fabric.

#### Product Information
* **Suggested Price:** ₹8,40,000 INR *(Provisional concept pricing)*
* **Primary Material:** Grade-A Sustainable Teak, Marine Polyolefin Rope, Perennials Acrylic Fabric
* **Finish:** Natural untreated teak (develops silver patina) or factory oiled; weatherproof rope
* **Colour:** Honey Gold Teak / Natural Sand Rope / Sandstone Weatherproof Canvas
* **Architectural Dimensions:**
  * Width: 250 cm
  * Depth: 105 cm
  * Height: 72 cm
  * Seat Height: 38 cm
* **Estimated Weight:** 86 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Grade-A teak containing high natural silica and oil content to resist rot, insects, and cracking
  * Reticulated open-cell QuickDry foam cores draining rain within minutes
  * UV-stabilized marine rope with 10-year fade and mildew resistance guarantee
  * 316 marine-grade stainless steel internal structural joinery hardware
* **Care Instructions:** Hose down frame with freshwater periodically to remove marine salt. Allow teak to age naturally to silver patina or apply golden teak oil annually. Machine wash cushion covers on cold delicate cycle.
* **Availability Status:** Made to Order (Lead time: 8 to 10 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `glb_3d` (Interactive 3D GLB Model Viewer)
* **Demonstration Video:** Recommended — Coastal terrace setting with wind through rope weave.
* **3D GLB/GLTF Model:** **Required** — Excellent for architectural terrace visualization.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-od-029-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Front Outdoor Elevation): `vlx-od-029-gallery-front.webp`
  * Gallery View 2 (Rear View Highlighting Woven Marine Rope Weave): `vlx-od-029-gallery-rope.webp`
  * Gallery View 3 (Teak Joinery & Outdoor Cushion Piping Macro): `vlx-od-029-gallery-joinery.webp`
  * Gallery View 4 (Terrace Setting Overlooking Ocean at Sunset): `vlx-od-029-gallery-terrace.webp`
  * 3D Binary Model: `vlx-od-029-model.glb`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] 3D GLB model uploaded and verified in canvas
  * [ ] Draft saved and verified via live preview
  * [ ] Published to showroom

---

### Product 30: Taormina Lava Stone Outdoor Dining Table
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Taormina Lava Stone & Powdercoated Aluminum Dining Table
* **SKU:** `VLX-OD-030`
* **URL Slug:** `taormina-lava-stone-dining-table`
* **Category:** Outdoor
* **Short Description:** A weatherproof outdoor dining table sculpted from volcanic Etna lava stone with a marine-grade aluminum frame.
* **Detailed Premium Description:** Engineered to endure extreme elements from alpine frost to coastal sun, the Taormina Dining Table features a solid top carved from Mount Etna volcanic basalt stone. Kiln-fired with a mineral-pigmented crackle glaze at 1,000°C, the stone surface becomes impervious to grease, wine, UV bleaching, and thermal shock. It rests upon an architectural trestle chassis welded from marine-grade extruded aluminum, finished in a textured powdercoat.

#### Product Information
* **Suggested Price:** ₹9,90,000 INR *(Provisional concept pricing)*
* **Primary Material:** Solid Volcanic Etna Basalt Lava Stone, Powdercoated Marine Aluminum
* **Finish:** 1,000°C ceramic crackle glaze top; AkzoNobel Interpon architectural powdercoat
* **Colour:** Glazed Mineral Sage Grey / Matte Charcoal Aluminum Base
* **Architectural Dimensions:**
  * Width: 240 cm
  * Depth: 110 cm
  * Height: 75 cm
  * Seat Height: 0 cm (Seats 8 to 10 guests)
* **Estimated Weight:** 175 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Kiln-fired volcanic lava stone top completely impervious to food oils, citrus, and wine
  * Rated for sub-zero freeze-thaw cycles without surface micro-cracking
  * 6063 marine-grade aluminum underchassis with stainless steel leveler feet
  * Accommodates up to 10 outdoor dining armchairs with generous legroom
* **Care Instructions:** Clean with damp cloth and gentle soap. Resistant to all common household cleaners. No winter storage or protective tarping required.
* **Availability Status:** Atelier Commission (Lead time: 8 to 10 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `video` (Showcase Video)
* **Demonstration Video:** **Highly Recommended** — Water beading demonstration across the glazed volcanic lava stone top.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-od-030-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Overhead Table Top Showing Mineral Crackle Glaze): `vlx-od-030-gallery-top.webp`
  * Gallery View 2 (Side Profile Angle Showing Aluminum Trestle Frame): `vlx-od-030-gallery-profile.webp`
  * Gallery View 3 (Glazed Lava Stone Surface & Edge Chamfer Macro): `vlx-od-030-gallery-stone.webp`
  * Gallery View 4 (Full Outdoor Dining Terrace Setup with Tableware): `vlx-od-030-gallery-terrace.webp`
  * Showcase Video: `vlx-od-030-showcase.mp4` & Poster: `vlx-od-030-video-poster.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Video file and poster uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 31: Positano Sculpted Teak Sunlounger
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Positano Sculpted Teak Sunlounger with Marine Cushion
* **SKU:** `VLX-OD-031`
* **URL Slug:** `positano-sculpted-teak-sunlounger`
* **Category:** Outdoor
* **Short Description:** A luxury pool lounger carved from solid Burmese teak featuring an articulated 5-position brass ratchet backrest and concealed wheels.
* **Detailed Premium Description:** Engineered for pool pavilions and yacht sundecks, the Positano Sunlounger combines nautical joinery and sun-worshipping comfort. Solid Grade-A teak slats are hand-beveled with expansion joints to accommodate weather fluctuations. An internal marine brass ratchet mechanism offers five distinct recline angles from upright reading to flat sunbathing. Two solid teak wheels with rubber treads are integrated into the rear chassis for easy terrace mobility.

#### Product Information
* **Suggested Price:** ₹3,20,000 INR *(Provisional concept pricing)*
* **Primary Material:** Grade-A Burmese Teak, Marine Cast Brass Ratchet, QuickDry Cushion
* **Finish:** Fine-sanded natural raw teak; salt-resistant cast brass
* **Colour:** Natural Golden Teak / Textured Chalk White Performance Cushion
* **Architectural Dimensions:**
  * Width: 205 cm
  * Depth: 76 cm
  * Height: 32 cm (Flat) to 88 cm (Full upright position)
  * Seat Height: 32 cm (Base) / 42 cm (With cushion)
* **Estimated Weight:** 38 kg *[Provisional workshop estimate]*
* **Key Features:**
  * Five-position backrest recline system cast in heavy corrosion-proof marine brass
  * Concealed rubber-tread teak wheels enabling effortless single-person terrace relocation
  * Includes full-length 10cm QuickDry foam cushion with magnetic securing straps
  * Integrated sliding teak drinks tray pulling out from side chassis
* **Care Instructions:** Hose down with fresh water. Wash cushion covers with mild soap. Allow teak to patina gracefully or apply teak sealer in spring.
* **Availability Status:** Made to Order (Lead time: 4 to 6 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `sequence_360` (360-Degree Turntable)
* **Demonstration Video:** Optional — Showing the 5-position ratchet adjustment and pull-out drinks tray.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** **Highly Recommended** — Shows the streamlined teak silhouette from flat to full recline.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-od-031-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Direct Side Recline Profile): `vlx-od-031-gallery-side.webp`
  * Gallery View 2 (Angled View Showing Integrated Teak Wheels & Tray): `vlx-od-031-gallery-wheels.webp`
  * Gallery View 3 (Cast Brass Ratchet Mechanism & Slat Joinery Macro): `vlx-od-031-gallery-brass.webp`
  * Gallery View 4 (Pair Positioned Beside Infinity Pool): `vlx-od-031-gallery-pool.webp`
  * 360 Turntable Frames: `vlx-od-031-frame-01.webp` through `vlx-od-031-frame-24.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and set as primary
  * [ ] 4 gallery photos uploaded
  * [ ] 360 sequence uploaded and verified
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

### Product 32: Cava Ceramic & Teak Outdoor Occasional Table Trio
* **Classification:** Fictional VILLEXA Original Concept Piece

#### Product Identity
* **Product Name:** Cava Ceramic & Teak Outdoor Occasional Table Trio
* **SKU:** `VLX-OD-032`
* **URL Slug:** `cava-ceramic-teak-outdoor-table-trio`
* **Category:** Outdoor
* **Short Description:** A set of three nesting outdoor occasional tables featuring handcrafted frost-proof ceramic tops and solid teak tripod plinths.
* **Detailed Premium Description:** Sold as a graduated nesting trio, the Cava Occasional Tables bring flexible architectural utility to outdoor lounge settings. Each table features a handcrafted circular ceramic top with glazed stone crackle finishes in earthy hues: Moss Green, Ochre Sand, and Basalt Charcoal. The tops rest upon three-legged tripod frames carved from solid Grade-A teak with mortise-and-tenon joinery, designed to nest together or scatter across an outdoor lounge grouping.

#### Product Information
* **Suggested Price:** ₹2,60,000 INR *(Provisional concept pricing for set of 3)*
* **Primary Material:** Frost-Proof Fired Glazed Ceramic, Solid Grade-A Burmese Teak
* **Finish:** Matte-gloss crackle glaze ceramic; natural raw teak tripod base
* **Colour:** Tonal Triad: Moss Olive Green, Ochre Sand, and Basalt Charcoal
* **Architectural Dimensions:**
  * Large Table: Diameter 75 cm × Height 42 cm
  * Medium Table: Diameter 58 cm × Height 36 cm
  * Small Table: Diameter 44 cm × Height 48 cm
  * Seat Height: 0 cm
* **Estimated Weight:** 32 kg (Combined set of 3) *[Provisional workshop estimate]*
* **Key Features:**
  * Fired at 1,250°C to guarantee complete frost and UV resistance in all climates
  * Organic nesting proportions allowing compact grouping or distributed occasional placement
  * Three-point tripod stance providing rock-solid stability on uneven outdoor terrace stone
  * Heavy ceramic tops resist blowing over in high coastal winds
* **Care Instructions:** Wipe ceramic surfaces with damp cloth. Rinse with water. Teak tripod legs can be left untreated to weather silver or oiled annually.
* **Availability Status:** Made to Order (Lead time: 4 to 6 weeks)

#### Media Requirements & Checklist
* **Preferred Primary Viewer Mode:** `gallery`
* **Demonstration Video:** Optional.
* **3D GLB/GLTF Model:** Recommended.
* **360° Sequence:** Optional.
* **Recommended Asset Filenames:**
  * Main Cover Image: `vlx-od-032-cover.webp` (`4:3`, `2400×1800 px`)
  * Gallery View 1 (Trio Arranged in Overlapping Nesting Cluster): `vlx-od-032-gallery-cluster.webp`
  * Gallery View 2 (Top Down Overhead View Showing 3 Ceramic Glazes): `vlx-od-032-gallery-top.webp`
  * Gallery View 3 (Glaze Craquelure Texture & Teak Joint Macro): `vlx-od-032-gallery-glaze.webp`
  * Gallery View 4 (Scattered Alongside Ravello Lounge Sofa on Terrace): `vlx-od-032-gallery-styling.webp`
* **Manual Media Upload Checklist:**
  * [ ] Cover image uploaded and designated as primary
  * [ ] 4 gallery photos uploaded
  * [ ] Draft saved and verified
  * [ ] Published to showroom

---

# 5. Final Showroom Launch Checklist

Before opening the showroom to clients and interior design partners, execute this final verification checklist:

### Category Setup Verification
* [ ] All 8 categories created with correct names and URL slugs.
* [ ] Category display order configured from 0 (Living Room) to 7 (Outdoor).
* [ ] Category cover images uploaded to provide visual landing headers.

### Product Data Verification
* [ ] Exactly 32 products entered (4 per category).
* [ ] All SKUs confirmed unique (from `VLX-LR-001` through `VLX-OD-032`).
* [ ] All URL slugs verified as lowercase hyphenated strings.
* [ ] Suggested prices entered in INR and formatted correctly.
* [ ] Materials, dimensions, and care instructions entered for every product.

### Media Quality Verification
* [ ] Each product has a primary cover image set (gold "Primary Card" badge active).
* [ ] Gallery images ordered logically from architectural silhouette to macro texture.
* [ ] Interactive viewers (3D GLB, 360 Turntables, and Videos) tested in the editor before publishing.
* [ ] All asset files follow consistent lowercase naming standards (`sku-view.webp`).

### Final Editorial Review
* [ ] Test each product in the public storefront via "Preview on Site".
* [ ] Test category filtering on the public Catalogue page (`/catalogue`).
* [ ] Test the global search modal for key terms (e.g., "velvet", "travertine", "walnut").
* [ ] Switch status to **Published to Showroom** on all 32 items.
