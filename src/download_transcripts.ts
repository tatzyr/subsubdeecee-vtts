import playwright from "playwright";
import fs from "fs/promises";
import { event, video_ids } from "./config";
import { Sentence } from "./types";

async function main() {
  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 100,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 768 });

  for (const video_id of video_ids) {
    console.dir({ video_id });

    await page.goto(
      `https://developer.apple.com/videos/play/${event}/${video_id}/`
    );
    const sentences = await page
      .locator("li.transcript a.sentence")
      .evaluateAll<Sentence[], HTMLAnchorElement>((list) =>
        list.map((item) => ({ text: item.innerText, link: item.href }))
      );
    await fs.writeFile(
      `gh-pages-dir/transcripts/${event}/${video_id}.json`,
      JSON.stringify(sentences, null, 2)
    );
  }
  await browser.close();
}

main().catch(console.error);
