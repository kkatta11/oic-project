

# Oracle Integration Project UI Template

## Overview
A faithful recreation of the Oracle Integration Cloud (OIC) project dashboard using Oracle's Redwood design theme — featuring the characteristic warm color palette, clean typography, and card-based layout shown in the reference screenshot.

## Design Theme — Oracle Redwood
- **Color palette**: Dark header bar (#312D2A), warm neutrals, white card backgrounds, gold/amber accents
- **Typography**: Clean sans-serif (Oracle Sans style via system fonts), bold section headers
- **Status badges**: Green for "Active", olive/dark for "Configured"
- **Subtle decorative banner strip** below the header (gold/amber marble pattern via CSS gradient)

## Layout & Components

### 1. Top Header Bar
- Oracle logo/branding on the left
- Project instance name on the right
- Notification and user avatar icons

### 2. Project Title Bar
- Bold project name (e.g., "Smart Invoice Validation AgAI")

### 3. Navigation Tabs
- Three tabs: **Design** (active), **Deploy**, **Observe**
- Toggle view icons (list/card) and action icons (edit, save, etc.) on the right

### 4. Left Sidebar Navigation
- Vertical icon-based navigation with icons for different sections (Integrations, Connections, Lookups, etc.)
- Active state highlighting

### 5. Main Content Area — Card Grid (2 columns)

**Card 1: Integrations**
- Header with title + "Add" button (+)
- List of integration items, each showing: flow icons → name, version number, status badge (Active/Configured), actions menu (⋯)
- Some items include a description subtitle
- "View all 14 integration(s)" link at bottom

**Card 2: Connections**
- Header with title + "Add" button (+)
- List of connection items: icon, type label, connection name, role (Trigger/Invoke/Trigger and Invoke), status badge, actions menu
- "View all 9 connection(s)" link at bottom

**Card 3: Lookups**
- Header with title + "Add" button
- Amber underline accent
- Description: "Map values between applications."

**Card 4: Libraries**
- Header with title + "Add" button
- Amber underline accent
- Description: "Use JavaScript functions and libraries in your integrations."

### 6. Search Bar
- Positioned top-right of the content area
- Placeholder: "Full or partial name or keyword or description"

## Data
- All content will use realistic sample/mock data matching the screenshot (integration names, connection types, versions, statuses)
- No backend needed — purely static template with hardcoded sample data

## Pages
- Single-page dashboard (Design tab view)
- Tab switching will be visual only (highlighting active tab)

