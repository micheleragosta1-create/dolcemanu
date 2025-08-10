"use client"

import React from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ 
  width = '100%', 
  height = '1rem', 
  className = '', 
  variant = 'rectangular' 
}: SkeletonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'text': return 'skeleton-text'
      case 'circular': return 'skeleton-circular'
      default: return 'skeleton-rect'
    }
  }

  return (
    <div 
      className={`skeleton ${getVariantClass()} ${className}`}
      style={{ width, height }}
    >
      <style jsx>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 4px;
        }
        
        .skeleton-text {
          border-radius: 4px;
          height: 1rem;
        }
        
        .skeleton-circular {
          border-radius: 50%;
        }
        
        .skeleton-rect {
          border-radius: 8px;
        }
        
        @keyframes skeleton-loading {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <Skeleton height="200px" className="product-image-skeleton" />
      <div className="product-content-skeleton">
        <Skeleton height="24px" width="80%" />
        <Skeleton height="16px" width="100%" />
        <Skeleton height="16px" width="60%" />
        <div className="product-footer-skeleton">
          <Skeleton height="24px" width="60px" />
          <Skeleton height="36px" width="120px" />
        </div>
      </div>
      
      <style jsx>{`
        .product-card-skeleton {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          overflow: hidden;
          padding: 0;
        }
        
        .product-image-skeleton {
          width: 100%;
          margin-bottom: 0;
        }
        
        .product-content-skeleton {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .product-footer-skeleton {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  )
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="products-grid-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
      
      <style jsx>{`
        .products-grid-skeleton {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          padding: 2rem 0;
        }
        
        @media (max-width: 768px) {
          .products-grid-skeleton {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

// Product Page Skeleton
export function ProductPageSkeleton() {
  return (
    <div className="product-page-skeleton">
      <div className="product-grid-skeleton">
        <div className="gallery-skeleton">
          <Skeleton height="400px" className="main-image-skeleton" />
        </div>
        <div className="details-skeleton">
          <Skeleton height="32px" width="70%" />
          <Skeleton height="24px" width="100px" />
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="80%" />
          
          <div className="buy-row-skeleton">
            <Skeleton height="40px" width="80px" />
            <Skeleton height="40px" width="160px" />
          </div>
          
          <div className="info-blocks-skeleton">
            {[1, 2, 3].map(i => (
              <div key={i} className="info-block-skeleton">
                <Skeleton height="20px" width="120px" />
                <Skeleton height="16px" width="100%" />
                <Skeleton height="16px" width="60%" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .product-page-skeleton {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .product-grid-skeleton {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 2rem;
        }
        
        .gallery-skeleton {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .main-image-skeleton {
          max-width: 500px;
        }
        
        .details-skeleton {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .buy-row-skeleton {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin: 1rem 0;
        }
        
        .info-blocks-skeleton {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .info-block-skeleton {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        @media (max-width: 992px) {
          .product-grid-skeleton {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}