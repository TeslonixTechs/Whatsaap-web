-- Agregar campo de teléfono a la tabla de asistentes
ALTER TABLE public.assistants
ADD COLUMN phone_number TEXT;

-- Crear índice para búsquedas rápidas por teléfono
CREATE INDEX idx_assistants_phone_number ON public.assistants(phone_number);