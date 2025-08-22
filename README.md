# AccAI - Personal Finance Dashboard

A comprehensive AI-powered financial management application built with Next.js and Supabase.

## Features

- Real-time financial dashboard
- AI-powered transaction categorization
- Budget tracking and management
- Secure authentication
- Mobile-responsive design

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI**: Google Gemini API
- **Deployment**: Netlify

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```