# LinkLoom

Welcome to LinkLoom—a simple, fast, and beautiful way to save and organize your bookmarks. Built for people who want a clean, dark-mode experience and powerful tagging, without the clutter.

---

## Why LinkLoom?

I built LinkLoom because I was tired of losing track of great links. With LinkLoom, you can quickly save, tag, and find your bookmarks from any device. It’s private, fast, and focused on what matters: your links.

---

## What’s Inside?

- **Next.js 15** (App Router, Server Actions, Client Components)
- **Supabase** (Postgres, Auth, RLS)
- **Tailwind CSS** (fully dark, responsive)
- **TypeScript** (strict, safe)

---

## ✨ Features

- Email/password & GitHub OAuth authentication
- Add, edit, and delete bookmarks
- Tag bookmarks (with chips, filtering)
- Search and filter your collection instantly
- Responsive dashboard—works great on mobile and desktop
- Undo accidental deletes (snackbar)
- Loading skeletons, empty states, and error banners
- SEO, favicon, and social sharing cards

---

## 📝 Setup & Local Development

1. **Clone the repo:**
   ```sh
   git clone https://github.com/<your-username>/LinkLoom-weave-your-thoughts.git
   cd LinkLoom-weave-your-thoughts
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure Supabase:**
   - Create a Supabase project
   - Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY` to a `.env.local` file:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
     ```
   - Run the SQL in `supabase/schema.sql` to set up tables and RLS
4. **Run locally:**
   ```sh
   npm run dev
   ```

---

## 🌐 Live Demo

[https://link-loom-weave-your-thoughts.vercel.app](https://link-loom-weave-your-thoughts.vercel.app)

---

## 🤝 Contributing

Found a bug or have an idea? Open an issue or PR—let’s make LinkLoom better together.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

> From shadows, with obsession.
