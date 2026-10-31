<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

- Map the connected project's public Supabase settings in Next.js configuration; never expose private keys.
- Use the cookie-aware Supabase client from src/lib/supabase/client for browser integrations so authentication shares one session.
- Keep shared layout filenames lowercase to match imports on case-sensitive hosts.
