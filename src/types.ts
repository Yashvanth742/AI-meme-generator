export interface MemeText {
  id: string;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: "Impact" | "Inter" | "Space Grotesk" | "JetBrains Mono";
  uppercase: boolean;
  strokeColor: string;
  strokeWidth: number;
  positionY: number; // Percentage from top (0 to 100)
  positionX: number; // Percentage from left (0 to 100)
}

export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  description: string;
  category: "classic" | "reaction" | "modern" | "ai-generated";
  defaultTexts?: {
    top?: string;
    bottom?: string;
  };
}

export interface AICaptionSuggestion {
  topText: string;
  bottomText: string;
  trope: string;
  explanation: string;
}

export type MemeStyle = "classic" | "twitter" | "news";
