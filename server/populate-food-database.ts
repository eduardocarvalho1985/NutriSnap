import { db } from "./db";
import { foodDatabase } from "@shared/schema";

// Brazilian food data from the CSV
const brazilianFoods = [
  { name: "Acarajé", category: "Alimentos preparados", calories: 289, protein: 8.3, carbs: 19.1, fat: 19.9 },
  { name: "Arroz carreteiro", category: "Alimentos preparados", calories: 154, protein: 10.8, carbs: 11.6, fat: 7.1 },
  { name: "Baião de dois, arroz e feijão-de-corda", category: "Alimentos preparados", calories: 136, protein: 6.2, carbs: 20.4, fat: 3.2 },
  { name: "Barreado", category: "Alimentos preparados", calories: 165, protein: 18.3, carbs: 0.2, fat: 9.5 },
  { name: "Bife à cavalo, com cona filé", category: "Alimentos preparados", calories: 291, protein: 23.7, carbs: 0.0, fat: 21.1 },
  { name: "Bolinho de arroz", category: "Alimentos preparados", calories: 274, protein: 8.0, carbs: 41.7, fat: 8.3 },
  { name: "Camarão à baia", category: "Alimentos preparados", calories: 101, protein: 7.9, carbs: 3.2, fat: 6.0 },
  { name: "Charuto, de repolho", category: "Alimentos preparados", calories: 78, protein: 6.8, carbs: 10.1, fat: 1.1 },
  { name: "Cuscuz, de milho, cozido com sal", category: "Alimentos preparados", calories: 113, protein: 2.2, carbs: 25.3, fat: 0.7 },
  { name: "Cuscuz, paulista", category: "Alimentos preparados", calories: 142, protein: 2.6, carbs: 22.5, fat: 4.6 },
  { name: "Cuxá, molho", category: "Alimentos preparados", calories: 80, protein: 5.6, carbs: 5.7, fat: 3.6 },
  { name: "Dobradinha", category: "Alimentos preparados", calories: 125, protein: 19.8, carbs: 0.0, fat: 4.4 },
  { name: "Estrogonofe de carne", category: "Alimentos preparados", calories: 173, protein: 15.0, carbs: 3.0, fat: 10.8 },
  { name: "Estrogonofe de frango", category: "Alimentos preparados", calories: 157, protein: 17.6, carbs: 2.6, fat: 8.0 },
  { name: "Feijão tropeiro mineiro", category: "Alimentos preparados", calories: 152, protein: 10.2, carbs: 19.6, fat: 6.8 },
  { name: "Feijoada", category: "Alimentos preparados", calories: 117, protein: 8.7, carbs: 11.6, fat: 6.5 },
  { name: "Frango, com açafrão", category: "Alimentos preparados", calories: 113, protein: 9.7, carbs: 4.1, fat: 6.2 },
  { name: "Macarrão, molho bolognesa", category: "Alimentos preparados", calories: 120, protein: 4.9, carbs: 22.5, fat: 0.9 },
  { name: "Maniçoba", category: "Alimentos preparados", calories: 134, protein: 10.0, carbs: 3.4, fat: 8.7 },
  { name: "Quibebe", category: "Alimentos preparados", calories: 86, protein: 8.6, carbs: 6.6, fat: 2.7 },
  
  // Beverages
  { name: "Bebida isotônica, sabores variados", category: "Bebidas", calories: 26, protein: 0.0, carbs: 6.4, fat: 0.0 },
  { name: "Café, infusão 10%", category: "Bebidas", calories: 9, protein: 0.7, carbs: 1.5, fat: 0.1 },
  { name: "Cana, caldo de", category: "Bebidas", calories: 65, protein: 0.0, carbs: 18.2, fat: 0.0 },
  { name: "Cerveja, pilsen", category: "Bebidas", calories: 41, protein: 0.6, carbs: 3.3, fat: 0.0 },
  { name: "Chá, erva-doce, infusão 5%", category: "Bebidas", calories: 1, protein: 0.0, carbs: 0.4, fat: 0.0 },
  { name: "Chá, mate, infusão 5%", category: "Bebidas", calories: 3, protein: 0.0, carbs: 0.6, fat: 0.1 },
  { name: "Chá, preto, infusão 5%", category: "Bebidas", calories: 2, protein: 0.0, carbs: 0.6, fat: 0.0 },
  { name: "Coco, água de", category: "Bebidas", calories: 22, protein: 0.0, carbs: 5.3, fat: 0.0 },
  { name: "Refrigerante, tipo cola", category: "Bebidas", calories: 34, protein: 0.0, carbs: 8.7, fat: 0.0 },
  { name: "Refrigerante, tipo guaraná", category: "Bebidas", calories: 39, protein: 0.0, carbs: 10.0, fat: 0.0 },
  
  // Meats
  { name: "Carne, bovina, acém, moído, cozido", category: "Carnes e derivados", calories: 212, protein: 26.7, carbs: 0.0, fat: 10.9 },
  { name: "Carne, bovina, acém, moído, cru", category: "Carnes e derivados", calories: 137, protein: 19.4, carbs: 0.0, fat: 5.9 },
  { name: "Carne, bovina, contra-filé, sem gordura, grelhado", category: "Carnes e derivados", calories: 194, protein: 35.9, carbs: 0.0, fat: 4.5 },
  { name: "Carne, bovina, filé mingnon, sem gordura, grelhado", category: "Carnes e derivados", calories: 220, protein: 32.8, carbs: 0.0, fat: 8.8 },
  { name: "Carne, bovina, picanha, sem gordura, grelhada", category: "Carnes e derivados", calories: 238, protein: 31.9, carbs: 0.0, fat: 11.3 },
  { name: "Frango, peito, sem pele, grelhado", category: "Carnes e derivados", calories: 159, protein: 32.0, carbs: 0.0, fat: 2.5 },
  { name: "Frango, coxa, sem pele, cozida", category: "Carnes e derivados", calories: 167, protein: 26.9, carbs: 0.0, fat: 5.8 },
  { name: "Porco, lombo, assado", category: "Carnes e derivados", calories: 210, protein: 35.7, carbs: 0.0, fat: 6.4 },
  
  // Common Brazilian foods
  { name: "Arroz branco, cozido", category: "Cereais e derivados", calories: 128, protein: 2.5, carbs: 28.1, fat: 0.1 },
  { name: "Arroz integral, cozido", category: "Cereais e derivados", calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0 },
  { name: "Feijão preto, cozido", category: "Leguminosas", calories: 77, protein: 4.5, carbs: 14.0, fat: 0.5 },
  { name: "Feijão carioca, cozido", category: "Leguminosas", calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5 },
  { name: "Macarrão, cozido", category: "Cereais e derivados", calories: 111, protein: 3.3, carbs: 23.0, fat: 0.9 },
  { name: "Pão francês", category: "Cereais e derivados", calories: 300, protein: 8.0, carbs: 58.6, fat: 3.1 },
  { name: "Pão integral", category: "Cereais e derivados", calories: 253, protein: 9.4, carbs: 43.3, fat: 4.2 },
  { name: "Batata inglesa, cozida", category: "Hortaliças", calories: 87, protein: 1.9, carbs: 19.6, fat: 0.1 },
  { name: "Mandioca, cozida", category: "Hortaliças", calories: 125, protein: 1.2, carbs: 30.1, fat: 0.3 },
  { name: "Banana, nanica", category: "Frutas", calories: 92, protein: 1.3, carbs: 23.8, fat: 0.1 },
  { name: "Laranja, pêra", category: "Frutas", calories: 46, protein: 0.9, carbs: 11.5, fat: 0.1 },
  { name: "Maçã, fuji", category: "Frutas", calories: 56, protein: 0.3, carbs: 15.2, fat: 0.1 },
  { name: "Mamão, papaia", category: "Frutas", calories: 45, protein: 0.8, carbs: 11.6, fat: 0.1 },
  { name: "Abacaxi", category: "Frutas", calories: 48, protein: 0.9, carbs: 12.3, fat: 0.1 },
  { name: "Manga, tommy", category: "Frutas", calories: 64, protein: 0.7, carbs: 16.7, fat: 0.2 },
  { name: "Leite integral", category: "Laticínios", calories: 61, protein: 2.9, carbs: 4.3, fat: 3.2 },
  { name: "Iogurte natural", category: "Laticínios", calories: 51, protein: 4.1, carbs: 4.0, fat: 1.5 },
  { name: "Queijo minas", category: "Laticínios", calories: 264, protein: 17.4, carbs: 3.8, fat: 20.0 },
  { name: "Ovo de galinha, cozido", category: "Ovos", calories: 146, protein: 13.3, carbs: 0.6, fat: 9.5 },
  { name: "Clara de ovo", category: "Ovos", calories: 48, protein: 10.9, carbs: 0.7, fat: 0.0 },
  { name: "Gema de ovo", category: "Ovos", calories: 353, protein: 16.1, carbs: 0.6, fat: 31.9 },
  { name: "Salmão, grelhado", category: "Peixes", calories: 308, protein: 25.4, carbs: 0.0, fat: 22.1 },
  { name: "Tilápia, grelhada", category: "Peixes", calories: 96, protein: 20.1, carbs: 0.0, fat: 1.7 },
  { name: "Atum, conserva em água", category: "Peixes", calories: 108, protein: 25.0, carbs: 0.0, fat: 0.8 },
  { name: "Sardinha, conserva em óleo", category: "Peixes", calories: 208, protein: 24.6, carbs: 0.0, fat: 11.5 },
  { name: "Azeite de oliva", category: "Óleos e gorduras", calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0 },
  { name: "Óleo de soja", category: "Óleos e gorduras", calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0 },
  { name: "Manteiga", category: "Óleos e gorduras", calories: 717, protein: 0.9, carbs: 0.7, fat: 80.0 },
  { name: "Margarina", category: "Óleos e gorduras", calories: 596, protein: 0.9, carbs: 1.3, fat: 65.0 },
  { name: "Amendoim, torrado", category: "Oleaginosas", calories: 544, protein: 27.2, carbs: 20.3, fat: 43.9 },
  { name: "Castanha-do-pará", category: "Oleaginosas", calories: 643, protein: 14.5, carbs: 15.1, fat: 63.5 },
  { name: "Castanha de caju", category: "Oleaginosas", calories: 570, protein: 18.5, carbs: 28.7, fat: 46.3 },
  { name: "Açúcar cristal", category: "Açúcares e produtos de confeitaria", calories: 387, protein: 0.0, carbs: 99.5, fat: 0.0 },
  { name: "Mel de abelha", category: "Açúcares e produtos de confeitaria", calories: 309, protein: 0.4, carbs: 84.0, fat: 0.0 },
  { name: "Chocolate ao leite", category: "Açúcares e produtos de confeitaria", calories: 533, protein: 7.3, carbs: 59.5, fat: 29.6 },
  { name: "Biscoito cream cracker", category: "Cereais e derivados", calories: 432, protein: 10.5, carbs: 71.3, fat: 11.0 },
  { name: "Aveia, flocos", category: "Cereais e derivados", calories: 394, protein: 13.9, carbs: 66.6, fat: 8.5 },
  { name: "Granola", category: "Cereais e derivados", calories: 471, protein: 12.1, carbs: 64.9, fat: 18.5 }
];

export async function populateFoodDatabase() {
  try {
    console.log("🍽️ Starting to populate food database...");
    
    // Check if data already exists
    const existingFoods = await db.select().from(foodDatabase).limit(1);
    if (existingFoods.length > 0) {
      console.log("📋 Food database already populated, skipping...");
      return;
    }
    
    // Insert all foods in batches
    const batchSize = 50;
    for (let i = 0; i < brazilianFoods.length; i += batchSize) {
      const batch = brazilianFoods.slice(i, i + batchSize);
      await db.insert(foodDatabase).values(batch);
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(brazilianFoods.length / batchSize)}`);
    }
    
    console.log(`🎉 Successfully populated food database with ${brazilianFoods.length} Brazilian foods!`);
  } catch (error) {
    console.error("❌ Error populating food database:", error);
    throw error;
  }
}