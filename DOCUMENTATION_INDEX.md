# Documentation Index

This file serves as an entry point to all documentation in the El Buen Sabor project.

## Project Documentation

- [README.md](./README.md) - Main project documentation with setup instructions
- [CHANGELOG.md](./CHANGELOG.md) - History of changes to the project
- [ROADMAP.md](./ROADMAP.md) - Future development plans

## Development Documentation

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Documentation of the development process
- [TECHNICAL.md](./TECHNICAL.md) - Technical documentation of the source code
- [WORK_LOG.md](./WORK_LOG.md) - Step-by-step log of development work

## Design System

The project uses a comprehensive design system based on CSS variables:

### Color Palette
- **Primary**: #D87D4D (Orange) - Main brand color
- **Danger**: #FF4F4F (Red) - For destructive actions
- **White Primary**: #F9F9F9 (Light gray) - Primary background
- **White Secondary**: #EEEEEE (Medium gray) - Secondary background
- **Success**: #6DBC62 (Green) - For confirmations
- **Interface**: #747474 (Dark gray) - For non-client interfaces

### Theme Variables
The design system is implemented through CSS variables in `src/styles/theme.css` and includes:
- Base colors
- Derived colors (lighter/darker variants)
- Functional colors (text, backgrounds)
- Spacing variables
- Typography variables
- Border radius variables

## Pages

### Login Page
The application includes a responsive login page with:
- Split-screen layout (food image on left, form on right)
- Email/password login form
- Google authentication option
- Registration link for new users
- Responsive design for all screen sizes

## Project Structure

```
el-buen-sabor/
├── Documentation Files
│   ├── README.md              # Project overview and setup
│   ├── CHANGELOG.md           # History of changes
│   ├── DEVELOPMENT.md         # Development process documentation
│   ├── TECHNICAL.md           # Technical documentation
│   ├── WORK_LOG.md            # Development work log
│   ├── ROADMAP.md             # Future development plans
│   └── DOCUMENTATION_INDEX.md # This file
│
├── Configuration Files
│   ├── package.json           # Project dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── tsconfig.app.json      # App-specific TypeScript config
│   ├── tsconfig.node.json     # Node-specific TypeScript config
│   ├── eslint.config.js       # ESLint configuration
│   └── .gitignore             # Git ignore rules
│
├── Source Code
│   ├── src/                   # Source directory
│   │   ├── assets/            # Project assets
│   │   │   └── google-icon.svg # Google icon for login
│   │   ├── styles/            # Global styles
│   │   │   └── theme.css      # Theme variables
│   │   ├── components/        # React components
│   │   │   ├── Button/        # Button component
│   │   │   │   ├── Button.tsx # Button implementation
│   │   │   │   ├── Button.css # Button styles
│   │   │   │   └── index.ts   # Button exports
│   │   │   └── index.ts       # Components barrel file
│   │   ├── pages/             # Page components
│   │   │   ├── Login/         # Login page 
│   │   │   │   ├── Login.tsx  # Login implementation
│   │   │   │   ├── Login.css  # Login styles
│   │   │   │   └── index.ts   # Login exports
│   │   │   └── index.ts       # Pages barrel file
│   │   ├── main.tsx           # Application entry point
│   │   ├── App.tsx            # Main App component
│   │   ├── App.css            # App-specific styles
│   │   ├── index.css          # Global styles
│   │   └── vite-env.d.ts      # Vite type declarations
│   │
│   ├── public/                # Static assets
│   │   └── vite.svg           # Vite logo
│   │
│   └── index.html             # HTML entry point
```

## Getting Started with Documentation

1. Start with the [README.md](./README.md) for an overview of the project and setup instructions.
2. Check the [CHANGELOG.md](./CHANGELOG.md) to understand the project's history.
3. Review the [ROADMAP.md](./ROADMAP.md) to see planned future development.
4. Dive into [TECHNICAL.md](./TECHNICAL.md) for detailed technical documentation of the code.
5. Use [DEVELOPMENT.md](./DEVELOPMENT.md) to understand the development process.
6. Refer to [WORK_LOG.md](./WORK_LOG.md) for a step-by-step history of the work done. 