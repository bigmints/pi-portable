"use client";

import React from 'react';
import { useModelSettingsStore, AppearanceSettings as SettingsType } from '@/store/model-settings';
import { Palette, Type, AlignLeft } from 'lucide-react';
import styles from './AppearanceSettings.module.css';

export default function AppearanceSettings() {
  const { appearance, updateAppearance } = useModelSettingsStore();

  const handleFontSizeChange = (size: SettingsType['fontSize']) => {
    updateAppearance({ fontSize: size });
  };

  const handleCodeThemeChange = (theme: SettingsType['codeTheme']) => {
    updateAppearance({ codeTheme: theme });
  };

  const handleLineHeightChange = (height: SettingsType['lineHeights']) => {
    updateAppearance({ lineHeights: height });
  };

  // Swatches color profiles for visual representation
  const themeSwatches = {
    'github-dark': { bg: '#0d1117', border: '#30363d', dots: ['#ff7b72', '#79c0ff', '#7ee787'] },
    'github-light': { bg: '#ffffff', border: '#d0d7de', dots: ['#cf222e', '#0969da', '#1a7f37'] },
    'monokai': { bg: '#272822', border: '#49483e', dots: ['#f92672', '#66d9ef', '#a6e22e'] },
    'nord': { bg: '#2e3440', border: '#4c566a', dots: ['#bf616a', '#88c0d0', '#a3be8c'] },
  };

  return (
    <div className={styles.container}>
      {/* Font Size Section */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <Type size={18} className={styles.icon} />
          <div>
            <h3 className={styles.title}>Font Size</h3>
            <p className={styles.subtitle}>Adjust the readability of the chat text</p>
          </div>
        </div>

        <div className={styles.optionGrid}>
          {(['small', 'medium', 'large'] as SettingsType['fontSize'][]).map((size) => {
            const isActive = appearance.fontSize === size;
            return (
              <button
                key={size}
                type="button"
                className={`${styles.cardButton} ${isActive ? styles.cardActive : ''}`}
                onClick={() => handleFontSizeChange(size)}
              >
                <span className={`${styles.sizeIndicator} ${styles[`indicator-${size}`]}`}>Aa</span>
                <span className={styles.cardLabel}>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
              </button>
            );
          })}
        </div>

        {/* Live Font Size Preview */}
        <div className={styles.previewBox}>
          <div className={styles.previewHeader}>Preview</div>
          <p className={`${styles.previewText} ${styles[`preview-${appearance.fontSize}`]}`}>
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </div>

      {/* Code Theme Section */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <Palette size={18} className={styles.icon} />
          <div>
            <h3 className={styles.title}>Code Block Theme</h3>
            <p className={styles.subtitle}>Choose your code syntax highlighting flavor</p>
          </div>
        </div>

        <div className={styles.optionGrid}>
          {(['github-dark', 'github-light', 'monokai', 'nord'] as SettingsType['codeTheme'][]).map((theme) => {
            const isActive = appearance.codeTheme === theme;
            const colors = themeSwatches[theme];
            return (
              <button
                key={theme}
                type="button"
                className={`${styles.cardButton} ${isActive ? styles.cardActive : ''}`}
                onClick={() => handleCodeThemeChange(theme)}
              >
                <div
                  className={styles.swatch}
                  style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                >
                  <div className={styles.swatchDots}>
                    {colors.dots.map((dotColor, idx) => (
                      <span
                        key={idx}
                        className={styles.swatchDot}
                        style={{ backgroundColor: dotColor }}
                      />
                    ))}
                  </div>
                </div>
                <span className={styles.cardLabel}>
                  {theme
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Line Height Section */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <AlignLeft size={18} className={styles.icon} />
          <div>
            <h3 className={styles.title}>Line Height</h3>
            <p className={styles.subtitle}>Set vertical spacing for message bodies</p>
          </div>
        </div>

        <div className={styles.optionGrid}>
          {(['compact', 'comfortable', 'spacious'] as SettingsType['lineHeights'][]).map((height) => {
            const isActive = appearance.lineHeights === height;
            return (
              <button
                key={height}
                type="button"
                className={`${styles.cardButton} ${isActive ? styles.cardActive : ''}`}
                onClick={() => handleLineHeightChange(height)}
              >
                <div className={`${styles.lineIndicator} ${styles[`lines-${height}`]}`}>
                  <span />
                  <span />
                </div>
                <span className={styles.cardLabel}>{height.charAt(0).toUpperCase() + height.slice(1)}</span>
              </button>
            );
          })}
        </div>

        {/* Live Line Height Preview */}
        <div className={styles.previewBox}>
          <div className={styles.previewHeader}>Preview</div>
          <div className={`${styles.linePreviewText} ${styles[`lh-${appearance.lineHeights}`]}`}>
            <p>Artificial intelligence is general technology advancing at high velocity.</p>
            <p>Optimizing readability enhances long coding and chat sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
