-- Run this in the Supabase SQL Editor AFTER you have registered the account on the website!

UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'onlinestore7188@gmail.com');
