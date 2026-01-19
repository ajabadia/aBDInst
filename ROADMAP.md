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
  - [ ] **Data Inheritance**: Musical context (instruments) added to a Master Release automatically propagates to all its versions.
  - [ ] **UI Unification**: Display global instrument associations even when viewing a specific local edition (Vinyl vs CD).

### 2. Musical Relationships System 🚧 IN PROGRESS
*Cross-linking instruments, artists, and albums.*

#### Phase 1: Artist/Band Management
- [ ] **`Artist` Model**: Name, bio, image, type (band/solo/group), founded year, genres.
- [ ] **Admin Panel**: CRUD for Artists (similar to metadata management).
- [ ] **Fix**: Restore access card to `/dashboard/admin/metadata` in admin dashboard.

- [ ] **Metadata Multi-Image Support**: Support multiple images/logos for ALL metadata types (Brands, Artists, Types, Decades).
  - [ ] **Primary Selector**: Admin/Editor UI to select the "Active" or "Primary" image/logo.
  - [ ] **Batch Import**: Pull all available images from Discogs/External APIs.
- [ ] **Catalog Analytics (Admin)**: Count instruments by ALL metadata categories (Brand, Type, Artist, and Decade).
  - [ ] **Stats Dashboard**: Visualize distribution and density of the collection.
  - [ ] **Dynamic Counts**: Show counts in filters and administrative lists.

#### Phase 2: N-M Relationships (Pivot Tables)
- [ ] **`InstrumentArtist`**: Link instruments to artists (e.g., "Kraftwerk used this Minimoog").
  - [ ] **Artist Metadata Enrichment**: Automatically fetch artist logos/images from Discogs API when creating relationships.
  - Fields: `instrumentId`, `artistId`, `notes`, `yearsUsed`, `isVerified`.
- [ ] **`InstrumentAlbum`**: Link instruments to albums (e.g., "This bass on 'Dark Side of the Moon'").
  - Fields: `instrumentId`, `albumId`, `notes`, `tracks[]`, `isVerified`.
- [ ] **`ArtistAlbum`**: Link artists to albums (many-to-many).
  - Fields: `artistId`, `albumId`, `role` (main/featured/producer).

#### Phase 3: UI for Associations
- [ ] **Instrument Detail Page**: Section "Used by Artists/Albums" with add/remove UI.
- [ ] **Album Detail Page**: Section "Instruments Used" with add/remove UI.
  - [ ] **AI Detection**: Use AI to detect instruments used in an album (structured JSON response).
  - [ ] **Relationship Propagation**: Automatically link identified instruments to the album's artists.
- [ ] **Artist Detail Page**: Show instruments and albums associated.
- [ ] **Catalog Filters**: "Show instruments used by Kraftwerk", "Albums with Minimoog".

#### Phase 4: Showroom Integration
- [ ] **Polymorphic Showrooms**: Mix instruments AND albums in same showroom ✅ DONE.
- [ ] **Relationship Display**: Show artist/album info in instrument slides.
- [ ] **Smart Slides**: Auto-generate "Used in [Album] by [Artist]" slides.

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
- [ ] **Unified Media Manager** (`@/lib/media/`)
  - **Concept**: Single centralized module for all image and asset operations (DRY).
  - **Coverage**: Apply to Instruments, Metadata (Artists/Brands), Showroom Slides, Avatars, Badges, and Music.
  - **Features**:
    - `mediaEngine.upload()`: Unified handler for Cloudinary/Local/S3.
    - `mediaEngine.optimize()`: Auto-resizing, WebP conversion, and SVG sanitization.
    - `MediaLibrary`: A "Gallery" component to reuse previously uploaded images across the app.
    - `PrimarySelector`: Reusable logic/UI for selecting the primary image in any collection.
    - `ExternalEnricher`: Standardized logic to pull images from Discogs, Spotify, or Web Scrapers.

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

- [ ] **Unified AI Service** (`@/lib/ai/`)
  - **Concept**: Centralize all AI-related logic (Prompts, Parsing, Retries, and JSON extraction).
  - **Coverage**: Magic Import (Instruments), AI Writer (Blog/Notes), Market Scraper, and Music Detection.
  - **Features**:
    - `aiEngine.generateJSON()`: Reusable logic to enforce structured outputs and handle sanitization.
    - `aiEngine.getDynamicPrompt()`: Unified retrieval from System Config.
    - `aiEngine.parseMarkdownJSON()`: Extract JSON from AI markdown blocks (fix common AI quirks).
    - `PromptVersioning`: Track and rollback prompt changes centrally.

### Benefits of DRY Refactoring:
- 🎯 Easier maintenance (fix once, apply everywhere)
- 🐛 Fewer bugs (less code = less surface area)
- 📚 Better documentation (one place to understand each pattern)
- ⚡ Faster development (reuse instead of rewrite)

---

## 🧠 Research & Best Practices (Ongoing)
- [ ] **UX Patterns**: Study "Digital Museum" kiosks (bitesize content, high contrast, storytelling).
- [ ] **Audio/Video**: Explore adding audio clips (instrument samples) or video (performances) to slides.
- [ ] **Performance**: Evaluate lazy-loading strategies for heavy media showrooms.

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
*   **Duplicate/Fork Showroom**: Allow users to duplicate their own showrooms or "Fork" public showrooms (if allowed) to remix them.
*   **Internal Tools**: "Assembly Chat" for curation discussions.

### 3. Gamification (Contests & Hall of Fame)
*   **Thematic Contests**: Monthly themes (e.g., "60s Guitars", "Prog Rock Vinyls").
*   **Submit Entry**: Allow users to submit an existing showroom (or specific items) to an active contest.
*   **Voting System**: Anti-spam voting, categories ("Rarest", "Best Condition").
*   **Hall of Fame**: Permanent archive of winning showrooms.
*   **Profile Trophies**: user-selectable "Main Badge" next to avatar (e.g., "Curator of the Month").

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
