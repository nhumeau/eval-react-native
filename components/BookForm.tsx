import { ReactNode, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { BookPayload } from "../services/BooksService";

type BookFormProps = {
  initialValues?: Partial<BookPayload>;
  onSubmit: (values: BookPayload) => Promise<void> | void;
  submitting?: boolean;
  submitLabel: string;
  children?: ReactNode;
};

type FormError = {
  name?: string;
  author?: string;
  year?: string;
};

export function BookForm({
  initialValues,
  onSubmit,
  submitLabel,
  submitting = false,
  children,
}: BookFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [author, setAuthor] = useState(initialValues?.author ?? "");
  const [editor, setEditor] = useState(initialValues?.editor ?? "");
  const [yearText, setYearText] = useState(() =>
    initialValues?.year ? String(initialValues.year) : ""
  );
  const [read, setRead] = useState(initialValues?.read ?? false);
  const [favorite, setFavorite] = useState(initialValues?.favorite ?? false);
  const [errors, setErrors] = useState<FormError>({});

  const canSubmit = useMemo(() => {
    return Boolean(name.trim()) && Boolean(author.trim()) && !submitting;
  }, [author, name, submitting]);

  const handleSubmit = () => {
    const nextErrors: FormError = {};
    const trimmedName = name.trim();
    const trimmedAuthor = author.trim();

    if (!trimmedName) {
      nextErrors.name = "Nom est requis.";
    }

    if (!trimmedAuthor) {
      nextErrors.author = "L'auteur est requis.";
    }

    let parsedYear: number | undefined;
    if (yearText.trim()) {
      const value = Number(yearText.trim());
      if (Number.isNaN(value)) {
        nextErrors.year = "L'année doit être un nombre.";
      } else {
        parsedYear = value;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload: BookPayload = {
      name: trimmedName,
      author: trimmedAuthor,
      editor: editor.trim() ? editor.trim() : undefined,
      year: parsedYear,
      read,
      favorite,
    };

    onSubmit(payload);
  };

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formCard}>
        <View style={styles.field}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Titre du livre"
            placeholderTextColor="#94a3b8"
            editable={!submitting}
          />
          {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Auteur</Text>
          <TextInput
            value={author}
            onChangeText={setAuthor}
            style={styles.input}
            placeholder="Nom de l'auteur"
            placeholderTextColor="#94a3b8"
            editable={!submitting}
          />
          {errors.author ? (
            <Text style={styles.error}>{errors.author}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Éditeur</Text>
          <TextInput
            value={editor}
            onChangeText={setEditor}
            style={styles.input}
            placeholder="Maison d'édition"
            placeholderTextColor="#94a3b8"
            editable={!submitting}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Année de publication</Text>
          <TextInput
            value={yearText}
            onChangeText={setYearText}
            style={styles.input}
            placeholder="2024"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            editable={!submitting}
          />
          {errors.year ? <Text style={styles.error}>{errors.year}</Text> : null}
        </View>

        <View style={[styles.field, styles.switchRow]}>
          <Text style={styles.label}>Déjà lu</Text>
          <Switch value={read} onValueChange={setRead} disabled={submitting} />
        </View>

        <View style={[styles.field, styles.switchRow]}>
          <Text style={styles.label}>Favori</Text>
          <Switch
            value={favorite}
            onValueChange={setFavorite}
            disabled={submitting}
          />
        </View>
      </View>

      {children ? <View style={styles.extra}>{children}</View> : null}

      <Pressable
        style={[
          styles.submitButton,
          !canSubmit ? styles.submitButtonDisabled : null,
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={styles.submitText}>
          {submitting ? "Enregistrement..." : submitLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f5f6fb",
  },
  container: {
    padding: 24,
    gap: 20,
  },
  formCard: {
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
  field: {
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#f8fafc",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  submitButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  error: {
    color: "#b91c1c",
    fontSize: 13,
  },
  extra: {
    gap: 16,
  },
});
