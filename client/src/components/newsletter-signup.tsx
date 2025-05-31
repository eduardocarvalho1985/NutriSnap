import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const newsletterSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Por favor, insira um email válido")
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function NewsletterSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      fullName: "",
      email: ""
    }
  });

  async function onSubmit(data: NewsletterFormData) {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", data);
      
      if (response.ok) {
        setIsSubscribed(true);
        form.reset();
        toast({
          title: "Inscrição realizada com sucesso!",
          description: "Você receberá dicas exclusivas e novidades do ForkFit. Confira sua caixa de entrada para um presente especial!",
          duration: 5000,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro na inscrição",
          description: errorData.message || "Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na inscrição",
        description: "Falha na conexão. Verifique sua internet e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubscribed) {
    return (
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">
          Bem-vindo à comunidade ForkFit!
        </h3>
        <p className="text-white/80">
          Obrigado por se inscrever. Você receberá conteúdo exclusivo e será o primeiro a saber sobre o lançamento do app mobile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-center text-white">
          Newsletter ForkFit
        </h3>
        <p className="text-center text-white/80 mb-6 text-sm">
          Receba dicas de nutrição, novidades e seja notificado sobre o lançamento do app mobile!
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu nome completo"
                      {...field}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Digite seu melhor email"
                      {...field}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-all duration-300"
            >
              {isSubmitting ? "Inscrevendo..." : "Inscrever-se Gratuitamente"}
            </Button>
          </form>
        </Form>

        <p className="text-xs text-white/60 text-center mt-4">
          Prometemos não enviar spam. Você pode cancelar a inscrição a qualquer momento.
        </p>
      </div>
    </div>
  );
}