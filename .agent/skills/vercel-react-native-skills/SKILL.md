---
name: vercel-react-native-skills
description: Comprehensive best practices for React Native and Expo applications. Covers performance, animations, UI patterns, and platform-specific optimizations.
tags: [react-native, expo, mobile, performance, animation]
version: 1.0.0
---

# React Native & Expo Skills

Best practices for building high-performance, smooth mobile applications using React Native and Expo.

## Goal
Optimize mobile application performance, ensure platform-native UX, and implement efficient animations and list rendering.

## Requirements
- React Native or Expo environment.
- Knowledge of native mobile paradigms (safe areas, touch targets).

## Steps

### 1. Optimize List Performance (CRITICAL)
- Use `FlashList` from Shopify for heavy lists.
- Memoize list items to prevent unnecessary re-renders.
- Extract render functions outside the main component.

### 2. Implement Fluid Animations
- Use `react-native-reanimated` for GPU-accelerated animations.
- Animate only `transform` and `opacity` properties.
- Use `Gesture.Tap` from `react-native-gesture-handler` for better touch response.

### 3. Native UI Patterns
- Use `Pressable` over `TouchableOpacity`.
- Handle safe areas (notch, home indicator) using `react-native-safe-area-context`.
- Prefer native navigators and modals where possible for a smoother feel.

### 4. Monorepo & Configuration
- Keep native dependencies in the app package.
- Use Expo Config Plugins for modifying native project files without ejecting.

## Verification
- [ ] Lists scroll at 60fps without lag or blank spots.
- [ ] Animations are smooth and do not block the JS thread.
- [ ] UI elements are correctly positioned within safe areas on all devices.
- [ ] Touch targets are at least 44x44pt.
