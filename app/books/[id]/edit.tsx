import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { BookForm } from "../../../components/BookForm";
import {
  Book,
  BookPayload,
  getBook,
  updateBook,
} from "../../../services/BooksService";

export default function EditBook() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Array.isArray(id) ? id[0] : id;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (values: BookPayload) => {
    if (!bookId) {
      return;
    }

    try {
      setSubmitting(true);
      await updateBook(bookId, values);
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

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
    <BookForm
      initialValues={{
        name: book.name,
        author: book.author,
        editor: book.editor,
        year: book.year ?? undefined,
        read: book.read ?? false,
      }}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Enregistrer les modifications"
    />
  );
}

const styles = StyleSheet.create({
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
