import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Book,
  deleteBook,
  getBooks,
  updateBook,
} from "../services/BooksService";

export default function Index() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  const handleToggleRead = useCallback(
    async (book: Book) => {
      try {
        const updated = await updateBook(book.id, {
          name: book.name,
          author: book.author,
          editor: book.editor,
          year: book.year ?? undefined,
          read: !book.read,
        });
        setBooks((prev) =>
          prev.map((item) => (item.id === book.id ? updated : item))
        );
      } catch (error) {
        console.error(error);
        Alert.alert("Erreur", (error as Error).message);
      }
    },
    []
  );

  const handleDelete = useCallback(async (book: Book) => {
    try {
      await deleteBook(book.id);
      setBooks((prev) => prev.filter((item) => item.id !== book.id));
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Book }) => (
      <Pressable
        onPress={() => router.push(`/books/${item.id}`)}
        style={({ pressed }) => [
          styles.book,
          pressed ? styles.bookPressed : null,
        ]}
      >
        <View style={styles.bookHeader}>
          <Text style={styles.bookTitle}>{item.name}</Text>
          <Text style={styles.badge}>{item.read ? "Lu" : "À lire"}</Text>
        </View>
        <Text style={styles.bookMeta}>Auteur · {item.author}</Text>
        {item.editor ? (
          <Text style={styles.bookMeta}>Éditeur · {item.editor}</Text>
        ) : null}
        {item.year ? (
          <Text style={styles.bookMeta}>Publication · {item.year}</Text>
        ) : null}
        <View style={styles.row}>
          <Pressable
            onPress={() => handleToggleRead(item)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.secondaryAction,
              pressed ? styles.actionPressed : null,
            ]}
          >
            <Text style={styles.actionText}>
              Marquer comme {item.read ? "non lu" : "lu"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleDelete(item)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.dangerAction,
              pressed ? styles.actionPressed : null,
            ]}
          >
            <Text style={styles.actionText}>Supprimer</Text>
          </Pressable>
        </View>
      </Pressable>
    ),
    [handleDelete, handleToggleRead]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Chargement des livres...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Livres</Text>
        <Link href="/books/new" asChild>
          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Ajouter</Text>
          </Pressable>
        </Link>
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aucun livre pour le moment</Text>
            <Text style={styles.emptySubtitle}>
              Ajoutez votre première lecture pour commencer.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: "#f5f6fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1f2933",
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  book: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 8,
  },
  bookPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  bookHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  bookMeta: {
    fontSize: 14,
    color: "#4b5563",
  },
  row: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },
  badge: {
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryAction: {
    backgroundColor: "#eef2ff",
  },
  dangerAction: {
    backgroundColor: "#fee2e2",
  },
  actionPressed: {
    opacity: 0.8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  listContent: {
    paddingBottom: 32,
    gap: 16,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f6fb",
  },
  loadingText: {
    fontSize: 16,
    color: "#475569",
  },
  separator: {
    height: 12,
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
});
