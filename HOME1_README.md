# Cherry Home Page - Code Implementation

## Overview
This is a coded replacement for the Canva-hosted landing page at `/home1` (test route).

## What Was Built

### Page Structure (11 Sections)
1. **Hero Section** - "Pop the cherry on something new!" with phone mockup
2. **About Cherry** - Platform description with lightbulb icon
3. **Educational Cards** - APS, NSC, NBT explanations
4. **Berry Informed** - App features breakdown
5. **Full Course Feast** - University course explorer
6. **Sow Your Seeds** - APS calculator showcase
7. **Record Your Marks** - Performance tracking feature
8. **Meet the Co-Founders** - Lebea Mpho Maake & Tyrone Kasi
9. **About Us** - Company story and mission
10. **Download CTA** - App store buttons
11. **Contact Section** - Phone, email, social links

### Design System
- **Colors**: Light pink gradient background (#FFC0CB, #FFE4E1), hot pink accents (#FF1493)
- **Typography**: Bold black headings, gray body text
- **Icons**: Emoji-based for simplicity (🧮, 📚, ✅, 💡, 🍽️, 💧, 📈)
- **Components**: Rounded cards, circular icon backgrounds, phone mockups

### Animations (Framer Motion)
- **Scroll-triggered animations**: Fade-in and slide effects
- **Viewport detection**: Animations trigger when sections enter view
- **Hover effects**: Scale transforms on interactive elements
- **Smooth transitions**: 0.6-0.8s duration for professional feel

### Assets Used
- `/HOME_PHOTOS/IMG_3111.PNG` - Insights screen mockup
- `/HOME_PHOTOS/IMG_3112.PNG` - APS calculator mockup  
- `/HOME_PHOTOS/IMG_3113.PNG` - Three phones showcase
- `/HOME_PHOTOS/42c0ffc0-0764-4f56-9ec6-0d975298381a.JPG` - Single phone explore view

### Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Images**: Next.js Image component (optimized)
- **TypeScript**: Full type safety

## Key Features Replicated

### From Canva Page
✅ Pink cloud decorations (SVG components)  
✅ Gradient pink background  
✅ All 11 content sections  
✅ Phone mockups with drop shadows  
✅ Circular icon backgrounds  
✅ Rounded card designs  
✅ Co-founder cards with LinkedIn links  
✅ Download CTA with app store buttons  
✅ Contact information (phone, email, social)  
✅ Scroll animations  

### Improvements Over Canva
✅ Faster page load (no external JS framework)  
✅ SEO optimized with proper meta tags  
✅ Fully responsive design  
✅ Type-safe with TypeScript  
✅ Accessible markup  
✅ Optimized images with Next.js Image  

## To Deploy to Production

1. **Test thoroughly** at `http://localhost:3000/home1`
2. **Replace root route**: Copy `app/home1/page.tsx` to `app/page.tsx`
3. **Remove Canva proxy**: Delete/comment out the edge-proxy rewrites in:
   - `next.config.ts` (rewrites section)
   - `vercel.json` (rewrites section)
   - `app/api/edge-proxy/route.ts` (entire file)
4. **Update navigation**: Change `app/layout.tsx` handleCherryClick to use `/` instead of `/home`

## Customization Guide

### Colors
Edit Tailwind classes in `page.tsx`:
- `bg-pink-100` → Main background
- `text-pink-500` → Accent color
- `bg-pink-400` → Icon circles

### Content
All text is hardcoded strings in the component for easy editing.

### Animations
Adjust `transition={{ duration: 0.6 }}` values in motion components.

### Sections
Each section is self-contained - easy to reorder, add, or remove.

## Performance Notes
- All animations use `whileInView` with `viewport={{ once: true }}` to prevent re-animation on scroll up
- Images use Next.js automatic optimization
- Framer Motion only animates transform/opacity (GPU-accelerated)

## Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Mobile browsers: ✅ Optimized

## Missing Features (To Add Later)
- [ ] Actual co-founder photos (placeholders used)
- [ ] Real LinkedIn links
- [ ] Working app store links
- [ ] Social media links
- [ ] More elaborate cloud animations
- [ ] Intersection observer for progress tracking
- [ ] Sticky navigation with scroll effects
