DO $$
DECLARE
  stu uuid;
  oid uuid;
  s text;
  cfg record;
BEGIN
  SELECT id INTO stu FROM public.profiles WHERE full_name = 'Demo Student' LIMIT 1;
  IF stu IS NULL THEN SELECT id INTO stu FROM public.profiles LIMIT 1; END IF;
  IF stu IS NULL THEN RETURN; END IF;

  FOR cfg IN
    SELECT * FROM (VALUES
      ('placed'::public.order_status, 'Counter 1', 4),
      ('placed'::public.order_status, 'Counter 2', 9),
      ('preparing'::public.order_status, 'Counter 1', 14),
      ('preparing'::public.order_status, 'Counter 3', 18),
      ('ready'::public.order_status, 'Counter 2', 24),
      ('completed'::public.order_status, 'Counter 1', 46)
    ) AS t(st, counter, mins)
  LOOP
    INSERT INTO public.orders (user_id, status, counter, subtotal, gst, total, placed_at,
      ready_at, completed_at)
    VALUES (stu, cfg.st, cfg.counter, 0, 0, 0, now() - (cfg.mins || ' minutes')::interval,
      CASE WHEN cfg.st IN ('ready','completed') THEN now() - '5 minutes'::interval END,
      CASE WHEN cfg.st = 'completed' THEN now() - '2 minutes'::interval END)
    RETURNING id INTO oid;

    INSERT INTO public.order_items (order_id, menu_item_id, name, qty, price)
    SELECT oid, m.id, m.name, 1 + (random() * 1)::int, m.price
    FROM public.menu_items m ORDER BY random() LIMIT 2;

    UPDATE public.orders o SET
      subtotal = x.sum,
      gst = round(x.sum * 0.05, 2),
      total = round(x.sum * 1.05, 2)
    FROM (SELECT sum(price * qty) AS sum FROM public.order_items WHERE order_id = oid) x
    WHERE o.id = oid;
  END LOOP;
END $$;