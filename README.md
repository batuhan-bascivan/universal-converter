# Universal Converter

<p align="center">
  <img src="public/logo.png" alt="Universal Converter Logo" width="128" height="128">
</p>

A privacy-first desktop application for local file conversion. Convert images, videos, audio, and documents — entirely offline.

## Features

- **100% Offline** — All conversions happen locally, no data ever leaves your machine
- **Multi-format Support** — Images, video, audio, and document conversion
- **Batch Conversion** — Convert multiple files at once
- **Custom Output Directory** — Choose where your converted files are saved
- **Dark/Light Theme** — Toggle between themes

## Supported Formats

| Category | Formats |
|----------|---------|
| **Image** | JPG, PNG, WEBP, GIF, BMP, TIFF, ICO, PDF |
| **Video** | MP4, MOV, AVI, MKV, WEBM, FLV, WMV |
| **Audio** | MP3, WAV, AAC, OGG, FLAC, M4A, WMA |
| **Document** | PDF, DOCX, TXT, HTML, ODT |

## Prerequisites

- **Node.js** 18+
- **npm** (bundled with Node.js)

## Getting Started

### Installation

```bash
git clone https://github.com/your-username/universal-converter.git
cd universal-converter
npm install
```

### Development

```bash
npm run electron:dev
```

### Build for Windows

```bash
npm run electron:build
```

The installer and portable executable will be generated in the `release/` directory.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Electron** | Desktop application framework |
| **React** | User interface |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI components |
| **FFmpeg** | Video/audio conversion |
| **Sharp** | Image processing |
| **Mammoth** | DOCX parsing |

## Project Structure

```
├── electron/          # Electron main process & preload
│   ├── main.ts        # Main process with conversion logic
│   └── preload.ts     # Bridge between main & renderer
├── src/               # React renderer process
│   ├── components/    # UI components
│   ├── pages/         # Application pages
│   └── App.tsx        # Root component
├── public/            # Static assets
└── build/             # Build resources (icons)
```

## License

MIT