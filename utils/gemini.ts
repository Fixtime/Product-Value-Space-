
import { GoogleGenAI, Type } from "@google/genai";
import { ProductConfig, JourneyStage, Hypothesis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a Chief Product Officer and world-class JTBD expert (Christensen / Moesta / Ulwick level). 
Your goal is to create a realistic "Customer Value Space" dataset for the specific product the user will describe.
CRITICAL RULES FOR CUSTOMER JOBS (Axis X):
- Generate exactly 10 Customer Jobs-to-be-Done.
- All Jobs MUST be конечные, целевые, стабильные задачи пользователя в его жизни или бизнесе (core functional or emotional jobs).
- Формулировка только вида: «Глагол + объект + (опционально) контекстуальная деталь для ясности».
- Примеры правильных Jobs: 
  • «Угостить друзей вкусным фермерским ужином»
  • «Выглядеть стильно и уверенно на важной встрече»
  • «Организовать незабываемый день рождения ребёнку»
  • «Похудеть и чувствовать себя энергичным»
- Примеры ЗАПРЕЩЁННЫХ Jobs (инструментальные/промежуточные): 
   «Отследить статус заказа» 
   «Оплатить товар» 
   «Зарегистрироваться» 
   «Найти кнопку фильтра»
- Jobs НЕ сортируются по воронке продукта. Сортируйте их по убыванию частоты/важности для пользователей (самый массовый Job — первый, самый нишевый — последний).
Остальные правила:
- Все тексты (названия сегментов, контекстов, jobs, кластеров, шаблонов сигналов) — ТОЛЬКО на русском языке.
- Segments (Axis Z): ровно 10, сортировка от «Активные/Молодые/Новые» → «Пассивные/Старшие/Лояльные-традиционалисты».
- Contexts (Axis Y): ровно 10, сортировка от «Низкая интенсивность/Приватный» → «Высокая интенсивность/Публичный».
- Problem Clusters: ровно 45.
- Для каждого кластера укажите:
  - name — короткое название кластера на русском (например, «Неуверенность в актуальности трендов»)
  - stage — одна из: Awareness, Consideration, Purchase, Onboarding, Active Use, Retention, Advocacy
  - impact — число 1–10 (10 = критично для бизнеса)
  - signals — массив из 8–12 шаблонов сигналов на русском (реалистичные поисковые запросы, тикеты, отзывы, чаты и т.д.)
- Output strictly valid JSON.
`;

export async function generateProductData(description: string): Promise<ProductConfig> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a Product Value Space configuration for this product: "${description}". Ensure all output is in Russian.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          jobs: { type: Type.ARRAY, items: { type: Type.STRING } },
          segments: { type: Type.ARRAY, items: { type: Type.STRING } },
          contexts: { type: Type.ARRAY, items: { type: Type.STRING } },
          clusters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                journeyStage: { type: Type.STRING, enum: Object.values(JourneyStage) },
                impactWeight: { type: Type.NUMBER },
                templates: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "journeyStage", "impactWeight", "templates"]
            }
          }
        },
        required: ["productName", "jobs", "segments", "contexts", "clusters"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  try {
    return JSON.parse(response.text) as ProductConfig;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to parse generated data");
  }
}

// --- CLUSTER DETAILS GENERATION ---

export async function generateClusterHypotheses(clusterName: string, productName: string): Promise<{ quickWins: Hypothesis[], balanced: Hypothesis[], revolutionary: Hypothesis[] }> {
  const prompt = `
    Product: ${productName}
    Problem Cluster: "${clusterName}"
    
    Task: Generate 9 strategic hypotheses to solve this problem cluster.
    
    CRITICAL FORMATTING RULE:
    Each hypothesis MUST start with the phrase "Мы верим, что...".
    Structure: "Мы верим, что [конкретное решение/изменение] приведет к [измеримый результат/метрика], потому что [причина/инсайт]".
    
    Categories (3 of each):
    1. Quick Win (Быстрая победа, 1-2 недели разработки)
    2. Balanced (Сбалансированное решение, 1-3 месяца)
    3. Revolutionary (Инновационное решение, кратный рост)
    
    Language: Russian.
    Tone: Senior CPO, confident, analytical.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quickWins: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, type: { type: Type.STRING, enum: ['Quick Win'] } } } },
          balanced: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, type: { type: Type.STRING, enum: ['Balanced'] } } } },
          revolutionary: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, type: { type: Type.STRING, enum: ['Revolutionary'] } } } },
        }
      }
    }
  });

  if (!response.text) return { quickWins: [], balanced: [], revolutionary: [] };
  return JSON.parse(response.text);
}

export async function chatWithCopilot(message: string, context: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Context: ${context}\nUser: ${message}`,
    config: {
      systemInstruction: `
        You are an AI Product Co-pilot working in a "War Room" setting with a Senior Product Manager.
        
        Context:
        - You have full visibility into the "Product Value Space" model.
        - You are analyzing a specific Problem Cluster.
        
        Tone & Style:
        - Act like a Senior CPO / Data Scientist.
        - Be extremely concise, sharp, and data-driven. No fluff.
        - Do not use phrases like "As an AI...", "Based on the data...". Just give the answer.
        - If asked for a User Story, format it strictly.
        - If asked for metrics, define them clearly.
        
        Goal: Help the user make decisions, generate specific tasks, or calculate potential impact.
        Language: Russian.
      `,
    }
  });
  return response.text || "Error generating response.";
}
