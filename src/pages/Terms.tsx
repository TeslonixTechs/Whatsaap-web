import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Card className="p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>
          
          <section className="space-y-4 text-muted-foreground">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">1. Aceptación de los Términos</h2>
              <p>Al acceder y utilizar este servicio, usted acepta estar sujeto a estos términos y condiciones de uso y todas las leyes y regulaciones aplicables.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">2. Descripción del Servicio</h2>
              <p>Proporcionamos una plataforma de asistente virtual para WhatsApp que permite a las empresas automatizar sus comunicaciones con clientes a través de inteligencia artificial.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">3. Uso del Servicio</h2>
              <p>Usted se compromete a:</p>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Utilizar el servicio de manera legal y ética</li>
                <li>No usar el servicio para enviar spam o contenido no solicitado</li>
                <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                <li>Cumplir con las políticas de WhatsApp y las leyes de protección de datos</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">4. Planes y Facturación</h2>
              <p>Los servicios se facturan según el plan seleccionado. Los pagos son procesados de forma segura a través de Stripe. La facturación es mensual y se renueva automáticamente a menos que se cancele.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">5. Cancelación</h2>
              <p>Puede cancelar su suscripción en cualquier momento desde su panel de control. La cancelación será efectiva al final del período de facturación actual.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">6. Limitación de Responsabilidad</h2>
              <p>El servicio se proporciona "tal cual" sin garantías de ningún tipo. No seremos responsables de daños indirectos, incidentales o consecuentes derivados del uso del servicio.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">7. Propiedad Intelectual</h2>
              <p>Todo el contenido, características y funcionalidad del servicio son propiedad exclusiva de la empresa y están protegidos por las leyes de propiedad intelectual.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">8. Modificaciones</h2>
              <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia inmediatamente después de su publicación.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">9. Contacto</h2>
              <p>Si tiene preguntas sobre estos términos, contáctenos a través de nuestros canales de soporte.</p>
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

export default Terms;