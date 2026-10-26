export type ThemeName = 'light' | 'dark'

export interface ThemeColors {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    success: string;
    danger: string;
    warning: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
    light: {
        background: '#F4F6FA',
        card: '#FFFFFF',
        text: '#1B1F2A',
        textSecondary: '#6B7280',
        primary: '#2563EB',
        border: '#E5E7EB',
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#D97706',
    },
    dark: {
        background: '#0F1220',
        card: '#1A1F33',
        text: '#F3F4F6',
        textSecondary: '#9CA3AF',
        primary: '#60A5FA',
        border: '#2B3150',
        success: '#4ADE80',
        danger: '#F87171',
        warning: '#FBBF24',
    },
}