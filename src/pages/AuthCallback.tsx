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
        console.log("=== AuthCallback Started ===");
        console.log("URL:", window.location.href);
        console.log("Hash:", window.location.hash);

        // Supabase v2 automatically handles the hash/code exchange
        // Just wait a moment for it to process
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log("Checking session after delay...");

        // Get session
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log("Session check result:", { 
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          error: error?.message 
        });

        if (error) {
          throw new Error(`Session error: ${error.message}`);
        }

        if (session?.user?.id) {
          console.log("✓ Authentication successful!");
          toast.success("Welcome back!");
          // Give it a moment to ensure everything is set
          await new Promise(resolve => setTimeout(resolve, 500));
          navigate("/dashboard", { replace: true });
        } else {
          console.log("✗ No user session found");
          console.log("Session object:", session);
          
          // Try one more time after a longer delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (retrySession?.user?.id) {
            console.log("✓ Got session on retry!");
            navigate("/dashboard", { replace: true });
          } else {
            console.log("✗ Still no session after retry");
            toast.error("Authentication failed. Please try again.");
            navigate("/auth", { replace: true });
          }
        }
      } catch (error: any) {
        console.error("❌ AuthCallback Error:", error);
        toast.error(error?.message || "Authentication error occurred");
        navigate("/auth", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing your login...</h2>
        <p className="text-gray-600">Authenticating with your account.</p>
        <p className="text-gray-400 text-xs mt-4">Open DevTools (F12) → Console to see details</p>
      </div>
    </div>
  );
}