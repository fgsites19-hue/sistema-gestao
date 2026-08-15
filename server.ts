import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Server-side Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI features will operate in fallback mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "StudioOS", time: new Date().toISOString() });
});

// AI Assistant endpoint
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { prompt, contextData, conversationHistory } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        reply: `[Modo Offline/Demonstração da IA StudioOS]\n\nRecebi sua solicitação: "${prompt}". Para respostas analíticas com modelo generativo Gemini em tempo real, certifique-se de que a chave GEMINI_API_KEY esteja configurada no ambiente. Com base nos seus dados atuais, você pode consultar o painel financeiro e projetos diretamente na interface!`,
      });
    }

    const systemInstruction = `Você é o "Assistente IA do StudioOS", o braço direito e consultor de negócios de um Web Designer e dono de Agência Digital.
Você tem acesso aos dados operacionais e financeiros em tempo real do sistema.

Seu objetivo é:
1. Responder perguntas sobre faturamento, métricas, contas a receber, clientes em atraso, projetos em andamento, tarefas e recorrências com dados precisos.
2. Auxiliar na redação e estruturação de propostas comerciais persuasivas e contratos de prestação de serviços para web design, landing pages, e-commerce e manutenção.
3. Dar insights práticos para aumentar o lucro, converter mais leads e evitar atrasos em entregas.
4. Responder sempre em Português do Brasil com tom profissional, direto, ágil e prestativo.
5. Quando o usuário pedir para calcular ou listar algo (ex: faturamento do mês, quem está devendo, projetos atrasados), consulte e interprete os dados fornecidos no contexto.

Contexto atual dos dados do negócio:
${JSON.stringify(contextData || {}, null, 2)}
`;

    const chatMessages = (conversationHistory || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Add current user prompt
    chatMessages.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: chatMessages,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Desculpe, não consegui processar a resposta no momento.";
    return res.json({ reply });
  } catch (error: any) {
    console.error("Error in AI assistant endpoint:", error);
    return res.status(500).json({
      error: "Falha ao consultar a IA",
      message: error?.message || "Erro desconhecido",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudioOS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
