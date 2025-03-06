-- Check if storage bucket exists and create if needed
INSERT INTO storage.buckets (id, name, public)
SELECT 'documents', 'Document Storage', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'documents'
);

-- Add appropriate RLS policies for the documents bucket
CREATE POLICY "Anyone can view documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can update their own documents" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Check if user_documents table exists and create if needed
CREATE TABLE IF NOT EXISTS public.user_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    category TEXT DEFAULT 'Uncategorized',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS to user_documents table
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
ON public.user_documents FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own documents"
ON public.user_documents FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own documents"
ON public.user_documents FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own documents"
ON public.user_documents FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Check if exams table exists and create if needed
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    registration_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    exam_date TIMESTAMP WITH TIME ZONE,
    result_date TIMESTAMP WITH TIME ZONE,
    answer_key_date TIMESTAMP WITH TIME ZONE,
    website_url TEXT NOT NULL,
    eligibility TEXT,
    application_fee TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS to exams table
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified exams"
ON public.exams FOR SELECT
USING (is_verified = true);

CREATE POLICY "Admins can manage all exams"
ON public.exams 
TO authenticated
USING (
    -- This assumes you have a user_roles table with role information
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Check if user_exam_subscriptions table exists and create if needed
CREATE TABLE IF NOT EXISTS public.user_exam_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, exam_id)
);

-- Add RLS to user_exam_subscriptions table
ALTER TABLE public.user_exam_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
ON public.user_exam_subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own subscriptions"
ON public.user_exam_subscriptions 
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Check if pending_exams table exists and create if needed
CREATE TABLE IF NOT EXISTS public.pending_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    registration_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    exam_date TIMESTAMP WITH TIME ZONE,
    result_date TIMESTAMP WITH TIME ZONE,
    answer_key_date TIMESTAMP WITH TIME ZONE,
    website_url TEXT NOT NULL,
    eligibility TEXT,
    application_fee TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS to pending_exams table
ALTER TABLE public.pending_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pending exams"
ON public.pending_exams 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create an index on user_id to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON public.user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_subscriptions_user_id ON public.user_exam_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_subscriptions_exam_id ON public.user_exam_subscriptions(exam_id);

-- Check if profiles table exists and create if needed
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS to profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'user'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a user is created
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_profile_for_user();
