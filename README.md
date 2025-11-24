# E-commerce Admin Dashboard

A simple e-commerce admin web app for managing products, orders, and customers.  
Built as a learning project to practice React, echarts, and API integration.

## Features

- View product list with search and filters
- Create, edit, and delete products
- Manage orders and update order status
- View customer details
- Responsive layout for desktop and tablet

## Tech Stack

- Frontend: React, TypeScript, Vite (or Next.js)
- UI: Tailwind CSS (or other UI library)
- State Management: (e.g. React Query / Redux / Context API)
- API: Mock API with JSON Server / custom Node.js backend

## Getting Started

### Prerequisites

- Node.js (version XX or above)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo-name.git

# Go into the project folder
cd your-repo-name

# Install dependencies
npm install
# or
yarn install
```

# E-commerce Admin Dashboard

A small e-commerce admin web app for managing **products**, **orders**, and **customers**.

This project is mainly a **learning sandbox** for practicing:

- React component structure and layout
- Data fetching with React Query
- Form handling and validation with Ant Design
- Data aggregation for charts (ECharts)
- Working with a mock REST API (JSON Server)

---

## Features

### Dashboard

- **Total Revenue** card
  - Calculated from all orders `total` field
  - Shows a simple month‑over‑month growth rate
- **Average Monthly Revenue** card
  - Uses aggregated revenue of the last few months
- **Top 5 Selling Products**
  - Based on order items quantity
  - Colored horizontal bars, similar to real admin UIs
- **Monthly Sales Trend**
  - Line + area chart (ECharts)
  - Aggregated revenue by month from orders
- **Product Rating Statistics**
  - Donut chart with 1–5 stars distribution
  - Center shows average rating and total rating count
- **Order Status Statistics**
  - Custom "pill" bars for each status (Paid / Shipped / Cancelled / Refunded / Pending)
  - Height is proportional to the count of orders per status
- **Customer Distribution by Continent**
  - Horizontal bar chart using ECharts
  - Aggregates customers by country → continent (Africa / Europe / Asia / North America / South America / Oceania)

### Products

- Product table with:
  - Name, SKU, price, stock, active status, created date
  - Basic search box (by name / SKU / created time)
- **Create Product** drawer
  - Built with Ant Design `Drawer` + `Form`
  - Uses React Query `useMutation` to POST to mock API
  - Basic validation rules:
    - `name`: required
    - `sku`: required (should be unique logically)
    - `categoryId`: required, positive integer
    - `price`: required, number > 0
    - `cost`: optional, number > 0 if provided
    - `stock`: required, integer ≥ 0
    - `active`: boolean switch
    - `thumbnail`: optional, URL format
  - On success: reset form, close drawer, and refetch product list

### Customers

- Customer table with:
  - ID, name, gender, country, created time
- **Create Customer** drawer
  - Simple form to add a new customer
  - Auto‑generates `id` based on current max id + 1
  - Auto‑fills `createdAt` with current time
- Customer distribution chart on dashboard (see above)

### Orders

- Orders table (read‑only for now)
- Order data is used to drive:
  - Revenue cards
  - Monthly sales trend chart
  - Order status statistics

---

## Tech Stack

- **Framework**: React + Vite
- **UI Components**: Ant Design
- **Charts**: Apache ECharts
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Mock Backend**: JSON Server (using `mock/db.json`)
- **Language**: JavaScript (ES6+)

---

## Project Structure (simplified)

```bash
ecommerce-admin/
  ├─ src/
  │  ├─ api/           # axios + React Query API helpers
  │  ├─ components/    # reusable UI components
  │  ├─ features/
  │  │  ├─ dashboard/  # dashboard charts & cards
  │  │  ├─ products/   # product table + create drawer
  │  │  ├─ orders/     # orders table
  │  │  └─ customers/  # customers table + create drawer
  │  ├─ hooks/         # custom hooks (aggregations, queries)
  │  └─ App.jsx
  ├─ mock/
  │  └─ db.json        # mock data for products/orders/customers
  ├─ README.md
  └─ ...
```

_(The exact structure may differ slightly from the real project, but this is the general idea.)_

---

## Data & API

All data is served from a local JSON Server instance.

- Products: `GET /api/products`, `POST /api/products`
- Orders: `GET /api/orders`
- Customers: `GET /api/customers`, `POST /api/customers`

React Query is used to:

- Cache list data (products, orders, customers)
- Refetch lists after successful mutations

Aggregation logic (for charts) is implemented with small helper functions in `hooks` / `aggregate` utilities.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
yarn install
```

### 2. Start mock API (JSON Server)

```bash
# Example: adjust the script/port to match your package.json
npm run mock
```

This serves `mock/db.json` as a REST API.

### 3. Start frontend dev server

```bash
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

---

## Deployment

You can deploy this project to **Vercel**, **Netlify**, or any static hosting that supports Vite builds.

Typical steps:

1. Push this repository to GitHub.
2. On Vercel, import the repo.
3. Build command: `npm run build`
4. Output directory: `dist`

JSON Server is only used locally, so the production demo will show static mock data unless you connect it to a real backend.

---

## Next Steps / Ideas

- Edit & delete products / customers
- Order detail drawer + timeline
- Auth (admin login)
- Dark theme
- More charts on dashboard (conversion rate, repeat customers, etc.)

This project is mainly for practice. Feel free to fork it and experiment with your own ideas.
