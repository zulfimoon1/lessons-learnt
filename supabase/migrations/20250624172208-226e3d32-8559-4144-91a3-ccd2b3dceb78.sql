
-- First, identify and remove orphaned class_schedules that reference non-existent teachers
-- This ensures data integrity (core principle: comprehensive security & data consistency)
DELETE FROM public.class_schedules 
WHERE teacher_id NOT IN (SELECT id FROM public.teachers);

-- Log this cleanup for security audit trail
INSERT INTO public.audit_log (table_name, operation, user_id, new_data)
VALUES (
  'data_cleanup',
  'remove_orphaned_schedules',
  auth.uid(),
  jsonb_build_object(
    'action', 'cleanup_orphaned_class_schedules',
    'timestamp', now(),
    'reason', 'preparing_for_foreign_key_constraint'
  )
);

-- Now add the proper foreign key constraint
ALTER TABLE public.class_schedules 
ADD CONSTRAINT fk_class_schedules_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE;

-- Create index for performance (core principle: scalable architecture)
CREATE INDEX IF NOT EXISTS idx_class_schedules_teacher_id ON public.class_schedules(teacher_id);

-- Add audit trigger for security monitoring (core principle: comprehensive security)
CREATE OR REPLACE TRIGGER audit_class_schedules_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.class_schedules
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
