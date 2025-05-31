import { useState } from "react";
import { Link } from "wouter";
import { 
  Camera, 
  TrendingUp, 
  Dumbbell, 
  Brain, 
  BarChart3, 
  Heart,
  ChevronRight,
  Star,
  ChevronLeft,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: Camera,
      title: "Escaneamento de Refeições",
      description: "Tire uma foto do seu prato e nossa IA identifica automaticamente os alimentos e suas quantidades."
    },
    {
      icon: TrendingUp,
      title: "Rastreamento de Macronutrientes",
      description: "Acompanhe proteínas, carboidratos e gorduras para otimizar sua dieta com facilidade."
    },
    {
      icon: Dumbbell,
      title: "Integração com Treinos",
      description: "Registre seus exercícios e veja como eles afetam seu balanço calórico diário."
    },
    {
      icon: Brain,
      title: "Análise por IA",
      description: "Receba insights personalizados e sugestões para melhorar sua alimentação."
    },
    {
      icon: BarChart3,
      title: "Acompanhamento de Progresso",
      description: "Visualize seu progresso ao longo do tempo com gráficos intuitivos e relatórios detalhados."
    },
    {
      icon: Heart,
      title: "Recomendações Personalizadas",
      description: "Obtenha sugestões de refeições baseadas em seus objetivos e preferências alimentares."
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Fotografe seu Prato",
      description: "Basta apontar a câmera para sua refeição e tirar uma foto para começar a análise."
    },
    {
      step: 2,
      title: "Obtenha Análise Instantânea",
      description: "Nossa IA identifica os alimentos e calcula automaticamente calorias e nutrientes."
    },
    {
      step: 3,
      title: "Acompanhe seu Progresso",
      description: "Visualize seu consumo diário e progresso ao longo do tempo com relatórios detalhados."
    }
  ];

  const testimonials = [
    {
      name: "Marina Silva",
      role: "Perdeu 12kg em 6 meses",
      content: "O ForkFit transformou minha relação com a comida. A análise por foto é incrivelmente precisa e me ajudou a entender melhor minha nutrição sem o estresse de pesar tudo.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marina&backgroundColor=b6e3f4,c0aede,d1d4f9"
    },
    {
      name: "Pedro Oliveira",
      role: "Triatleta Amador",
      content: "Como atleta, preciso acompanhar de perto minha ingestão de proteínas. O ForkFit tornou isso muito mais fácil e me deu insights que melhoraram meu desempenho nos treinos.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro&backgroundColor=b6e3f4,c0aede,d1d4f9"
    },
    {
      name: "Ana Costa",
      role: "Mãe e Profissional",
      content: "Com a correria do dia a dia, era difícil manter uma alimentação saudável. O ForkFit me ajuda a fazer escolhas melhores de forma rápida e prática.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=b6e3f4,c0aede,d1d4f9"
    },
    {
      name: "Carlos Santos",
      role: "Perdeu 8kg em 4 meses",
      content: "A facilidade de usar é impressionante. Só preciso fotografar e o app faz todo o trabalho. Consegui atingir meus objetivos sem estresse.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=b6e3f4,c0aede,d1d4f9"
    },
    {
      name: "Beatriz Lima",
      role: "Nutricionista",
      content: "Recomendo o ForkFit para meus pacientes. A precisão da análise nutricional é excelente e ajuda muito no acompanhamento das dietas.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz&backgroundColor=b6e3f4,c0aede,d1d4f9"
    }
  ];

  const userAvatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=b6e3f4,c0aede,d1d4f9",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro&backgroundColor=b6e3f4,c0aede,d1d4f9", 
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=b6e3f4,c0aede,d1d4f9"
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl">🍴</span>
              <span className="ml-2 text-xl font-bold text-secondary">ForkFit</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#recursos" className="text-gray-600 hover:text-primary transition-colors">Recursos</a>
              <a href="#como-funciona" className="text-gray-600 hover:text-primary transition-colors">Como Funciona</a>
              <a href="#depoimentos" className="text-gray-600 hover:text-primary transition-colors">Depoimentos</a>
              <a href="#download" className="text-gray-600 hover:text-primary transition-colors">Download</a>
            </nav>

            {/* CTA Button Desktop */}
            <div className="hidden md:block">
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl">
                  Começar Agora
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-4">
                <a href="#recursos" className="text-gray-600 hover:text-primary transition-colors">Recursos</a>
                <a href="#como-funciona" className="text-gray-600 hover:text-primary transition-colors">Como Funciona</a>
                <a href="#depoimentos" className="text-gray-600 hover:text-primary transition-colors">Depoimentos</a>
                <a href="#download" className="text-gray-600 hover:text-primary transition-colors">Download</a>
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary-dark text-white w-full mt-4 rounded-full">
                    Começar Agora
                  </Button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-secondary mb-6">
                Sua nutrição de forma{" "}
                <span className="text-primary">divertida</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Transforme fotos do seu prato em insights nutricionais em segundos. 
                Monitore calorias, macros e alcance seus objetivos com facilidade.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/login" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center">
                  Começar Agora
                  <ChevronRight className="ml-2" size={20} />
                </Link>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300"
                  onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Como Funciona
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {userAvatars.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt={`Usuário ${index + 1}`}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 pl-[45px] pr-[45px]">
                  <span className="font-semibold">+5.000 usuários</span> já estão transformando sua nutrição
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                  <div className="text-2xl font-bold text-primary">73%</div>
                  <div className="text-sm text-gray-600">Objetivo</div>
                  <div className="text-xs text-gray-500">1698 kcal consumidas</div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                  <div className="text-2xl font-bold text-primary">129g</div>
                  <div className="text-sm text-gray-600">Proteínas</div>
                  <div className="text-xs text-gray-500">145g / 145g</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="recursos" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">
              Recursos que Transformam sua Nutrição
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              O ForkFit combina tecnologia avançada com simplicidade para tornar o 
              acompanhamento nutricional fácil e eficaz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-neutral-light hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-primary" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section id="como-funciona" className="py-20 bg-neutral-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">
              Como o ForkFit Funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Em apenas três passos simples, você terá acesso a insights nutricionais 
              precisos e personalizados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white text-2xl font-bold">{step.step}</span>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-primary/20 -translate-x-8" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="bg-primary/10 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-secondary mb-4">Mais Inteligente a Cada Uso</h3>
              <p className="text-lg text-gray-600 mb-6">
                Nossa inteligência artificial aprende com seus hábitos para oferecer recomendações cada 
                vez mais precisas e personalizadas. Quanto mais você usa, melhor ficamos em ajudá-lo a 
                atingir seus objetivos.
              </p>
              <Link href="/login" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl inline-block text-center">
                Experimentar Agora
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section id="depoimentos" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">
              O Que Nossos Usuários Dizem
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubra como o ForkFit está ajudando pessoas reais a transformarem seus hábitos 
              alimentares e alcançarem seus objetivos.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-neutral-light rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={20} />
                ))}
              </div>
              <p className="text-lg text-gray-700 mb-6 italic">
                "{testimonials[currentTestimonial].content}"
              </p>
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="text-left">
                  <div className="font-semibold text-secondary">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>
      {/* Download/CTA Section */}
      <section id="download" className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Comece sua Jornada para uma Nutrição Melhor
          </h2>
          <p className="text-lg opacity-90 mb-12 max-w-2xl mx-auto">
            Baixe o ForkFit agora e transforme suas refeições em dados acionáveis para 
            alcançar seus objetivos de saúde e fitness.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <div className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="text-2xl">📱</div>
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </div>
            <div className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="text-2xl">🤖</div>
              <div className="text-left">
                <div className="text-xs">GET IT ON</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/login" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl inline-block text-center">
              🍴 ForkFit App Login
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl">🍴</span>
              <span className="ml-2 text-xl font-bold">ForkFit</span>
            </div>
            <p className="text-gray-400 mb-8">
              Transformando a forma como você acompanha sua nutrição.
            </p>
            <div className="border-t border-gray-800 pt-8 text-gray-400">
              <p>&copy; 2025 ForkFit. Todos os direitos reservados.</p>
            </div>
          </div>

          {/* 
          TODO: Uncomment when ready to add footer links
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl">🍴</span>
                <span className="ml-2 text-xl font-bold">ForkFit</span>
              </div>
              <p className="text-gray-400">
                Transformando a forma como você acompanha sua nutrição.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sobre</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Quem Somos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nossa Missão</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#recursos" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          */}
        </div>
      </footer>
    </div>
  );
}