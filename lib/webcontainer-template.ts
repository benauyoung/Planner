import type { FileSystemTree } from '@webcontainer/api'
import { ELEMENT_SELECTOR_SCRIPT } from './element-selector-script'

/**
 * Minimal Vite + React 18 + Tailwind CSS v4 scaffold.
 * AI-generated source files (pages, components) are written on top of this.
 */
export const BASE_TEMPLATE: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'tinybaguette-preview',
          private: true,
          type: 'module',
          scripts: {
            dev: 'vite --host',
          },
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            'react-router-dom': '^6.28.0',
            'lucide-react': '^0.468.0',
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.3.4',
            tailwindcss: '^4.0.0',
            '@tailwindcss/vite': '^4.0.0',
            vite: '^6.0.0',
          },
        },
        null,
        2
      ),
    },
  },

  'vite.config.js': {
    file: {
      contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
`,
    },
  },

  'index.html': {
    file: {
      contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    ${ELEMENT_SELECTOR_SCRIPT}
  </body>
</html>
`,
    },
  },

  src: {
    directory: {
      'main.tsx': {
        file: {
          contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
`,
        },
      },

      'index.css': {
        file: {
          contents: `@import "tailwindcss";
`,
        },
      },

      'App.tsx': {
        file: {
          contents: `import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Ready to generate</h1>
            <p className="text-lg text-gray-500">Click "Generate App" to create your project.</p>
          </div>
        </div>
      } />
    </Routes>
  )
}
`,
        },
      },

      pages: {
        directory: {
          '.gitkeep': {
            file: { contents: '' },
          },
        },
      },

      components: {
        directory: {
          '.gitkeep': {
            file: { contents: '' },
          },
        },
      },
    },
  },
}
