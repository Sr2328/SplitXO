import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import  {AuthForm} from "@/components/auth/AuthForm";
import { Receipt } from "lucide-react";
import { Link } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/dashboard");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      {/* <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
          <div className="p-2 rounded-xl gradient-primary">
            <Receipt className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">SplitWise Pro</span>
        </Link>
      </header> */}

      {/* Auth form */}
      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <AuthForm />
      </main>
    </div>
  );
}
