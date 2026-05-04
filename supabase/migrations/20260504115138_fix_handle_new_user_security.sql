/*
  # Fix Security Issues with handle_new_user Function

  1. Security Issues Fixed
    - Remove mutable search_path from handle_new_user function
    - Revoke EXECUTE permissions from anon and authenticated roles
    - Switch function to SECURITY INVOKER to prevent privilege escalation
    - Only service role can call this function

  2. Changes
    - Drop existing handle_new_user function
    - Recreate with SECURITY INVOKER
    - Set immutable search_path
    - Grant EXECUTE only to service_role
*/

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'USER');
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
