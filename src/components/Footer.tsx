import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">AsistenteBot</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Automatización de WhatsApp que se siente humana
            </p>
            <a 
              href="https://wa.me/34653292714" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              Contáctanos por WhatsApp
            </a>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Funciones</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sectores</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Precios</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Recursos</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Sobre nosotros</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Casos de éxito</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacidad</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Términos</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 AsistenteBot. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
