# Smart Travel Assistant — Frontend Specification

## 1. Product Vision

An AI-powered travel planning tool where users explore a fullscreen interactive map, click any location, and converse with an AI agent to build a personalized itinerary. The experience is: **map as canvas, AI as guide**. Clean, dark, minimal — no visual clutter, no 3D, no gimmicks.

---

## 2. User Journey & Experience Map

| Step | Visual State | User Action | System Response |
|------|-------------|-------------|-----------------|
| **Entry** | Fullscreen static map with centered search bar "Where do you want to go?". Subtle parallax or gentle zoom. Dark overlay for readability. | User lands on page | Map tiles load. Search bar pulses gently. Background map slowly drifts (CSS animation on tiles). |
| **Explore** | Search bar collapses to top bar. Map fills full viewport. UI panels (nav bar top, chat floating bottom-right, POI labels on map) float over map. | User types a destination or pans/zooms map | Map smoothly flies to destination. POI markers appear. Chat panel shows welcome message. |
| **Interact** | User clicks a POI or map point. A location info card appears near the point. Chat panel expands showing AI greeting for that location. | User clicks map → Clicks "Plan this trip" in info card | Location info card opens with photo, name, description. Chat panel activates with context: "Tell me what you'd like to do in [location]." |
| **Feedback** | AI streams response token by token in chat panel. Suggested itinerary cards appear inline. | User types preferences, asks questions, refines plan | Streaming message animation. Tool calls shown as brief status pills. Itinerary preview cards render after planning completes. |
| **Complete** | A floating "View Itinerary" button appears in chat when a plan is ready. Clicking opens fullscreen itinerary page. | User clicks "View Itinerary" | Fullscreen itinerary page slides in from right (or fades). Map remains behind with a dim overlay. |

---

## 3. Z-Index & Layer Map

```
z-0:     Map tiles base layer (Leaflet tile pane)
z-10:    Map POI markers, vector layers, heatmap overlay
z-20:    Map UI controls (zoom buttons, attribution)
z-30:    Location info card (floating near clicked point)
z-40:    Search bar / top navigation bar
z-50:    Chat panel (floating bottom-right, collapsible)
z-60:    "View Itinerary" floating button
z-70:    Map overlay (dim bg when itinerary is open)
z-80:    Mobile bottom sheet (replaces chat on small screens)
z-100:   Fullscreen itinerary page
```

Every layer's z-index is intentional. Map interaction (pan/zoom/click) must pass through to z-0 through any transparent overlay above it (`pointer-events-none` on intermediate layers where appropriate).

---

## 4. Page Structure

### 4.1 Landing Page
- **Route:** `/` 
- **Size:** 100dvh × 100vw
- **Background:** Deep dark (`#0A0A0A`) with a static map screenshot or subtle pattern
- **Layout:** Centered flex column
- **Children:**
  - Hero area (vertical center):
    - Brand wordmark: "TravelAI" (or project name), text-4xl font-light tracking-wide text-white
    - Tagline: "Plan every journey with AI", text-sm text-white/50 mt-2
    - Search input: large pill input `w-[480px] max-w-[90vw] h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 text-white placeholder-white/30 text-sm outline-none focus:border-white/30 transition-colors`
    - Below search: popular destinations as small pill chips, clickable
  - Footer: thin text "AI-Powered Travel Platform", fixed bottom-8

### 4.2 Main App Page
- **Route:** `/app`
- **Size:** 100dvh × 100vw
- **Layout:** Fullscreen map with overlaid UI panels
- **Children:**
  - Map (fullscreen, z-0)
  - Top Navigation Bar (fixed top-0, z-40)
  - Chat Panel (fixed bottom-6 right-6, z-50)
  - Location Info Card (absolute, z-30, positioned near clicked map point)

### 4.3 Itinerary Page
- **Route:** `/itinerary/:id`
- **Size:** 100dvh × 100vw
- **Background:** `#0A0A0A` solid
- **Layout:** Scrollable vertical layout with day-by-day itinerary cards
- **Header:** Back button, "My Itinerary" title, export button (PDF/print)
- **Content:** Timeline-style day cards with activities

---

## 5. Layout Specification

### Top Navigation Bar
- Position: `fixed top-0 left-0 right-0 z-40`
- Height: 56px (h-14)
- Background: `bg-black/30 backdrop-blur-xl border-b border-white/5`
- Content (flex items-center justify-between px-4 md:px-8):
  - **Left:** Brand wordmark + hamburger menu (mobile only)
  - **Center:** Search bar (collapsed from landing) — `w-[240px] md:w-[360px] h-9 bg-white/5 border border-white/10 rounded-full px-4 text-xs text-white placeholder-white/20`
  - **Right:** Avatar/initials circle (for future user system) or settings icon

