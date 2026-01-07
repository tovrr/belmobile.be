# Belmobile Premium Design System

This document outlines the visual standards for all new features and components added to the Belmobile platform.

## 1. Color Palette

| Name | Role | HEX/CSS |
| :--- | :--- | :--- |
| **Bel Blue** | Primary Action | `#0066FF` (Indigo/Blue hybrid) |
| **Bel Indigo** | Branding / Contrast | `#4F46E5` |
| **Glass Light** | Surface (Light) | `rgba(255, 255, 255, 0.7)` with `backdrop-filter: blur(10px)` |
| **Glass Dark** | Surface (Dark) | `rgba(15, 23, 42, 0.7)` with `backdrop-filter: blur(10px)` |
| **Accent Gold** | Success / Feedback | `#F59E0B` |
| **Deep Space** | Ultra-Dark Backgrounds | `#0B1120` (Rich dark blue/black) |
| **Electric Indigo** | Glow Effects | `#6366f1` (Vibrant purple-blue) |
| **Cyber Citron** | Secondary Highlights | `#EAB308` (Modern gold) |

## 2. Typography
- **Primary Font**: `Inter` (Sans-serif) for clean, modern readability.
- **Secondary Font**: `Outfit` or `Manrope` for headers to give a SaaS premium feel.
- **Weights**: 
  - Bold (700): Headers
  - Medium (500): UI Labels / Buttons
  - Regular (400): Body text

## 3. Visual Language
- **Gradients**: Use linear gradients for primary buttons (e.g., `from-blue-600 to-indigo-600`).
- **Shadows**: Soft, multi-layered shadows to provide depth without clutter.
- **Rounding**: Consistent `rounded-xl` (12px) for cards and `rounded-lg` (8px) for inputs/buttons.
- **Borders**: Thin, high-contrast borders (`border-gray-100` or `border-slate-800`).

## 4. Interaction Patterns
- **Hovers**: Subtle scale transforms (`scale-105`) and background brighten.
- **Transitions**: 200ms `ease-in-out` for all state changes.
- **Loading**: Pulse skeletons or custom spinner in Bel Blue.

## 5. Mobile Priorities
- **Touch Targets**: Minimum 44x44px.
- **Spacing**: Generous gutter (16-20px) on mobile screens.
- **Bottom Bars**: Use floating rounded bars for primary mobile actions.

## 6. Performance Engineering
- **Asset Strategy**: All major visual assets and translations are lazy-loaded to ensure sub-1s LCP.
- **Dependency Hygiene**: Heavy third-party libraries must be dynamically imported to avoid main-thread blocking.
- **Interactive States**: Use skeleton loaders to handle asynchronous state transitions (e.g., during PDF generation or language switching) to maintain perceived speed.
