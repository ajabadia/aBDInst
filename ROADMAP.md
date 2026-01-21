# Instrument Collector - Project Roadmap

## 🚀 Current Status: Showroom V2 (Completed)
- **Features**: Custom Cover Images, Granular Privacy/Visibility (Draft, Private, Public, Unlisted), Kiosk Mode Toggle.
- **Tech**: Next.js 14 Server Actions, MongoDB Mongoose, TypeScript.

---

## 📅 Short-Term: Showroom V3 - Phase 1 (The Slide Engine)
*Goal: Transform static single-image items into dynamic multi-slide exhibits.*

### 1. Data Model Evolution
- [ ] **Update `IShowroomItem`**: Add `slides: ISlide[]` array.
    ```typescript
    interface ISlide {
        id: string;
        type: 'image' | 'text' | 'specs_grid';
        content: string; // URL or Text
        caption?: string;
    }
    ```
- [ ] **Migration Strategy**: Use existing `collectionId.images[0]` as fallback if `slides` is empty.

### 2. Editor & UX
- [ ] **Slide Editor**: UI to add/remove/order slides for a specific instrument in the showroom.
- [ ] **"Magic Import 1.0"**: When adding an instrument, optionally auto-generate:
    - Slide 1: Main Photo.
    - Slide 2: Placard Text (if exists).

### 3. Public View
- [ ] **Carousel/Slider**: Replace static image card with a mini-carousel in the grid (or just on hover?).
- [ ] **QR Code Generation**: Generate a unique QR code for each showroom to allow physical kiosks/visitors to scan and jump directly to the digital version.
- [ ] **Kiosk Upgrade**: Clicking "Modo Kiosko" cycles through ALL slides of ALL instruments automatically.

---

## 🔭 Mid-Term: Showroom V3 - Phase 2 (Digital Museum)
*Goal: Structure and Storytelling.*

### 1. Hierarchy
- [ ] **Rooms/Sections**: `Showroom -> Room (e.g., "The 70s") -> Items`.
- [ ] **Curatorial Cards**: Items that are *not* instruments, but text/posters describing the section.

### 2. Advanced Editor
- [ ] **Drag & Drop**: Reorder items and slides visually.
- [ ] **Layouts**: Choose slide layouts (Hero, Split, Grid).

---

## 🔮 Long-Term: Domain Expansion (Music Collection)
*Goal: Link Instruments to the Music they created.*

### 1. New Core Models ✅ COMPLETED
- [x] **`MusicAlbum`**: Title, Artist, Year, Cover Art, Format (Vinyl, CD...).
- [x] **`UserMusicCollection`**: User-specific music collection with condition, notes, etc.
- [x] **API Integration**: Discogs and Spotify for album import.
- [x] **Smart Caching**: Reuse albums across users to reduce API calls.
- [ ] **Master Release Architecture**: Implement "Supra-Albums" (similar to Discogs Master Release) to group multiple editions/versions.
  - [x] **Data Inheritance**: Musical context (instruments) added to a Master Release automatically propagates to all its versions.
  - [x] **UI Unification**: Display global instrument associations even when viewing a specific local edition (Vinyl vs CD).

### 2. Musical Relationships System 🚧 IN PROGRESS
*Cross-linking instruments, artists, and albums.*

#### Phase 1: Artist/Band Management
- [ ] **`Artist` Model**: Name, bio, image, type (band/solo/group), founded year, genres.
- [ ] **Admin Panel**: CRUD for Artists (similar to metadata management).
- [ ] **Fix**: Restore access card to `/dashboard/admin/metadata` in admin dashboard.

- [x] **Metadata Multi-Image Support**: Support multiple images/logos for ALL metadata types (Brands, Artists, Types, Decades).
  - [x] **Primary Selector**: Admin/Editor UI to select the "Active" or "Primary" image/logo.
  - [x] **Batch Import**: Pull all available images from Discogs/External APIs.
