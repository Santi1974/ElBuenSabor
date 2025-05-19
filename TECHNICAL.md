# Technical Documentation

This document provides technical details about the source code and architecture of the El Buen Sabor project.

## Theme System

The project uses a comprehensive theming system based on CSS variables to ensure consistent styling throughout the application.

### Theme Implementation: src/styles/theme.css

```css
:root {
  /* Color Palette */
  --color-primary: #D87D4D;
  --color-danger: #FF4F4F;
  --color-white-primary: #F9F9F9;
  --color-white-secondary: #EEEEEE;
  --color-success: #6DBC62;
  --color-interface: #747474;

  /* Derived Colors */
  --color-primary-light: #E69A74;
  --color-primary-dark: #C06A3D;
  /* ... additional derived colors ... */

  /* Functional Colors */
  --color-text-primary: #333333;
  --color-text-secondary: #666666;
  /* ... additional functional colors ... */
  
  /* Spacing, Typography, and Border Radius variables */
  /* ... */
}
```

**Technical Description:**
- Uses CSS custom properties (variables) for consistent theming
- Organizes colors into logical groups:
  - Base palette: The core brand colors
  - Derived colors: Variations of base colors (light/dark versions)
  - Functional colors: Purpose-specific colors (text, backgrounds)
- Includes comprehensive design tokens for spacing, typography, and border radius
- Follows a single source of truth principle for design values

### Theme Usage

The theme variables are imported in the main index.css file and are globally available. Components use these variables to maintain consistent styling:

```css
/* Example of theme variable usage in Button.css */
.button--primary {
  background-color: var(--color-primary);
  color: white;
}

.button--primary:hover {
  background-color: var(--color-primary-dark);
}
```

## Source Code Documentation

### Entry Point: main.tsx

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Technical Description:**
- Uses React 18's `createRoot` API for concurrent rendering capabilities
- Implements `StrictMode` to highlight potential problems in the application during development
- Renders the main `App` component into the DOM element with id 'root'
- Imports global styles from index.css

### Main Component: App.tsx

```tsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from './components'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>El Buen Sabor</h1>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="button-showcase">
        <h2>Button Variants</h2>
        <div className="button-row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
        
        <h2>Button Sizes</h2>
        <div className="button-row">
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
```

**Technical Description:**
- Functional component using React Hooks (`useState`) for state management
- Demonstrates basic state handling with a counter
- Imports and displays SVG assets from both the project's assets directory and the public directory
- Component-specific styles imported from App.css
- Uses React Fragments (`<>...</>`) to avoid unnecessary DOM nodes
- Demonstrates basic event handling with the onClick event
- Imports and implements the Button component with various variants and sizes
- Contains a showcase section to display different Button variants and sizes

### Button Component: src/components/Button/Button.tsx

```tsx
import { ButtonHTMLAttributes } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '', 
  ...props 
}: ButtonProps) => {
  const buttonClass = `button button--${variant} button--${size} ${className}`;
  
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
```

**Technical Description:**
- Functional component that extends the native HTML button element
- TypeScript interface `ButtonProps` extends HTML button attributes for full functionality
- Provides customization through variant and size props with default values
- Supported variants:
  - `primary`: Orange button (#D87D4D) for primary actions
  - `secondary`: Light gray button for secondary actions
  - `outline`: Transparent button with colored border
  - `danger`: Red button (#FF4F4F) for destructive actions
  - `success`: Green button (#6DBC62) for confirmation actions
- Supported sizes: `small`, `medium` (default), and `large`
- Uses CSS classes to style the button based on variant and size
- Implements TypeScript union types for strongly typed props
- Spreads remaining props to the HTML button element using the rest parameter
- Uses theme variables for consistent styling

### Component Export Pattern: src/components/Button/index.ts

```tsx
export { default } from './Button';
export type { ButtonProps } from './Button';
```

**Technical Description:**
- Uses barrel file pattern for cleaner imports
- Re-exports the default Button component
- Re-exports the ButtonProps type for TypeScript support

### Component Directory Structure

```
src/components/
├── Button/
│   ├── Button.tsx       # Component implementation
│   ├── Button.css       # Component-specific styles
│   └── index.ts         # Barrel file for exports
└── index.ts             # Root barrel file for all components
```

**Technical Description:**
- Components are organized in their own directories
- Each component directory contains the component file, styles, and index
- Root barrel file exports all components from a single entry point

## Project Architecture

### Component Structure
The project follows a standard React component architecture:
- Components are defined in .tsx files
- Each component is a function that returns JSX
- State is managed using React Hooks
- Components are organized in a modular directory structure

### Styling Approach
- CSS modules for component-specific styling
- Global CSS for application-wide styles
- BEM-inspired naming convention for CSS classes (block__element--modifier)

### Asset Management
- SVG and other static assets are stored in:
  - `src/assets/` for imported assets
  - `public/` for assets served directly

## Build System

Vite is used as the build tool with the following configurations:

### Development Mode
- Hot Module Replacement (HMR) for instant feedback
- Fast refresh for React components
- Optimized dependency pre-bundling

### Production Build
- Code splitting for optimal loading
- Asset optimization (minification, tree-shaking)
- Generation of static assets

## TypeScript Configuration

The project uses TypeScript with the following key settings:
- Strict type checking
- JSX support for React
- Modern JavaScript features
- Type interfaces for components with proper documentation

## Tooling Integration

### ESLint
- Code quality enforcement
- React-specific rules
- TypeScript integration

## Performance Considerations

- React StrictMode is enabled for development to identify potential issues
- Modern React APIs (createRoot) are used for optimal rendering performance
- CSS selectors follow specificity best practices 