import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName } from '../themes/colors';

const KEYS = {
    brokerUrl: '@Checkpoint6_MobileDevelopment:brokeUrl',
    theme: '@Checkpoint6_MobileDevelopment:theme',
} as const

export async function getBrokerUrl(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(KEYS.brokerUrl)
    }catch {
        return null
    }
}

export async function saveBrokerUrl(url: string): Promise<void> {
    try {
        await AsyncStorage.setItem(KEYS.brokerUrl, url);
    } catch {
    
    }
}

export async function getTheme(): Promise<ThemeName | null> {
    try {
        const value = await AsyncStorage.getItem(KEYS.theme);
        return value === 'light' || value === 'dark' ? value : null;
    } catch {
        return null;
    }
}

export async function saveTheme(theme: ThemeName): Promise<void> {
    try {
        await AsyncStorage.setItem(KEYS.theme, theme)
    }catch {

    }
}