const axios = require('axios');
const cheerio = require('cheerio');
const googleIt = require('google-it');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const API_URL = process.env.LARAVEL_API_URL;

async function runPhase2() {
    try {
        const res = await axios.get(API_URL);
        const articles = res.data;
        if (articles.length === 0) return;
        const originalArticle = articles[0];

        const searchResults = await googleIt({ query: originalArticle.title });
        const topLinks = searchResults.slice(0, 2).map(r => r.link);

        let referenceContext = "";
        for (const link of topLinks) {
            try {
                const { data } = await axios.get(link, { timeout: 5000 });
                const $ = cheerio.load(data);
                const text = $('p').text().substring(0, 1500);
                referenceContext += `\n--- SOURCE: ${link} ---\n${text}\n`;
            } catch (e) {
                continue;
            }
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert blog editor. You will rewrite an article to match the depth and style of top-ranking competitors while citing them at the bottom."
                },
                {
                    role: "user",
                    content: `Original Title: ${originalArticle.title}\nOriginal Content: ${originalArticle.excerpt}\n\nCompetitor Research Data:\n${referenceContext}\n\nTask:\n1. Rewrite the article to be more detailed and better formatted (use Markdown).\n2. Use the competitor data to improve the quality.\n3. At the very end, add a section 'References:' and list the source links used.`
                }
            ]
        });

        const updatedContent = completion.choices[0].message.content;

    } catch (error) {
        console.error(error.message);
    }
}

runPhase2();