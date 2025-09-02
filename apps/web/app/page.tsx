import Link from "next/link";

// Icon components using inline SVG
const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const systems = [
  {
    name: "Membrane Cleaning System (RO)",
    description: "CIP system design for reverse osmosis membrane cleaning",
    href: "/systems/cip-ro",
    status: "active",
    features: ["Flow rate optimization", "Temperature control", "Pressure management"],
  },
  {
    name: "Ion Exchange System",
    description: "Softening and demineralization system design",
    href: "/systems/ion-exchange",
    status: "coming-soon",
    features: ["Resin selection", "Regeneration cycles", "Capacity calculations"],
  },
  {
    name: "Media Filtration System",
    description: "Multi-media and activated carbon filtration design",
    href: "/systems/media-filtration",
    status: "coming-soon",
    features: ["Media sizing", "Backwash design", "Flow distribution"],
  },
  {
    name: "Ultrafiltration System",
    description: "UF membrane system design and sizing",
    href: "/systems/ultrafiltration",
    status: "coming-soon",
    features: ["Membrane selection", "Flux optimization", "Cleaning protocols"],
  },
];

const features = [
  {
    emoji: "🤖",
    title: "AI-Powered Design Assistant",
    description: "Get intelligent guidance on parameter selection, troubleshooting, and optimization from our water treatment expert AI.",
    highlight: "Smart Guidance"
  },
  {
    emoji: "📊",
    title: "Deterministic Calculations",
    description: "Pure engineering mathematics ensure accurate, reliable designs based on proven water treatment principles.",
    highlight: "Engineering Precision"
  },
  {
    emoji: "📋",
    title: "Professional Specifications",
    description: "Generate detailed BOMs with industry standards, vendor alternatives, and compliance requirements.",
    highlight: "Industry Standards"
  },
  {
    emoji: "⚡",
    title: "Real-time Validation",
    description: "Smart parameter validation provides instant feedback and recommendations as you design.",
    highlight: "Instant Feedback"
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="relative">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Logo Placeholder */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Haliant AI</h1>
                <p className="text-xs text-gray-500">Water Treatment Systems Design</p>
              </div>
            </div>
            
            <Link
              href="/history"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Design History
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Automated Water Treatment
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">System Design</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Advanced engineering tools that help you automate different kinds of water treatment systems with AI-enhanced capabilities and precision calculations.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/systems"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Designing
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <button className="inline-flex items-center px-6 py-3 text-gray-700 border border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </button>
            </div>

          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combining decades of water treatment expertise with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 bg-gray-50 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all hover:shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl mb-4">{feature.emoji}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{feature.description}</p>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {feature.highlight}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Systems Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Design Systems</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional tools for every water treatment application
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {systems.map((system) => {
              return (
                <div
                  key={system.href}
                  className={`group relative bg-white rounded-2xl shadow-sm border p-6 transition-all ${
                    system.status === "active"
                      ? "hover:shadow-xl hover:border-blue-200 hover:-translate-y-1"
                      : "opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {system.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">{system.description}</p>
                        
                        {/* Features */}
                        <ul className="space-y-1 text-sm text-gray-500">
                          {system.features.map((feature, idx) => (
                            <li key={idx}>
                              • {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {system.status === "coming-soon" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    {system.status === "active" ? (
                      <Link
                        href={system.href}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all group-hover:shadow-lg"
                      >
                        Design System
                        <ChevronRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Ready to Start Designing?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/systems/cip-ro"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start Your First Design
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center px-6 py-3 text-white border border-white/30 font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                View Examples
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-lg font-semibold">Haliant AI</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Professional water treatment system design tools
            </p>
            <div className="text-xs text-gray-500">
              © 2025 Haliant AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}