- [ ] **Catalog Analytics (Admin)**: Count instruments by ALL metadata categories (Brand, Type, Artist, and Decade).
  - [ ] **Stats Dashboard**: Visualize distribution and density of the collection.
  - [ ] **Dynamic Counts**: Show counts in filters and administrative lists.
        4. **"Silent" Deep Enrichment**: Automatically fetch and persist missing specs when a user views an instrument (Lazy Enrichment).
        5. **Specs Pro UX Refinement**: 
            - Relocate the manual enrichment trigger from "Market" to "Specifications" to better align with user mental models.
            - Enhance `MagicImporter` with clear labeling and structured guidance for "Specs Pro" mode, distinguishing it from general AI analysis.
        6. **Automated Sync (Cron Jobs)**:
#### Phase 2: N-M Relationships (Pivot Tables)
- [ ] **`InstrumentArtist`**: Link instruments to artists (e.g., "Kraftwerk used this Minimoog").
  - Fields: `instrumentId`, `artistId`, `notes`, `yearsUsed`, `isVerified`.
- [ ] **`InstrumentAlbum`**: Link instruments to albums (e.g., "This bass on 'Dark Side of the Moon'").
  - Fields: `instrumentId`, `albumId`, `notes`, `tracks[]`, `isVerified`.
- [ ] **`ArtistAlbum`**: Link artists to albums (many-to-many).
  - Fields: `artistId`, `albumId`, `role` (main/featured/producer).

#### Phase 3: UI for Associations
- [ ] **Instrument Detail Page**: Section "Used by Artists/Albums" with add/remove UI.
- [ ] **Album Detail Page**: Section "Instruments Used" with add/remove UI.
  - [ ] **AI Detection**: Use AI to detect instruments used in an album (structured JSON response).
  - [ ] **Ghost Instrument Creation**: If an detected instrument doesn't exist, auto-create a "Ghost" record with basic AI-extracted data (Brand, Model, Type). 
    - **Status**: Must be set to `pending` so admins/editors can review and complete it later.
  - [ ] **Relationship Propagation**: Automatically link identified instruments to the album's artists.

#### Phase 3: Editor Integration (DRY Module)
- [x] **Unified Association Manager**: Reusable component to search/add/create Artists and Albums.
  - **Usage**: Integrate into `InstrumentEditor` (`/instruments/[id]/edit`).
  - **Features**:
    - Live Search (Spotify/Discogs/Local) ✅.
    - Quick "Add New" modal (with Discogs auto-enrichment) ✅.
    - "Ghost Mode" support for creation on the fly ✅.
    - **Note**: Ensure artists/albums created here are properly registered in the main catalog (DRY philosophy) ✅.
- [x] **Artist Detail Page**: Show instruments and albums associated ✅.
- [ ] **Catalog Filters**: "Show instruments used by Kraftwerk", "Albums with Minimoog".
- [x] **Bug Investigation**: Review "Musical Context" selector.
  - **Issue**: Some existing artists in the catalog are not appearing in the search results.
  - **Resolution**: Code logic is correct. Missing artists were due to missing database entries or incorrect `type`.

#### Phase 6: Metadata Enrichment & Catalog Pages
- [ ] **Rich Metadata Profiles**: Create dedicated landing pages for Artists, Decades, Types, and Brands.
- [ ] **Data Enrichment**: Fetch and display historical data, images/logos, and biographies for these entities.
- [ ] **Public Exposure**: Design a strategy to make these profiles public to create a "Wikipedia of Gear".
- [ ] **Catalog Statistics**:
  - [ ] Global/Specific item counts.
  - [ ] Distribution by Brand/Type.
  - [ ] Correlation between Artists and Decades.
- [ ] **Association Grids**: Show a visual grid of all instruments and albums linked to the specific metadata entity.

### 3. Advanced Features
- [ ] **Verification System**: Mark relationships as "verified" (admin) vs "user-submitted".
- [ ] **Ownership Indicator**: Show if you own the album/instrument in your collection.
- [ ] **Timeline View**: Chronological view of artist's instruments over the years.
- [ ] **Discovery**: "Similar Artists", "Albums with similar instruments".

---

## 🔧 Code Quality & DRY Refactoring (Technical Debt)
*Goal: Eliminate code duplication and centralize common patterns.*

