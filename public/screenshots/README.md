# Desktop App Screenshots

This directory contains screenshots for the Desktop App page gallery.

## Adding Screenshots

To add a screenshot to the gallery:

1. **Save your screenshot** to this directory (`public/screenshots/`)
2. **Update the screenshot data** in `/src/app/desktop/DesktopAppPage.tsx`

### Recommended Screenshot Names

```
/screenshots/embed-interface.png
/screenshots/document-comparison.png
/screenshots/benchmark-dashboard.png
/screenshots/vector-explorer.png
```

### Recommended Dimensions

- **Aspect ratio**: 16:9 (e.g., 1920x1080, 1600x900, 1280x720)
- **File format**: PNG or JPG
- **File size**: < 500KB (optimize for web)

### Example Update in DesktopAppPage.tsx

Find the `screenshots` array and update the `image` field:

```tsx
const screenshots = [
  {
    image: '/screenshots/embed-interface.png', // ✅ Changed from null
    title: 'Embedding Interface',
    description: 'Generate embeddings with a clean, intuitive interface',
  },
  // ... more screenshots
];
```

## Screenshot Guidelines

### What to Capture

1. **Embedding Interface** - Show the embed tab with sample text and output
2. **Document Comparison** - Display document similarity results
3. **Benchmark Dashboard** - Show performance metrics and charts
4. **Vector Search Explorer** - Display vector search visualization

### Best Practices

- Use **clean, representative data** (avoid personal/sensitive info)
- **Highlight key features** in each screenshot
- Ensure **good contrast** and readability
- Use **consistent window chrome** (macOS/Windows/Linux)
- Consider **dark mode** to match the site theme

### Image Optimization

Before adding screenshots, optimize them:

```bash
# Using ImageOptim (macOS)
# Drag images to ImageOptim app

# Using online tools
# TinyPNG: https://tinypng.com
# Squoosh: https://squoosh.app
```

## Fallback Behavior

If an image is:
- Set to `null`
- Path doesn't exist
- Fails to load

The `ScreenshotCard` component will automatically show a placeholder with:
- Window chrome (macOS-style buttons)
- Icon placeholder
- "Screenshot placeholder" text
