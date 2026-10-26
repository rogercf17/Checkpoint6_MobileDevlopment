import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_BROKER_URL, TOPICS } from '../config/mqtt';
import { mqttService, parseLampState, parseSensorValue } from '../services/mqttService';
import { getBrokerUrl, getTheme, saveBrokerUrl, saveTheme } from '../services/storageService';
import { ThemeColors, ThemeName, themes } from '../themes/colors';
import { ConnectionStatus, HistoryMessage, LampState, LampStatus, SensorReading } from '../types/mqtt';

const HISTORY_LIMIT = 10;

interface MqttContextValue {
    ready: boolean;
    status: ConnectionStatus;
    errorMessage: string | null;
    temperature: SensorReading | null;
    humidity: SensorReading | null;
    lamp: LampStatus | null;
    pendingCommand: LampState | null;
    history: HistoryMessage[];
    brokerUrl: string;
    themeName: ThemeName;
    colors: ThemeColors;
    connect: (url?: string) => void;
    disconnect: () => void;
    sendLampCommand: (action: LampState) => Promise<void>;
    setTheme: (theme: ThemeName) => void;
}

const MqttContext = createContext<MqttContextValue | undefined>(undefined);

export function MqttProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(false);
    const [status, setStatus] = useState<ConnectionStatus>(mqttService.getStatus());
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [temperature, setTemperature] = useState<SensorReading | null>(null);
    const [humidity, setHumidity] = useState<SensorReading | null>(null);
    const [lamp, setLamp] = useState<LampStatus | null>(null);
    const [pendingCommand, setPendingCommand] = useState<LampState | null>(null);
    const [history, setHistory] = useState<HistoryMessage[]>([]);
    const [brokerUrl, setBrokerUrl] = useState<string>(DEFAULT_BROKER_URL);
    const [themeName, setThemeName] = useState<ThemeName>('light');

    useEffect(() => {
        const offStatus = mqttService.onStatusChange((newStatus, error) => {
        setStatus(newStatus);
        setErrorMessage(newStatus === 'error' ? error ?? 'Erro de conexão' : null);
        if (newStatus !== 'connected') setPendingCommand(null);
        });

        const offMessage = mqttService.onMessage((msg) => {
        setHistory((prev) => [msg, ...prev].slice(0, HISTORY_LIMIT));
        if (msg.direction !== 'received') return;

        if (msg.topic === TOPICS.temperatura) {
            const value = parseSensorValue(msg.payload);
            if (value !== null) setTemperature({ value, timestamp: msg.timestamp });
        } else if (msg.topic === TOPICS.umidade) {
            const value = parseSensorValue(msg.payload);
            if (value !== null) setHumidity({ value, timestamp: msg.timestamp });
        } else if (msg.topic === TOPICS.estado) {
            const state = parseLampState(msg.payload);
            if (state !== null) {
            setLamp({ state, timestamp: msg.timestamp });
            setPendingCommand(null); 
            }
        }
        });

        return () => {
        offStatus();
        offMessage();
        mqttService.disconnect();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
        const [savedUrl, savedTheme] = await Promise.all([getBrokerUrl(), getTheme()]);
        if (cancelled) return;
        const url = savedUrl ?? DEFAULT_BROKER_URL;
        setBrokerUrl(url);
        if (savedTheme) setThemeName(savedTheme);
        setReady(true);
        mqttService.connect(url);
        })();
        return () => {
        cancelled = true;
        };
    }, []);

    const connect = useCallback(
        (url?: string) => {
        const target = (url ?? brokerUrl).trim();
        setBrokerUrl(target);
        if (!/^wss?:\/\//i.test(target)) {
            mqttService.disconnect();
            setStatus('error');
            setErrorMessage('A URL deve começar com ws:// ou wss:// (não use a porta TCP 1883).');
            return;
        }
        void saveBrokerUrl(target);
        mqttService.connect(target);
        },
        [brokerUrl],
    );

    const disconnect = useCallback(() => mqttService.disconnect(), []);

    const sendLampCommand = useCallback(async (action: LampState) => {
        setPendingCommand(action);
        try {
        await mqttService.sendLampCommand(action);
        } catch (e) {
        setPendingCommand(null);
        throw e; // a tela mostra o Alert com a mensagem
        }
    }, []);

    const setTheme = useCallback((theme: ThemeName) => {
        setThemeName(theme);
        void saveTheme(theme);
    }, []);

    const value: MqttContextValue = {
        ready,
        status,
        errorMessage,
        temperature,
        humidity,
        lamp,
        pendingCommand,
        history,
        brokerUrl,
        themeName,
        colors: themes[themeName],
        connect,
        disconnect,
        sendLampCommand,
        setTheme,
    };

    return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}

export function useMqtt(): MqttContextValue {
    const ctx = useContext(MqttContext);
    if (!ctx) throw new Error('useMqtt deve ser usado dentro de <MqttProvider>');
    return ctx;
}