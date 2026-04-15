# PSL Pulse — Complete UI/UX Design Brief
## For New UI Designer — Full System Specification

---

## 📋 TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Design Philosophy](#design-philosophy)
3. [Complete Color System](#complete-color-system)
4. [Typography & Fonts](#typography--fonts)
5. [Layout & Spacing System](#layout--spacing-system)
6. [Component Library](#component-library)
7. [Page Structure & Navigation](#page-structure--navigation)
8. [Animations & Motion](#animations--motion)
9. [Content & Copy](#content--copy)
10. [Responsive Design](#responsive-design)
11. [Accessibility Guidelines](#accessibility-guidelines)

---

## PROJECT OVERVIEW

### What is PSL Pulse?
**PSL Pulse** is a blockchain-powered fan engagement platform for PSL 2026 cricket built on WireFluid blockchain. It allows fans to:
- **Stake WIRE tokens** into Impact Pools (Grassroots, Player Welfare, Fan Access, Infinity Legacy)
- **Tip players directly** for permanent on-chain records
- **Buy NFT tickets** for digital match ownership
- **Earn impact badges** as collectible NFTs
- **See their names on the Infinity Wall** — a real-time on-chain leaderboard

### Tagline
**"8 Teams. One Infinity Legacy."**

### Core Values
- Transparency & auditability (blockchain-native)
- Real-time engagement
- Community-driven impact
- Inclusive PSL expansion (all 8 teams treated equally)

---

## DESIGN PHILOSOPHY

### The "KittyPaws Aesthetic"

This is **not** a generic bright utility UI. The design is intentionally:

#### 1. **Deep, Layered, and Luxurious**
- Base color: **#0a0a1a** (deep navy/black with slight purple tint)
- Creates an "intimate" feeling, not corporate or sterile
- Evokes premium, exclusive experience
- Perfect for dark/night viewing (matches cricket)

#### 2. **Glassmorphism — The Signature Visual**
- All cards have **semi-transparent frosted glass effect**:
  - Background: `rgba(255,255,255,0.05)` (5% white opacity)
  - Border: `rgba(255,255,255,0.10)` (10% white opacity)
  - Blur: `backdrop-filter: blur(12px)`
- Creates **depth and layering** — not flat
- Gives UI a "floating" quality
- Every interactive element feels premium and responsive

#### 3. **Mauve/Rose Gradient as Primary System**
- Primary: **Mauve** `#6D3A6D` (deep purple)
- Secondary: **Rose** `#B85C8A` (warm purple-pink)
- Used for:
  - Gradient backgrounds
  - Text highlights
  - Button states
  - Hero animations
- Creates a **cohesive, sophisticated mood**

#### 4. **Neon Accents — Team-Specific Energy**
- Each PSL team has a **vibrant neon color** (not muted)
- Creates **visual excitement** and **team identity**
- Used for:
  - Team card borders/glows
  - Real-time update indicators
  - Interactive highlights
  - Player cards

#### 5. **Motion Over Information Hierarchy**
- **Animations are primary UI communication tool**
- Not used for decoration — every motion serves purpose:
  - Pulse animations = real-time activity
  - Scroll reveals = storytelling
  - Expand/collapse = state changes
  - Glassmorphic transitions = spatial relationships

#### 6. **Natural, Direct Copy**
- Avoid over-stylized jargon or marketing speak
- Use active verbs and clear benefit statements
- Examples:
  - ✅ "Stake in Grassroots" (not "Contribute to Foundational Growth Initiatives")
  - ✅ "Tip your favorite player" (not "Initiate Impact Transfer")
  - ✅ "See your name on the Infinity Wall" (not "Etched in Perpetuity")

---

## COMPLETE COLOR SYSTEM

### Base Palette

```
Dark Base:        #0a0a1a  (Deep navy/black)
Mauve (Primary):  #6D3A6D  (Deep purple)
Rose (Secondary): #B85C8A  (Warm purple-pink)
Electric Blue:    #3B82F6  (Bright blue accent)
Neon Violet:      #7C3AED  (Gas badge/glow pills)
Neon Pink:        #FF69B4  (Striking emphasis)
```

### 8-Team Neon Accent Colors (Equal Power)

| Team | Code | Color | Hex | Glow |
|------|------|-------|-----|------|
| Lahore Qalandars | LQ | Neon Green | #00FF00 | `shadow-[0_0_20px_rgba(0,255,0,0.25)]` |
| Karachi Kings | KK | Royal Blue | #0000FF | `shadow-[0_0_20px_rgba(0,0,255,0.25)]` |
| Islamabad United | IU | Hot Red | #FF0000 | `shadow-[0_0_20px_rgba(255,0,0,0.25)]` |
| Peshawar Zalmi | PZ | Electric Yellow | #FFFF00 | `shadow-[0_0_20px_rgba(255,255,0,0.25)]` |
| Quetta Gladiators | QG | Deep Purple | #800080 | `shadow-[0_0_20px_rgba(128,0,128,0.25)]` |
| Multan Sultans | MS | Teal Blue | #008080 | `shadow-[0_0_20px_rgba(0,128,128,0.25)]` |
| Hyderabad Kingsmen | HK | Deep Maroon | #800000 | `shadow-[0_0_20px_rgba(128,0,0,0.25)]` |
| Rawalpindi Pindiz | RP | Neon Cyan | #00FFFF | `shadow-[0_0_20px_rgba(0,255,255,0.25)]` |

### glassmorphic Surface System

```css
/* Glass Card Background */
Background:  rgba(255, 255, 255, 0.05)
Border:      rgba(255, 255, 255, 0.10)
Blur:        12px
Effect:      Creates semi-transparent frosted glass floating effect

/* Text Opacity System */
Primary Text:    rgba(255, 255, 255, 1.00)  (100%)
Secondary Text:  rgba(255, 255, 255, 0.80)  (80%)
Muted Text:      rgba(255, 255, 255, 0.60)  (60%)
Hint Text:       rgba(255, 255, 255, 0.40)  (40%)
Disabled:        rgba(255, 255, 255, 0.20)  (20%)

/* Interactive Feedback */
Hover Bg:        rgba(255, 255, 255, 0.10)
Active Bg:       rgba(255, 255, 255, 0.15)
Pressed Bg:      rgba(255, 255, 255, 0.20)
```

### Status/Action Colors
```
Success:    #10B981  (Green)
Warning:    #F59E0B  (Amber)
Error:      #EF4444  (Red)
Info:       #3B82F6  (Blue)
Pending:    #F59E0B  (Amber — same as warning)
Confirmed:  #10B981  (Green)
```

---

## TYPOGRAPHY & FONTS

### Font Stack
```
Sans Serif: Inter, system-ui, -apple-system, sans-serif
Monospace:  JetBrains Mono, Fira Code, monospace (for code/gas)
```

### Type Scale & Weights

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| **H1** | 48px | 700 Bold | 1.2 | -0.02em | Hero Page Title |
| **H2** | 36px | 700 Bold | 1.3 | -0.01em | Section Heading |
| **H3** | 28px | 600 SemiBold | 1.4 | 0em | Card Title |
| **H4** | 20px | 600 SemiBold | 1.5 | 0em | Subsection |
| **Body L** | 16px | 400 Regular | 1.6 | 0em | Main Body Text |
| **Body M** | 14px | 400 Regular | 1.5 | 0em | Component Text |
| **Body S** | 12px | 400 Regular | 1.4 | 0.01em | Labels, Badges |
| **Caption** | 11px | 400 Regular | 1.3 | 0.02em | Helper Text |
| **Button** | 14px | 600 SemiBold | 1.4 | 0.5px | All Buttons |

### Text Styles

#### Hero Heading (Landing Page)
- Size: 48px
- Weight: 700 Bold
- Effect: **Gradient text** using `background: linear-gradient(135deg, #6D3A6D, #B85C8A)`
- Animation: Rotating stamp effect + pulse glow

#### Interactive Links
- Color: Rose `#B85C8A`
- Decoration: None (no underline)
- Hover: Underline appears + glow effect
- Transition: 200ms ease

#### Form Labels
- Size: 12px
- Weight: 600 SemiBold
- Color: Muted text (60% white)
- Transform: Uppercase letter-spacing

---

## LAYOUT & SPACING SYSTEM

### Base Unit Grid
**Base Unit: 4px**

```
4px  = 1 unit
8px  = 2 units
12px = 3 units
16px = 4 units (main spacing)
20px = 5 units
24px = 6 units
32px = 8 units
40px = 10 units
48px = 12 units
64px = 16 units
```

### Container Sizes
```
Mobile:     320px - 639px  (full width - 16px padding)
Tablet:     640px - 1023px (max-width 600px)
Desktop:    1024px+        (max-width 1200px content)
Ultra:      1440px+        (max-width 1200px + centered)
```

### Common Spacing

| Component | Padding | Gap Between Items |
|-----------|---------|-------------------|
| Card | 24px | — |
| Button | 12px outer, 12px inner | — |
| Section | 40-64px vertical | 32px horizontal |
| Grid Gap | — | 20px |
| Input Field | 12px | — |
| Modal | 32px | — |

### Responsive Breakpoints (Tailwind)
```
sm:  640px   (tablets)
md:  768px   (tablets → desktop)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
2xl: 1536px  (ultra-wide)
```

**Mobile-First Approach**: Start with mobile styles, then add media queries.

---

## COMPONENT LIBRARY

### 1. BUTTONS

#### Primary Button (Main CTA)
```
Background:  Gradient mauve → rose
Text:        White, 600 SemiBold
Padding:     12px 24px
Border:      None
Radius:      8px
Shadow:      Light (0 4px 12px rgba(0,0,0,0.3))

States:
  Default:   Full color
  Hover:     Brightness +15%, slight scale (1.02)
  Active:    Brightness -10%, scale (0.98)
  Disabled:  Opacity 50%, no cursor
```

#### Secondary Button (Alternative Action)
```
Background:  rgba(255,255,255,0.10) (glass)
Text:        White, 600 SemiBold
Border:      1px rgba(255,255,255,0.20)
Padding:     12px 24px
Radius:      8px

States:
  Hover:     Background rgba(255,255,255,0.15)
  Active:    Background rgba(255,255,255,0.20)
```

#### Ghost Button (Minimal)
```
Background:  Transparent
Text:        Rose #B85C8A
Border:      None
Padding:     12px 16px
Radius:      6px

States:
  Hover:     Background rgba(184,92,138,0.10)
  Active:    Background rgba(184,92,138,0.20), scale (0.98)
```

#### Icon Button (Compact)
```
Size:        40px × 40px
Background:  rgba(255,255,255,0.05)
Icon Color:  White 80%
Border:      1px rgba(255,255,255,0.10)
Radius:      6px

States:
  Hover:     Background rgba(255,255,255,0.10)
```

#### Connect Wallet Button (Special)
```
Background:  Gradient electric-blue
Text:        White, 600 SemiBold
Animation:   Liquid Pulse (border shimmer every 3s)
Padding:     12px 24px
Radius:      8px

Pulse Effect:
  - Neon border glow amplifies
  - Subtle scale pulse (1.00 → 1.02 → 1.00)
  - Duration: 3s infinite
```

### 2. CARDS

#### Glass Card (Generic Container)
```
Background:  rgba(255,255,255,0.05)
Border:      1px rgba(255,255,255,0.10)
Padding:     24px
Radius:      12px
Backdrop:    blur(12px)
Shadow:      0 8px 32px rgba(0,0,0,0.2)

Hover:
  - Border opacity increases to 0.20
  - Shadow expands slightly (0 12px 48px)
  - Scale: 1.02
  - Transition: 200ms ease
```

#### Pool Card (Staking Interface)
```
Structure:
  ├─ Header
  │  ├─ Pillar icon + name (24px title)
  │  └─ Pool status badge (Open/Locked/Closed)
  ├─ Body
  │  ├─ Total staked (large number, mauve accent)
  │  ├─ Your stake (secondary text)
  │  ├─ Input field (amount in WIRE)
  │  ├─ Quick amount buttons (0.5, 1, 2, 5)
  │  └─ Gas estimate badge (neon violet)
  └─ Footer
     ├─ Cancel button (ghost)
     └─ Stake button (primary)

Responsive:
  Mobile:  Full width, stacked
  Desktop: 2-4 cols grid, 320px width
```

#### Match Card (Team Matchup)
```
Layout:
  ├─ Matchup Header
  │  ├─ Team 1 Logo (40×40)
  │  ├─ "vs" separator
  │  └─ Team 2 Logo (40×40)
  ├─ Match Info
  │  ├─ Date/time
  │  ├─ Venue
  │  └─ Current score
  ├─ Action CTA
  │  └─ "View Match" / "Stake Now" button
  └─ Accent Glow
     └─ Team 1 neon border (left) + Team 2 neon border (right)

Colors:
  - Borders: Team 1 & Team 2 neon colors
  - Glassmorphic surface
  - Team logos rendered with 40% team color glow

Interactive:
  Hover:    Card expands (scale 1.03), glows brighten
  Click:    Navigate to /match/[id]
```

#### Player Card (Tipping)
```
Structure:
  ├─ Player Avatar (60×60 circle, placeholder emoji/color)
  ├─ Player Name (16px, bold)
  ├─ Team Badge (12px pill, team color)
  ├─ Current Tip Total (14px, secondary)
  ├─ Tip Amount Input (14px monospace)
  └─ Tip Button (primary, full width)

Colors:
  - Avatar background: Team neon color
  - Border: Team neon glow
  - Text: White 100% for name, 60% for stats

Interactive:
  Hover:    Avatar glows intensifies
  Click Tip: Pulse ripple from button, then confirmation modal
```

### 3. INPUT FIELDS

#### Text Input (Amount)
```
Background:  rgb(255,255,255,0.08)
Border:      1px rgba(255,255,255,0.10)
Padding:     12px 16px
Radius:      8px
Text:        16px, white
Placeholder: 40% opacity white
Icon (right-side optional): Mauve accent

States:
  Focus:     Border 1px mauve, outline none, shadow glow
  Error:     Border red, error text below (12px, red)
  Disabled:  Opacity 50%, no cursor
```

#### Wallet Input (Custom)
```
Left Icon:   Wallet emoji or SVG (20×20)
Input Area:  "0x..." address placeholder
Copy Button: Ghost button on right (icon only)
Paste Option: Right-click context menu enabled

Validation Feedback:
  Valid:   Green checkmark, green glow border
  Invalid: Red X, red glow border
```

### 4. BADGES & PILLS

#### Status Badge
```
Background:  Depends on status (see colors below)
Text:        12px, 600 weight
Padding:     6px 12px
Radius:      16px (fully rounded)
Border:      1px semi-transparent matching color

Open:        bg-green-500/20 text-green-300 border-green-500/30
Locked:      bg-amber-500/20 text-amber-300 border-amber-500/30
Closed:      bg-red-500/20 text-red-300 border-red-500/30
```

#### Gas Badge (Neon Violet Pill)
```
Background:  Gradient neon-violet (semi-transparent)
Icon:        ⚡ (lightning bolt)
Text:        Gas amount in monospace (e.g., "0.000312")
Padding:     8px 16px
Radius:      20px
Animation:   Subtle pulse glow (opacity 0.5 → 1.0 every 2s)
```

#### Team Badge
```
Background:  Team neon color @ 20% opacity
Border:      1px team neon @ 60% opacity
Text:        Team abbreviation (e.g., "LQ") or name
Radius:      6px (less rounded than status)
Padding:     4px 12px
Font:        12px, 700 weight, uppercase
```

### 5. MODALS

#### Confirmation Modal (Staking/Tipping)
```
Overlay:     Black @ 50% opacity, click outside closes
Container:   Glass card (max-width 420px)
Header:      "Confirm [Action]" (28px title)
Content:
  ├─ Detail rows (14px secondary text)
  │  ├─ Pillar/Player: [value]
  │  ├─ Amount: [value] WIRE
  │  └─ Gas Fee: [value] WF
  └─ Warning: Anti-phishing notice § 18 (small, muted)
Footer:
  ├─ Cancel button (secondary, left)
  └─ Confirm button (primary, right)

States:
  Loading:   Confirm button shows spinner, disabled
  Error:     Red border on modal, error text displayed
```

#### Toast Notification
```
Position:    Bottom-right (20px from edges)
Background:  Glass card with border
Max-width:   300px
Padding:     16px
Border-left: 4px thick colored (status-dependent)

Types:
  Success:   Green border, green icon + checkmark
  Warning:   Amber border, warning icon
  Error:     Red border, error icon + X
  Info:      Blue border, info icon

Auto-dismiss: 4s, or click X to close
Animation:    Slide in from bottom-right (200ms), fade out (300ms)
```

### 6. LOADERS & SKELETONS

#### Skeleton Loader
```
Shape:       Rectangle or circle (rounded)
Background:  White @ 10% opacity
Animation:   Shimmer gradient left-to-right (1.5s infinite)
  - Shimmer gradient: transparent → white(20%) → transparent
  - Uses CSS gradient animation for smoothness

Common Sizes:
  - Text: 16px height, 60% width
  - Card: Full width, 200px height
  - Avatar: 40×40 circle
```

#### Loading Spinner
```
Animation:   Rotating circle (360° in 1s)
Color:       Mauve → Rose gradient
Size:        24×24 (can scale)
Style:       Thin stroke (2px)
```

### 7. NAVIGATION & NAVBAR

#### Sticky Glass Navbar
```
Position:    Fixed top, z-index 40
Background:  rgba(10,10,26,0.80) (semi-transparent dark)
Border:      1px rgba(255,255,255,0.10) bottom border
Backdrop:    blur(12px)
Padding:     16px 24px
Height:      64px

Layout (Desktop):
  ├─ Left: PSL Logo + "Pulse" text (20px, mauve gradient)
  ├─ Center: Nav links (14px, spaced 24px apart)
  │  ├─ Home
  │  ├─ Matches
  │  ├─ Impact
  │  ├─ Leaderboard
  │  └─ Profile
  └─ Right: Connect Wallet button + Settings icon

Layout (Mobile):
  ├─ Left: Menu hamburger (icon button)
  ├─ Center: Logo
  └─ Right: Connect Wallet icon (compact)
  Drawer: Opens sidebar with stacked nav links + settings

Link States:
  Default:   White 60% opacity
  Hover:     White 100%, underline (2px mauve)
  Active:    White 100%, underline (2px rose)
```

#### Sidebar / Mobile Drawer
```
Position:    Fixed left, full height (above viewport on mobile)
Width:       Mobile 280px, tablet 300px
Background:  Glass card effect (full height)
Animation:   Slide in from left (300ms)
Content:
  ├─ Close button (X icon, top-right)
  ├─ Logo
  ├─ Nav links (full width, stacked, 16px)
  ├─ Divider line
  └─ Settings section

Links:
  Hover:     Background rgba(255,255,255,0.10), left border accent
  Active:    Left border 3px mauve, background rgba(255,255,255,0.05)
```

### 8. FORMS & INTERACTIONS

#### Input Validation Feedback
```
Valid State:
  - Border: 1px green (#10B981)
  - Right icon: Green checkmark
  - Helper text: Green, 12px (1 line below)

Error State:
  - Border: 1px red (#EF4444)
  - Right icon: Red X
  - Error message: Red, 12px, bold (displays below)
  - Focus: Outline red glow

Disabled State:
  - Opacity: 50%
  - Cursor: not-allowed
  - Background: Slightly darker
```

#### Multi-Step Form
```
Progress Indicator:
  ├─ Numbered circles (1, 2, 3, 4)
  ├─ Connecting line between circles
  │  └─ Completed steps: Mauve line
  │  └─ Future steps: Gray line
  └─ Current step: Pulsing rose glow

Step Content:
  - Animated fade in (300ms)
  - Previous/Next buttons
  - Progress text ("Step 2 of 4")
```

---

## PAGE STRUCTURE & NAVIGATION

### Site Map
```
/                      — Landing / Home
/matches               — Match Grid (all 44 matches)
/match/[id]            — Match Detail + Staking Panel
/impact                — Impact Hub (pools, badging, stats)
/profile               — User Profile + Transaction History
/leaderboard           — Global Infinity Wall
/admin                 — Admin Panel (demo/testing mode)
```

### Page Flows

#### 1. HOME PAGE (/)
**Hero Section:**
- Pre-loader lift animation (fade in with scale)
- Giant "PULSE" heading with gradient text + rotating stamp effect
- Infinity Trophy 3D background (subtle parallax)
- Typewriter subtitle rotating through 4 strings
- Animated WireFluid network lines pulsing in background

**Navigation:**
- Sticky glass navbar (detaches on scroll)
- Smooth scroll to sections

**Main Content Flow:**
1. **Hero** (Full viewport)
   - PULSE title × rotating badge
   - Typewriter subtitle
   - Animated network background
   - Two CTAs: "Explore Matches" (primary) + "Reserve Seat" (secondary)

2. **Trust Bar** (Dual-marquee)
   - Left: Team logos scrolling left infinitely
   - Right: Team names scrolling right infinitely
   - Sync speed so they move together

3. **"What is PSL Pulse"** (Scroll-reveal text section)
   - Long-form paragraph with scroll-tied white fill animation
   - Reveals copy as user scrolls down
   - 40px left padding, max-width 900px

4. **Core Impact Pillars** (4 columns or stacked mobile)
   ```
   ┌──────────────────────────────────────────┐
   │ 🌱 Grassroots Development                │
   │ Fund academy academies | Funds direct... │
   │                                          │
   │ Pillar 0 ID                              │
   └──────────────────────────────────────────┘
   ```
   - Icon + title + description
   - Glass card, mauve/rose gradient border on hover
   - Icons: 🌱, 🤝, 🎟️, ♾️

5. **Infinity Legacy Teaser** (CTA Section)
   - Large heading: "See Your Name on the Infinity Wall"
   - "Top contributors etched in the blockchain"
   - Three-step explainer with icons
   - CTA button: "Explore Leaderboard"

6. **Footer**
   - Links: Terms, Privacy, Socials
   - Copyright
   - WireFluid logo + chain explorer link

---

#### 2. MATCHES PAGE (/matches)

**Layout:**
- Full-width page
- Header: "PSL 2026 — All Matches" + filter controls
- Grid (2-6 cols responsive) of all 44 match cards

**Match Card Structure:**
```
┌────────────────────────────────┐
│ 🟢← Team1 Color │ Team2 Color →🔵
│                                │
│  LQ Logo      vs     RP Logo   │
│                                │
│  Lahore Qalandars vs Pindiz    │
│                                │
│  Mar 26, 2026 @ 3:00 PM        │
│  Gaddafi Stadium, Lahore       │
│                                │
│  ┌─ Match 5 ──────────────────┐│
│  │ Status: Upcoming (badge) │  │
│  │ View Match →              │  │
│  └──────────────────────────────┘│
│                                │
│  Total Staked: 2500 WIRE       │
│  Your Stake: 0.5 WIRE (if yes) │
└────────────────────────────────┘
```

**Interactivity:**
- Hover: Card glows with team colors on borders
- Click: Navigate to /match/[id]

**Filters (Optional Top Bar):**
- Team filter dropdown
- Status filter (Upcoming, Live, Completed)
- Sort by (Date, Total Staked, etc.)

---

#### 3. MATCH DETAIL PAGE (/match/[id])

**Two-Column Layout:**
```
Left (60%):
├─ Match Header
│  ├─ Large teams + date/time
│  ├─ Live score (if live)
│  ├─ Venue
│  └─ Status badge
├─ Lineups section
├─ Stats section
└─ Comments/Activity log

Right (40%):
├─ Pool Card Grid (4 pools stacked)
│  ├─ Pool 1: Grassroots
│  ├─ Pool 2: Player Welfare
│  ├─ Pool 3: Fan Access
│  └─ Pool 4: Infinity Legacy
└─ Player Tipping Section
   ├─ "Tip Your Favorite Player"
   ├─ Quick player buttons (8 players in carousel)
   └─ Player card with input + tip button
```

**Responsive (Mobile):**
- Single column
- Match header full width at top
- Pools below
- Player tipping section at bottom

---

#### 4. IMPACT HUB PAGE (/impact)

**Tab Interface:**
```
This Match | Global Impact | Badges | Grassroots Help
```

**This Match Tab:**
- Pool contributions today
- Total impact for match
- Pie chart (pools visualization)
- "Stake now" CTA

**Global Impact Tab:**
- Global stats counter (animated)
  - Total staked ($X)
  - Total tipped (Y fans)
  - Matches supported
  - Badges minted
- Time-series chart (staking over time)

**Badges Tab:**
- Grid of user's earned badges (ERC-721)
- Badge details:
  - Image
  - Title
  - Earned date
  - Transaction link
- "Earn more badges" CTA

**Grassroots Help Tab:**
- Team academy listings
- "See how your stake helps"
- Links to academy programs

---

#### 5. PROFILE PAGE (/profile)

**Header Section:**
- User avatar (generated from address or uploaded)
- Connected wallet address (masked or full)
- Copy address button
- Disconnect wallet button

**Profile Stats Card:**
```
┌─────────────────────────────────────┐
│ Total Contributed  | Grassroots     │
│ 12.5 WIRE         | 5.2 WIRE       │
│                   |                │
│ Your Rank         | Player Welfare │
│ #234 on Infinity  | 3.8 WIRE       │
│ Wall              |                │
│                   | Fan Access     │
│                   | 2.1 WIRE       │
│                   |                │
│                   | Infinity Legacy│
│                   | 1.4 WIRE       │
└─────────────────────────────────────┘
```

**Transactions Tab:**
- Timeline or table of all past transactions
  - Type (Stake, Tip, Claim Badge)
  - Amount
  - Date
  - Status
  - Link to explorer

**Badges Section:**
- Grid of earned badges (ERC-721 thumbnails)
- "View all" expandable

**Settings:**
- Dark/Light mode toggle (if implemented)
- Notification preferences
- Privacy settings

---

#### 6. LEADERBOARD PAGE (/leaderboard)

**The Infinity Wall:**
- **Horizontal scroll of avatars/names** (or vertical, depending on layout)
- Top 10 contributors displayed prominently

**Layout A (Horizontal Scroll):**
```
← 
│ 👤    │ 👤    │ 👤    │ 👤    │ 👤    │ ...
│ 0x72.. │ 0xAB.. │ 0xCD.. │ 0xEF.. │ 0x12.. │
│ 12.5   │ 11.2   │ 10.8   │ 9.6    │ 8.4    │
│ WIRE   │ WIRE   │ WIRE   │ WIRE   │ WIRE   │
│        │        │        │        │        │
│ #1 ⭐  │ #2 ⭐  │ #3 ⭐  │ #4     │ #5     │
→
```

**Design Details:**
- Avatar: 60×60, glowing border (team color if shown)
- Rank badge: Top 3 with star ⭐, animated crown animation
- Contribution amount: 16px bold, mauve accent
- Hover: Card expands slightly, name appears in full
- Animation: Smooth infinite scroll (no jank)

**Leaderboard Table (Alternative/Desktop):**
```
| Rank | Address | Contributed | Team | Status |
|------|---------|-------------|------|--------|
| 1    | 0x72... | 12.5 WIRE   | LQ   | ⭐     |
| 2    | 0xAB... | 11.2 WIRE   | KK   | ⭐     |
| 3    | 0xCD... | 10.8 WIRE   | IU   | ⭐     |
...
```

**Stats Section Below:**
- Total staked across all users
- Active contributors count
- Average stake
- Highest single stake

---

#### 7. ADMIN PAGE (/admin)

**Demo/Testing Mode:**
- **Event Injection Panel**
  - Dropdown to select event type (Six, Wicket, Boundary, etc.)
  - Match selector
  - Team selector
  - Inject button
  - Result: Event appears in oracle queue, gets batched

- **Live Monitor**
  - Current event queue (real-time list)
  - Pending transactions
  - Batch history
  - Health status (✅ Running, ⚠️ Degraded, ❌ Down)

- **Override Controls** (for hackers)
  - Manual leaderboard entry
  - Badge minting
  - Pool state reset

---

## ANIMATIONS & MOTION

### Micro-Interactions

#### 1. **Pulse Ripple (On-Click Impact)**
```javascript
Animation: Click on tip button
├─ Large circle appears at click point
├─ Expands outward (radius 0 → 60px)
├─ Opacity fades (1.0 → 0.0)
├─ Duration: 600ms
├─ Easing: ease-out
└─ Color: Team neon or rose gradient

Code Hint: Framer Motion + `layoutId`
```

#### 2. **Liquid Pulse (Connect Wallet)**
```javascript
Animation: Continuous
├─ Border shimmer (glow brighter)
├─ Neon line traces around button
├─ Slight scale pulse (1.00 → 1.02 → 1.00)
├─ Duration: 3s infinite
├─ Easing: ease-in-out
└─ Color: Electric blue

Effect: Draws user's attention to wallet connect
```

#### 3. **Breath Glow (Active Cards)**
```javascript
Animation: On card hover or selection
├─ Shadow expands slowly
├─ Glow color intensifies
├─ Duration: 2s ease-in-out
├─ Loop: Infinite
└─ Effect: Card "inhales" and "exhales"
```

#### 4. **Typewriter Subtitle**
```javascript
Animation: Landing page
├─ Text appears character-by-character
├─ Each char: fade-in + rise (y: 10px → 0)
├─ Stagger: 50ms between chars
├─ After 4s complete, fade out over 1s
├─ Next string fades in while previous fades out
└─ Duration per string: 6s (2s type + 2s hold + 2s fade)
```

#### 5. **Scroll-Reveal Gradient Text**
```javascript
Animation: On page scroll
├─ Text initializing as transparent (0% white)
├─ As viewport scrolls over text, white fill % increases
├─ 100% white when text is centered on screen
├─ Effect: `background: linear-gradient(90deg, transparent 0%, white [%] 100%)`
├─ Tied to scroll position (not time-based)
└─ Only on desktop (mobile: instant white)
```

#### 6. **Grid Entry Stagger (Card Grids)**
```javascript
Animation: Page load or re-render
├─ Each card staggered entry
├─ Entry: opacity 0 → 1, y: 30 → 0, scale 0.95 → 1
├─ Stagger: 50ms between each
├─ Duration per card: 400ms
├─ Spring easing: stiffness 260, damping 24
└─ Creates waterfall effect down grid
```

#### 7. **Expand/Collapse Match Card**
```javascript
Animation: On match card click
├─ Card animates to center (layoutId transition)
├─ Overlay fades in
├─ Expanded content fades in from below
├─ Duration: 400ms
├─ Easing: cubic-bezier(0.4, 0, 0.2, 1)
└─ Reverse on close or click overlay
```

#### 8. **WireFluid Network Pulse Lines**
```javascript
Animation: Background hero effect
├─ Multiple curved lines
├─ Lines stroke-dash animate
├─ Color pulse (mauve → rose → mauve)
├─ Duration: 4s infinite
├─ Opacity: 0.2 → 0.5 → 0.2
└─ Effect: Suggests active blockchain network
```

#### 9. **Marquee Animation (Team Logos)**
```javascript
Animation: Continuous scroll
├─ Left marquee: translates -100% over 20s, repeats infinite
├─ Right marquee: translates +100% over 20s, repeats infinite
├─ Linear easing (no acceleration)
├─ Seamless loop (duplicate content)
└─ Hover: pause animation
```

#### 10. **Animated Crown (Top Contributors)**
```javascript
Animation: Infinity Wall top 3
├─ Crown rotates (360° every 3s)
├─ Crown scales slightly (1.0 → 1.1 → 1.0)
├─ Glow behind crown pulses
├─ Duration: 3s
├─ Easing: ease-in-out
└─ Effect: Celebratory premium feel
```

### Page Transitions

#### Route Change Animation
```javascript
Animation: When navigating between pages
├─ Current page fades out (opacity 1 → 0)
├─ Duration: 200ms
├─ New page fades in simultaneously
├─ Duration: 300ms (slightly slower)
├─ Easing: ease-out
├─ Effect: Smooth cross-fade, no blank flash
```

### Reduced Motion Respect
```javascript
// For accessibility, check prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// Framer Motion respects useReducedMotion() hook
const prefersReducedMotion = useReducedMotion();
// Skip complex animations if true, use instant state changes
```

---

## CONTENT & COPY

### Brand Voice

**Tone:** Direct, enthusiastic, authentic
- Not corporate or formal
- Not over-excited or slang
- Explains blockchain simply
- Celebrates cricket culture

### Key Message Hierarchies

#### 1. **Main Value Proposition**
> "PSL Pulse transforms how cricket fans engage with the game. Stake, tip, collect, and make an impact—all on blockchain."

#### 2. **The 4 Pillars**
- **Grassroots Development:** "Fund the talent of tomorrow"
- **Player Welfare:** "Support your favorite players directly"
- **Fan Access & Collectibles:** "Own your match memories as NFTs"
- **Infinity Legacy:** "See your name etched on the blockchain"

#### 3. **The Infinity Wall**
> "Top contributors shown in real-time. Every stake counts. Every tip matters."

#### 4. **Quick Start Copy**
- "Connect your wallet"
- "Choose your impact pool"
- "Confirm your stake"
- "Watch your name move up the leaderboard!"

### CTAs & Button Text

| Context | Text | Variant |
|---------|------|---------|
| Main Hero | "Explore Matches" | Primary |
| Hero Alt | "Reserve Your Seat" | Secondary |
| Pool Card | "Stake Now" | Primary |
| Connect | "Connect Wallet" | Primary (liquid pulse) |
| Tip | "Tip [Player Name]" | Primary with ripple |
| Confirmation | "Confirm" / "I'm Sure" | Primary |
| Dismiss | "Cancel" | Secondary |
| Leaderboard | "View All Contributors" | Ghost |
| Pool | "Claim Badge" (if earned) | Primary gradient |

### Microcopy (Helper & Error Text)

| Situation | Copy |
|-----------|------|
| Empty state | "No matches yet. Check back soon!" |
| Loading | "Fetching blockchain data..." |
| Error - Network | "WireFluid node is congested, hang tight..." |
| Error - Balance | "Insufficient balance. Top up your wallet." |
| Error - Gas Too High | "Gas fees higher than expected. Try again?" |
| Success | "Staked in Grassroots! ✅" + tx link |
| Wallet Connected | "Connected: 0x72a5..." |
| Anti-phishing | "Please verify transaction details in your wallet." |
| Share Badge | "Share your impact badge!" |

### Form Labels & Placeholders

```
Amount Input:
  Label: "Amount to Stake (WIRE)"
  Placeholder: "0.00"
  Hint: "Min: 0.1 WIRE, Gas: ~0.0003 WIRE"

Player Selector:
  Label: "Choose a Player"
  Placeholder: "Select from roster..."

Quick Amounts:
  Buttons: "0.5" | "1" | "2" | "5"
  (no labels, just numbers in pill shape)
```

---

## RESPONSIVE DESIGN

### Mobile-First Strategy
1. Start with 320px mobile design
2. Add breakpoints progressively
3. Hide/show elements as needed
4. Stack vs. grid adjustments

### Breakpoint Behavior

#### Mobile (320px - 639px)
```
Navigation:    Hamburger menu (3 lines) → drawer on left
Hero Title:    32px (down from 48px)
Hero Subtitle: 16px typewriter effect
Grid:          Single column, full width - 16px padding
Cards:         Full width, stacked vertical
Buttons:       Full width (48px min-height for tap target)
Images:        100% width, max-width parent
Modals:        Full height, 80vw width or full-width - margin
Navbar:        Compact 56px height, simplified
```

#### Tablet (640px - 1023px)
```
Navigation:    Horizontal nav bar (no drawer yet)
Hero Title:    40px
Grid:          2-3 columns
Cards:         More breathing room, 2 per row
Buttons:       Auto width (don't force full), min 44px height
Images:        Optimized size (not 1x)
Modals:        500px width, centered
Navbar:        64px height, buttons visible
Sidebar:       Not visible yet
```

#### Desktop (1024px+)
```
Navigation:    Sticky glass navbar at top
Hero Title:    48px full effect
Grid:          4-6 columns (depends on card size)
Cards:         Fixed width or flex, gaps 20px
Buttons:       Auto width, hover states active
Images:        High-quality, full resolution
Modals:        600px width, centered overlay
Navbar:        64px, all features visible
Sidebar:       May show as nav on right (admin)
```

### Common Responsive Patterns

#### Grid Responsive
```css
/* Small: 1 col */
@apply grid grid-cols-1 gap-4

/* Tablet: 2 col */
@apply md:grid-cols-2 md:gap-6

/* Desktop: 4 col */
@apply lg:grid-cols-4

/* Ultra: 6 col */
@apply 2xl:grid-cols-6
```

#### Flex Stack
```css
/* Mobile: Column (stacked vertical) */
@apply flex flex-col gap-4

/* Tablet+: Row (side-by-side) */
@apply md:flex-row md:gap-6
```

#### Hidden Elements
```css
/* Show only on mobile */
@apply block md:hidden

/* Show only on desktop */
@apply hidden md:block

/* Show tablet and up */
@apply hidden sm:block
```

---

## ACCESSIBILITY GUIDELINES

### WCAG AA Compliance

#### 1. **Color Contrast**
```
All text must pass WCAG AA (4.5:1 for normal text, 3:1 for large)

✅ White (#FFFFFF) on dark (#0a0a1a):  21:1 (passes)
✅ Rose (#B85C8A) on dark (#0a0a1a):    7:1 (passes)
❌ Neon green (#00FF00) on dark:         17:1 (passes, but hard on eyes - use only for accents)
⚠️ Muted text (60% white) on dark:       ~7:1 (passes for secondary)
```

**Rule:** Always test color combos with WebAIM Contrast Checker.

#### 2. **Focus Indicators**
```
Every interactive element must have visible focus ring.

Default:  outline: 2px solid rgba(184, 92, 138, 0.6)  (rose)
          outline-offset: 2px

Buttons:  Visible box-shadow glow on focus
Inputs:   Subtle inner glow + underline
Links:    Underline + outline ring
```

#### 3. **Keyboard Navigation**
```
Tab Order:  Logical, left-to-right top-to-bottom
Focusable:  All buttons, links, inputs, modals
Escape:     Closes modals, dropdowns
Enter:      Activates buttons, submits forms
Space:      Toggles checkboxes, activates buttons
Arrow Keys: Navigate dropdowns, carousels
```

#### 4. **ARIA Labels**
```html
<!-- Buttons without text -->
<button aria-label="Close menu">
  <svg><!-- X icon --></svg>
</button>

<!-- Form labels -->
<label htmlFor="amount-input">Amount (WIRE)</label>
<input id="amount-input" type="number" />

<!-- Live regions (real-time updates) -->
<div aria-live="polite" role="status">
  Staked in Grassroots! ✅
</div>

<!-- Icon buttons with description -->
<button aria-label="Connect wallet">
  💰
</button>
```

#### 5. **Skip-to-Content Link**
```html
<a href="#main" className="skip-link">
  Skip to main content
</a>

<!-- Positioned off-screen, visible on focus -->
<!-- CSS: position absolute, top -10px, focus:top 2px -->

<main id="main">
  {/* Page content */}
</main>
```

#### 6. **Reduced Motion**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* No auto-play animations */
  .carousel { animation: none; }
  .pulse-ripple { animation: none; }
}
```

#### 7. **Semantic HTML**
```html
<!-- ✅ Good -->
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<!-- ❌ Bad -->
<div onClick={...}>Home</div>

<!-- ✅ Good -->
<button onClick={...}>Stake Now</button>

<!-- ❌ Bad -->
<div onClick={...} role="button">Stake Now</div>
```

#### 8. **Image Alt Text**
```html
<!-- Team logo -->
<img src="..." alt="Lahore Qalandars logo" />

<!-- Decorative -->
<img src="..." alt="" aria-hidden="true" />

<!-- Informative chart -->
<img src="..." alt="Staking distribution: Grassroots 40%, Player Welfare 30%, Fan Access 20%, Infinity Legacy 10%" />
```

#### 9. **Loading Indicators**
```html
<!-- Tell screen readers loading in progress -->
<div aria-live="polite" role="status">
  {isLoading ? "Loading matches..." : ""}
</div>

<!-- Or use aria-busy -->
<div role="status" aria-busy={isLoading}>
  Match data
</div>
```

#### 10. **Error Messages**
```html
<!-- Link error to input -->
<input 
  id="amount" 
  aria-describedby="amount-error"
  value={amount}
/>
<div id="amount-error" role="alert">
  ❌ Insufficient balance
</div>
```

### Testing Checklist

- [ ] Run WebAIM contrast checker on all text
- [ ] Tab through entire page — logical order?
- [ ] Try keyboard-only navigation (no mouse)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Check with browser extension: axe DevTools
- [ ] Resize to 200% zoom — still usable?
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] All form inputs have labels
- [ ] All buttons have visible focus state
- [ ] Images have alt text or aria-hidden

---

## VISUAL REFERENCE

### Hero Section Example
```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║          🌐 Animated WireFluid network lines                   ║
║                                                                ║
║              P U L S E ✤ 🏏                                     ║
║          (Gradient mauve→rose rotating badge)                  ║
║                                                                ║
║         "The All-in-One Fan Impact Platform"                   ║
║              (Typewriter, looping)                             ║
║                                                                ║
║         [Explore Matches]  [Reserve Your Seat]                 ║
║         (Primary gradient) (Secondary glass)                   ║
║                                                                ║
║          ♾️ Infinity Trophy 3D background subtle parallax       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### Card Layout Example
```
┌─────────────────────────────────┐
│ 🟢 Grassroots ────────────────→ │  Neon team color borders
│ Development                     │
│                                 │ Glass background
│ Supports emerging talent        │ Light border (10% white)
│                                 │
│ Total Staked: 124.5 WIRE        │ Mauve accent on text
│ Your Stake: 5.2 WIRE            │ 60% white for secondary
│                                 │
│ [Input: 0.00]  [Quick▼]  ⚡0.001│ Input + dropdown + gas badge
│                                 │
│ [Stake Now ▶]  [Cancel]         │ Primary + secondary buttons
└─────────────────────────────────┘
Hover: Border glow intensifies, slight scale up
```

---

## SUMMARY FOR NEW DESIGNER

### Top 5 Design Principles to Remember

1. **Glassmorphism First**
   - Every card/overlay is semi-transparent with blur
   - This is THE signature visual

2. **Neon Accents for Energy**
   - Team colors pop against the dark base
   - Use neon to highlight active states, real-time updates

3. **Mauve/Rose Gradient for Brand**
   - All primary actions use this gradient
   - Creates luxury feeling, not flat utility

4. **Animations Tell Stories**
   - Pulse ripples = impact
   - Liquid pulse = attention
   - Scroll reveal = narrative
   - Stagger grids = cascade

5. **Accessibility is Non-Negotiable**
   - WCAG AA contrast throughout
   - Keyboard navigation works
   - Screen reader compatible
   - Reduced motion respected

### File Delivery Expectation

When building UI components, provide:
- **Figma file** with all components & states
- **Component library** (variants, hover/active/disabled states)
- **Design tokens** (colors, spacing, typography)
- **Prototype** showing animations & interactions
- **Design documentation** with usage guidelines

### Technology Context (For Inspiration)

The frontend will be built with:
- **Next.js 14** (React framework)
- **Framer Motion** (animations library)
- **Tailwind CSS** (utility-first styling)
- **Wagmi v2** (Web3 wallet integration)
- **Viem** (blockchain interactions)

This means animations will be smooth, colors/spacing live in utility classes, and components are reusable.

---

**Version:** 1.0.0  
**Date:** 2026-04-13  
**Status:** ✅ Complete — Ready for UI Designer Handoff
