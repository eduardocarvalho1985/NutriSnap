import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateUserProfile } from "@/lib/firebase";
import { 
  CameraIcon, 
  UserIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  MailIcon,
  CakeIcon,
  RulerIcon,
  WeightIcon,
  TargetIcon,
  ActivityIcon
} from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    height: user?.height || '',
    weight: user?.weight || ''
  });

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    setIsLoading(true);
    try {
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        try {
          await updateUserProfile(user.uid, { photoURL: base64 });
          updateUser({ photoURL: base64 });
          
          toast({
            title: "Foto atualizada!",
            description: "Sua foto de perfil foi atualizada com sucesso.",
          });
        } catch (error: any) {
          toast({
            title: "Erro ao atualizar foto",
            description: error.message,
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: "Erro ao processar foto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const updateData = {
        name: basicInfo.name,
        email: basicInfo.email,
        age: basicInfo.age ? parseInt(basicInfo.age) : undefined,
        height: basicInfo.height ? parseInt(basicInfo.height) : undefined,
        weight: basicInfo.weight ? parseInt(basicInfo.weight) : undefined,
      };

      await updateUserProfile(user.uid, updateData);
      updateUser(updateData);
      setIsEditingBasic(false);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfilePhoto = () => {
    const photoUrl = user?.photoURL;
    
    return (
      <div className="relative">
        <div 
          className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer"
          onClick={handlePhotoClick}
        >
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt="Foto do perfil" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Camera overlay */}
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-30 transition-all cursor-pointer flex items-center justify-center"
             onClick={handlePhotoClick}>
          <CameraIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="app-container min-h-screen flex flex-col bg-neutral-light pb-16">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Carregando perfil...</p>
        </div>
        <BottomNav activePage="profile" />
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen flex flex-col bg-neutral-light pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold font-heading text-secondary">
            Meu Perfil
          </h1>
        </div>
      </header>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="hidden"
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="space-y-6">
          
          {/* Profile Photo Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                {renderProfilePhoto()}
                
                <div className="mt-4">
                  <h2 className="text-xl font-semibold text-gray-900">{user.name || 'Usuário'}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handlePhotoClick}
                  disabled={isLoading}
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  {user.photoURL ? 'Alterar foto' : 'Adicionar foto'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                {!isEditingBasic ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingBasic(true)}
                  >
                    <EditIcon className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingBasic(false);
                        setBasicInfo({
                          name: user?.name || '',
                          email: user?.email || '',
                          age: user?.age?.toString() || '',
                          height: user?.height?.toString() || '',
                          weight: user?.weight?.toString() || ''
                        });
                      }}
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveBasicInfo}
                      disabled={isLoading}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  {isEditingBasic ? (
                    <div className="flex-1">
                      <Label htmlFor="name" className="text-sm text-gray-600">Nome</Label>
                      <Input
                        id="name"
                        value={basicInfo.name}
                        onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                        placeholder="Seu nome"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium">{user.name || 'Não informado'}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center space-x-3">
                  <MailIcon className="w-5 h-5 text-gray-500" />
                  {isEditingBasic ? (
                    <div className="flex-1">
                      <Label htmlFor="email" className="text-sm text-gray-600">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={basicInfo.email}
                        onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})}
                        placeholder="seu@email.com"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user.email || 'Não informado'}</p>
                    </div>
                  )}
                </div>

                {/* Age */}
                <div className="flex items-center space-x-3">
                  <CakeIcon className="w-5 h-5 text-gray-500" />
                  {isEditingBasic ? (
                    <div className="flex-1">
                      <Label htmlFor="age" className="text-sm text-gray-600">Idade</Label>
                      <Input
                        id="age"
                        type="number"
                        value={basicInfo.age}
                        onChange={(e) => setBasicInfo({...basicInfo, age: e.target.value})}
                        placeholder="Sua idade"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Idade</p>
                      <p className="font-medium">{user.age ? `${user.age} anos` : 'Não informado'}</p>
                    </div>
                  )}
                </div>

                {/* Height */}
                <div className="flex items-center space-x-3">
                  <RulerIcon className="w-5 h-5 text-gray-500" />
                  {isEditingBasic ? (
                    <div className="flex-1">
                      <Label htmlFor="height" className="text-sm text-gray-600">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={basicInfo.height}
                        onChange={(e) => setBasicInfo({...basicInfo, height: e.target.value})}
                        placeholder="Sua altura em cm"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Altura</p>
                      <p className="font-medium">{user.height ? `${user.height} cm` : 'Não informado'}</p>
                    </div>
                  )}
                </div>

                {/* Weight */}
                <div className="flex items-center space-x-3">
                  <WeightIcon className="w-5 h-5 text-gray-500" />
                  {isEditingBasic ? (
                    <div className="flex-1">
                      <Label htmlFor="weight" className="text-sm text-gray-600">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={basicInfo.weight}
                        onChange={(e) => setBasicInfo({...basicInfo, weight: e.target.value})}
                        placeholder="Seu peso em kg"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Peso Atual</p>
                      <p className="font-medium">{user.weight ? `${user.weight} kg` : 'Não informado'}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals & Targets */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Objetivos</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <TargetIcon className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Meta de Peso</p>
                    <p className="font-medium">{user.targetWeight ? `${user.targetWeight} kg` : 'Não definido'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <ActivityIcon className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Objetivo</p>
                    <p className="font-medium">
                      {user.goal === 'lose' ? 'Perder peso' : 
                       user.goal === 'gain' ? 'Ganhar peso' : 
                       user.goal === 'maintain' ? 'Manter peso' : 'Não definido'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <ActivityIcon className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Nível de Atividade</p>
                    <p className="font-medium">
                      {user.activityLevel === 'sedentary' ? 'Sedentário' : 
                       user.activityLevel === 'light' ? 'Leve' : 
                       user.activityLevel === 'moderate' ? 'Moderado' : 
                       user.activityLevel === 'active' ? 'Ativo' : 
                       user.activityLevel === 'very_active' ? 'Muito ativo' : 'Não definido'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Targets */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Metas Nutricionais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Calorias</p>
                  <p className="text-xl font-bold text-primary">{user.calories || 0}</p>
                  <p className="text-xs text-gray-500">kcal/dia</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Proteína</p>
                  <p className="text-xl font-bold text-blue-600">{user.protein || 0}</p>
                  <p className="text-xs text-gray-500">g/dia</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Carboidratos</p>
                  <p className="text-xl font-bold text-green-600">{user.carbs || 0}</p>
                  <p className="text-xs text-gray-500">g/dia</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Gordura</p>
                  <p className="text-xl font-bold text-yellow-600">{user.fat || 0}</p>
                  <p className="text-xs text-gray-500">g/dia</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activePage="profile" />
    </div>
  );
}