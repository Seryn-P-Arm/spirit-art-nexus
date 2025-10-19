-- Assign admin role to owner account
DO $$
DECLARE
  owner_user_id uuid;
BEGIN
  -- Get the user ID from profiles for the owner email
  SELECT id INTO owner_user_id
  FROM public.profiles
  WHERE email = 'serynarmstrong@gmail.com';
  
  -- Only proceed if user exists
  IF owner_user_id IS NOT NULL THEN
    -- Remove any existing roles for this user to avoid duplicates
    DELETE FROM public.user_roles WHERE user_id = owner_user_id;
    
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (owner_user_id, 'admin');
  END IF;
END $$;