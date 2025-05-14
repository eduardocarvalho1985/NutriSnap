import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signInWithEmail, signInWithGoogle, signInWithApple, getUserProfile, createUserProfile } from "@/lib/firebase";

const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  rememberMe: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      console.log("Attempting to sign in with email:", data.email);
      const result = await signInWithEmail(data.email, data.password);
      
      if (result && result.user) {
        console.log("Email sign-in successful, user:", result.user.uid);
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard..."
        });
        
        // Force navigation to dashboard immediately after successful login
        setLocation("/dashboard");
      } else {
        console.error("No user returned from signInWithEmail");
        throw new Error("Falha no login. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Ocorreu um erro ao fazer login. Tente novamente.";
      
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado. Verifique seu email ou crie uma conta.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta. Tente novamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      console.log("Attempting to sign in with Google");
      const result = await signInWithGoogle();
      
      if (result && result.user) {
        console.log("Google sign-in successful, user:", result.user.uid);
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        
        // Force navigation to dashboard immediately after successful login
        setLocation("/dashboard");
      } else {
        throw new Error("Falha ao fazer login com Google");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      let errorMessage = "Ocorreu um erro ao fazer login com o Google. Tente novamente.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao fazer login com Google",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  }

  async function handleAppleSignIn() {
    setIsLoading(true);
    try {
      console.log("Attempting to sign in with Apple");
      
      // Apple sign-in is currently not fully implemented
      toast({
        title: "Função não disponível",
        description: "Login com Apple ainda não foi implementado.",
        variant: "destructive"
      });
      
      setIsLoading(false);
    } catch (error: any) {
      console.error("Apple sign-in error:", error);
      
      let errorMessage = "Ocorreu um erro ao fazer login com Apple. Tente novamente.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao fazer login com Apple",
        description: errorMessage,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-neutral-light">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-secondary">
              <span className="text-primary">Nutri</span>Snap
            </h1>
            <p className="mt-2 text-sm text-gray-600">Acompanhe sua nutrição, alcance seus objetivos</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Email" 
                        {...field} 
                        className="py-3"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Senha" 
                        {...field} 
                        className="py-3"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <label 
                        htmlFor="rememberMe" 
                        className="text-sm text-gray-900 cursor-pointer"
                      >
                        Lembrar-me
                      </label>
                    </FormItem>
                  )}
                />
                
                <Link href="/auth/reset-password" className="text-sm font-medium text-primary hover:text-primary-dark">
                  Esqueceu a senha?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-3" 
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
          
          <div className="flex items-center justify-center my-4">
            <div className="border-t border-gray-200 flex-grow"></div>
            <div className="mx-4 text-sm text-gray-500">ou</div>
            <div className="border-t border-gray-200 flex-grow"></div>
          </div>
          
          <div className="space-y-3">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full py-3 flex justify-center items-center"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar com Google
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full py-3 flex justify-center items-center"
              onClick={handleAppleSignIn}
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
              </svg>
              Continuar com Apple
            </Button>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Novo por aqui?{" "}
              <Link href="/auth/signup" className="font-medium text-primary hover:text-primary-dark">
                Criar conta
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
