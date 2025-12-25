const axios = require('axios');
const cheerio = require('cheerio');
const googleIt = require('google-it');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const API_URL = process.env.LARAVEL_API_URL;

async function startProject() {
    try {
        console.log("Connecting to API...");
        let res = await axios.get(API_URL);
        
        if (res.data.length === 0) {
            console.log("Database empty. Scraping BeyondChats...");
            const { data } = await axios.get('https://beyondchats.com/blogs/');
            const $ = cheerio.load(data);
            const articlesFound = [];
            
            $('article').each((i, el) => {
                if (i < 5) {
                    articlesFound.push({
                        title: $(el).find('h2').text().trim(),
                        url: $(el).find('h2 a').attr('href'),
                        excerpt: "Original article content from BeyondChats."
                    });
                }
            });

            for (const art of articlesFound) {
                await axios.post(API_URL, art);
                console.log("Saved: " + art.title);
            }
            res = await axios.get(API_URL);
        }

        console.log(`Processing ${res.data.length} articles...`);

        for (const article of res.data) {
            console.log("Updating: " + article.title);
            const searchResults = await googleIt({ query: article.title });
            const topLinks = searchResults.slice(0, 2).map(r => r.link);

            let referenceContext = "";
            for (const link of topLinks) {
                try {
                    const { data } = await axios.get(link, { timeout: 5000 });
                    const $ = cheerio.load(data);
                    referenceContext += `\nSOURCE: ${link}\n${$('p').text().substring(0, 1000)}\n`;
                } catch (e) {
                    continue;
                }
            }

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{
                    role: "user",
                    content: `Rewrite this article: "${article.title}" based on these references: ${referenceContext}. Cite the links at the bottom.`
                }]
            });

            const updatedContent = completion.choices[0].message.content;

            await axios.put(`${API_URL}/${article.id}`, {
                excerpt: updatedContent
            });
            console.log("Done.");
        }
        console.log("All tasks complete.");
    } catch (error) {
        console.error("Error: " + error.message);
        process.exit(1);
    }
}

startProject();