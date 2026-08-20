export default function SearchBar() {
  return (
    <section className="mx-auto mt-10 w-full max-w-3xl px-8">
      <input
        type="text"
        placeholder="Décrivez votre problème ou recherchez une pièce..."
        className="w-full rounded-xl border border-gray-300 px-5 py-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </section>
  );
}
