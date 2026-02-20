# CampJournal Design System
**National Parks Passport Aesthetic**

## 2. Global Layout Styling

### App Background
```
bg-sand-50
```
Warm cream background instead of gray-50/white

### Container Spacing
```
px-4 sm:px-6 lg:px-8 py-6 md:py-8
max-w-7xl mx-auto
```

### Typography Hierarchy

**Page Titles**
```
text-3xl md:text-4xl font-display font-bold text-ink tracking-tight
```

**Section Headings**
```
text-xl md:text-2xl font-display font-semibold text-ink
```

**Card Titles**
```
text-lg font-semibold text-ink
```

**Body Text**
```
text-base text-ink-light leading-relaxed
```

**Small Text / Meta**
```
text-sm text-ink-lighter
```

---

## 3. Component Patterns

### Primary Button
**Default State:**
```
px-6 py-3 bg-brand-500 text-white font-medium rounded-button
hover:bg-brand-600 active:bg-brand-700
transition-colors duration-150
focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
```

**Small Button:**
```
px-4 py-2 text-sm bg-brand-500 text-white font-medium rounded-button
hover:bg-brand-600 transition-colors
```

### Secondary Button
```
px-6 py-3 bg-sand-100 text-ink font-medium rounded-button
hover:bg-sand-200 active:bg-sand-300
transition-colors duration-150
border border-sand-300
```

### Text Link Button
```
text-brand-500 hover:text-brand-600 font-medium transition-colors
underline-offset-2 hover:underline
```

### Card Component
**Before:**
```
bg-white rounded-lg shadow border p-4
```

**After:**
```
bg-white rounded-card shadow-card hover:shadow-card-hover
transition-shadow duration-200
border border-sand-200
overflow-hidden
```

### Journal Entry Card (Photo-Forward)
```html
<div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group">
  <!-- Photo Section -->
  <div className="relative h-48 bg-sand-100 overflow-hidden">
    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    <!-- Favorite Badge Overlay -->
    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-badge shadow-stamp">
      <span className="text-sm font-medium text-brand-500">⭐ Favorite</span>
    </div>
  </div>

  <!-- Content Section -->
  <div className="p-5">
    <!-- Title -->
    <h3 className="text-lg font-semibold text-ink mb-1">
      Yosemite Valley Campground
    </h3>

    <!-- Location -->
    <p className="text-sm text-ink-lighter mb-3">
      Yosemite National Park, CA
    </p>

    <!-- Visit Date -->
    <div className="flex items-center gap-2 mb-3">
      <span className="inline-flex items-center px-3 py-1 bg-pine-50 text-pine-700 text-xs font-medium rounded-badge border border-pine-200">
        📍 Visited Sep 15, 2024
      </span>
    </div>

    <!-- Notes Preview -->
    <p className="text-sm text-ink-light line-clamp-2 leading-relaxed">
      Amazing views of Half Dome. The campsite was clean and spacious.
    </p>
  </div>
</div>
```

### Badge / Passport Stamp Style
**Achievement Badge:**
```
inline-flex items-center gap-2 px-4 py-2
bg-brand-50 text-brand-700
text-sm font-medium rounded-badge
border-2 border-brand-200 shadow-stamp
```

**Status Badge (Visited):**
```
inline-flex items-center gap-1.5 px-3 py-1
bg-pine-50 text-pine-700
text-xs font-medium rounded-badge
border border-pine-200
```

**Count Badge:**
```
inline-flex items-center justify-center
w-6 h-6 bg-brand-500 text-white
text-xs font-bold rounded-full
```

### Tab Bar (Bottom Navigation)

**Tab Container:**
```
fixed bottom-0 left-0 right-0
bg-white/95 backdrop-blur-md
border-t border-sand-200
shadow-soft
```

**Inactive Tab:**
```
flex flex-col items-center justify-center flex-1 h-16
text-ink-lighter transition-colors duration-150
```

**Active Tab:**
```
flex flex-col items-center justify-center flex-1 h-16
text-brand-500 transition-colors duration-150
relative
```

**Active Indicator:**
```
absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-500 rounded-b-full
```

---

## 4. Empty States & Microcopy

### Empty Journal State
```html
<div className="bg-white rounded-card shadow-soft p-12 text-center max-w-md mx-auto">
  <div className="text-6xl mb-4">🏕️</div>
  <h3 className="text-xl font-display font-semibold text-ink mb-2">
    Your adventure awaits
  </h3>
  <p className="text-base text-ink-light mb-6 leading-relaxed">
    Start logging your campground visits and build your own travel passport.
  </p>
  <button className="px-6 py-3 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-colors">
    Find a Campground
  </button>
</div>
```

