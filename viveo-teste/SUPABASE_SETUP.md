# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Copy your **Project URL** and **Anon Key**

## Step 2: Configure Environment Variables

Update your `.env.local` file with your Supabase credentials:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `your_project_url_here` with your Supabase Project URL (e.g., `https://xxxxx.supabase.co`)
- `your_anon_key_here` with your Anon Key

## Step 3: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Set the email templates if needed

## Step 4: Test the App

Run your development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── lib/
│   └── supabase.ts              # Supabase client initialization
├── contexts/
│   ├── AuthContext.tsx          # Auth provider component
│   └── AuthContextDef.ts        # Auth context definition
├── hooks/
│   └── useAuth.ts               # useAuth hook
└── Views/
    ├── home.tsx                 # Login page (uses useAuth)
    ├── cadastro.tsx             # Registration page
    └── lista.tsx                # List page
```

## Using Authentication

### In Components:

```tsx
import { useAuth } from '../hooks/useAuth'

export function MyComponent() {
  const { user, login, signup, logout, loading } = useAuth()

  // user - Current logged-in user or null
  // loading - Loading state during auth operations
  // login(email, password) - Sign in
  // signup(email, password) - Create new account
  // logout() - Sign out
}
```

### Sign Up (in cadastro.tsx):

```tsx
const { signup } = useAuth()

const handleSignup = async (email: string, password: string) => {
  try {
    await signup(email, password)
    navigate('/lista')
  } catch (error) {
    console.error('Signup failed:', error)
  }
}
```

### Protect Routes:

You can add a route guard to protect pages that require authentication:

```tsx
// In main.tsx
import { Navigate } from 'react-router-dom'

<Route 
  path="/lista" 
  element={user ? <Lista /> : <Navigate to="/" />} 
/>
```

## Testing

1. Go to `http://localhost:5173`
2. Click "Cadastre-se agora!" to go to signup
3. Create an account with email + password
4. Log in with those credentials
5. You should be redirected to `/lista`

## Common Issues

**"Cannot find module '@supabase/supabase-js'"**
- Run: `npm install @supabase/supabase-js`

**"Missing environment variables"**
- Check `.env.local` exists and has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after changing `.env.local`

**Authentication not working**
- Check that Email provider is enabled in Supabase
- Verify your credentials in `.env.local` are correct
- Check browser console for error messages
