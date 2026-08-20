import Link from "next/link";

export default function ActionCards() {
  return (
    <section className="mx-auto mt-8 grid w-full max-w-3xl gap-4 px-8 md:grid-cols-2">
      <Link
        href="/piece"
        className="rounded-xl bg-blue-600 p-5 text-center text-lg font-semibold text-white transition hover:bg-blue-700"
      >
        Rechercher une pièce
      </Link>

      <Link
        href="/probleme"
        className="rounded-xl bg-gray-800 p-5 text-center text-lg font-semibold text-white transition hover:bg-gray-900"
      >
        Diagnostiquer un problème
      </Link>
    </section>
  );
}
