import { StyleSheet, Text, View } from "react-native";
import { ThemeColors } from "../themes/colors";

interface Props {
    title: string;
    value: number | null;
    unit: string;
    timestamp: number | null;
    colors: ThemeColors
}

export default function SensorCard({ title, value, unit, timestamp, colors }: Props) {
    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.textSecondary }]}>
                {title}
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
                {value !== null ? `${value}${unit}` : '--'}
            </Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>
                {timestamp !== null
                    ? `Atualizado às ${new Date(timestamp).toLocaleTimeString('pt-BR')}`
                    : 'Aguardando dados...'
                }
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    card: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14 },
    title: { fontSize: 14 },
    value: { fontSize: 30, fontWeight: '700', marginVertical: 6 },
    time: { fontSize: 11 },
})