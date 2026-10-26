import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMqtt } from "../context/MqttContext";
import { LampState } from "../types/mqtt";
import ConnectionStatus from "../components/ConnectionStatus";
import SensorCard from "../components/SensorCard";

export default function DashboardScreen() {
    const { status, errorMessage, temperature, humidity, lamp, pendingCommand, colors, connect, sendLampCommand } =
    useMqtt()

    const handleCommand = (action: LampState) => {
        sendLampCommand(action).catch((e: Error) => Alert.alert('Não foi possível enviar', e.message))
    }

    const lampLabel = lamp ? (lamp.state === 'ON' ? 'Ligada' : 'Desligada') : 'Sem informação'
    const lampColor = lamp?.state === 'ON' ? colors.warning : colors.textSecondary

    return(
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
            <ConnectionStatus status={status} errorMessage={errorMessage} colors={colors} />

            {status === 'error' || status === 'disconnected' && (
                <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => connect()}>
                    <Text style={styles.buttonText}>Reconectar</Text>
                </Pressable>
            )}

            <View style={styles.row}>
                <SensorCard title="Temperatura" value={temperature?.value ?? null} unit="°C"
                    timestamp={temperature?.timestamp ?? null} colors={colors} />
                <SensorCard title="Umidade" value={humidity?.value ?? null} unit="%"
                    timestamp={humidity?.timestamp ?? null} colors={colors} />
            </View>

            <View style={[styles.lampCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.lampTitle, { color: colors.textSecondary }]}>Lâmpada</Text>
                <Text style={[styles.lampState, { color: lampColor }]}>💡 {lampLabel}</Text>
                <Text style={[styles.lampTime, { color: colors.textSecondary }]}>
                    {pendingCommand
                        ? `Comando ${pendingCommand === 'ON' ? 'Ligar' : 'Desligar'} enviado, aguardando confirmação...`
                        : lamp
                        ? `Atualizado às ${new Date(lamp.timestamp).toLocaleTimeString('pt-BR')}`
                        : 'Aguardando estado do dispositivo...'}
                </Text>

                <View style={styles.row}>
                    <Pressable style={[styles.button, styles.flex, { backgroundColor: colors.success }]}
                        onPress={() => handleCommand('ON')}>
                        <Text style={styles.buttonText}>Ligar</Text>
                    </Pressable>
                    <Pressable style={[styles.button, styles.flex, { backgroundColor: colors.danger }]}
                        onPress={() => handleCommand('OFF')}>
                        <Text style={styles.buttonText}>Desligar</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    content: { padding: 16, gap: 16 },
    row: { flexDirection: 'row', gap: 12 },
    flex: { flex: 1 },
    button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    lampCard: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 10 },
    lampTitle: { fontSize: 14 },
    lampState: { fontSize: 28, fontWeight: '700' },
    lampTime: { fontSize: 12 },
})