import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Integrations = () => {
  const integrations = [
    { name: "WhatsApp Business", category: "Mensajería", logo: "📱" },
    { name: "Shopify", category: "E-commerce", logo: "🛍️" },
    { name: "WooCommerce", category: "E-commerce", logo: "🛒" },
    { name: "Stripe", category: "Pagos", logo: "💳" },
    { name: "Google Calendar", category: "Calendario", logo: "📅" },
    { name: "Salesforce", category: "CRM", logo: "☁️" },
    { name: "HubSpot", category: "CRM", logo: "🎯" },
    { name: "Zapier", category: "Automatización", logo: "⚡" },
    { name: "Make", category: "Automatización", logo: "🔄" },
    { name: "Google Sheets", category: "Datos", logo: "📊" },
    { name: "Airtable", category: "Datos", logo: "🗃️" },
    { name: "Calendly", category: "Reservas", logo: "📆" },
  ];

  return (
    <section className="py-20 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge className="mb-4" variant="secondary">
            Integraciones
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Conecta con tus <span className="text-primary">Herramientas Favoritas</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Integración perfecta con las apps que ya usas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {integrations.map((integration, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-hover transition-all duration-300 hover:-translate-y-1 text-center group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {integration.logo}
              </div>
              <h3 className="font-semibold mb-1">{integration.name}</h3>
              <Badge variant="outline" className="text-xs">
                {integration.category}
              </Badge>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            ¿No ves tu herramienta? Conecta cualquier app con Zapier o Make
          </p>
          <Badge variant="secondary" className="text-sm">
            + 5,000 integraciones disponibles
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
