export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold text-blue-700">
          TapiecesAuto
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <a href="#" className="transition hover:text-blue-700">
            Accueil
          </a>

          <a href="#" className="transition hover:text-blue-700">
            Comment ça marche
          </a>

          <a href="#" className="transition hover:text-blue-700">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
