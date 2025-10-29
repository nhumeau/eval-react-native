
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
  description?: string;
};

export type BookPayload = {
  name: string;
  author: string;
  editor?: string;
  year?: number | null;
  read?: boolean;
};

const API_URL = "http://localhost:3000";

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

export async function getBooks() {
  return request<Book[]>("/books");
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
