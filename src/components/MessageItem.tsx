import { StyleSheet, Text, View } from "react-native";
import { ThemeColors } from "../themes/colors";
import { HistoryMessage } from "../types/mqtt";

interface Props {
    message: HistoryMessage;
    colors: ThemeColors;
}

export default function MessageItem({ message, colors }: Props) {
    const sent = message.direction === 'sent'

    return (
        <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                <Text style={[styles.badge, { color: sent ? colors.primary : colors.success }]}>
                    {sent ? 'Enviada' : 'Recebida'}
                </Text>
                <Text style={[styles.time, { color: colors.textSecondary }]}>
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
                </Text>
            </View>
            <Text style={[styles.topic, { color: colors.text }]}>{message.topic}</Text>
            <Text style={[styles.payload, { color: colors.textSecondary }]}>{message.payload}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    item: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    badge: { fontSize: 13, fontWeight: '700' },
    time: { fontSize: 12 },
    topic: { fontSize: 13, fontWeight: '600' },
    payload: { fontSize: 13, marginTop: 2, fontFamily: 'monospace' },
})