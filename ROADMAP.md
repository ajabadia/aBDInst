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

### 1. New Core Models
- [ ] **`Album`**: Title, Artist, Year, Cover Art, Format (Vinyl, CD...).
- [ ] **`Track`**: Song list.

### 2. The "Killer Feature" (Cross-Linking)
- [ ] **Relationship**: `Instrument <-> Track`. "This Gibson Les Paul was used on 'Whole Lotta Love'".
- [ ] **Polymorphic Showrooms**: A showroom can contain Instruments AND Albums mixed together.

---

## 🧠 Research & Best Practices (Ongoing)
- [ ] **UX Patterns**: Study "Digital Museum" kiosks (bitesize content, high contrast, storytelling).
- [ ] **Audio/Video**: Explore adding audio clips (instrument samples) or video (performances) to slides.
- [ ] **Performance**: Evaluate lazy-loading strategies for heavy media showrooms.
