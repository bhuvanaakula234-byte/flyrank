const axios = require('axios');
const cheerio = require('cheerio');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');

// 1. Zod Schema for validation
const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().min(0, "Price cannot be negative"),
  rating: z.string().min(1, "Rating is required"),
  inStock: z.boolean(),
});

// 2. Polite Delay Function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configure Axios with a polite User-Agent
const client = axios.create({
  baseURL: 'http://books.toscrape.com/catalogue/',
  headers: {
    'User-Agent': 'FlyRank Intern Scraper/1.0 (Learning Project)'
  },
  timeout: 10000 // 10 seconds timeout
});

// Helper to clean price (e.g., "£51.77" -> 51.77)
const parsePrice = (priceStr) => {
  const match = priceStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

// Main scraper function
async function runScraper() {
  const books = [];
  const TOTAL_PAGES = 3;

  console.log(`Starting the polite scraper. Target: ${TOTAL_PAGES} pages.`);

  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const pageUrl = `page-${i}.html`;
    console.log(`Fetching ${pageUrl}...`);

    try {
      // Fetch the page
      const response = await client.get(pageUrl);
      const $ = cheerio.load(response.data);

      const articles = $('article.product_pod');
      let pageCount = 0;

      articles.each((idx, el) => {
        const title = $(el).find('h3 a').attr('title') || $(el).find('h3 a').text();
        const priceStr = $(el).find('.product_price .price_color').text();
        const price = parsePrice(priceStr);
        const ratingClass = $(el).find('p.star-rating').attr('class');
        const rating = ratingClass ? ratingClass.replace('star-rating', '').trim() : 'Unknown';
        const inStock = $(el).find('.product_price .instock.availability').text().includes('In stock');

        const rawBook = { title, price, rating, inStock };

        // 3. Validation against Schema
        const validationResult = bookSchema.safeParse(rawBook);
        if (validationResult.success) {
          books.push(validationResult.data);
          pageCount++;
        } else {
          console.warn(`[Warning] Validation failed for a book on page ${i}:`, validationResult.error.issues);
        }
      });

      console.log(`Successfully scraped ${pageCount} books from page ${i}.`);

    } catch (error) {
      // 4. Resilience: Log error but don't crash
      console.error(`[Error] Failed to fetch or parse ${pageUrl}:`, error.message);
      console.log('Continuing to the next page...');
    }

    // 5. Politeness: Wait before the next request (unless it's the last page)
    if (i < TOTAL_PAGES) {
      console.log('Sleeping for 1 second to be polite...');
      await delay(1000);
    }
  }

  // 6. Output to JSON
  console.log(`\nScraping complete! Total valid books collected: ${books.length}`);
  const outputPath = path.join(__dirname, 'books.json');
  fs.writeFileSync(outputPath, JSON.stringify(books, null, 2), 'utf-8');
  console.log(`Data saved to ${outputPath}`);
}

// Execute
runScraper();
