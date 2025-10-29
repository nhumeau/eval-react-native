import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Lireo" }} />
      <Stack.Screen name="books/new" options={{ title: "Ajouter un livre" }} />
      <Stack.Screen name="books/[id]" options={{ title: "Détails du livre" }} />
      <Stack.Screen name="books/[id]/edit" options={{ title: "Modifier le livre" }} />
    </Stack>
  );
}
