import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  GestureResponderEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Book,
  GetBooksParams,
  SortField,
  getBooks,
  updateBook,
} from "../services/BooksService";

type FilterRead = "tous" | "lus" | "non lus";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "title", label: "Titre" },
  { value: "author", label: "Auteur" },
  { value: "theme", label: "Theme" },
  { value: "year", label: "Annee" },
  { value: "rating", label: "Note" },
];

export default function Index() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRead, setFilterRead] = useState<FilterRead>("tous");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<"tous" | string>("tous");
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);
  const [sort, setSort] = useState<SortField>("title");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const queryParams = useMemo<GetBooksParams>(() => {
    return {
      query: search.trim() ? search.trim() : undefined,
      read:
        filterRead === "tous" ? undefined : filterRead === "lus" ? true : false,
      favorite: onlyFavorites ? true : undefined,
      theme: selectedTheme !== "tous" ? selectedTheme : undefined,
      sort,
      order,
    };
  }, [filterRead, onlyFavorites, order, search, selectedTheme, sort]);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBooks(queryParams);
      setBooks(data);
      setAvailableThemes((prev) => {
        const combined = new Set(prev);
        data.forEach((item) => {
          if (item.theme) {
            combined.add(item.theme);
          }
        });
        const next = Array.from(combined).sort((a, b) =>
          a.localeCompare(b, "fr")
        );
        if (
          next.length === prev.length &&
          next.every((value, index) => value === prev[index])
        ) {
          return prev;
        }
        return next;
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [queryParams]);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  const filtersReadyRef = useRef(false);

  useEffect(() => {
    if (filtersReadyRef.current) {
      loadBooks();
    } else {
      filtersReadyRef.current = true;
    }
  }, [loadBooks]);

  useEffect(() => {
    if (!status) {
      return;
    }
    const timer = setTimeout(() => setStatus(null), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  const handleToggleRead = useCallback(
    async (book: Book) => {
      try {
        const updated = await updateBook(book.id, {
          name: book.name,
          author: book.author,
          editor: book.editor,
          year: book.year ?? undefined,
          read: !book.read,
          favorite: book.favorite ?? false,
          rating: book.rating ?? null,
          cover: book.cover ?? null,
        });
        setBooks((prev) =>
          prev.map((item) => (item.id === book.id ? updated : item))
        );
        setStatus(
          book.read
            ? `Livre marque comme non lu : ${book.name}`
            : `Livre marque comme lu : ${book.name}`
        );
      } catch (error) {
        console.error(error);
        Alert.alert("Erreur", (error as Error).message);
      }
    },
    []
  );

  const handleToggleFavorite = useCallback(
    async (book: Book) => {
      try {
        const updated = await updateBook(book.id, {
          name: book.name,
          author: book.author,
          editor: book.editor,
          year: book.year ?? undefined,
          read: book.read ?? false,
          favorite: !book.favorite,
          rating: book.rating ?? null,
          cover: book.cover ?? null,
        });
        setBooks((prev) =>
          prev.map((item) => (item.id === book.id ? updated : item))
        );
        setStatus(
          !book.favorite
            ? `Livre ajoute aux favoris : ${book.name}`
            : `Livre retire des favoris : ${book.name}`
        );
      } catch (error) {
        console.error(error);
        Alert.alert("Erreur", (error as Error).message);
      }
    },
    []
  );

  const handleRate = useCallback(
    async (book: Book, rating: number) => {
      const bounded = Math.min(Math.max(Math.round(rating), 1), 5);
      try {
        const updated = await updateBook(book.id, {
          name: book.name,
          author: book.author,
          editor: book.editor,
          year: book.year ?? undefined,
          read: book.read ?? false,
          favorite: book.favorite ?? false,
          rating: bounded,
          cover: book.cover ?? null,
        });
        setBooks((prev) =>
          prev.map((item) => (item.id === book.id ? updated : item))
        );
        setStatus(
          `Note mise a jour : ${bounded} etoile(s) pour ${book.name}`
        );
      } catch (error) {
        console.error(error);
        Alert.alert("Erreur", (error as Error).message);
      }
    },
    []
  );

  const renderStars = useCallback(
    (book: Book) => {
      const current = book.rating ?? 0;
      return (
        <View style={styles.starsWrapper}>
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, index) => {
              const starValue = index + 1;
              const filled = starValue <= current;
              return (
                <Pressable
                  key={starValue}
                  onPress={(event: GestureResponderEvent) => {
                    event.stopPropagation();
                    handleRate(book, starValue);
                  }}
                  hitSlop={8}
                  accessibilityLabel={`Attribuer ${starValue} etoile${
                    starValue > 1 ? "s" : ""
                  }`}
                >
                  <Ionicons
                    name={filled ? "star" : "star-outline"}
                    size={20}
                    color={filled ? "#f97316" : "#cbd5f5"}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    },
    [handleRate]
  );

  const renderItem = useCallback(
    ({ item }: { item: Book }) => (
      <Pressable
        onPress={() => router.push(`/books/${item.id}`)}
        style={({ pressed }) => [
          styles.bookCard,
          pressed ? styles.bookCardPressed : null,
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.cardActions}>
            <Pressable
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                handleToggleFavorite(item);
              }}
              hitSlop={8}
              accessibilityLabel={
                item.favorite
                  ? `Retirer ${item.name} des favoris`
                  : `Ajouter ${item.name} aux favoris`
              }
            >
              <Ionicons
                name={item.favorite ? "heart" : "heart-outline"}
                size={20}
                color={item.favorite ? "#dc2626" : "#94a3b8"}
              />
            </Pressable>
            <Pressable
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                handleToggleRead(item);
              }}
              style={({ pressed }) => [
                styles.readBadge,
                item.read ? styles.readBadgeActive : styles.readBadgeInactive,
                pressed ? styles.readBadgePressed : null,
              ]}
              hitSlop={8}
              accessibilityLabel={
                item.read
                  ? `Marquer ${item.name} comme non lu`
                  : `Marquer ${item.name} comme lu`
              }
            >
              <MaterialIcons
                name={item.read ? "check-circle" : "radio-button-unchecked"}
                size={16}
                color={item.read ? "#047857" : "#4b5563"}
              />
              <Text style={styles.readBadgeText}>
                {item.read ? "Lu" : "A lire"}
              </Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.cardMeta}>Auteur : {item.author}</Text>
        {item.editor ? (
          <Text style={styles.cardMeta}>Editeur : {item.editor}</Text>
        ) : null}
        {item.year ? (
          <Text style={styles.cardMeta}>Publication : {item.year}</Text>
        ) : null}
        {item.theme ? (
          <Text style={styles.cardMeta}>Theme : {item.theme}</Text>
        ) : null}
        {renderStars(item)}
      </Pressable>
    ),
    [handleToggleFavorite, handleToggleRead, renderStars]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.headerRow}>
          <Text style={styles.title}><Ionicons
                name="book"
                size={28}
                color="#2563eb"
              /> Livres</Text>
          <Link href="/books/new" asChild>
            <Pressable style={styles.addButton}>
              <Text style={styles.addButtonText}>Ajouter</Text>
            </Pressable>
          </Link>
        </View>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher par titre ou auteur"
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContent}
        >
          {(["tous", "lus", "non lus"] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => setFilterRead(value)}
              style={[
                styles.filterChip,
                filterRead === value ? styles.filterChipActive : null,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterRead === value ? styles.filterChipTextActive : null,
                ]}
              >
                {value === "tous"
                  ? "Tous"
                  : value === "lus"
                  ? "Deja lus"
                  : "A lire"}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setOnlyFavorites((prev) => !prev)}
            style={[
              styles.filterChip,
              onlyFavorites ? styles.filterChipActive : null,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                onlyFavorites ? styles.filterChipTextActive : null,
              ]}
            >
              Favoris
            </Text>
          </Pressable>
        </ScrollView>
        {loading && !initialLoading ? (
          <View style={styles.inlineLoader}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.inlineLoaderText}>Mise a jour...</Text>
          </View>
        ) : null}
        {availableThemes.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScrollContent}
          >
            {["tous", ...availableThemes].map((value) => (
              <Pressable
                key={value}
                onPress={() => setSelectedTheme(value)}
                style={[
                  styles.filterChip,
                  selectedTheme === value ? styles.filterChipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedTheme === value ? styles.filterChipTextActive : null,
                  ]}
                >
                  {value === "tous" ? "Tous les themes" : value}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <View style={styles.sortHeader}>
          <Pressable
            onPress={() => setOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            style={[
              styles.orderButton,
              order === "desc" ? styles.orderButtonActive : null,
            ]}
          >
            <MaterialIcons
              name={order === "asc" ? "arrow-upward" : "arrow-downward"}
              size={16}
              color={order === "desc" ? "#fff" : "#1f2937"}
            />
            <Text
              style={[
                styles.orderButtonText,
                order === "desc" ? styles.orderButtonTextActive : null,
              ]}
            >
              {order === "asc" ? "Ordre croissant" : "Ordre decroissant"}
            </Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContent}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <Pressable
              key={value}
              onPress={() => setSort(value)}
              style={[
                styles.sortButton,
                sort === value ? styles.sortButtonActive : null,
              ]}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sort === value ? styles.sortButtonTextActive : null,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          books.length === 0 ? styles.emptyContent : styles.listContent
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          initialLoading ? (
            <View style={styles.emptyContent}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun livre</Text>
              <Text style={styles.emptySubtitle}>
                Ajustez vos filtres ou ajoutez un nouveau livre pour commencer.
              </Text>
            </View>
          )
        }
      />
      {status ? (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f6fb",
  },
  topBar: {
    padding: 20,
    paddingBottom: 12,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#2563eb",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  chipScrollContent: {
    gap: 12,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  filterChipActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  inlineLoader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineLoaderText: {
    fontSize: 13,
    color: "#475569",
  },
  sortHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  orderButtonActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8",
  },
  orderButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  orderButtonTextActive: {
    color: "#fff",
  },
  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  sortButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  sortButtonTextActive: {
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  bookCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bookCardPressed: {
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    paddingRight: 12,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardMeta: {
    fontSize: 14,
    color: "#4b5563",
  },
  readBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  readBadgeActive: {
    backgroundColor: "#dcfce7",
  },
  readBadgeInactive: {
    backgroundColor: "#e5e7eb",
  },
  readBadgePressed: {
    opacity: 0.85,
  },
  readBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  starsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  separator: {
    height: 12,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  statusBanner: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statusText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
