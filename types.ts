
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface TranslationItem {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  detectedLang: string;
  timestamp: Date;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface VoiceOption {
  id: VoiceName;
  label: string;
  gender: 'male' | 'female';
}

export interface UserUsage {
  secondsUsed: number;
  lastResetDate: string;
  bonusSeconds?: number;
}

export interface UserProfile {
  isPremium: boolean;
  usage: UserUsage;
}
