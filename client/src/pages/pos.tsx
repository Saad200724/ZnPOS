import { useState } from "react";
import Sidebar from "@/components/sidebar";
import POSModal from "@/components/pos-modal";

export default function POS() {
  const [isPOSOpen, setIsPOSOpen] = useState(true);

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Point of Sale</h2>
              <p className="text-gray-600">Process customer transactions</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <POSModal isOpen={isPOSOpen} onClose={() => setIsPOSOpen(false)} />
          
          {!isPOSOpen && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Sale</h3>
                <p className="text-gray-600 mb-4">Start a new sale to begin processing transactions</p>
                <button 
                  onClick={() => setIsPOSOpen(true)}
                  className="btn-primary"
                >
                  Start New Sale
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
