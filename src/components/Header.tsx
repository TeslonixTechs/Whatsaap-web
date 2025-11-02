import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">AsistenteBot</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#inicio" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Inicio
          </a>
          <a href="#funciones" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Funciones
          </a>
          <a href="#sectores" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Sectores
          </a>
          <a href="#precios" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Precios
          </a>
          <a href="#faq" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            FAQ
          </a>
          <a href="#contacto" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Contacto
          </a>
        </nav>
        
        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              <a 
                href="#inicio" 
                className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </a>
              <a 
                href="#funciones" 
                className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Funciones
              </a>
              <a 
                href="#sectores" 
                className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Sectores
              </a>
              <a 
                href="#precios" 
                className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Precios
              </a>
              <a 
                href="#faq" 
                className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </a>
              <a 
                href="#contacto" 
                className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Contacto
              </a>
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/auth?mode=login");
                  }}
                >
                  Iniciar sesión
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/auth?mode=signup");
                  }}
                >
                  Empezar gratis
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="hidden md:inline-flex"
            onClick={() => navigate("/auth?mode=login")}
          >
            Iniciar sesión
          </Button>
          <Button 
            variant="default"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Empezar gratis
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
