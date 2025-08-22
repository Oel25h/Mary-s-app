# Development Guide

## Getting Started

This guide will help you set up the development environment for AccAI Personal Finance Dashboard.

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A Supabase account
- Google Gemini API key

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/Oel25h/Mary-s-app.git
cd accai
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your API keys in `.env.local`

5. Start the development server:
```bash
npm run dev
```

### Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ai/             # AI-related components
│   ├── auth/           # Authentication components
│   ├── budgets/        # Budget management
│   ├── charts/         # Data visualization
│   ├── dashboard/      # Dashboard components
│   ├── import/         # Data import functionality
│   ├── layout/         # Layout components
│   ├── settings/       # Settings pages
│   ├── transactions/   # Transaction management
│   ├── ui/             # Reusable UI components
│   └── utils/          # Utility components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utility libraries
├── services/           # API services
└── types/              # TypeScript type definitions
```

### Development Guidelines

#### Code Style
- Use TypeScript for all new code
- Follow the existing naming conventions
- Use meaningful component and variable names
- Add JSDoc comments for complex functions

#### Component Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Ensure mobile responsiveness
- Add accessibility attributes

#### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets
- Use dynamic imports for large components

### Testing

Run the type checker:
```bash
npm run type-check
```

Check code formatting:
```bash
npm run format:check
```

### Deployment

The application is deployed to Netlify automatically when pushing to the main branch.

Manual deployment:
```bash
npm run build
netlify deploy --prod
```