### Chat Panel
- Position: `fixed bottom-6 right-6 z-50`
- **Collapsed state:** Circular floating button `w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors` with a MessageCircle icon (lucide-react, h-6 w-6 text-white)
- **Expanded state:**
  - Width: 380px (w-[380px]), Max-height: 560px
  - Background: `bg-[#111] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl`
  - Header: "AI Travel Assistant" + minimize button (X icon)
  - Message area: scrollable, flex-1, padding p-4
  - Input area: p-4 border-t border-white/5
  - Transition: Framer Motion scale + fade (0.2s spring)

### Map Container
- `absolute inset-0 z-0`
- Leaflet MapContainer with `zoomControl: false` (custom zoom buttons in z-20)
- Attribution hidden or minimal

### Location Info Card
- Appears on map click
- Width: 320px
- Positioned near click coordinates, offset to not overlap cursor
- Background: `bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden`
- Contains: location photo (160px height), name, short description, "Plan this trip" button
- Animation: scale from 0.9 → 1.0, fade in (0.15s)
- Closes on: clicking outside, pressing Escape, clicking X

### Fullscreen Itinerary Page
- `fixed inset-0 z-100 bg-[#0A0A0A]`
- Animation: slide in from right (Framer Motion, 0.3s easeOut)
- Close: slide out to right or fade
- Header: sticky top-0, "My Itinerary" + back button + export button
- Content: max-w-3xl mx-auto px-6 py-8, scrollable

---

## 6. Visual Language

### Color Palette

```css
/* Neutrals — the entire palette */
--color-bg: #0A0A0A;         /* Page background */
--color-surface: #111111;    /* Card/panel background */
--color-surface-hover: #1A1A1A;
--color-border: rgba(255,255,255,0.1);
--color-border-hover: rgba(255,255,255,0.2);
--color-text-primary: #FFFFFF;
--color-text-secondary: rgba(255,255,255,0.5);
--color-text-tertiary: rgba(255,255,255,0.25);
--color-glass-bg: rgba(255,255,255,0.05);
--color-glass-border: rgba(255,255,255,0.08);
--color-accent: #FFFFFF;       /* Accent is white — no brand color */
--color-accent-hover: rgba(255,255,255,0.8);
--color-overlay: rgba(0,0,0,0.6);
```

### Typography

| Style | Font | Weight | Size | Line-Height | Letter-Spacing |
|-------|------|--------|------|-------------|----------------|
| Display H1 | Inter/sans-serif | 300 (light) | 3xl / 4xl | 1.1 | -0.02em |
| Section Title | Inter | 400 (regular) | lg | 1.3 | normal |
| Body | Inter | 400 | sm / base | 1.5 | normal |
| Small / Label | Inter | 400 | xs | 1.4 | normal |
| Mono / Data | JetBrains Mono / monospace | 400 | xs | 1.4 | normal |
| Button / CTA | Inter | 500 (medium) | sm | 1 | normal |

No serif, no decorative fonts. Clean, functional, readable.

### Design Tokens

```css
/* Reusable classes via Tailwind or CSS */
.glass-panel {
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-glass-border);
  border-radius: 12px;
}

.glass-panel-sm {
  background: var(--color-glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border);
  border-radius: 8px;
}

.btn-primary {
  background: var(--color-text-primary);
  color: var(--color-bg);
  border-radius: 9999px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.85; }
.btn-primary:active { transform: scale(0.97); }

.chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
```

### Iconography
- Use **lucide-react** throughout (already installed)
- Stroke width: 1.5px (default)
- Size: 16-20px for inline, 24px for standalone
- Color: inherit or `text-white/50`

---

## 7. Interaction Mechanics

### Feature 1: Map click → Location Info
```
Event: map click (Leaflet MapEventsHandler)
Tracking: latlng from event → reverse geocode (Nominatim or custom API)
Effect: 
  1. Show loading state on cursor (brief pulse)
  2. Fetch location name, photo, description
  3. Render LocationInfoCard at click position
  4. Card appears with scale-in fade animation (0.15s)
Fallback: If geocode fails, show "Unknown location" card
Cleanup: Click outside → card closes. Escape key → card closes.
```

### Feature 2: Chat Panel toggle
```
Event: click floating button / click X / swipe (mobile)
Tracking: useState for expanded/collapsed
Effect:
  - Expand: 
    - Button morphs from circle into panel (Framer Motion layoutAnimation)
    - Background fades from transparent to glass
    - Messages scroll to bottom
  - Collapse:
    - Panel shrinks back to circle button
    - Input clears
Animation: Framer Motion spring, stiffness 400, damping 30
```

