
export type Book = {
  id: string;
  name: string;
  author: string;
  editor?: string;
  year?: number | null;
  read?: boolean;
  favorite?: boolean;
  theme?: string;
  rating?: number | null;
  cover?: string | null;
};

export type BookPayload = {
  name: string;
  author: string;
  editor?: string;
  year?: number | null;
  read?: boolean;
  favorite?: boolean;
  rating?: number | null;
  cover?: string | null;
};

export type Note = {
  id: string;
  bookId: string;
  content: string;
  dateISO: string;
};

export type SortField = "title" | "author" | "theme" | "year" | "rating";
export type SortOrder = "asc" | "desc";

export type GetBooksParams = {
  query?: string;
  read?: boolean | null;
  favorite?: boolean | null;
  theme?: string;
  sort?: SortField;
  order?: SortOrder;
};

const API_URL = "https://api-books-kycs.onrender.com";

async function request<T>(
  path: string,
  init?: RequestInit,
  expectsBody = true
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const message = await safeParseError(response);
    throw new Error(message);
  }

  if (!expectsBody) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function safeParseError(response: Response) {
  try {
    const body = await response.json();
    if (body?.message) {
      return body.message;
    }
    return `La requête a échoué avec le statut ${response.status}`;
  } catch {
    return `La requête a échoué avec le statut ${response.status}`;
  }
}

function buildQuery(params?: GetBooksParams) {
  if (!params) {
    return "";
  }
  const query = new URLSearchParams();
  if (params.query) {
    query.set("q", params.query);
  }
  if (typeof params.read === "boolean") {
    query.set("read", String(params.read));
  }
  if (typeof params.favorite === "boolean") {
    query.set("favorite", String(params.favorite));
  }
  if (params.theme) {
    query.set("theme", params.theme);
  }
  if (params.sort) {
    query.set("sort", params.sort);
  }
  if (params.order) {
    query.set("order", params.order);
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export async function getBooks(params?: GetBooksParams) {
  const query = buildQuery(params);
  return request<Book[]>(`/books${query}`);
}

export async function getBook(id: string) {
  return request<Book>(`/books/${id}`);
}

export async function createBook(payload: BookPayload) {
  return request<Book>("/books", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

type NoteResponse = {
  id: number;
  bookId: number;
  content: string;
  dateISO: string;
};

function mapNote(response: NoteResponse): Note {
  return {
    id: String(response.id),
    bookId: String(response.bookId),
    content: response.content,
    dateISO: response.dateISO,
  };
}

export async function updateBook(id: string, payload: BookPayload) {
  return request<Book>(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteBook(id: string) {
  return request<undefined>(
    `/books/${id}`,
    {
      method: "DELETE",
    },
    false
  );
}

export async function getBookNotes(bookId: string) {
  const notes = await request<NoteResponse[]>(`/books/${bookId}/notes`);
  return notes.map(mapNote);
}

export async function addBookNote(bookId: string, content: string) {
  const note = await request<NoteResponse>(`/books/${bookId}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return mapNote(note);
}

export async function deleteBookNote(bookId: string, noteId: string) {
  return request<undefined>(
    `/books/${bookId}/notes/${noteId}`,
    {
      method: "DELETE",
    },
    false
  );
}
