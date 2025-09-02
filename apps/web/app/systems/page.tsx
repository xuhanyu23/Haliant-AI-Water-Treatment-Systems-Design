"use client";

import Link from "next/link";


const systems = [
  {
    id: "cip-ro",
    title: "Membrane Cleaning System (RO)",
    description: "CIP system design for reverse osmosis membrane cleaning",
    features: [
      "Flow rate optimization",
      "Temperature control", 
      "Pressure management"
    ],
    available: true,
    href: "/systems/cip-ro"
  },
  {
    id: "ion-exchange",
    title: "Ion Exchange System",
    description: "Softening and demineralization system design",
    features: [
      "Resin selection",
      "Regeneration cycles",
      "Capacity calculations"
    ],
    available: false,
    href: "/systems/ion-exchange"
  },
  {
    id: "media-filtration",
    title: "Media Filtration System", 
    description: "Multi-media and activated carbon filtration design",
    features: [
      "Media sizing",
      "Backwash design",
      "Flow distribution"
    ],
    available: false,
    href: "/systems/media-filtration"
  },
  {
    id: "ultrafiltration",
    title: "Ultrafiltration System",
    description: "UF membrane system design and sizing",
    features: [
      "Membrane selection",
      "Flux optimization", 
      "Cleaning protocols"
    ],
    available: false,
    href: "/systems/ultrafiltration"
  }
];

export default function SystemsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            Water Systems
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Design Systems</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional tools for every water treatment application
          </p>
        </div>

        {/* Systems Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {systems.map((system) => {
            return (
              <div 
                key={system.id}
                className={`relative p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  system.available 
                    ? "bg-white border-gray-200 hover:border-blue-300" 
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  {system.available ? (
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Available
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                      Coming Soon
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className={`text-xl font-semibold mb-2 ${
                  system.available ? "text-gray-900" : "text-gray-500"
                }`}>
                  {system.title}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  system.available ? "text-gray-600" : "text-gray-400"
                }`}>
                  {system.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {system.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${
                        system.available ? "text-green-500" : "text-gray-400"
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={system.available ? "text-gray-600" : "text-gray-400"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {system.available ? (
                  <Link
                    href={system.href}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Design System
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <button 
                    disabled
                    className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-400 font-medium rounded-lg cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}