# Universal Converter

<p align="center">
  <img src="public/logo.png" alt="Universal Converter Logo" width="128" height="128">
</p>

A desktop application for local file conversion across various formats including images, video, audio, and documents.

## Description

Universal Converter provides a streamlined interface for converting files directly on your local machine. By leveraging Electron, FFmpeg, and Sharp, the application ensures that no data leaves your computer during the conversion process, prioritizing privacy and performance.

### Key Features

*   **Offline Processing:** All conversions are performed locally.
*   **Broad Format Support:** Handles common and professional file formats for images, audio, video, and documents.
*   **Customizable Output:** Users can specify destination directories for converted files.
*   **Cross-Platform:** Built using Electron for compatibility across multiple operating systems.
*   **Modern Interface:** Built with React and Tailwind CSS for a responsive user experience.

## Prerequisites

Ensure you have the following installed:

*   **Node.js** (version 18 or higher)
*   **npm** (usually bundled with Node.js)

## Getting Started

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/zekobinks/universal-converter.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd universal-converter
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Development

To start the application in development mode:

```bash
npm run electron:dev
```

### Production Build

To build the application for Windows:

```bash
npm run electron:build
```

## Supported Formats

### Images
JPG, PNG, WEBP, GIF, BMP, TIFF, ICO, PDF

### Video
MP4, MOV, AVI, MKV, WEBM, FLV, WMV

### Audio
MP3, WAV, AAC, OGG, FLAC, M4A, WMA

### Documents
PDF, DOCX, TXT, HTML, ODT

## Technical Stack

*   **Electron** - Framework for cross-platform desktop applications.
*   **React** - UI library for building the user interface.
*   **TypeScript** - Strongly typed programming language.
*   **Tailwind CSS** - Utility-first CSS framework.
*   **Shadcn/ui** - Component library for UI elements.
*   **FFmpeg** - Multimedia framework for media conversion.
*   **Sharp** - High-performance Node.js image processing library.

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
