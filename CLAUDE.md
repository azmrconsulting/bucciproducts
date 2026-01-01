# Bucci Products - Development Guidelines

## Project Overview
Premium hair care e-commerce site with a luxury black and gold aesthetic.

## Design System

### Color Palette
| Color | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| Black | `--black` | `#0a0a0a` | Primary background |
| Charcoal | `--charcoal` | `#141414` | Secondary background |
| Gold | `--gold` | `#c9a962` | Accent, CTAs, prices |
| Gold Light | `--gold-light` | `#d4b978` | Hover states |
| Gold Dark | `--gold-dark` | `#a68b4b` | Pressed states |
| Ivory | `--ivory` | `#f5f0e8` | Primary text |
| Gray | `--gray` | `#888` | Secondary text |
| Gray Dark | `--gray-dark` | `#555` | Tertiary text, borders |

### Typography
- **Display Font**: `var(--font-display)` - Bodoni Moda (headings, labels, buttons)
- **Body Font**: `var(--font-body)` - Libre Baskerville (body text)

### Tailwind Color Classes
```
text-gold      - Gold accent text (#c9a962)
text-ivory     - Primary text (#f5f0e8)
text-gray      - Secondary text (#888)
bg-black       - Primary background
bg-charcoal    - Card/secondary background
```

---

## Admin Panel Guidelines

### Required Classes for Admin Pages

#### Page Structure
```jsx
<div>
  {/* Page Header */}
  <div className="admin-page-header">
    <div>
      <h1 className="admin-page-title">Page Title</h1>
      <p className="admin-page-subtitle">Subtitle text</p>
    </div>
    <Link href="/admin/..." className="admin-btn admin-btn-primary">
      Action Button
    </Link>
  </div>

  {/* Content */}
</div>
```

#### Cards
```jsx
<div className="admin-card">
  <div className="admin-card-header">
    <h2 className="admin-card-title">Card Title</h2>
  </div>
  <div className="admin-card-body">
    {/* Card content */}
  </div>
</div>
```

#### Tables
```jsx
<div className="admin-card">
  <div className="admin-table-container">
    <table className="admin-table">
      <thead>
        <tr>
          <th>Column</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="admin-td-primary">Primary text</td>
          <td className="admin-td-secondary">Secondary text</td>
          <td className="admin-td-gold">$99.00</td>
          <td>
            <Link className="admin-td-link">View</Link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

#### Buttons
```jsx
<button className="admin-btn admin-btn-primary">Primary</button>
<button className="admin-btn admin-btn-secondary">Secondary</button>
<button className="admin-btn admin-btn-danger">Delete</button>
```

#### Badges (Status)
```jsx
<span className="admin-badge admin-badge-pending">Pending</span>
<span className="admin-badge admin-badge-confirmed">Confirmed</span>
<span className="admin-badge admin-badge-processing">Processing</span>
<span className="admin-badge admin-badge-shipped">Shipped</span>
<span className="admin-badge admin-badge-delivered">Delivered</span>
<span className="admin-badge admin-badge-cancelled">Cancelled</span>
<span className="admin-badge admin-badge-active">Active</span>
<span className="admin-badge admin-badge-inactive">Inactive</span>
```

#### Forms
```jsx
<label className="admin-form-label">Label</label>
<input className="admin-form-input" />
<select className="admin-form-select">...</select>
<textarea className="admin-form-input" />
```

#### Search
```jsx
<div className="admin-search">
  <Search /> {/* lucide-react icon */}
  <input type="text" placeholder="Search..." />
</div>
```

#### Grid Layouts
```jsx
<div className="admin-grid-2">...</div>  {/* 2 columns */}
<div className="admin-grid-3">...</div>  {/* 3 columns */}
<div className="admin-grid-4">...</div>  {/* 4 columns */}
```

### Text Colors in Admin
- **Primary text**: `text-ivory` or `#f5f0e8`
- **Secondary/labels**: `text-gray` or `#888`
- **Tertiary/muted**: `#666` or `#555`
- **Prices/accents**: `text-gold` or `#c9a962`
- **Success**: `text-green-400`
- **Error**: `text-red-400`

### Borders in Admin
- Card borders: `border-white/10` or `rgba(201, 169, 98, 0.1)`
- Dividers: `border-white/10`
- Hover borders: `rgba(201, 169, 98, 0.3)`

### DO NOT USE in Admin Pages
- `bg-white` - Use `admin-card` or dark backgrounds
- `text-gray-900`, `text-gray-600` - Use `text-ivory`, `text-gray`
- `border-gray-200` - Use `border-white/10`
- Light theme Tailwind classes

---

## Storefront Guidelines

### Button Classes
```jsx
<button className="btn btn-primary">Shop Now</button>
<button className="btn btn-secondary">Learn More</button>
<button className="btn btn-outline">Outline</button>
```

### Card Classes
```jsx
<div className="card">
  <div className="card-content">...</div>
</div>
```

### Section Structure
```jsx
<section className="section-container">
  <div className="section-header">
    <span className="section-label">Label</span>
    <h2 className="section-title">Title with <em>emphasis</em></h2>
    <p className="section-intro">Introduction text</p>
  </div>
  {/* Section content */}
</section>
```

---

## Image Handling

### Product Images with Fallback
Always use the `ProductImage` component for product images that may fail to load:

```jsx
import ProductImage from '@/components/admin/ProductImage';

<ProductImage src={product.images[0]?.url} alt={product.name} />
```

This component shows a bottle placeholder when:
- No image URL exists
- Image fails to load

---

## File Structure
```
src/
├── app/
│   ├── admin/           # Admin panel pages
│   ├── account/         # Customer account pages
│   ├── (storefront)/    # Public storefront pages
│   └── api/             # API routes
├── components/
│   ├── admin/           # Admin-specific components
│   └── ...              # Shared components
└── lib/                 # Utilities, auth, prisma
```

## Key Dependencies
- **Framework**: Next.js 15 (App Router)
- **Database**: Prisma with PostgreSQL
- **Auth**: NextAuth.js
- **Payments**: Stripe
- **Images**: Cloudinary
- **Icons**: lucide-react
- **Styling**: Tailwind CSS + Custom CSS

---

## Environment Variables

### Required for Image Uploads (Cloudinary)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Setup:**
1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Add to `.env` file and Vercel environment variables