### Completed DRY Initiatives ✅
- [x] **Music Enrichment Module** (`@/lib/music/enrichment.ts`)
  - Centralized album creation/caching logic
  - Eliminated 60+ lines of duplicated code
  - Single source of truth for Discogs/Spotify integration

### Pending DRY Refactoring 🚧
- [x] **Unified Media Manager**
  - **Status**: Implemented in `@/lib/media/MediaManager.ts` and `@/components/media/MediaLibrary.tsx` ✅
  - **Features**:
    - Centralized `Media` model for all uploads.
    - Reusable `MediaLibrary` gallery component.
    - Automatic registration of uploads from all sources.

- [ ] **Unified PDF Generation Module** (`@/lib/pdf/`)
  - **Concept**: Centralize PDF creation using `jsPDF` or `React-PDF`.
  - **Coverage**: Instrument Spec Sheets, Collection Reports, and QR Labels.
  - **Features**:
    - Reusable templates and components for printable documents.
    - Unified styling (Fonts, Colors, Branding).
    - Handle both client-side and server-side PDF generation.

- [ ] **Form Validation Module** (`@/lib/validation/`)
  - Extract common validation patterns
  - Reusable schemas for instruments, collections, showrooms
  - Centralize error message formatting

- [ ] **API Response Helpers** (`@/lib/api/response.ts`)
  - Standardize success/error response format
  - Currently inconsistent across server actions
  - Create `apiSuccess(data)`, `apiError(message)` helpers

- [ ] **Database Query Helpers** (`@/lib/db/queries.ts`)
  - Common patterns like pagination, sorting, filtering
  - Reusable across instruments, music, showrooms

- [ ] **Authentication Guards** (`@/lib/auth/guards.ts`)
  - Centralize role-based access control
  - Currently duplicated in multiple server actions

- [x] **Unified AI Service** (`@/actions/ai.ts`) ✅
  - **Status**: Centralized Service active using Gemini 2.0 Flash.
  - **Capabilities**:
    - `analyzeInstrumentImage`: Vision analysis for identification.
    - `analyzeInstrumentText`: Text-based appraisal.
    - `analyzeInstrumentUrl`: Smart scraping with fallback to AI inference.
    - `generateBlogContent`: AI Writer for content generation.
    - `getMarketInsight`: Financial sentiment analysis.
  - **Integration**: Used in Magic Importer, Scraper, and Blog.

### Benefits of DRY Refactoring:
- 🎯 Easier maintenance (fix once, apply everywhere)
- 🐛 Fewer bugs (less code = less surface area)
- 📚 Better documentation (one place to understand each pattern)
- ⚡ Faster development (reuse instead of rewrite)

---

- [ ] **Market Intelligence & Data Enrichment (V4)**:
    - **Goal**: Implement a unified engine to enrich the catalog using official APIs (Reverb, eBay, Mercado Libre, Synthesizer-API) and manufacturer CDNs.
    - **Consolidated API Sources**:
        - **Reverb API (Global Primary)**: Full category coverage (Synths, Drum Machines, Samplers, Interfaces, Pedals). 10k/day rate limit.
        - **eBay Browse API**: Professional listings and high-res imagery via standardized category IDs.
        - **Mercado Libre API**: Essential for Spanish (and LATAM) market context.
        - **Synthesizer-API**: Technical specs for 800+ models with Cloudinary multi-res images.
        - **Manufacturer CDNs**: Automated asset discovery for **Roland, Korg, Moog, Elektron, Akai, Yamaha**.
    - **Architecture & Implementation Strategy**:
        1. **Unified Enrichment Service**: Implement `enrichInstrumentData(type, brand, model)` to aggregate data from all sources in parallel.
        2. **Multi-Category Mapping**: Logic to map internal types to specific platform categories.
        3. **Instrument-Level Caching**: Centralized `marketValue` and technical spec snapshots with a 12h-24h TTL stored in the `Instrument` model.
        4. **Specs Pro Refinement**: 
            - Move manual enrichment trigger to the **Especificaciones Técnicas** tab.
            - Enhance **MagicImporter** UI with specific instructions for "Specs Pro" mode.
        5. **Automated Sync (Cron)**: 
            - Weekly full-catalog refresh for technical metadata.
            - Daily market price analysis and history storage in `PriceHistory`.
        6. **High-Resolution Media Pipeline**: Automated prioritization of Official > API > Marketplace imagery.
