import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;



// Increase payload limit for base64 image uploads
app.use(express.json({ limit: "15mb" }));

// Initialize GoogleGenAI client
// We must set the User-Agent header to 'aistudio-build' in httpOptions for telemetry.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to extract base64 data and mimeType from data URL
function parseDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2],
    };
  }
  // Fallback if it's already a raw base64 string
  return {
    mimeType: "image/png",
    data: dataUrl,
  };
}

// API Route: Magic Caption (analyze image and suggest captions)
app.post("/api/generate-captions", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }

    const { mimeType, data } = parseDataUrl(image);

    const prompt = `Analyze this image and suggest 5 funny, hilarious, and highly relevant meme captions. 
The captions should fit classic meme tropes (e.g., relatable pain, dramatic exaggeration, sarcasm, expect vs reality, developer humor, or general irony) and correspond perfectly to the visible expressions, objects, or scenario in the image.
Provide short, punchy captions. Some should have both top and bottom text, and some can have just bottom text (set topText to an empty string in those cases).`;

    // Fallback list of models starting with the most highly available fast models (gemini-2.5-flash)
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.1-pro-preview"];
    let response = null;
    let lastError: any = null;
    let selectedModel = "";

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting caption generation with ${modelName}...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                mimeType: mimeType,
                data: data,
              },
            },
            {
              text: prompt,
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                captions: {
                  type: Type.ARRAY,
                  description: "List of 5 funny suggested meme captions",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topText: {
                        type: Type.STRING,
                        description: "Text that goes at the top of the meme (can be empty string)",
                      },
                      bottomText: {
                        type: Type.STRING,
                        description: "Text that goes at the bottom of the meme (required)",
                      },
                      trope: {
                        type: Type.STRING,
                        description: "The name of the trope or style (e.g., 'Relatable', 'Sarcasm', 'Panic')",
                      },
                      explanation: {
                        type: Type.STRING,
                        description: "A very brief explanation of why this caption is funny for this image",
                      },
                    },
                    required: ["bottomText"],
                  },
                },
              },
              required: ["captions"],
            },
          },
        });
        selectedModel = modelName;
        break; // Break loop on success
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or quota exceeded:`, err.message || err);
        lastError = err;
      }
    }

    if (!response) {
      throw new Error(`All generative models failed. Details: ${lastError?.message || lastError}`);
    }

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text received from Gemini");
    }

    const result = JSON.parse(resultText.trim());
    return res.json({
      ...result,
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error("Error generating captions:", error);
    return res.status(500).json({
      error: "Failed to generate captions: " + (error.message || error),
    });
  }
});

// API Route: Generate Image with prompt using gemini-3.1-flash-image-preview
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: [
        {
          text: prompt,
        },
      ],
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K",
        },
      },
    });

    let base64Image = null;
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("Failed to find image data in Gemini response parts");
    }

    return res.json({ imageUrl: base64Image });
  } catch (error: any) {
    console.error("Error generating image:", error);
    return res.status(500).json({
      error: "Failed to generate image: " + (error.message || error),
    });
  }
});

// API Route: Edit Image (Add or modify content in existing image)
app.post("/api/edit-image", async (req, res) => {
  try {
    const { image, prompt } = req.body;
    if (!image || !prompt) {
      return res.status(400).json({ error: "Image and prompt are required" });
    }

    const { mimeType, data } = parseDataUrl(image);

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let base64Image = null;
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("Failed to find edited image data in Gemini response parts");
    }

    return res.json({ imageUrl: base64Image });
  } catch (error: any) {
    console.error("Error editing image:", error);
    return res.status(500).json({
      error: "Failed to edit image: " + (error.message || error),
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