### First Campground Logged
```
✨ First stamp in your passport!
```

### Badge Unlocked Toast
```
🎉 Adventure Badge Unlocked: First Campground Visited
```

### CTA Rewrites
- **Before:** "Add to Journal"
- **After:** "Log This Visit" or "Add to My Passport"

- **Before:** "View My Journal"
- **After:** "My Travel Journal" or "View My Passport"

- **Before:** "Search Campgrounds"
- **After:** "Explore Campgrounds" or "Find Your Next Stop"

---

## 5. Delight Moments

### Hover States
**Cards:**
```
hover:shadow-card-hover hover:-translate-y-0.5
transition-all duration-200
```

**Images:**
```
group-hover:scale-105 transition-transform duration-300
```

**Buttons:**
```
hover:bg-brand-600 hover:shadow-md
active:scale-98 transition-all duration-150
```

### Focus States
```
focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
transition-all
```

### Loading States
**Spinner:**
```
animate-spin rounded-full h-8 w-8 border-3 border-brand-500 border-t-transparent
```

**Skeleton:**
```
animate-pulse bg-sand-200 rounded-card
```

### Success Animations
**Badge Appear:**
```
animate-[scale-in_0.3s_ease-out]
@keyframes scale-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## 6. Specific Component Examples

### Header
```html
<header className="bg-white/95 backdrop-blur-md border-b border-sand-200 sticky top-0 z-40">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <!-- Logo -->
      <a href="/" className="flex items-center gap-3 group">
        <span className="text-3xl group-hover:scale-110 transition-transform">🏕️</span>
        <span className="text-xl font-display font-bold text-ink">CampJournal</span>
      </a>

      <!-- Desktop Nav -->
      <nav className="hidden md:flex items-center gap-6">
        <a href="/search" className="text-ink hover:text-brand-500 font-medium transition-colors">
          Explore
        </a>
        <a href="/journal" className="text-ink hover:text-brand-500 font-medium transition-colors">
          My Journal
        </a>
        <button className="px-4 py-2 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-colors text-sm">
          Sign Out
        </button>
      </nav>
    </div>
  </div>
</header>
```

### Home Hero
```html
<div className="bg-gradient-to-br from-brand-50 via-sand-50 to-pine-50 py-16 md:py-24">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4 tracking-tight">
      Your RV & Camping Passport
    </h1>
    <p className="text-lg md:text-xl text-ink-light mb-8 max-w-2xl mx-auto leading-relaxed">
      Log your campground visits, collect memories, and track your adventures across the country.
    </p>
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <button className="px-8 py-4 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-all hover:shadow-md active:scale-98">
        Start Your Journey
      </button>
      <button className="px-8 py-4 bg-white text-ink font-medium rounded-button border-2 border-sand-300 hover:border-brand-300 hover:bg-sand-50 transition-all">
        Browse Campgrounds
      </button>
    </div>
  </div>
</div>
```

### Stats Display
```html
<div className="flex gap-6 flex-wrap">
  <div className="flex items-center gap-3 px-4 py-2 bg-pine-50 rounded-button border border-pine-200">
    <span className="text-2xl">🏕️</span>
    <div>
      <div className="text-2xl font-display font-bold text-pine-700">24</div>
      <div className="text-xs text-pine-600 font-medium">Campgrounds</div>
    </div>
  </div>

  <div className="flex items-center gap-3 px-4 py-2 bg-brand-50 rounded-button border border-brand-200">
    <span className="text-2xl">📸</span>
    <div>
      <div className="text-2xl font-display font-bold text-brand-700">142</div>
      <div className="text-xs text-brand-600 font-medium">Photos</div>
    </div>
  </div>
</div>
```

---

## Color Usage Guidelines

### DO:
- Use `brand-500` for primary CTAs
- Use `pine` colors for success states and nature-related elements
- Use `sand` colors for backgrounds and borders
- Use `ink` for all body text (never pure black)
- Use `bg-white` for cards and elevated surfaces

### DON'T:
- Don't use `brand` colors for body text (readability)
- Don't use gray-100/200 (use sand instead)
- Don't use pure white (#FFFFFF) for backgrounds (use sand-50)
- Don't use pure black for text (use ink)

---

## Accessibility Notes
- All text meets WCAG AA contrast requirements
- Minimum body text is `text-base` (16px)
- Focus states clearly visible with ring utilities
- Hover states provide clear affordance
- Icon-only buttons include aria-labels
