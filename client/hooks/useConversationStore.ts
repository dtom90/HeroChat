import { create } from 'zustand';
import { Message, VALID_HEROES, ValidHero } from '../../shared/types';

interface ConversationState {

  // Per-hero state
  heroStates: Record<ValidHero, {
    isLoading: boolean;
    messages: Message[];
  }>;
  
  // Actions
  setIsLoading: (hero: ValidHero, isLoading: boolean) => void;
  addMessage: (hero: ValidHero, message: Message) => void;
  upsertHeroMessage: (hero: ValidHero, message: Message) => void;
  clearMessages: (hero: ValidHero) => void;
}

// Initialize hero states
const initialHeroState = {
  isLoading: false,
  messages: [],
};

const initialHeroStates = VALID_HEROES.reduce((acc, hero) => {
  acc[hero] = initialHeroState;
  return acc;
}, {} as Record<ValidHero, typeof initialHeroState>);

export const useConversationStore = create<ConversationState>((set, get) => ({
  
  heroStates: initialHeroStates,
  
  setIsLoading: (hero, isLoading) => set((state) => ({
    heroStates: {
      ...state.heroStates,
      [hero]: {
        ...state.heroStates[hero],
        isLoading,
      },
    },
  })),
  
  addMessage: (hero, message) => set((state) => ({
    heroStates: {
      ...state.heroStates,
      [hero]: {
        ...state.heroStates[hero],
        messages: [...state.heroStates[hero].messages, message],
      },
    },
  })),
  
  upsertHeroMessage: (hero, message) => set((state) => {
    const heroState = state.heroStates[hero];
    const lastMessage = heroState.messages[heroState.messages.length - 1];
    
    if (lastMessage && lastMessage.type === 'hero') {
      // Update the last message if it's a hero type
      const updatedMessage = { ...lastMessage, text: message.text, audio: message.audio };
      return {
        heroStates: {
          ...state.heroStates,
          [hero]: {
            ...heroState,
            messages: [...heroState.messages.slice(0, -1), updatedMessage],
          },
        },
      };
    } else {
      // Add new message if last message is not hero type
      return {
        heroStates: {
          ...state.heroStates,
          [hero]: {
            ...heroState,
            messages: [...heroState.messages, message],
          },
        },
      };
    }
  }),
  
  clearMessages: (hero) => set((state) => ({
    heroStates: {
      ...state.heroStates,
      [hero]: {
        ...state.heroStates[hero],
        messages: [],
      },
    },
  })),
}));
