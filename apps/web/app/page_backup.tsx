import Link from "next/link";

const systems = [
  {
    name: "Membrane Cleaning System (RO)",
    description: "CIP system design for reverse osmosis membrane cleaning",
    href: "/systems/cip-ro",
    status: "active",
  },
  {
    name: "Ion Exchange System",
    description: "Softening and demineralization system design",
    href: "/systems/ion-exchange",
    status: "coming-soon",
  },
  {
    name: "Media Filtration System",
    description: "Multi-media and activated carbon filtration design",
    href: "/systems/media-filtration",
    status: "coming-soon",
  },
  {
    name: "Ultrafiltration System",
    description: "UF membrane system design and sizing",
    href: "/systems/ultrafiltration",
    status: "coming-soon",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Water Treatment System Design
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional engineering tools for designing water treatment systems with 
            deterministic calculations and AI-enhanced specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {systems.map((system) => (
            <div
              key={system.href}
              className={`bg-white rounded-2xl shadow-lg p-6 border transition-all ${
                system.status === "active"
                  ? "border-brand-primary/20 hover:border-brand-primary/40 hover:shadow-xl"
                  : "border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {system.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{system.description}</p>
                </div>
                {system.status === "coming-soon" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Coming Soon
                  </span>
                )}
              </div>
              
              {system.status === "active" ? (
                <Link
                  href={system.href}
                  className="inline-flex items-center px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium rounded-lg transition-colors"
                >
                  Design System
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-400 font-medium rounded-lg cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/history"
            className="inline-flex items-center px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-medium rounded-lg transition-colors"
          >
            View Design History
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
