import fs from "fs/promises";
import { event, lang, video_ids } from "./config";

function numberToTime(sec: number): string {
  const date = new Date(sec * 1000).toISOString();
  // 1970-01-01T03:25:45.000Z
  //            ~~~~~~~~~~~~
  //            |          |
  //            11         23
  return date.slice(11, 23);
}

function escapeSubtitle(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\xa0/g, "&nbsp;");
}

async function main() {
  for (const video_id of video_ids) {
    console.dir({ video_id });

    const resultAry: string[] = [];
    resultAry.push("WEBVTT\n\n");

    const lines = (
      await fs.readFile(
        `gh-pages-dir/translated_files/${event}/${lang}/${video_id}.txt`,
        "utf-8"
      )
    )
      .split("\n")
      .filter((x) => x)
      .filter((_x, i) => i > 0);

    const timeLines = (
      await fs.readFile(
        `gh-pages-dir/intermediate_files/${event}/time_${video_id}.txt`,
        "utf-8"
      )
    )
      .split("\n")
      .filter((x) => x)
      .map(Number);

    if (lines.length !== timeLines.length) {
      throw new Error(
        `length mismatched (lines.length, timeLines.length = ${lines.length}, ${timeLines.length})`
      );
    }

    for (let i = 0; i < lines.length; i += 1) {
      const text = lines[i];
      const sec = timeLines[i];
      const nextSec = timeLines[i + 1];
      const start = numberToTime(sec);
      const end = numberToTime(nextSec ?? 86399);
      resultAry.push(`${start} -> ${end}\n`);
      resultAry.push(`${escapeSubtitle(text)}\n`);
      resultAry.push("\n");
    }

    const resultStr = resultAry.join("");
    await fs.writeFile(
      `gh-pages-dir/docs/${event}/${lang}/${video_id}.vtt`,
      resultStr
    );
  }
}

main().catch(console.error);
