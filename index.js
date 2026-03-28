const axios = require("axios");
const cheerio = require("cheerio");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ""
});

const YOUTUBE_TRENDING_URL = "https://www.youtube.com/feed/trending";

async function scrapeTrendingTitles(category = "All") {
  try {
    const { data } = await axios.get(YOUTUBE_TRENDING_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    const titles = [];
    
    // Try to find video titles in the page
    $("ytd-rich-item-renderer, ytd-video-renderer").each((i, el) => {
      const title = $(el).find("#video-title, h3 a, yt-formatted-string").first().text().trim();
      const views = $(el).find(".yt-lockup-meta-info, span").first().text().trim();
      
      if (title && title.length > 10 && title.length < 150) {
        titles.push({
          title,
          views: views || "Unknown",
          index: i + 1
        });
      }
    });
    
    // If scraping fails, use sample titles
    if (titles.length === 0) {
      console.log("Using sample trending titles...");
      return getSampleTrendingTitles();
    }
    
    return titles.slice(0, 20);
  } catch (error) {
    console.log("Scraping failed, using samples:", error.message);
    return getSampleTrendingTitles();
  }
}

function getSampleTrendingTitles() {
  return [
    { title: "I Tried Living Like a Billionaire for 24 Hours", views: "10M views", index: 1 },
    { title: "The Secret to Success Nobody Tells You", views: "5M views", index: 2 },
    { title: "How I Made $10,000 in One Week", views: "8M views", index: 3 },
    { title: "Why You're Still Broke (Math Explained)", views: "3M views", index: 4 },
    { title: "I Bought EveryTHING in One Store Challenge", views: "15M views", index: 5 },
    { title: "The TRUTH About Intermittent Fasting", views: "4M views", index: 6 },
    { title: "Building My Dream House in 30 Days", views: "20M views", index: 7 },
    { title: "What Doctors Won't Tell You About Sleep", views: "6M views", index: 8 },
    { title: "I Left Everything and Traveled the World", views: "12M views", index: 9 },
    { title: "The Real Reason You're Unhappy", views: "7M views", index: 10 }
  ];
}

async function remixTitle(originalTitle, sourceNiche, targetNiche, style = "engaging") {
  if (!client.apiKey) {
    return generateLocalRemix(originalTitle, sourceNiche, targetNiche);
  }
  
  try {
    const prompt = `You are a YouTube title expert. Transform video titles from one niche to another while keeping them engaging and clickable.

ORIGINAL TITLE: "${originalTitle}"
SOURCE NICHE: ${sourceNiche}
TARGET NICHE: ${targetNiche}
STYLE: ${style}

Rules:
- Keep the SAME structure/pattern but change the topic
- Make it specific to "${targetNiche}"
- Use power words: secret, truth, proven, shocking, ultimate, etc.
- Keep under 60 characters
- Make it curiosity-inducing
- NO clickbait lies - stay factual

Return ONLY the new title, nothing else.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.8
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.log("GPT error:", error.message);
    return generateLocalRemix(originalTitle, sourceNiche, targetNiche);
  }
}

function generateLocalRemix(title, source, target) {
  // Simple pattern-based remixing without AI
  const patterns = [
    `The ULTIMATE ${target} Guide (Based on "${title.substring(0, 30)}...")`,
    `What "${title.substring(0, 20)}" Taught Me About ${target}`,
    `Why ${target} Experts Are Switching to This (Inspired by "${title.substring(0, 25)}")`,
    `The ${target} Secret Nobody Talks About (Like "${title.substring(0, 20)}")`,
    `${target} vs ${target.toUpperCase()} - What Nobody Tells You`
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
}

async function checkOriginality(title, existingTitles = []) {
  if (!client.apiKey) {
    return { score: 80, suggestions: ["Add your unique angle/perspective"] };
  }
  
  try {
    const prompt = `Rate this YouTube title's originality and clickability on a scale of 1-100.

TITLE: "${title}"
EXISTING POPULAR TITLES: ${existingTitles.slice(0, 3).map(t => `"${t}"`).join(", ")}

Consider:
- Is it unique or generic?
- Does it create curiosity?
- Is it specific vs vague?
- Would YOU click on it?

Return in format:
SCORE: [number]
SUGGESTIONS: [1-2 improvement tips]`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    });
    
    const text = response.choices[0].message.content;
    const scoreMatch = text.match(/SCORE:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;
    
    return {
      score,
      suggestions: []
    };
  } catch (error) {
    return { score: 75, suggestions: ["Add a unique perspective"] };
  }
}

async function generateVideoIdeas(niche, count = 5) {
  if (!client.apiKey) {
    return generateLocalIdeas(niche);
  }
  
  try {
    const prompt = `Generate ${count} unique YouTube video ideas for the niche: "${niche}"

For each idea provide:
1. A catchy title (under 60 chars)
2. A brief hook (first 10 seconds)
3. 3 key points covered

Make them:
- Unique and not generic
- curiosity-inducing
- Something YOU would watch

Format:
1. [Title] | HOOK: [hook] | POINTS: [point1], [point2], [point3]
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    return generateLocalIdeas(niche);
  }
}

function generateLocalIdeas(niche) {
  const ideas = [
    `1. The "${niche}" Mistake Nobody Talks About | HOOK: You're doing this wrong | POINTS: Common error, Hidden truth, Quick fix`,
    `2. ${niche.toUpperCase()} Secrets Revealed | HOOK: I spent $10k learning this | POINTS: Expensive lesson, Insider tips, Free alternative`,
    `3. Why "${niche}" Is Overrated (Honest Review) | HOOK: Controversial take | POINTS: Popular claim, Real truth, Better alternative`,
    `4. I Tried "${niche}" for 30 Days - Results | HOOK: Day 1 vs Day 30 | POINTS: The process, Real transformation, What to expect`,
    `5. The "${niche}" Formula Nobody Knows | HOOK: This changed everything | POINTS: Hidden formula, Step by step, Real example`
  ];
  return ideas.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  
  console.log("\n🎬 YOUTUBE CONTENT REMIXER\n");
  
  switch (command) {
    case "scrape":
      console.log("📊 Fetching trending titles...\n");
      const titles = await scrapeTrendingTitles();
      titles.forEach(t => {
        console.log(`${t.index}. "${t.title}"`);
        console.log(`   Views: ${t.views}\n`);
      });
      break;
      
    case "remix": {
      const sourceNiche = args[1] || "General";
      const targetNiche = args[2] || "Tech";
      
      console.log(`✍️ Remixing titles from "${sourceNiche}" → "${targetNiche}"...\n`);
      
      const trendingTitles = await scrapeTrendingTitles();
      
      console.log("ORIGINAL → REMIXED:\n");
      for (const t of trendingTitles.slice(0, 5)) {
        const remixed = await remixTitle(t.title, sourceNiche, targetNiche);
        const { score } = await checkOriginality(remixed);
        
        console.log(`📍 Original: "${t.title}"`);
        console.log(`✨ Remixed: "${remixed}"`);
        console.log(`📊 Originality Score: ${score}/100\n`);
      }
      break;
    }
    
    case "ideas": {
      const niche = args[1] || "AI Tools";
      console.log(`💡 Generating video ideas for: "${niche}"...\n`);
      
      const ideas = await generateVideoIdeas(niche);
      console.log(ideas);
      break;
    }
    
    case "full": {
      const sourceNiche = args[1] || "Lifestyle";
      const targetNiche = args[2] || "AI Tools";
      
      console.log(`🎯 FULL REMIX: "${sourceNiche}" → "${targetNiche}"\n`);
      
      // Get trending
      const trending = await scrapeTrendingTitles();
      console.log(`📊 Found ${trending.length} trending titles\n`);
      
      // Remix top 5
      console.log("✍️ TOP 5 REMIXED TITLES:\n");
      for (const t of trending.slice(0, 5)) {
        const remixed = await remixTitle(t.title, sourceNiche, targetNiche);
        console.log(`"${remixed}"`);
      }
      
      // Generate new ideas
      console.log(`\n💡 NEW IDEAS for ${targetNiche}:\n`);
      const ideas = await generateVideoIdeas(targetNiche, 5);
      console.log(ideas);
      break;
    }
    
    default:
      console.log("Usage:");
      console.log("  node index.js scrape          - Get trending titles");
      console.log("  node index.js remix [source] [target]  - Remixer titles");
      console.log("  node index.js ideas [niche]   - Generate video ideas");
      console.log("  node index.js full [source] [target] - Full remix workflow");
      console.log("\nExample:");
      console.log("  node index.js full Lifestyle 'AI Tools'");
      console.log("\nSet OPENAI_API_KEY for AI-powered remixing");
      break;
  }
}

main().catch(console.error);
