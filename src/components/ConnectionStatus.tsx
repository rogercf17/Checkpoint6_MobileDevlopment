import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ThemeColors } from "../themes/colors";
import { ConnectionStatus as Status } from "../types/mqtt";

interface Props {
    status: Status;
    errorMessage: string | null;
    colors: ThemeColors;
}

const LABELS: Record<Status, string> = {
    connecting: 'Conectando...',
    connected: 'Conectado',
    disconnected: 'Desconectado',
    error: 'Erro de conexão',
}

export default function ConnectionStatus({ status, errorMessage, colors }: Props) {
    const dotColor: Record<Status, string> = {
        connecting: colors.warning,
        connected: colors.success,
        disconnected: colors.textSecondary,
        error: colors.danger,
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.row}>
                {status === 'connecting' ? (
                    <ActivityIndicator size="small" color={dotColor.connecting} />
                ) : (
                    <View style={[styles.dot, { backgroundColor: dotColor[status] }]} />
                )}
                <Text style={[styles.label, { color: colors.text }]}>{LABELS[status]}</Text>
            </View>
            {status === 'error' && errorMessage ? (
                <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text>
            ) : null} 
        </View>
    )
}

const styles = StyleSheet.create({
    container: { borderWidth: 1, borderRadius: 12, padding: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    label: { fontSize: 16, fontWeight: '600' },
    error: { marginTop: 6, fontSize: 13 },
})