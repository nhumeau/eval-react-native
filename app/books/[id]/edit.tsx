import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BookForm } from "../../../components/BookForm";
import {
  Book,
  BookPayload,
  Note,
  addBookNote,
  getBook,
  getBookNotes,
  updateBook,
} from "../../../services/BooksService";

export default function EditBook() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Array.isArray(id) ? id[0] : id;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const loadBook = useCallback(async () => {
    if (!bookId) {
      return;
    }

    try {
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
      loadBook();
    }, [loadBook])
  );

  useEffect(() => {
    if (!status) {
      return;
    }
    const timer = setTimeout(() => setStatus(null), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  const handleSubmit = async (values: BookPayload) => {
    if (!bookId) {
      return;
    }

    try {
      setSubmitting(true);
      await updateBook(bookId, values);
      setStatus("Livre mis a jour avec succes.");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = useCallback(async () => {
    if (!bookId) {
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
      setStatus("Note ajoutee avec succes.");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setNoteSubmitting(false);
    }
  }, [bookId, noteContent]);

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
      <BookForm
      initialValues={{
        name: book.name,
        author: book.author,
        editor: book.editor,
        year: book.year ?? undefined,
        read: book.read ?? false,
        favorite: book.favorite ?? false,
        rating: book.rating ?? 0,
        cover: book.cover ?? null,
      }}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Enregistrer les modifications"
      >
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
              placeholder="Ajouter une note pour ce livre"
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
      </BookForm>
      {status ? (
        <View style={styles.statusBanner}>
          <Text style={styles.statusBannerText}>{status}</Text>
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
  notesCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
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
  statusBannerText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
