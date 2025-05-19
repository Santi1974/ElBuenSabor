# El Buen Sabor - React + TypeScript + Vite

This project is a modern web application built using React, TypeScript, and Vite.

> **Note:** For comprehensive documentation, please see the [Documentation Index](./DOCUMENTATION_INDEX.md).

## Project Documentation

### Overview
El Buen Sabor is a web application built with React and TypeScript using Vite as the build tool. This project provides a fast development environment with hot module replacement (HMR) and optimized production builds.

### Color System
The application uses a consistent color system based on the following palette:
- **Primary**: #D87D4D (Orange) - Main brand color
- **Danger**: #FF4F4F (Red) - For destructive actions
- **White Primary**: #F9F9F9 (Light gray) - Primary background
- **White Secondary**: #EEEEEE (Medium gray) - Secondary background
- **Success**: #6DBC62 (Green) - For confirmations
- **Interface**: #747474 (Dark gray) - For non-client interfaces

The color system is implemented through CSS variables in `src/styles/theme.css`.

### Project Structure
```
el-buen-sabor/
├── node_modules/        # Dependencies
├── public/              # Static assets
├── src/                 # Source code
│   ├── assets/          # Project assets (images, fonts, etc.)
│   ├── styles/          # Global styles and theme
│   ├── components/      # Reusable UI components
│   ├── main.tsx         # Application entry point
│   ├── App.tsx          # Main App component
│   ├── App.css          # App-specific styles
│   ├── index.css        # Global styles
│   └── vite-env.d.ts    # Vite environment type declarations
├── .gitignore           # Git ignore configuration
├── CHANGELOG.md         # Project changelog
├── eslint.config.js     # ESLint configuration
├── index.html           # HTML entry point
├── package.json         # Project metadata and dependencies
├── tsconfig.json        # TypeScript configuration
├── tsconfig.app.json    # App-specific TypeScript configuration
├── tsconfig.node.json   # Node-specific TypeScript configuration
└── vite.config.ts       # Vite configuration
```

### Getting Started

1. **Prerequisites**
   - Node.js (v14.0.0 or later)
   - npm (v6.0.0 or later)

2. **Installation**
   ```bash
   npm install
   ```

3. **Development**
   ```bash
   npm run dev
   ```
   This will start the development server at http://localhost:5173/

4. **Building for Production**
   ```bash
   npm run build
   ```
   This will generate optimized assets in the `dist` directory.

5. **Running Tests**
   ```bash
   npm run test
   ```

### Technologies Used
- **React**: A JavaScript library for building user interfaces
- **TypeScript**: Typed superset of JavaScript
- **Vite**: Next-generation frontend tooling
- **ESLint**: Code quality tool
- **CSS**: Styling

### Project Conventions
- Component files use `.tsx` extension
- Style files use `.css` extension
- TypeScript strict mode is enabled

## Development Notes

For detailed information about the development process, refer to the [CHANGELOG.md](./CHANGELOG.md).

## ESLint Configuration

This project uses ESLint for code quality. The configuration can be expanded as described below:

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
