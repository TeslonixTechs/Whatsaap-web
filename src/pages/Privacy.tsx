import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Card className="p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
          
          <section className="space-y-4 text-muted-foreground">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">1. Información que Recopilamos</h2>
              <p>Recopilamos información que usted nos proporciona directamente, como nombre, correo electrónico, número de teléfono y datos de su empresa cuando utiliza nuestros servicios de asistente virtual para WhatsApp.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">2. Uso de la Información</h2>
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Proporcionar, mantener y mejorar nuestros servicios</li>
                <li>Procesar transacciones y enviar información relacionada</li>
                <li>Enviar comunicaciones técnicas, actualizaciones y soporte</li>
                <li>Responder a sus comentarios y preguntas</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">3. Compartir Información</h2>
              <p>No vendemos ni compartimos su información personal con terceros, excepto cuando sea necesario para proporcionar nuestros servicios o cuando la ley lo requiera.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">4. Seguridad de los Datos</h2>
              <p>Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra el acceso no autorizado, alteración, divulgación o destrucción.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">5. Sus Derechos</h2>
              <p>Usted tiene derecho a acceder, rectificar, cancelar y oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, contáctenos a través de nuestros canales de soporte.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">6. Cookies</h2>
              <p>Utilizamos cookies y tecnologías similares para mejorar su experiencia. Consulte nuestra Política de Cookies para más información.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">7. Cambios a esta Política</h2>
              <p>Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios significativos publicando la nueva política en esta página.</p>
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

export default Privacy;