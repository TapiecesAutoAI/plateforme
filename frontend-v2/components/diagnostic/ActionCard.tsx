interface ActionCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  color: "green" | "blue" | "gray";
  onClick?: () => void;
}

const COLORS = {
  green:
    "bg-green-600 hover:bg-green-700 text-white",

  blue:
    "bg-blue-600 hover:bg-blue-700 text-white",

  gray:
    "bg-white hover:bg-gray-100 text-gray-900 border",
};

export default function ActionCard({
  icon,
  title,
  subtitle,
  color,
  onClick,
}: ActionCardProps) {

  return (

    <button
      onClick={onClick}
      className={`w-full rounded-2xl p-5 transition text-left shadow-sm ${COLORS[color]}`}>

      <div className="flex items-center gap-4">

        <div className="text-3xl">

          {icon}

        </div>

        <div className="flex-1">

          <div className="text-xl font-bold">

            {title}

          </div>

          {subtitle && (

            <div className="mt-1 opacity-80">

              {subtitle}

            </div>

          )}

        </div>

      </div>

    </button>

  );

}
