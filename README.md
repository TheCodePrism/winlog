# Winlog

**Winlog** is a local-first, Progressive Web App (PWA) designed to track your success journey. From broad, visionary dreams to concrete goals, milestones, and daily reflections, Winlog gives you a private, offline-first space to log your growth.

## Features

- 🎯 **Comprehensive Tracking**: Manage Dreams, Goals, Milestones, Achievements, and Reflections all in one place.
- 🔒 **Local-First Privacy**: Powered by Dexie.js (IndexedDB). All your data stays strictly on your device.
- ☁️ **Google Drive Cloud Sync**: Optionally connect your Google account to securely backup and restore your database as a private JSON file in your Google Drive. No custom backend servers required.
- 📱 **Progressive Web App (PWA)**: Installable on Desktop and Mobile for a native app-like experience.
- 🎨 **Modern UI**: Built with Tailwind CSS v4, Lucide Icons, and full Dark Mode support.

## Tech Stack

- **Framework**: React + Vite (TypeScript)
- **Styling**: Tailwind CSS v4
- **Database**: Dexie.js (IndexedDB wrapper)
- **Cloud Sync**: Google Identity Services (OAuth 2.0) & Google Drive API v3
- **PWA**: `vite-plugin-pwa`

## Getting Started

### Prerequisites

- Node.js (v22+ recommended)
- A Google Cloud Project with the Google Drive API enabled (if you wish to use the Cloud Sync feature)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Google Client ID for the cloud sync feature:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

### Building for Production

To build the optimized production version (including the PWA service workers):
```bash
npm run build
```
