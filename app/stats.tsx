import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";

import { BooksStats, getStats } from "../services/BooksService";

export default function StatsScreen() {
  const [stats, setStats] = useState<BooksStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartWidth = useMemo(() => {
    const screenWidth = Dimensions.get("window").width;
    return Math.max(screenWidth - 32, 320);
  }, []);

  const pieData = useMemo(() => {
    if (!stats) {
      return null;
    }
    const segments = [
      {
        label: "Lus",
        value: stats.readCount,
        color: "#2563eb",
      },
      {
        label: "Non lus",
        value: stats.unreadCount,
        color: "#94a3b8",
      },
      {
        label: "Favoris",
        value: stats.favoritesCount,
        color: "#f97316",
      },
    ].filter((segment) => segment.value > 0);

    if (segments.length === 0) {
      return null;
    }

    return segments.map((segment) => ({
      name: segment.label,
      population: segment.value,
      color: segment.color,
      legendFontColor: "#111827",
      legendFontSize: 13,
    }));
  }, [stats]);

  const averageRatingText = useMemo(() => {
    if (!stats || typeof stats.averageRating !== "number") {
      return "Non renseignee";
    }
    return stats.averageRating.toFixed(1);
  }, [stats]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStats();
      setStats(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError((fetchError as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Tableau de bord</Text>
          <Pressable
            onPress={loadStats}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed ? styles.refreshButtonPressed : null,
            ]}
            disabled={loading}
          >
            <MaterialIcons
              name="refresh"
              size={18}
              color={loading ? "#9ca3af" : "#2563eb"}
            />
            <Text
              style={[
                styles.refreshText,
                loading ? styles.refreshTextDisabled : null,
              ]}
            >
              {loading ? "Mise a jour..." : "Actualiser"}
            </Text>
          </Pressable>
        </View>
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loaderText}>Chargement des statistiques...</Text>
          </View>
        ) : stats ? (
          <View style={styles.statsBody}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{stats.totalBooks}</Text>
                <Text style={styles.summaryLabel}>Livres</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{stats.readCount}</Text>
                <Text style={styles.summaryLabel}>Lus</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{stats.unreadCount}</Text>
                <Text style={styles.summaryLabel}>Non lus</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{stats.favoritesCount}</Text>
                <Text style={styles.summaryLabel}>Favoris</Text>
              </View>
            </View>
            {pieData ? (
              <View style={styles.chartWrapper}>
                <PieChart
                  data={pieData}
                  width={chartWidth}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="16"
                  absolute
                />
              </View>
            ) : (
              <View style={styles.emptyChart}>
                <MaterialIcons name="pie-chart-outline" size={20} color="#94a3b8" />
                <Text style={styles.emptyChartText}>
                  Ajoutez des livres pour visualiser la repartition.
                </Text>
              </View>
            )}
            <View style={styles.averageCard}>
              <MaterialIcons name="star-rate" size={20} color="#f59e0b" />
              <View style={styles.averageTextGroup}>
                <Text style={styles.averageLabel}>Note moyenne</Text>
                <Text style={styles.averageValue}>{averageRatingText}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.errorBox}>
            <MaterialIcons name="cloud-off" size={20} color="#b91c1c" />
            <Text style={styles.errorText}>
              {error
                ? `Impossible de charger les statistiques : ${error}`
                : "Aucune statistique disponible pour le moment."}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#f8fafc",
  backgroundGradientTo: "#f8fafc",
  color: (opacity = 1) => `rgba(37,99,235,${opacity})`,
  labelColor: (opacity = 1) => `rgba(17,24,39,${opacity})`,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f6fb",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2563eb",
    backgroundColor: "#fff",
  },
  refreshButtonPressed: {
    opacity: 0.85,
  },
  refreshText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 13,
  },
  refreshTextDisabled: {
    color: "#9ca3af",
  },
  loaderBox: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
  },
  loaderText: {
    color: "#475569",
    fontSize: 15,
  },
  statsBody: {
    gap: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    gap: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#475569",
  },
  chartWrapper: {
    alignItems: "center",
  },
  emptyChart: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  emptyChartText: {
    color: "#475569",
    fontSize: 14,
  },
  averageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff7ed",
  },
  averageTextGroup: {
    gap: 4,
  },
  averageLabel: {
    fontSize: 14,
    color: "#92400e",
  },
  averageValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#92400e",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fee2e2",
    padding: 12,
  },
  errorText: {
    flex: 1,
    color: "#b91c1c",
    fontSize: 13,
  },
});
