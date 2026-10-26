import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useMqtt } from "../context/MqttContext";
import { useEffect, useState } from "react";
import ConnectionStatus from "../components/ConnectionStatus";
import { connect } from "mqtt";

export default function HistoryScreen() {
    const { status, errorMessage, brokerUrl, themeName, colors, connect, disconnect, setTheme } = useMqtt()
    const [draft, setDraft] = useState(brokerUrl)

    useEffect(() => setDraft(brokerUrl), [brokerUrl])

    const isOn = status === 'connected' || status === 'connecting'

    return(
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ConnectionStatus status={status} errorMessage={errorMessage} colors={colors} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>URL WebSocket do broker</Text>

            <TextInput 
                value={draft}
                onChangeText={setDraft}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="wss://broker.emqx.io:8084/mqtt"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            />

            <Pressable
                style={[styles.button, { backgroundColor: isOn ? colors.danger : colors.primary }]}
                onPress={() => (isOn ? disconnect() : connect(draft))}
            >
                <Text style={styles.buttonText}>{isOn ? 'Desconectar' : 'Conectar'}</Text>
            </Pressable>

            {isOn && draft.trim() !== brokerUrl && (
                <Pressable
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => connect(draft)}
                >
                    <Text style={styles.buttonText}>Reconectar com a nova URL</Text>
                </Pressable>
            )}

            <View style={[styles.themeRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.themeLabel, { color: colors.text }]}>Tema escuro</Text>
                <Switch value={themeName === 'dark'} onValueChange={(v) => setTheme(v ? 'dark' : 'light')} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 12 },
    label: { fontSize: 14, marginTop: 8 },
    input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
    button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    themeRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 8,
    },
    themeLabel: { fontSize: 16 },
})