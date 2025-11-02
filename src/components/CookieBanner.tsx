import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <Card className="max-w-4xl mx-auto p-6 bg-card border shadow-lg">
        <div className="flex items-start gap-4">
          <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Este sitio utiliza cookies</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Utilizamos cookies para mejorar su experiencia de navegación, personalizar contenido y analizar nuestro tráfico. 
              Al hacer clic en "Aceptar", acepta el uso de cookies según nuestra{" "}
              <Link to="/cookies" className="text-primary hover:underline">
                Política de Cookies
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={acceptCookies}>
                Aceptar todas
              </Button>
              <Button variant="outline" onClick={rejectCookies}>
                Rechazar
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/cookies">Más información</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieBanner;