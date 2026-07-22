# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
# dqms_frontend


## Folder & File Structure
```
src/
├── components/                       # Shared UI Elements
│   ├── ui/                           # Button, Input, Modal, Card, Badge, Spinner
│   ├── Navbar.jsx                    # Top navigation bar
│   ├── Sidebar.jsx                   # Role-specific sidebar navigation
│   └── ProtectedRoute.jsx            # Role Guard Wrapper (JWT & Role Check)
│
├── features/                         # Core Complex Feature Components
│   ├── auth/                         # Login & Registration Form components
│   ├── dental-chart/                 # Interactive 32-Teeth SVG canvas logic
│   ├── queue/                        # WebSocket connection wrappers & live queue status
│   └── billing/                      # Payment calculators & invoice templates
│
├── layouts/                          # UI Shells wrapping specific user roles
│   ├── PatientLayout.jsx             # Top Nav + Patient Container
│   ├── ReceptionistLayout.jsx        # Compact Operational Sidebar + Main View
│   ├── DentistLayout.jsx             # Fullscreen Wide Monitor Layout
│   └── AdminLayout.jsx               # Admin Sidebar + Metrics Layout
│
├── pages/                            # Explicit View Components (Named by Page)
│   ├── auth/
│   │   ├── LoginPage.jsx             # Route: /login
│   │   └── RegisterPage.jsx          # Route: /register
│   │
│   ├── patient/
│   │   ├── PatientDashboardPage.jsx  # Route: /patient/dashboard
│   │   ├── BookAppointmentPage.jsx   # Route: /patient/book-appointment
│   │   └── PatientHistoryPage.jsx    # Route: /patient/history
│   │
│   ├── receptionist/
│   │   ├── ReceptionistDashboardPage.jsx # Route: /receptionist/dashboard
│   │   ├── BillingPage.jsx           # Route: /receptionist/billing
│   │   ├── InvoiceDetailPage.jsx     # Route: /receptionist/billing/:invoiceId
│   │   └── PatientRegistryPage.jsx   # Route: /receptionist/patients
│   │
│   ├── dentist/
│   │   └── DentistDashboardPage.jsx  # Route: /dentist/dashboard
│   │
│   ├── admin/
│   │   ├── AdminDashboardPage.jsx    # Route: /admin/dashboard
│   │   ├── InventoryPage.jsx         # Route: /admin/inventory
│   │   ├── StaffManagementPage.jsx   # Route: /admin/staff-management
│   │   └── ReportsPage.jsx           # Route: /admin/reports
│   │
│   └── LobbyMonitorPage.jsx          # Route: /lobby (Public TV waiting room view)
│
├── routes/
│   ├── AppRoutes.jsx                 # Main React Router setup (<Routes> & <Route>)
│   └── DashboardRedirect.jsx         # Central redirector (/dashboard -> role page)
│
├── services/                         # External Integrations
│   ├── api.js                        # Axios instance configuration
│   └── socket.js                     # WebSocket connection manager
│
├── context/                          # State Management
│   └── AuthContext.jsx               # User JWT session & role state
│
├── App.jsx                           # Application Root component
└── main.jsx                          # React DOM entry point


```