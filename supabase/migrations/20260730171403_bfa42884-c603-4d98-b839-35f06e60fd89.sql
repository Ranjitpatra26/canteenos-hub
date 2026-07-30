INSERT INTO public.user_roles (user_id, role) VALUES
  ('628ee12a-d48a-467b-b16e-1f7c54dab671','student'),
  ('ccd35080-7b5b-4a6a-ad20-e66b284ad25f','kitchen'),
  ('f9cc1282-2979-43e0-ac37-cd750605ce2c','admin')
ON CONFLICT (user_id, role) DO NOTHING;