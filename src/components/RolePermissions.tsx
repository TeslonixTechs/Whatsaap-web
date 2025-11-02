import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, X } from "lucide-react";

const RolePermissions = () => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .order("role");

      if (error) throw error;
      setPermissions(data || []);
    } catch (error: any) {
      console.error("Error loading permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: any = {
      admin: "default",
      operator: "secondary",
      viewer: "outline",
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Permisos por Rol</h2>
        <p className="text-muted-foreground">Permisos asignados a cada rol del sistema</p>
      </div>

      <div className="grid gap-4">
        {["admin", "operator", "viewer"].map((role) => {
          const rolePerms = permissions.filter((p) => p.role === role);
          return (
            <Card key={role} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(role)}
                    <h3 className="font-semibold capitalize">{role}</h3>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {rolePerms.map((perm) => (
                  <div key={perm.id} className="border rounded-lg p-3">
                    <div className="font-semibold mb-2">{perm.resource}</div>
                    <div className="flex flex-wrap gap-2">
                      {["create", "read", "update", "delete"].map((action) => {
                        const hasPermission = perm.actions?.includes(action);
                        return (
                          <div
                            key={action}
                            className={`flex items-center gap-1 text-sm px-2 py-1 rounded ${
                              hasPermission
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20"
                                : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                            }`}
                          >
                            {hasPermission ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            {action}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RolePermissions;
