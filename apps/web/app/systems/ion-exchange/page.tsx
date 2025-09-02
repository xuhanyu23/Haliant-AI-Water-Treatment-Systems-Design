import { InputCard, OutputCard } from "@repo/ui";

export default function IonExchangePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ion Exchange System</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InputCard title="Input">
          <div className="text-gray-500 text-center py-8">
            Coming soon...
          </div>
        </InputCard>
        
        <OutputCard title="Output">
          <div className="text-gray-500 text-center py-8">
            Coming soon...
          </div>
        </OutputCard>
      </div>
    </div>
  );
}
