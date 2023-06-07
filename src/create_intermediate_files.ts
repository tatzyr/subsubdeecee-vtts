import fs from "fs/promises";
import { event, video_ids } from "./config";
import { Sentence } from "./types";

async function main() {
  for (const video_id of video_ids) {
    console.dir({ video_id });
    const resultAry: string[] = [];
    const timeResultAry: string[] = [];

    // When translating a file with the Shortcuts app on iPhone,
    // the first line of the file becomes the file name of the translation result.
    // To make the file name of the translated result `${video_id}.txt`,
    // write the video_id on the first line.
    resultAry.push(`${video_id}`);

    let hasReachedPeriod = true;
    const sentences: Sentence[] = JSON.parse(
      await fs.readFile(
        `gh-pages-dir/transcripts/${event}/${video_id}.json`,
        "utf-8"
      )
    );
    for (const sentence of sentences) {
      const { text, link } = sentence;
      if (hasReachedPeriod) {
        const m = link.match(/time=(\d+)/);
        if (!m) {
          throw new Error(link);
        }
        const time = Number(m[1]);
        resultAry.push("\n");
        timeResultAry.push(`${time}\n`);
      }
      resultAry.push(text);
      hasReachedPeriod = !!text.match(/[.!?♪]"?\s*$/);
    }
    if (!hasReachedPeriod) {
      resultAry.push(".");
    }
    const resultStr = resultAry.join("");
    await fs.writeFile(
      `gh-pages-dir/intermediate_files/${event}/${video_id}.txt`,
      resultStr
    );
    await fs.writeFile(
      `gh-pages-dir/intermediate_files/${event}/time_${video_id}.txt`,
      timeResultAry.join("")
    );
  }
}

main().catch(console.error);
