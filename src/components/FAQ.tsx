import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const FAQ = () => {
  const faqs = [
    {
      question: "¿Necesito conocimientos técnicos para configurarlo?",
      answer: "No, nuestro asistente está diseñado para ser configurado por cualquier persona. La interfaz es intuitiva y te guiamos paso a paso.",
    },
    {
      question: "¿Puedo usar mi número de WhatsApp actual?",
      answer: "Sí, puedes usar tu número de WhatsApp Business existente. También te ayudamos a configurar uno nuevo si lo prefieres.",
    },
    {
      question: "¿Qué pasa si el asistente no puede responder algo?",
      answer: "El asistente puede transferir automáticamente la conversación a un operador humano cuando detecta que necesita ayuda especializada.",
    },
    {
      question: "¿Cuántos mensajes puedo enviar al mes?",
      answer: "Depende del plan que elijas. Tenemos opciones desde 1,000 mensajes mensuales hasta ilimitados para empresas grandes.",
    },
    {
      question: "¿Es seguro? ¿Qué pasa con los datos de mis clientes?",
      answer: "Absolutamente seguro. Usamos encriptación end-to-end, cumplimos con GDPR y nunca compartimos tus datos con terceros.",
    },
    {
      question: "¿Puedo cancelar en cualquier momento?",
      answer: "Sí, puedes cancelar tu suscripción cuando quieras sin penalizaciones. No hay contratos de permanencia.",
    },
    {
      question: "¿El asistente aprende de las conversaciones?",
      answer: "Sí, nuestro asistente mejora continuamente analizando las interacciones para ofrecer respuestas más precisas con el tiempo.",
    },
    {
      question: "¿Ofrecen soporte técnico?",
      answer: "Sí, nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier pregunta o problema.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge className="mb-4" variant="secondary">
            Preguntas Frecuentes
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Tienes <span className="text-primary">Dudas</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            Aquí respondemos las preguntas más comunes de nuestros clientes
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-lg px-6 bg-card hover:shadow-soft transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
