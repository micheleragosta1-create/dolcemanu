"use client"

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'

interface MobileFiltersProps {
  children: React.ReactNode
  resultsCount: number
  isOpen: boolean
  onToggle: () => void
  onReset: () => void
  hasActiveFilters: boolean
}

export default function MobileFilters({ 
  children, 
  resultsCount, 
  isOpen, 
  onToggle, 
  onReset,
  hasActiveFilters 
}: MobileFiltersProps) {
  return (
    <div className="mobile-filters-wrapper">
      {/* Filter Toggle Button */}
      <div className="filters-header">
        <button 
          className="filters-toggle btn btn-outline"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="mobile-filters-panel"
        >
          <Filter size={18} />
          <span>Filtri {hasActiveFilters ? '(attivi)' : ''}</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        <div className="results-info">
          <span>{resultsCount} prodotti</span>
        </div>
      </div>

      {/* Collapsible Filters Panel */}
      <div 
        className={`filters-panel ${isOpen ? 'open' : ''}`}
        id="mobile-filters-panel"
        aria-hidden={!isOpen}
      >
        <div className="filters-content">
          <div className="filters-header-mobile">
            <h3>Filtra prodotti</h3>
            <button 
              className="close-filters"
              onClick={onToggle}
              aria-label="Chiudi filtri"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="filters-body">
            {children}
          </div>
          
          <div className="filters-actions">
            <button 
              className="btn btn-secondary btn-reset"
              onClick={onReset}
              disabled={!hasActiveFilters}
            >
              Reset filtri
            </button>
            <button 
              className="btn btn-primary btn-apply"
              onClick={onToggle}
            >
              Applica ({resultsCount})
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && <div className="filters-backdrop" onClick={onToggle} />}

      <style jsx>{`
        .mobile-filters-wrapper {
          display: none;
        }
        
        @media (max-width: 992px) {
          .mobile-filters-wrapper {
            display: block;
            margin-bottom: 1.5rem;
          }
          
          .filters-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          
          .filters-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            background: white;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            position: relative;
          }
          
          .filters-toggle:hover {
            border-color: var(--color-brown);
          }
          
          .filters-toggle:after {
            content: '';
            position: absolute;
            top: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            background: var(--color-brown);
            border-radius: 50%;
            opacity: ${hasActiveFilters ? 1 : 0};
            transition: opacity 0.3s ease;
          }
          
          .results-info {
            color: #666;
            font-size: 0.9rem;
            font-weight: 500;
          }
          
          .filters-panel {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 1001;
            background: transparent;
            pointer-events: none;
            overflow: hidden;
          }
          
          .filters-panel.open {
            pointer-events: all;
          }
          
          .filters-content {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-radius: 20px 20px 0 0;
            max-height: 85vh;
            overflow: hidden;
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
            transform: translateY(100%);
            transition: transform 0.3s ease-in-out;
          }
          
          .filters-panel.open .filters-content {
            transform: translateY(0);
          }
          
          .filters-header-mobile {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 1.5rem 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 1rem;
            margin-bottom: 1rem;
          }
          
          .filters-header-mobile h3 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--color-navy);
            margin: 0;
          }
          
          .close-filters {
            background: none;
            border: none;
            padding: 0.5rem;
            cursor: pointer;
            border-radius: 50%;
            transition: background 0.2s ease;
          }
          
          .close-filters:hover {
            background: rgba(0, 0, 0, 0.05);
          }
          
          .filters-body {
            padding: 0 1.5rem;
            max-height: 50vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          .filters-actions {
            display: flex;
            gap: 1rem;
            padding: 1.5rem;
            border-top: 1px solid #eee;
            background: #fafafa;
          }
          
          .btn-reset {
            flex: 1;
          }
          
          .btn-apply {
            flex: 2;
          }
          
          .filters-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.3s ease;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
        
        /* Hide on desktop */
        @media (min-width: 993px) {
          .mobile-filters-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}