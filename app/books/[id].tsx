import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Book,
  Note,
  addBookNote,
  deleteBook,
  getBook,
  getBookNotes,
  updateBook,
} from "../../services/BooksService";

export default function BookDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Array.isArray(id) ? id[0] : id;

  const [book, setBook] = useState<Book | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!bookId) {
      return;
    }

    try {
      setLoading(true);
      const [bookData, notesData] = await Promise.all([
        getBook(bookId),
        getBookNotes(bookId),
      ]);
      setBook(bookData);
      setNotes(notesData);
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
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    if (!status) {
      return;
    }
    const timer = setTimeout(() => setStatus(null), 3000);
    return () => clearTimeout(timer);
  }, [status]);

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
        favorite: book.favorite ?? false,
      });
      setBook(updated);
      setStatus(
        book.read
          ? `Livre marqué comme non lu : ${book.name}`
          : `Livre marqué comme lu : ${book.name}`
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    }
  }, [book]);

  const handleToggleFavorite = useCallback(async () => {
    if (!book) {
      return;
    }

    try {
      const updated = await updateBook(book.id, {
        name: book.name,
        author: book.author,
        editor: book.editor,
        year: book.year ?? undefined,
        read: book.read ?? false,
        favorite: !book.favorite,
      });
      setBook(updated);
      setStatus(
        !book.favorite
          ? `Livre ajouté aux favoris : ${book.name}`
          : `Livre retiré des favoris : ${book.name}`
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    }
  }, [book]);

  const handleDelete = useCallback(async () => {
    if (!book) {
      return;
    }

    Alert.alert(
      "Supprimer le livre",
      `Êtes-vous sûr de vouloir supprimer « ${book.name} » ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBook(book.id);
              setStatus(`Livre supprimé : ${book.name}`);
              router.replace("/");
            } catch (error) {
              console.error(error);
              Alert.alert("Erreur", (error as Error).message);
            }
          },
        },
      ]
    );
  }, [book]);

  const handleAddNote = useCallback(async () => {
    if (!book || !bookId) {
      return;
    }
    const trimmed = noteContent.trim();
    if (!trimmed) {
      setStatus("Veuillez saisir du texte pour ajouter une note.");
      return;
    }
    try {
      setNoteSubmitting(true);
      const created = await addBookNote(bookId, trimmed);
      setNotes((prev) => [created, ...prev]);
      setNoteContent("");
      setStatus("Note ajoutée avec succès.");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setNoteSubmitting(false);
    }
  }, [book, bookId, noteContent]);

  const formattedNotes = useMemo(
    () =>
      notes.map((note) => ({
        ...note,
        formattedDate: new Date(note.dateISO).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      })),
    [notes]
  );

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
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{book.name}</Text>
            <Pressable onPress={handleToggleFavorite} hitSlop={10}>
              <Text
                style={[
                  styles.heart,
                  book.favorite ? styles.heartFilled : styles.heartOutline,
                ]}
              >
                {book.favorite ? "♥" : "♡"}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.meta}>Auteur · {book.author}</Text>
          {book.editor ? (
            <Text style={styles.meta}>Éditeur · {book.editor}</Text>
          ) : null}
          {book.year ? (
            <Text style={styles.meta}>Publication · {book.year}</Text>
          ) : null}
          <Text style={styles.meta}>
            Statut · {book.read ? "lu" : "non lu"}
          </Text>
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
              Marquer comme {book.read ? "non lu" : "lu"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/books/${book.id}/edit`)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.secondaryAction,
              pressed ? styles.actionPressed : null,
            ]}
          >
            <Text style={styles.secondaryText}>Modifier</Text>
          </Pressable>
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

        <View style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {formattedNotes.length === 0 ? (
            <Text style={styles.emptyNotes}>Aucune note pour le moment.</Text>
          ) : (
            formattedNotes.map((note) => (
              <View style={styles.note} key={note.id}>
                <Text style={styles.noteDate}>{note.formattedDate}</Text>
                <Text style={styles.noteContent}>{note.content}</Text>
              </View>
            ))
          )}
          <View style={styles.noteComposer}>
            <TextInput
              value={noteContent}
              onChangeText={setNoteContent}
              placeholder="Ajouter une note (max 250 caractères)"
              placeholderTextColor="#94a3b8"
              style={styles.noteInput}
              multiline
              maxLength={250}
              editable={!noteSubmitting}
            />
            <Pressable
              onPress={handleAddNote}
              style={[
                styles.noteButton,
                (noteSubmitting || !noteContent.trim()) && styles.noteButtonDisabled,
              ]}
              disabled={noteSubmitting || !noteContent.trim()}
            >
              <Text style={styles.noteButtonText}>
                {noteSubmitting ? "Ajout..." : "Ajouter une note"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      {status ? (
        <View style={styles.statusBanner}>
          <Text style={styles.statusTextBanner}>{status}</Text>
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
  container: {
    padding: 24,
    gap: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    paddingRight: 16,
  },
  meta: {
    fontSize: 15,
    color: "#475569",
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
  },
  heart: {
    fontSize: 28,
  },
  heartFilled: {
    color: "#dc2626",
  },
  heartOutline: {
    color: "#cbd5f5",
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 14,
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  secondaryText: {
    color: "#1f2937",
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
  notesCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  emptyNotes: {
    fontSize: 15,
    color: "#6b7280",
  },
  note: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    gap: 6,
    backgroundColor: "#f8fafc",
  },
  noteDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  noteContent: {
    fontSize: 15,
    color: "#1f2937",
  },
  noteComposer: {
    gap: 12,
  },
  noteInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#f8fafc",
    textAlignVertical: "top",
  },
  noteButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  noteButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  noteButtonText: {
    color: "#fff",
    fontWeight: "600",
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
    textAlign: "center",
  },
  statusBanner: {
    position: "absolute",
    bottom: 24,
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
  statusTextBanner: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
