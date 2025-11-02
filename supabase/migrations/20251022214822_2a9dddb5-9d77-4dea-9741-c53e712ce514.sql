-- Crear tabla de perfiles de empresas
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Crear tabla de asistentes/bots
CREATE TABLE public.assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_description TEXT NOT NULL,
  industry TEXT,
  is_active BOOLEAN DEFAULT false,
  whatsapp_session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para assistants
CREATE POLICY "Users can view their own assistants"
  ON public.assistants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assistants"
  ON public.assistants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assistants"
  ON public.assistants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assistants"
  ON public.assistants FOR DELETE
  USING (auth.uid() = user_id);

-- Crear tabla de FAQs
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para FAQs
CREATE POLICY "Users can view FAQs of their assistants"
  ON public.faqs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = faqs.assistant_id
      AND assistants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create FAQs for their assistants"
  ON public.faqs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = faqs.assistant_id
      AND assistants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update FAQs of their assistants"
  ON public.faqs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = faqs.assistant_id
      AND assistants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete FAQs of their assistants"
  ON public.faqs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = faqs.assistant_id
      AND assistants.user_id = auth.uid()
    )
  );

-- Crear tabla de configuraciones personalizadas
CREATE TABLE public.assistant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assistant_id, config_key)
);

-- Habilitar RLS
ALTER TABLE public.assistant_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para assistant_config
CREATE POLICY "Users can view config of their assistants"
  ON public.assistant_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = assistant_config.assistant_id
      AND assistants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create config for their assistants"
  ON public.assistant_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = assistant_config.assistant_id
      AND assistants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update config of their assistants"
  ON public.assistant_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = assistant_config.assistant_id
      AND assistants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete config of their assistants"
  ON public.assistant_config FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = assistant_config.assistant_id
      AND assistants.user_id = auth.uid()
    )
  );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assistants_updated_at
  BEFORE UPDATE ON public.assistants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assistant_config_updated_at
  BEFORE UPDATE ON public.assistant_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mi Empresa')
  );
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();