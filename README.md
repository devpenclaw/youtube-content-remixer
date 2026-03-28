# YouTube Content Remixer 🎬

AI-powered tool that transforms trending video titles into fresh content for your niche.

## Features

- 📊 **Scrape Trending Titles** - Fetch trending videos from YouTube
- ✍️ **AI Title Rewriting** - Transform titles from one niche to another
- 📊 **Originality Scoring** - Rate your remixed titles
- 💡 **Video Ideas Generator** - AI-powered content ideas

## Setup

```bash
npm install
```

## Usage

```bash
# Get trending video titles
node index.js scrape

# Remix titles from one niche to another
node index.js remix [source-niche] [target-niche]
node index.js remix Lifestyle "AI Tools"

# Generate video ideas for a niche
node index.js ideas "AI Tools"

# Full workflow - scrape, remix, and generate ideas
node index.js full [source-niche] [target-niche]
node index.js full Lifestyle "AI Tools"
```

## AI-Powered Mode

Set your OpenAI API key for full AI-powered remixing:

```bash
export OPENAI_API_KEY=sk-...
```

Without an API key, it uses pattern-based remixing (still works but not as creative).

## Examples

### Remixing Lifestyle → AI Tools

**Original:** "I Tried Living Like a Billionaire for 24 Hours"
**Remixed:** "I Tried AI Tools for 24 Hours - Mind-Blowing Results"

**Original:** "The Secret to Success Nobody Tells You"
**Remixed:** "The AI Tool Nobody's Using (But Should Be)"

## How It Works

1. **Scrape** - Fetches trending video titles from YouTube
2. **Analyze** - Identifies patterns and structures
3. **Remix** - AI rewrites for your target niche
4. **Score** - Rates originality and clickability
5. **Generate** - Creates completely new video ideas

## License

MIT
