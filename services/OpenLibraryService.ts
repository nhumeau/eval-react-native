const OPEN_LIBRARY_API = "https://openlibrary.org";

type OpenLibraryDoc = {
  edition_count?: number;
};

type OpenLibraryResponse = {
  docs?: OpenLibraryDoc[];
  numFound?: number;
};

export async function fetchEditionCountByTitle(
  title: string
): Promise<number | null> {
  const query = encodeURIComponent(title);
  let response: Response;

  try {
    response = await fetch(
      `${OPEN_LIBRARY_API}/search.json?title=${query}&limit=1`
    );
  } catch (error) {
    console.error("Erreur reseau OpenLibrary", error);
    throw new Error("La recherche OpenLibrary a echoue.");
  }

  if (!response.ok) {
    throw new Error("La recherche OpenLibrary a echoue.");
  }

  try {
    const data = (await response.json()) as OpenLibraryResponse;
    const firstDoc = data.docs?.find(
      (doc) => typeof doc.edition_count === "number"
    );

    if (firstDoc && typeof firstDoc.edition_count === "number") {
      return firstDoc.edition_count;
    }

    if (typeof data.numFound === "number") {
      return data.numFound;
    }

    return null;
  } catch (error) {
    console.error("Erreur de parsing OpenLibrary", error);
    throw new Error("La recherche OpenLibrary a echoue.");
  }
}
