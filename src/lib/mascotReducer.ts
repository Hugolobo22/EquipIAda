import { initialMascotState, type MascotEvent, type MascotState } from "@/types/mascot";

/** O reducer mantém as ações previsíveis e fáceis de registrar/testar. */
export function mascotReducer(state: MascotState, event: MascotEvent): MascotState {
  switch (event.type) {
    case "SET_EMOTION":
      return { ...state, emotion: event.emotion };
    case "SPEAK":
      return {
        ...state,
        speech: event.text,
        emotion: event.emotion ?? state.emotion,
        gesture: event.gesture ?? state.gesture,
      };
    case "SET_GESTURE":
      return { ...state, gesture: event.gesture };
    case "RESET":
      return { ...initialMascotState };
  }
}
