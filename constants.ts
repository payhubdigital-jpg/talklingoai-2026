
import { Language, VoiceOption } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
];

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'Fenrir', label: 'Voz Homem 👨', gender: 'male' },
  { id: 'Kore', label: 'Voz Mulher 👩', gender: 'female' },
];

export const DEFAULT_SOURCE_LANG = SUPPORTED_LANGUAGES[0];
export const DEFAULT_TARGET_LANG = SUPPORTED_LANGUAGES[1];
export const DEFAULT_VOICE = VOICE_OPTIONS[1]; // Kore (Feminino)

export const GEMINI_MODEL = 'models/gemini-2.5-flash-native-audio-latest';

export const FREE_LIMIT_SECONDS = 600; // Limite de 10 minutos

/**
 * Link de Checkout da Kiwify atualizado.
 * Preço: R$ 37,00 (1º mês) / R$ 47,90 (Recorrência)
 */
export const CHECKOUT_URL_MONTHLY = 'https://pay.kiwify.com.br/fBgai5G'; // Link mensal atualizado
export const CHECKOUT_URL_YEARLY = 'https://pay.kiwify.com.br/sEDENXj'; // Link anual atualizado
export const CHECKOUT_URL_LIFETIME = 'https://pay.kiwify.com.br/tcL4B07'; // Link vitalício atualizado

/**
 * Link de Checkout padrão (Mantendo compatibilidade)
 */
export const PREMIUM_CHECKOUT_URL = CHECKOUT_URL_MONTHLY;

export const WHATSAPP_NUMBER = '5591988864578';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1%2C%20tenho%20uma%20d%C3%BAvida%20sobre%20o%20TalkLingo%20AI%21`;
