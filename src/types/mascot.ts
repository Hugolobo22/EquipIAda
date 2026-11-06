/** Estados comportamentais usados pelo mascote e pelos controles. */
export type MascotEmotion = "neutral" | "curious" | "sarcastic" | "annoyed" | "sleepy";
export type MascotGesture = "idle" | "wave" | "point" | "grab" | "shrug";

export type MascotEvent =
  | { type: "SET_EMOTION"; emotion: MascotEmotion }
  | { type: "SPEAK"; text: string; emotion?: MascotEmotion; gesture?: MascotGesture }
  | { type: "SET_GESTURE"; gesture: MascotGesture }
  | { type: "RESET" };

export type MascotState = {
  emotion: MascotEmotion;
  gesture: MascotGesture;
  speech: string;
};

export const initialMascotState: MascotState = {
  emotion: "neutral",
  gesture: "wave",
  speech: "Oi, humano! Eu sou a IAda. Você veio perguntar alguma coisa? Que inconveniente...",
};

export const EMOTIONS: { key: MascotEmotion; label: string; subtitle: string }[] = [
  { key: "neutral", label: "Normal", subtitle: "Só observando" },
  { key: "curious", label: "Curiosa", subtitle: "O que você quer?" },
  { key: "sarcastic", label: "Sarcástica", subtitle: "Ah, claro..." },
  { key: "annoyed", label: "Irritada", subtitle: "De novo?!" },
  { key: "sleepy", label: "Sonolenta", subtitle: "Zzz..." },
];
