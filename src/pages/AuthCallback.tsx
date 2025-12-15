import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash (Supabase sets this after OAuth)
        const { data: { session }, error: sessionError } = 
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (session) {
          // User is authenticated, redirect to dashboard
          toast.success("Successfully signed in!");
          navigate("/dashboard", { replace: true });
        } else {
          // No session found, redirect back to auth
          toast.error("Authentication failed");
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("An error occurred during authentication");
        navigate("/auth", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
        <p className="text-gray-600 font-medium">Processing your login...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}