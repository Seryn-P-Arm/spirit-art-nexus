-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'partner', 'standard');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create gallery categories table
CREATE TABLE public.gallery_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

-- Create gallery artworks table
CREATE TABLE public.gallery_artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  medium TEXT,
  size TEXT,
  year INTEGER,
  image_url TEXT NOT NULL,
  category_id UUID REFERENCES public.gallery_categories(id) ON DELETE SET NULL,
  is_partner_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_artworks ENABLE ROW LEVEL SECURITY;

-- Create merch products table
CREATE TABLE public.merch_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  image_url TEXT NOT NULL,
  redbubble_url TEXT NOT NULL,
  is_early_access BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.merch_products ENABLE ROW LEVEL SECURITY;

-- Create partner content table
CREATE TABLE public.partner_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('wallpaper', 'digital_art', 'preview', 'other')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.partner_content ENABLE ROW LEVEL SECURITY;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign 'standard' role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'standard');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_artworks
  BEFORE UPDATE ON public.gallery_artworks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_merch
  BEFORE UPDATE ON public.merch_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for gallery_categories
CREATE POLICY "Anyone can view categories"
  ON public.gallery_categories FOR SELECT
  TO PUBLIC USING (TRUE);

CREATE POLICY "Admins can manage categories"
  ON public.gallery_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for gallery_artworks
CREATE POLICY "Anyone can view public artworks"
  ON public.gallery_artworks FOR SELECT
  TO PUBLIC USING (is_partner_preview = FALSE);

CREATE POLICY "Partners can view all artworks"
  ON public.gallery_artworks FOR SELECT
  USING (public.has_role(auth.uid(), 'partner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage artworks"
  ON public.gallery_artworks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for merch_products
CREATE POLICY "Standard users can view public merch"
  ON public.merch_products FOR SELECT
  TO PUBLIC USING (is_early_access = FALSE);

CREATE POLICY "Partners can view all merch"
  ON public.merch_products FOR SELECT
  USING (public.has_role(auth.uid(), 'partner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage merch"
  ON public.merch_products FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for partner_content
CREATE POLICY "Partners can view partner content"
  ON public.partner_content FOR SELECT
  USING (public.has_role(auth.uid(), 'partner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage partner content"
  ON public.partner_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));