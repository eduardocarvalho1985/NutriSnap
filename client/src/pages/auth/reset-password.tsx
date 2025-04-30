import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { resetPassword } from "@/lib/firebase";

const resetSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório")
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: ""
    }
  });

  async function onSubmit(data: ResetFormValues) {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
      setIsSuccess(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive"
      });
    } finally {
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
            <p className="mt-2 text-sm text-gray-600">Recupere sua senha</p>
          </div>
          
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-green-800">
                  Email enviado com sucesso! Verifique sua caixa de entrada para instruções de redefinição de senha.
                </p>
              </div>
              <Button asChild className="mt-4">
                <Link href="/auth/login">Voltar para Login</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="mb-4 text-sm text-gray-600">
                  <p>
                    Insira o endereço de e-mail associado à sua conta e enviaremos um link para redefinir sua senha.
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="seu@email.com" 
                          {...field} 
                          className="py-3"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full py-3" 
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar Link de Redefinição"}
                </Button>
                
                <div className="text-center">
                  <Link href="/auth/login" className="text-sm font-medium text-primary hover:text-primary-dark">
                    Voltar para Login
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
