import AsyncStorage from "@react-native-async-storage/async-storage";

import { Book } from "./BooksService";

const BOOKS_CACHE_KEY = "@lireo/books-cache";

export type CachedBookList = {
  books: Book[];
  savedAt: number;
};

export async function loadBooksCache(): Promise<CachedBookList | null> {
  try {
    const raw = await AsyncStorage.getItem(BOOKS_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<CachedBookList>;
    if (!parsed || !Array.isArray(parsed.books)) {
      return null;
    }
    return {
      books: parsed.books as Book[],
      savedAt:
        typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch (error) {
    console.error("Erreur de lecture du cache des livres", error);
    return null;
  }
}

export async function saveBooksCache(books: Book[]): Promise<number> {
  const payload: CachedBookList = {
    books,
    savedAt: Date.now(),
  };
  try {
    await AsyncStorage.setItem(BOOKS_CACHE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Erreur de sauvegarde du cache des livres", error);
  }
  return payload.savedAt;
}