### Feature 3: AI message streaming
```
Event: WebSocket receives "agent_message" type
Tracking: ChatPanel reads messages from state array; last message appends tokens
Effect:
  1. Show typing indicator (3 dots bounce animation) while waiting for first token
  2. On first token: remove indicator, render message bubble with streaming text
  3. Each token appends to message.content (useRef to avoid re-render on every token)
  4. If tool_call received: show brief pill "🔍 Searching flights..." etc.
  5. If itinerary received: render itinerary preview card as inline component
Cleanup: Scroll to bottom on each new message
```

### Feature 4: Itinerary page open/close
```
Event: click "View Itinerary" button in chat
Effect:
  1. Map overlay fades in (bg-black/60, 0.3s)
  2. Itinerary page slides in from right (translateX 100% → 0, 0.35s easeOut)
  3. Close: click back button → slide out right → remove overlay
Prevention: Prevent map interaction while itinerary is open (pointer-events-none on map wrapper)
```

---

## 8. Animation System

### Keyframes (CSS, defined in tailwind config or index.css)

```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

@keyframes slideInRight {
  0% { transform: translateX(100%); }
  100% { transform: translateX(0); }
}
```

### Stagger Table

| Element | Animation | Duration | Delay | Easing |
|---------|-----------|----------|-------|--------|
| Landing search bar | fadeIn + slideUp | 0.6s | 0.3s | easeOut |
| Landing popular chips | fadeIn | 0.4s | 0.6s | easeOut (stagger 50ms) |
| Chat panel expand | scale + fade | 0.25s | 0s | spring(400,30) |
| Location card appear | scale(0.9→1) + fade | 0.15s | 0s | easeOut |
| AI message bubble | slideUp | 0.2s | 0s | easeOut |
| Itinerary slide in | slideInRight | 0.35s | 0s | cubic-bezier(0.16,1,0.3,1) |
| Map overlay fade | fadeIn | 0.3s | 0s | ease |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Framer Motion Usage
- Use `motion.div` for panels, cards, and page transitions (not CSS keyframes) — it handles mount/unmount animations better
- `AnimatePresence` for LocationInfoCard, ChatPanel expand, Itinerary page
- Spring transitions for UI elements, tween for page transitions
- `layoutAnimation` on ChatPanel for smooth expand/collapse

---

## 9. Responsive Strategy

| Element | Mobile (<768px) | Desktop (≥768px) |
|---------|----------------|-------------------|
| Map | Full viewport | Full viewport |
| Top nav | Compact: logo only + hamburger | Full: logo + search + avatar |
| Search bar (landing) | w-[90vw] | w-[480px] |
| Chat panel | Bottom sheet (w-full, h-[50vh], rounded-t-2xl) from bottom | Floating panel (w-[380px], max-h-[560px]) bottom-right |
| Chat toggle | Fixed bottom-4, centered | Fixed bottom-6 right-6 |
| Location card | Drawer from bottom, w-full | Floating card, 320px |
| Itinerary page | Fullscreen, standard scroll | Fullscreen, centered max-w-3xl |
| Map zoom controls | Hidden (use pinch) | Show custom zoom buttons |

Mobile chat opens as a bottom sheet (not floating panel) to maximize screen space. On mobile, the map occupies the upper portion and chat slides up from bottom.

---

## 10. Resource & Asset Inventory

| Asset | Type | Source | Loading |
|-------|------|--------|---------|
| Map tiles | Raster tiles | OpenStreetMap (via Leaflet default) | Lazy (tile loading is built-in) |
| Map markers | SVG/DivIcon | Custom styled with Tailwind | Inline |
| Location photos | WebP | Unsplash / Pexels API or user upload | Lazy with blur placeholder |
| Font: Inter | Google Fonts | `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap` | Preload |
| Font: JetBrains Mono | Google Fonts | `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap` | Preload (optional, fallback to monospace) |

No heavy assets. No video. No 3D models. Keep initial JS bundle under 150KB gzip.

---

## 11. Component Tree

