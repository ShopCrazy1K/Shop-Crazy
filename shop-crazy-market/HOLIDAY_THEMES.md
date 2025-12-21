# 🎨 Holiday Theme System

## Overview

The theme system now supports both monthly themes and special holiday themes! Holidays take priority over monthly themes, so if it's a holiday, the holiday theme will be displayed.

## Holiday Themes

### 🎄 Christmas (December 1-25)
- **Theme**: `christmas-toon`
- **Background**: Red (`bg-red-100`)
- **Accent**: Green (`text-green-600`)
- **Font**: Cartoon (`font-cartoon`)
- **Animation**: Wiggle (`animate-wiggle`)

### 🖤 Black History Month (February)
- **Theme**: `black-history`
- **Background**: Black (`bg-black`)
- **Accent**: Yellow (`text-yellow-400`)
- **Font**: Neon (`font-neon`)
- **Animation**: Neon Pulse (`animate-neon-pulse`)

### 🐣 Easter (April)
- **Theme**: `easter-toon`
- **Background**: Emerald (`bg-emerald-100`)
- **Accent**: Pink (`text-pink-500`)
- **Font**: Cartoon (`font-cartoon`)
- **Animation**: Bounce Soft (`animate-bounce-soft`)

### 🎃 Halloween (October 1-31)
- **Theme**: `halloween-spooky`
- **Background**: Orange Dark (`bg-orange-900`)
- **Accent**: Purple Light (`text-purple-300`)
- **Font**: Spooky (`font-spooky`)
- **Animation**: Float (`animate-float`)

### 🇺🇸 July 4th (July 1-4)
- **Theme**: `july-4th`
- **Background**: Blue Dark (`bg-blue-900`)
- **Accent**: Red (`text-red-400`)
- **Font**: Neon (`font-neon`)
- **Animation**: Neon Pulse (`animate-neon-pulse`)

## Monthly Themes (Fallback)

When no holiday is active, the system falls back to monthly themes:

### January - Winter Slime
- Background: Cyan (`bg-cyan-100`)
- Font: Winter (`font-winter`)
- Animation: Slime Drip (`animate-slime-drip`)

### April - Spring Cartoon
- Background: Pink (`bg-pink-100`)
- Font: Cartoon (`font-cartoon`)
- Animation: Bounce Soft (`animate-bounce-soft`)

### July - Summer Neon
- Background: Black (`bg-black`)
- Font: Neon (`font-neon`)
- Animation: Neon Pulse (`animate-neon-pulse`)

### October - Spooky Toon
- Background: Purple Dark (`bg-purple-900`)
- Font: Spooky (`font-spooky`)
- Animation: Float (`animate-float`)

### Default (Other Months)
- Background: Yellow (`bg-yellow-100`)
- Font: Cartoon (`font-cartoon`)
- Animation: Wiggle (`animate-wiggle`)

## Fonts

The following Google Fonts are loaded:
- **Comic Neue** - Cartoon style
- **Press Start 2P** - Neon/retro style
- **Creepster** - Spooky style
- **Fredoka One** - Winter style

## Animations

All animations are defined in `globals.css`:

- `animate-slime-drip` - Vertical drip effect
- `animate-neon-pulse` - Pulsing glow effect
- `animate-bounce-soft` - Gentle bounce
- `animate-float` - Floating up and down
- `animate-wiggle` - Subtle rotation wiggle

## Implementation

### Files Created/Updated

1. **`/lib/holidayTheme.ts`** (NEW)
   - Contains `getHolidayTheme()` function
   - Returns holiday theme if active, `null` otherwise

2. **`/lib/theme.ts`** (UPDATED)
   - Imports `getHolidayTheme()`
   - Checks for holidays first before falling back to monthly themes
   - Returns `ThemeConfig` object

3. **`/components/ThemeProvider.tsx`** (UPDATED)
   - Uses `getMonthlyTheme()` which includes holiday check
   - Applies theme classes to wrapper div
   - Adds `data-theme` attribute for CSS targeting

4. **`/app/globals.css`** (UPDATED)
   - Added Google Fonts imports
   - Added font classes (`.font-cartoon`, `.font-neon`, etc.)
   - Added animation keyframes and classes

## Usage

The theme system is automatically applied via `ThemeProvider` in the root layout. No additional code needed!

The theme changes automatically based on:
1. **Holiday dates** (takes priority)
2. **Current month** (fallback)

## Testing

To test different themes, you can temporarily modify the date in `getHolidayTheme()` or `getMonthlyTheme()`:

```typescript
// Test Christmas theme
const today = new Date('2024-12-15');

// Test Halloween theme
const today = new Date('2024-10-31');

// Test July 4th theme
const today = new Date('2024-07-04');
```

## Customization

To add a new holiday theme:

1. Add the holiday check in `/lib/holidayTheme.ts`:
```typescript
// 🎉 NEW YEAR (Jan 1)
if (month === 1 && day === 1) {
  return {
    name: "new-year",
    bg: "bg-gold-100",
    accent: "text-purple-600",
    font: "font-neon",
    animation: "animate-neon-pulse",
  };
}
```

2. Add any custom fonts to `/app/globals.css` if needed
3. Add any custom animations to `/app/globals.css` if needed

## Notes

- Holiday themes take priority over monthly themes
- Themes update automatically based on the current date
- All themes include smooth transitions (`transition-all duration-700`)
- The `data-theme` attribute can be used for CSS targeting specific themes

