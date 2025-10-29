import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { BookForm } from "../../components/BookForm";
import { BookPayload, createBook } from "../../services/BooksService";

export default function NewBook() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: BookPayload) => {
    try {
      setSubmitting(true);
      await createBook(values);
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BookForm
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Créer un livre"
    />
  );
}
