import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ReactNode, useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
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
  const [yearText, setYearText] = useState(
    initialValues?.year ? String(initialValues.year) : ""
  );
  const [read, setRead] = useState(initialValues?.read ?? false);
  const [favorite, setFavorite] = useState(initialValues?.favorite ?? false);
  const initialRating =
    typeof initialValues?.rating === "number" &&
    initialValues.rating >= 1 &&
    initialValues.rating <= 5
      ? initialValues.rating
      : 0;
  const [rating, setRating] = useState(initialRating);
  const [cover, setCover] = useState<string | null>(initialValues?.cover ?? null);
  const [errors, setErrors] = useState<FormError>({});

  const canSubmit = useMemo(() => {
    return Boolean(name.trim()) && Boolean(author.trim()) && !submitting;
  }, [author, name, submitting]);

  const handleSubmit = () => {
    const nextErrors: FormError = {};
    const trimmedName = name.trim();
    const trimmedAuthor = author.trim();

    if (!trimmedName) {
      nextErrors.name = "Le nom est requis.";
    }

    if (!trimmedAuthor) {
      nextErrors.author = "L'auteur est requis.";
    }

    let parsedYear: number | undefined;
    if (yearText.trim()) {
      const value = Number(yearText.trim());
      if (Number.isNaN(value)) {
        nextErrors.year = "L'annee doit etre un nombre.";
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
      rating,
      cover,
    };

    onSubmit(payload);
  };

  const handleStarPress = useCallback((value: number) => {
    const boundedValue = Math.min(Math.max(Math.round(value), 1), 5);
    setRating(boundedValue);
  }, []);

  const handlePickImage = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission requise",
          "Autorisez l'acces a la galerie pour selectionner une couverture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setCover(result.assets[0].uri);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erreur",
        "Impossible de selectionner l'image. Merci de reessayer."
      );
    }
  }, []);

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
          <Text style={styles.label}>Editeur</Text>
          <TextInput
            value={editor}
            onChangeText={setEditor}
            style={styles.input}
            placeholder="Maison d'edition"
            placeholderTextColor="#94a3b8"
            editable={!submitting}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Annee de publication</Text>
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
          <Text style={styles.label}>Deja lu</Text>
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

        <View style={styles.field}>
          <Text style={styles.label}>Note</Text>
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, index) => {
              const starValue = index + 1;
              const filled = starValue <= rating;
              return (
                <Pressable
                  key={starValue}
                  onPress={() => handleStarPress(starValue)}
                  hitSlop={8}
                  disabled={submitting}
                  accessibilityLabel={`Attribuer ${starValue} etoile${
                    starValue > 1 ? "s" : ""
                  }`}
                >
                  <Ionicons
                    name={filled ? "star" : "star-outline"}
                    size={24}
                    color={filled ? "#f97316" : "#cbd5f5"}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Couverture</Text>
          <View style={styles.coverActions}>
            <Pressable
              style={[
                styles.galleryButton,
                submitting ? styles.galleryButtonDisabled : null,
              ]}
              onPress={handlePickImage}
              disabled={submitting}
            >
              <MaterialIcons name="photo-library" size={16} color="#1f2937" />
              <Text style={styles.galleryButtonText}>
                Choisir dans la galerie
              </Text>
            </Pressable>
          </View>
          {cover ? (
            <>
              <Image source={{ uri: cover }} style={styles.coverImage} />
              {!cover.startsWith("http") ? (
                <Text style={styles.coverHint}>
                  L'image importee sera chargee depuis votre appareil.
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.coverHint}>
              Selectionnez une image depuis votre galerie.
            </Text>
          )}
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
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  coverActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f1f5f9",
  },
  galleryButtonDisabled: {
    opacity: 0.6,
  },
  galleryButtonText: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: 13,
  },
  coverImage: {
    width: 140,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    marginTop: 12,
  },
  coverHint: {
    fontSize: 13,
    color: "#64748b",
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#2563eb",
    marginTop: 24,
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
    marginTop: 20,
  },
});



