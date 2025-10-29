import {
  Link,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Book,
  deleteBook,
  getBook,
  updateBook,
} from "../../services/BooksService";

export default function BookDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Array.isArray(id) ? id[0] : id;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBook = useCallback(async () => {
    if (!bookId) {
      return;
    }

    try {
      const data = await getBook(bookId);
      setBook(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      loadBook();
    }, [loadBook])
  );

  const handleToggleRead = useCallback(async () => {
    if (!book) {
      return;
    }

    try {
      const updated = await updateBook(book.id, {
        name: book.name,
        author: book.author,
        editor: book.editor,
        year: book.year ?? undefined,
        read: !book.read,
      });
      setBook(updated);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    }
  }, [book]);

  const handleDelete = useCallback(async () => {
    if (!book) {
      return;
    }

    try {
      await deleteBook(book.id);
      router.replace("/");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    }
  }, [book]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.statusText}>Chargement du livre...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.center}>
        <Text style={styles.statusText}>Livre introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{book.name}</Text>
        <View style={styles.tagRow}>
          <Text
            style={[
              styles.badge,
              book.read ? styles.badgeRead : styles.badgeUnread,
            ]}
          >
            {book.read ? "Lu" : "À lire"}
          </Text>
          {book.year ? (
            <Text style={styles.badgeMuted}>Publication {book.year}</Text>
          ) : null}
        </View>
        <Text style={styles.meta}>Auteur · {book.author}</Text>
        {book.editor ? (
          <Text style={styles.meta}>Éditeur · {book.editor}</Text>
        ) : null}
        {book.theme ? <Text style={styles.meta}>Thème · {book.theme}</Text> : null}
        {typeof book.rating === "number" ? (
          <Text style={styles.meta}>Note · {book.rating}/5</Text>
        ) : null}
        {book.description ? (
          <Text style={styles.description}>{book.description}</Text>
        ) : (
          <Text style={styles.description}>
            Aucune description fournie pour ce livre.
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleToggleRead}
          style={({ pressed }) => [
            styles.actionButton,
            styles.primaryAction,
            pressed ? styles.actionPressed : null,
          ]}
        >
          <Text style={styles.primaryText}>
            Marquer comme {book.read ? "à lire" : "lu"}
          </Text>
        </Pressable>
        <Link href={`/books/${book.id}/edit`} asChild>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.secondaryAction,
              pressed ? styles.actionPressed : null,
            ]}
          >
            <Text style={styles.secondaryText}>Modifier</Text>
          </Pressable>
        </Link>
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.actionButton,
            styles.dangerAction,
            pressed ? styles.actionPressed : null,
          ]}
        >
          <Text style={styles.dangerText}>Supprimer</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
    backgroundColor: "#f5f6fb",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  meta: {
    fontSize: 16,
    color: "#475569",
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
  },
  badgeRead: {
    backgroundColor: "#dcfce7",
    color: "#047857",
  },
  badgeUnread: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
  badgeMuted: {
    backgroundColor: "#e2e8f0",
    color: "#475569",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionPressed: {
    opacity: 0.85,
  },
  primaryAction: {
    backgroundColor: "#2563eb",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryAction: {
    backgroundColor: "#eef2ff",
  },
  secondaryText: {
    color: "#4338ca",
    fontWeight: "600",
    fontSize: 15,
  },
  dangerAction: {
    backgroundColor: "#fee2e2",
  },
  dangerText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 15,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f6fb",
  },
  statusText: {
    fontSize: 16,
    color: "#475569",
  },
});
