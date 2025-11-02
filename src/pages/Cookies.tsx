import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Card className="p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Política de Cookies</h1>
          
          <section className="space-y-4 text-muted-foreground">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">¿Qué son las Cookies?</h2>
              <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Nos ayudan a mejorar su experiencia y proporcionar funcionalidades esenciales.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Tipos de Cookies que Utilizamos</h2>
              
              <div className="mt-3">
                <h3 className="font-semibold text-foreground">Cookies Esenciales</h3>
                <p>Necesarias para el funcionamiento básico del sitio web, como mantener su sesión activa y recordar sus preferencias de cookies.</p>
              </div>

              <div className="mt-3">
                <h3 className="font-semibold text-foreground">Cookies de Rendimiento</h3>
                <p>Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, recopilando información de forma anónima.</p>
              </div>

              <div className="mt-3">
                <h3 className="font-semibold text-foreground">Cookies de Funcionalidad</h3>
                <p>Permiten recordar sus elecciones (como idioma o región) para proporcionar una experiencia más personalizada.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Gestión de Cookies</h2>
              <p>Puede controlar y/o eliminar cookies según lo desee. Puede eliminar todas las cookies que ya están en su computadora y puede configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite un sitio.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Cookies de Terceros</h2>
              <p>Algunos de nuestros socios pueden usar cookies en nuestro sitio. No tenemos acceso ni control sobre estas cookies. Esta política de cookies cubre solo el uso de cookies por parte de este sitio.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Más Información</h2>
              <p>Para obtener más información sobre cómo usamos, almacenamos y mantenemos seguros sus datos personales, consulte nuestra Política de Privacidad.</p>
            </div>

            <div className="mt-8 pt-4 border-t">
              <p className="text-sm">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </section>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;