```
<App>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<MainApp />} />
      <Route path="/itinerary/:id" element={<ItineraryPage />} />
    </Routes>
  </BrowserRouter>
</App>

<LandingPage>
  <SearchHero>
    <BrandWordmark />
    <SearchInput onSearch={→ navigate('/app')} />
    <PopularDestinations chips={[...]} />
  </SearchHero>
</LandingPage>

<MainApp>
  <MapContainer>                  // Fullscreen Leaflet map
    <MapEventsHandler />          // Handles clicks, zooms
    <POIMarkers />                // Renders markers from data
    <LocationInfoCard />          // Absolute positioned on click
  </MapContainer>
  <TopNavBar>                     // Fixed top
    <BrandLogo />
    <SearchInput collapsed />
    <UserMenu />
  </TopNavBar>
  <ChatPanel>                     // Fixed bottom-right
    <ChatToggle />                // Floating circle button
    <ChatWindow>                  // Expanded panel
      <ChatHeader />
      <MessageList>
        <MessageBubble streaming? />
        <ItineraryPreviewCard />
      </MessageList>
      <ChatInput />
    </ChatWindow>
  </ChatPanel>
  <FloatingItineraryBtn />        // Appears when itinerary is ready
  <MapOverlay />                  // Dims map when itinerary open
</MainApp>

<ItineraryPage>
  <ItineraryHeader>
    <BackButton />
    <Title>My Itinerary</Title>
    <ExportButton />
  </ItineraryHeader>
  <DayCard key={day}>             // One per day
    <DayHeader date, title />
    <ActivityCard key={time}>     // One per activity
      <Time />
      <Place />
      <Description />
      <Tips />
    </ActivityCard>
  </DayCard>
</ItineraryPage>
```

---

## 12. Data Flow

### WebSocket Message Protocol

```
User sends: { type: "user_message", content: "..." }
Backend sends:
  { type: "agent_message", content: "streaming text..." }  // Token-by-token
  { type: "tool_call", tool: "search_flights", status: "running" }
  { type: "tool_result", tool: "search_flights", data: {...} }
  { type: "itinerary", data: ItineraryData }
  { type: "error", message: "..." }
```

### State Management
- **React Context** for WebSocket connection state + messages array
- **Zustand** (recommended, not yet installed) for itinerary data if it gets complex, or just useState
- Messages stored as `ChatMessage[]` in context

### Message Type (TypeScript)

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  itinerary?: ItineraryData;
}

interface ItineraryDay {
  date: string;
  title: string;
  activities: {
    time: string;
    place: string;
    description: string;
    tips?: string;
  }[];
}

interface ItineraryData {
  destination: string;
  days: ItineraryDay[];
}
```

---

## 13. Performance & Accessibility Checklist

- [ ] Semantic HTML: `<main>`, `<nav>`, `<section>`, `<button>`, `<h1>`-`<h3>`
- [ ] prefers-reduced-motion: full override in CSS
- [ ] RAF and timer cleanup on unmount (chat polling, animation frames)
- [ ] 100dvh for mobile full-screen
- [ ] Color contrast: text/primary on bg must pass WCAG AA (white on #0A0A0A = 18.5:1 ✅)
- [ ] Map accessible fallback: if JS disabled, show static image
- [ ] Keyboard navigation: Tab through nav, search, chat; Escape to close cards/panels
- [ ] Focus management: trap focus in chat panel when expanded; return on close
- [ ] Loading states: skeleton for location card, typing indicator for chat
- [ ] Font-display: swap for both Inter and JetBrains Mono
- [ ] Touch targets: all buttons ≥44px
- [ ] Bundle budget: initial JS <150KB gzip, no heavy dependencies beyond Leaflet + React + Framer Motion

---

## 14. Route Design

| Route | Page | Notes |
|-------|------|-------|
| `/` | LandingPage | Public, search-centered |
| `/app` | MainApp | Requires no auth for MVP |
| `/itinerary/:id` | ItineraryPage | Fullscreen, accessible via link share |

Use `react-router-dom` (already installed). Implement as:
```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/app" element={<MainApp />} />
    <Route path="/itinerary/:id" element={<ItineraryPage />} />
  </Routes>
</BrowserRouter>
```

---

## 15. Implementation Order

### Phase 1: Route + Layout
1. Set up BrowserRouter with 3 routes
2. Convert current App.tsx to routing-based
3. Build MapContainer wrapper (move Map.tsx into fullscreen layout)
4. Build TopNavBar component

### Phase 2: Chat Panel
5. Build ChatPanel with expand/collapse animation (Framer Motion)
6. Integrate WebSocket hook with ChatPanel
7. Implement message list + streaming text display
8. Wire send message → WebSocket

### Phase 3: Map Interactions
9. LocationInfoCard on map click
10. POI markers
11. Click → Chat context passing (selected location → AI)

### Phase 4: Itinerary
12. ItineraryPreviewCard (inline in chat)
13. Fullscreen ItineraryPage
14. Export functionality (print styles)

### Phase 5: Polish
15. LandingPage redesign
16. Responsive mobile adaptations
17. Accessibility pass
