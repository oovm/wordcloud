import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  shortcuts: [
    // Layout shortcuts
    ['flex-center', 'flex items-center justify-center'],
    ['flex-col-center', 'flex flex-col items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],
    ['flex-around', 'flex items-center justify-around'],
    ['flex-start', 'flex items-center justify-start'],
    ['flex-end', 'flex items-center justify-end'],
    
    // Button shortcuts
    ['btn', 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer'],
    ['btn-primary', 'btn bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'],
    ['btn-secondary', 'btn bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400'],
    ['btn-success', 'btn bg-green-500 text-white hover:bg-green-600 active:bg-green-700'],
    ['btn-warning', 'btn bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700'],
    ['btn-danger', 'btn bg-red-500 text-white hover:bg-red-600 active:bg-red-700'],
    ['btn-outline', 'btn border-2 border-current bg-transparent hover:bg-current hover:text-white'],
    
    // Card shortcuts
    ['card', 'bg-white rounded-xl shadow-sm border border-gray-200 p-6'],
    ['card-hover', 'card hover:shadow-md transition-shadow duration-200'],
    
    // Input shortcuts
    ['input', 'px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'],
    ['input-error', 'input border-red-500 focus:ring-red-500'],
    
    // Text shortcuts
    ['text-primary', 'text-gray-900'],
    ['text-secondary', 'text-gray-600'],
    ['text-muted', 'text-gray-500'],
    ['text-placeholder', 'text-gray-400'],
    
    // Background shortcuts
    ['bg-primary', 'bg-white'],
    ['bg-secondary', 'bg-gray-50'],
    ['bg-muted', 'bg-gray-100'],
    
    // WordCloud specific shortcuts
    ['wordcloud-container', 'relative w-full h-full bg-white rounded-xl shadow-sm border border-gray-200'],
    ['wordcloud-canvas', 'absolute inset-0 w-full h-full'],
    ['control-panel', 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6'],
    ['upload-area', 'border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors'],
    ['upload-area-active', 'border-blue-500 bg-blue-50'],
    
    // Animation shortcuts
    ['fade-in', 'animate-fade-in'],
    ['slide-up', 'animate-slide-up'],
    ['bounce-in', 'animate-bounce-in']
  ],
  
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      },
      wordcloud: {
        bg: '#ffffff',
        border: '#e5e7eb',
        text: '#374151',
        accent: '#3b82f6'
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace']
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'bounce-in': 'bounceIn 0.6s ease-out',
      'spin-slow': 'spin 3s linear infinite',
      'pulse-slow': 'pulse 3s ease-in-out infinite'
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' }
      },
      slideUp: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' }
      },
      bounceIn: {
        '0%': { transform: 'scale(0.3)', opacity: '0' },
        '50%': { transform: 'scale(1.05)' },
        '70%': { transform: 'scale(0.9)' },
        '100%': { transform: 'scale(1)', opacity: '1' }
      }
    }
  },
  
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default)
      },
      scale: 1.2,
      warn: true
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'JetBrains Mono:400,500'
      }
    })
  ],
  
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ],
  
  safelist: [
    // Ensure dynamic classes are included
    'i-carbon-cloud',
    'i-carbon-document',
    'i-carbon-upload',
    'i-carbon-download',
    'i-carbon-settings',
    'i-carbon-play',
    'i-carbon-pause',
    'i-carbon-reset',
    'i-carbon-image',
    'i-carbon-text-color',
    'i-carbon-palette',
    'i-mdi-file-image',
    'i-mdi-file-document',
    'i-mdi-table',
    'i-mdi-code-json'
  ]
})