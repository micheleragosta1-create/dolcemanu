"use client"

import Link from "next/link"
import { useState } from "react"

interface Category {
  id: string
  name: string
  description: string
  image: string
  filterType: 'category' | 'collection'
  filterValue: string
  color: string
  icon: string
}

const categories: Category[] = [
  {
    id: 'praline',
    name: 'Praline',
    description: 'Eleganti praline artigianali con ripieni cremosi e croccanti',
    image: '/images/categories/praline.jpg',
    filterType: 'category',
    filterValue: 'Praline',
    color: '#8B4513',
    icon: '🍫'
  },
  {
    id: 'drops',
    name: 'Drops',
    description: 'Piccole gocce di puro cioccolato, perfette per ogni momento',
    image: '/images/categories/drops.jpg',
    filterType: 'category',
    filterValue: 'Drops',
    color: '#5D3A1A',
    icon: '🫘'
  },
  {
    id: 'tavolette',
    name: 'Tavolette',
    description: 'Tavolette di cioccolato artigianale in diverse percentuali',
    image: '/images/categories/tavolette.jpg',
    filterType: 'category',
    filterValue: 'Tavolette',
    color: '#3E2723',
    icon: '🍫'
  },
  {
    id: 'natale',
    name: 'Natale',
    description: 'Collezione speciale per le festività natalizie',
    image: '/images/categories/natale.jpg',
    filterType: 'collection',
    filterValue: 'Natale',
    color: '#8B1538',
    icon: '🎄'
  }
]

export default function ShopCategories({ onSelectCategory }: { onSelectCategory: (filterType: string, filterValue: string) => void }) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <section className="shop-categories">
      <div className="categories-header">
        <h1 className="categories-title poppins">Il Nostro Shop</h1>
        <p className="categories-subtitle">
          Esplora le nostre collezioni di cioccolato artigianale
        </p>
      </div>

      <div className="categories-grid">
        {categories.map((category, index) => (
          <button
            key={category.id}
            className={`category-card ${hoveredCategory === category.id ? 'hovered' : ''}`}
            onClick={() => onSelectCategory(category.filterType, category.filterValue)}
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
            style={{ 
              '--accent-color': category.color,
              animationDelay: `${index * 0.1}s`
            } as React.CSSProperties}
          >
            <div className="category-bg">
              <div className="category-gradient" />
              <div className="category-pattern" />
            </div>
            
            <div className="category-content">
              <span className="category-icon">{category.icon}</span>
              <h2 className="category-name">{category.name}</h2>
              <p className="category-description">{category.description}</p>
              <span className="category-cta">
                Scopri
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>

            <div className="category-shine" />
          </button>
        ))}
      </div>

      <style jsx>{`
        .shop-categories {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .categories-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .categories-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-navy);
          margin-bottom: 0.75rem;
        }

        .categories-subtitle {
          font-size: 1.1rem;
          color: #6b7280;
          max-width: 500px;
          margin: 0 auto;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .category-card {
          position: relative;
          background: white;
          border: none;
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          text-align: left;
          min-height: 280px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .category-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .category-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            var(--accent-color) 0%,
            color-mix(in srgb, var(--accent-color) 70%, black) 100%
          );
          opacity: 0.95;
        }

        .category-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            circle at 20% 80%,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 80% 20%,
            rgba(255, 255, 255, 0.08) 0%,
            transparent 40%
          );
        }

        .category-content {
          position: relative;
          z-index: 1;
          padding: 2rem;
          color: white;
        }

        .category-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
          transition: transform 0.3s ease;
        }

        .category-card:hover .category-icon {
          transform: scale(1.1) rotate(-5deg);
        }

        .category-name {
          font-family: 'Poppins', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .category-description {
          font-size: 0.95rem;
          opacity: 0.9;
          line-height: 1.5;
          margin-bottom: 1rem;
          max-width: 90%;
        }

        .category-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .category-card:hover .category-cta {
          background: rgba(255, 255, 255, 0.3);
          gap: 0.75rem;
        }

        .category-cta svg {
          transition: transform 0.3s ease;
        }

        .category-card:hover .category-cta svg {
          transform: translateX(4px);
        }

        .category-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.6s ease;
          z-index: 2;
          pointer-events: none;
        }

        .category-card:hover .category-shine {
          left: 100%;
        }

        /* Card speciale per Natale */
        .category-card:nth-child(4) .category-gradient {
          background: linear-gradient(
            135deg,
            #1a472a 0%,
            #8B1538 50%,
            #5c0f24 100%
          );
        }

        .category-card:nth-child(4)::before {
          content: '❄';
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 1.5rem;
          opacity: 0.5;
          animation: snowfall 3s ease-in-out infinite;
          z-index: 3;
        }

        @keyframes snowfall {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(10px) rotate(180deg); opacity: 0.8; }
        }

        /* Responsive */
        @media (max-width: 992px) {
          .categories-grid {
            gap: 1.25rem;
          }

          .category-card {
            min-height: 240px;
          }

          .category-name {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .shop-categories {
            padding: 1.5rem;
          }

          .categories-title {
            font-size: 2rem;
          }

          .categories-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .category-card {
            min-height: 200px;
          }

          .category-content {
            padding: 1.5rem;
          }

          .category-icon {
            font-size: 2.5rem;
          }

          .category-name {
            font-size: 1.35rem;
          }

          .category-description {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .shop-categories {
            padding: 1rem;
          }

          .categories-header {
            margin-bottom: 2rem;
          }

          .categories-title {
            font-size: 1.75rem;
          }

          .categories-subtitle {
            font-size: 1rem;
          }

          .category-card {
            min-height: 180px;
          }

          .category-content {
            padding: 1.25rem;
          }

          .category-icon {
            font-size: 2rem;
            margin-bottom: 0.75rem;
          }

          .category-name {
            font-size: 1.25rem;
          }

          .category-description {
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
          }

          .category-cta {
            font-size: 0.85rem;
            padding: 0.4rem 0.875rem;
          }
        }
      `}</style>
    </section>
  )
}

