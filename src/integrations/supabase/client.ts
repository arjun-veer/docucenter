import { createClient } from "@/lib/supabase/client";

// Share the Next.js cookie-aware client and database types with the application.
export const supabase = createClient();
