import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import ResetPassword from "@/pages/auth/reset-password";
import Onboarding from "@/pages/onboarding";
import BasicInfo from "@/pages/onboarding/basic-info";
import Goals from "@/pages/onboarding/goals";
import Nutrition from "@/pages/onboarding/nutrition";
import Dashboard from "@/pages/dashboard";
import Progress from "@/pages/progress";
import Workouts from "@/pages/workouts";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect based on authentication status
    if (!loading) {
      const isAuthRoute = location.startsWith("/auth") || location === "/";
      const isOnboardingRoute = location.startsWith("/onboarding");
      
      // Determine if this is a new signup or an existing user login
      const isNewUser = user?.createdAt && 
                      (new Date().getTime() - new Date(user.createdAt).getTime()) < 5 * 60 * 1000; // 5 minutes

      if (!user && !isAuthRoute) {
        // Not logged in, redirect to login
        setLocation("/auth/login");
      } else if (user && !user.onboardingCompleted && isNewUser && !isOnboardingRoute && !isAuthRoute) {
        // New user, take them through onboarding
        setLocation("/onboarding");
      } else if (user && !user.onboardingCompleted && !isNewUser && !isAuthRoute) {
        // Existing user without onboarding data, redirect to dashboard instead of profile
        setLocation("/dashboard");
      } else if (user && user.onboardingCompleted && isAuthRoute) {
        // Logged in user on auth page, redirect to dashboard
        setLocation("/dashboard");
      }
    }
  }, [user, loading, location, setLocation]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <Switch>
      {/* Authentication routes */}
      <Route path="/" component={Login} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/signup" component={Signup} />
      <Route path="/auth/reset-password" component={ResetPassword} />
      
      {/* Onboarding routes */}
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/onboarding/basic-info" component={BasicInfo} />
      <Route path="/onboarding/goals" component={Goals} />
      <Route path="/onboarding/nutrition" component={Nutrition} />
      
      {/* Main app routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/progress" component={Progress} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/settings" component={Settings} />
      <Route path="/profile" component={Profile} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
