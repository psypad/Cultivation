import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Layout({ children, currentPageName }) {
  const [searchParams] = useSearchParams();
  const cultivationId = searchParams.get("id");

  const navItems = [
    { name: "CultivationSelector", label: "Paths" },
    { name: "Dashboard", label: "Cultivation" },
    { name: "Practice", label: "Practice" },
    { name: "History", label: "History" },
    { name: "Breakthrough", label: "Breakthrough" },
    { name: "Reflection", label: "Reflection" },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');
        
        :root {
          --font-serif: 'Cormorant Garamond', serif;
          --font-sans: 'Inter', sans-serif;
        }
        
        body {
          font-family: var(--font-sans);
          background-color: #1a1a1a;
          color: #e8e4dc;
        }
        
        .font-serif {
          font-family: var(--font-serif);
          font-weight: 500;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #3a3a3a #1a1a1a;
        }
        
        *::-webkit-scrollbar {
          width: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        *::-webkit-scrollbar-thumb {
          background-color: #3a3a3a;
          border-radius: 3px;
        }
      `}</style>

      {/* Minimal Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
        <div className="max-w-3xl mx-auto px-4">
          <ul className="flex justify-around md:justify-center md:gap-12 py-4">
            {navItems.map((item) => {
              // Hide all tabs except Paths when no cultivation is selected
              if (!cultivationId && item.name !== "CultivationSelector") {
                return null;
              }

              const url = item.name === "CultivationSelector" || !cultivationId
                ? createPageUrl(item.name)
                : createPageUrl(`${item.name}?id=${cultivationId}`);
              
              return (
                <li key={item.name}>
                  <Link
                    to={url}
                    className={`text-xs tracking-wider transition-colors duration-500 ${
                      currentPageName === item.name
                        ? "text-[#7c9a82]"
                        : "text-[#8a8680] hover:text-[#e8e4dc]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-4 pb-20 md:pt-20 md:pb-4">
        {children}
      </main>
    </div>
  );
}