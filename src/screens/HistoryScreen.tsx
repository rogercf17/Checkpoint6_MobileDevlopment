import { FlatList, StyleSheet, Text, View } from "react-native";
import { useMqtt } from "../context/MqttContext";
import MessageItem from "../components/MessageItem";

export default function HistoryScreen() {
    const { history, colors } = useMqtt()

    return(
        <View>
            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageItem message={item} colors={colors} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={[styles.empty, { color: colors.textSecondary }]}>
                        Nenhuma Mensagem
                    </Text>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16 },
    empty: { textAlign: 'center', marginTop: 40 },
})