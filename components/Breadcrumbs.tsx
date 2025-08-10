"use client"

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`breadcrumbs ${className}`}>
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link href="/" className="breadcrumb-link">
            <Home size={16} />
            <span>Home</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            <ChevronRight size={16} className="breadcrumb-separator" />
            {item.href && !item.current ? (
              <Link href={item.href} className="breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className={`breadcrumb-current ${item.current ? 'current' : ''}`}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>

      <style jsx>{`
        .breadcrumbs {
          margin-bottom: 2rem;
        }
        
        .breadcrumb-list {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
          flex-wrap: wrap;
        }
        
        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .breadcrumb-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s ease;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }
        
        .breadcrumb-link:hover {
          color: var(--color-brown);
          background: rgba(94, 54, 33, 0.06);
        }
        
        .breadcrumb-separator {
          color: #999;
          margin: 0;
        }
        
        .breadcrumb-current {
          color: var(--color-navy);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.25rem 0.5rem;
        }
        
        .breadcrumb-current.current {
          color: var(--color-brown);
        }
        
        @media (max-width: 768px) {
          .breadcrumbs {
            margin-bottom: 1.5rem;
          }
          
          .breadcrumb-link span,
          .breadcrumb-current {
            font-size: 0.85rem;
          }
          
          .breadcrumb-link,
          .breadcrumb-current {
            padding: 0.2rem 0.4rem;
          }
        }
      `}</style>
    </nav>
  )
}