- [ ] **Market Dashboard**: Visualize price trends, rarity index, and platform comparisons across all equipment categories.
- [ ] **UX Patterns**: Study "Digital Museum" kiosks (bitesize content, high contrast, storytelling).
- [ ] **Audio/Video**: Explore adding audio clips (instrument samples) or video (performances) to slides.
- [ ] **Performance**: Evaluate lazy-loading strategies for every heavy media showrooms.

---

## 🔔 Phase 5: Notification & Communication System
*Goal: Keep users informed and engaged via multiple channels.*

### 1. Email Infrastructure 🚧 IN PROGRESS
- [x] **SMTP Configuration**: `SmtpSettingsForm` for configuring distinct channels (Transactional, Alerts, Marketing).
- [x] **Template Engine**: `EmailTemplatesManager` for editing HTML templates directly in the dashboard.
- [ ] **Alerts & Triggers**:
  - **Price Alerts**: Notify when a watched instrument drops in price (Reverb/eBay integration).
  - **System Errors**: Auto-email admins on critical server failures (500 errors).
  - **Maintenance Reminders**: Weekly summary of instruments needing restringing or service.

### 2. In-App Notifications
- [ ] **Notification Center**: Bell icon with unread count.
- [ ] **Activity Feed**: "User X liked your showroom", "New item added to collection you follow".

---

## 💰 Phase 6: Finance & Asset Management
*Goal: Turn the collection into a managed asset portfolio.*

### 1. Valuation & Insurance
- [ ] **Depreciation/Appreciation Curves**: Visualize value trends over time (Linear, Declining Balance).
- [x] **Insurance Management** (`Insurance` model):
  - [x] **Data Model**: Policies, Coverage, Expiration.
  - [ ] **UI**: dedicated Insurance dashboard tab.
  - **Claims Assistant**: Generate a "Loss Report" PDF with photos and values for insurers.
- [x] **Price Alerts** (`PriceAlert` model): Logic to track target prices.
- [ ] **Total Portfolio Value**: Real-time dashboard of total collection equity based on current market data.

### 2. Compliance & Verification (Blockchain) 🔮
*Concept: Immutable proof of ownership and authenticity.*
- [ ] **Provenance Tree**: Digital genealogy tracking previous owners.
- [ ] **Ownership Certificates (NFTs)**:
  - **Minting**: Generate an immutable record on a Layer-2 network (Polygon/Optimism) for high-value items.
  - **Transfer**: Securely transfer digital ownership when physically selling the instrument.
- [ ] **Indicia & UBO Scanning**: (Compliance specific) Tools to verify Ultimate Beneficial Owners for high-value transactions.


---

## 💡 Strategic Backlog & Feature Sandbox (To Review)
*Concepts for future evaluation and design.*

### 1. The "Curator" Experience (Showroom Evolution)
*   **Concept**: Shift from "Inventory/Warehouse" to "Gallery/Art".
*   **Micro-Stories (The Slide Engine V2)**:
    *   Treat each item as a "Container of Scenes":
        *   *Scene 1*: General Photo + Intro Voiceover.
        *   *Scene 2*: Technical Detail (Pickups/Labels) + Text.
        *   *Scene 3*: Context (Photo of the album where it was used).
*   **Audio Guides & Voiceovers**:
    *   Integrated recorder (browser-based) or file upload to user's storage (Cloudinary/Drive).
    *   **Timeline Sync**: User defines duration per slide (e.g., "Intro lasts 10s").
*   **Dynamic Layouts**: Templates for "Grid", "Timeline", or "Museum Wall" styles.
*   **Connected Items**: "See Related" button inside a slide (e.g., jump from Instrument to Album).

