# MemOS Docs 

This repository contains the documentation website for MemOS project.

## Project Structure

```
MemOS-Docs/
├── app/                    # Main application code
│   ├── components/        # Vue components
│   ├── composables/       # Vue composables
│   ├── pages/            # Vue pages and routing
│   └── assets/           # Static assets like CSS
├── content/              # Documentation content
│   ├── en/              # English documentation
│   ├── cn/              # Chinese documentation
│   └── api.json         # OpenAPI Documentation
├── public/              # Public static assets
│   └── assets/         # Images and other media
├── envConfig/          # Environment configurations
│   ├── config.dev.ts   # Development config
│   ├── config.pre.ts   # Pre-production config
│   └── config.prod.ts  # Production config
├── i18n/               # Internationalization
│   └── locales/       # Translation files
└── nuxt.config.ts     # Nuxt configuration
```

## Features

- 📝 Markdown-based documentation
- 🌐 Multi-language support (English & Chinese)
- 🔍 Full-text search
- 📱 Mobile-friendly responsive design
- ⚡️ Fast static site generation

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Build

Build the documentation site:

```bash
# Build with default settings (en locale, dev environment)
pnpm run publish

# Build for specific environment
pnpm run publish --env=prod 
```

## Environment Configuration

The project supports different environments:

- `dev`: Development environment
- `pre`: Pre-production environment
- `prod`: Production environment

Configure environment-specific settings in `envConfig/config.[env].ts`.

## Writing Documentation

Documentation is written in Markdown format and organized by language:

- English docs: `content/en/`
- Chinese docs: `content/cn/`

Navigation structure is defined in `content/[lang]/settings.yml`.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

# Learn Git