### 2. Social & Collaboration (Exposiciones Compartidas & Préstamos)
*   **Virtual Loans**:
    *   **Request Flow**: Define "Missing Pieces" (e.g., "Need a '62 Precision Bass") -> Search available items -> Request Loan.
    *   **Attribution**: "Lent by [User]" label and dynamic watermarking for borrowed items.
    *   **Catalog Placeholders**: Use "Master Catalog Records" as educational references if the item is missing.
*   **Shared Showrooms**: "Curator in Chief" invites collaborators.
*   **Duplicate/Fork Showroom**: Allow users to duplicate their own showrooms or "Fork" public showrooms.
*   **Internal Tools**: "Assembly Chat" for curation discussions.

### 3. Gamification & Community 🚧 IN PROGRESS
*   **Thematic Contests** (`Exhibition` models):
    *   [x] **Models**: `Exhibition`, `ExhibitionSubmission`, `ExhibitionVote`.
    *   [ ] **UI**: Contest listing and submission flow.
*   **Badges System** (`Badge` models):
    *   [x] **Infrastructure**: `Badge`, `UserBadge` models and `BadgeManager` UI.
    *   [x] **Seed Script**: `seedBadges.ts`.
    *   [ ] **Triggers**: Auto-award badges based on activity.
*   **Blog/Content**:
    *   [x] **Models**: `Article`, `FeaturedContent`, `Comment`.
    *   [ ] **Public Blog**: View for curated content.

### 4. Technical & UX Refinements
*   **Autoplay Mode (TV Style)**: "Play All" button that cycles through slides and audio automatically.
*   **Performance**: Aggressive pre-fetching of next slides/audio.
*   **Accessibility**: Auto-transcripts for audio guides.
*   **Image Protection**: Watermarking for High-Res assets.

### 5. Proposed Data Architecture (V3 Advanced)
*   `Showroom_Items`: Add `RelationshipType` (Owned / Loaned / Reference).
*   `Loans` Collection: `RequesterID`, `OwnerID`, `ItemID`, `Status` (Pending/Accepted).
*   `Slides`: `AudioURL`, `DurationSeconds`, `CrossLinkID`.

---

## 🌩 Phase X: Enrichment & Blue Sky (Long Term)
*Advanced concepts to explore if the project scales.*

### 1. Technical Immersion
*   **Signal Chain Builder**: Draw virtual "cables" connecting instruments to amps/pedals to explain the sound.
*   **Spectrograms**: Visual "Audio Fingerprints" for rare vinyls to demonstrate condition/quality.

### 2. Social Micro-Economy
*   **Curator Reputation**: XP system based on content quality (likes/shares), not just quantity.
*   **Exchange Market**: "Wanted for Exhibition" board (e.g., "Need a Moog '70 for my Prog-Rock gallery").
*   **Exhibition Passport**: Digital stamp book for users who complete full audio-guide tours.

### 3. Data Insights
*   **Rarity Charts**: "You own 5% of all 1960s Spanish Jazz records".
*   **Provenance Tree**: Digital genealogy tracking previous owners of specific instruments within the platform.

### 4. Advanced Tech (AI & AR)
*   **AI Curator**: Auto-generate historical descriptions for catalog items (GPT-4o).
*   **AI Audio Polish**: Noise reduction for user-recorded voiceovers.
*   **Strategic Slide Editing**:
    - **Timing & Auto-play**: Set per-slide duration and transitions.
    - **Media Mixing**: Overlay voiceovers (locuciones) and background music/SFX on slides.
    - **Image Library**: Select images from existing collection/gallery instead of forced re-upload.
*   **Multimedia**: Audio samples (instrument sounds, album tracks) and Video reviews/clips.
*   **Publication Scheduling**: Set Start/End dates for exhibition visibility (Immediate/Indefinite by default).
*   **Catalog Integration**: Direct deep-links from an exhibit to the official technical catalog entry.
*   **WebAR**: "Place this instrument in your room" using mobile camera.
*   **"Near Me" Map**: Geolocation for local collector meetups/exhibitions.

### 5. Events & Live
*   **Digital Vernissages**: Scheduled "Premieres" for new showrooms with live chat/twitch-style interaction.
*   **Verified Badges**: Manual verification service for high-value collections.
