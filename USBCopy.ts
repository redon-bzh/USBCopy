#!/usr/bin/env deno run -A --unstable ./USBCopy

import { join } from "https://deno.land/std@0.106.0/path/mod.ts";
import * as log from "https://deno.land/std@0.106.0/log/mod.ts";
import { format } from "https://deno.land/std@0.106.0/datetime/mod.ts";

const __dirname = new URL(".", import.meta.url).pathname;
// const dir = join(__dirname, 'Kit_cle_USB').slice(1);
const dir = "Kit_cle_USB";

// Version
const version = "0.0.2";
const label = "REDON_Agglomération";

// Force Dir
Deno.mkdir(dir, { recursive: true });

/**
 * Sleep
 * @param seconds
 * @returns
 */
function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

// Timer
var timer = Date.now();
var filesList: Array<string> = [];
var keys: Array<string> = [];
var count = 0;

console.log(`
=================================
  WELCOME TO USBCopy v${version}
=================================
`);

await sleep(2);

// Files list
for (const entry of Deno.readDirSync(dir)) {
  if (entry.isFile) {
    filesList.push(entry.name);
  }
}

// Check filesList
if (filesList.length == 0) {
  log.critical(
    "⚠  You are not files in dir Kit_cle_USB\n  => Put files in dir Kit_cle_USB and start again!",
  );
  Deno.exit(1);
} else {
  log.info("List of files");
  console.table(filesList);
}

// Get list drive USB
const drive = Deno.run({
  cmd: ["wmic", "logicaldisk", "where", "drivetype=2", "get", "caption"],
  stdout: "piped",
  stderr: "piped",
});

// await its completion
const { code } = await drive.status();
const rawOutput = await drive.output();
const rawError = await drive.stderrOutput();

if (code === 0) {
  const output = new TextDecoder().decode(rawOutput);
  keys = output.replace("Caption", "")
    .replace(/\r?\n|\r/g, "")
    .split(":")
    .map((x: string) => x.trim())
    .filter((x: string) => x)
    .map((x: string) => x + ":");
} else {
  const errorString = new TextDecoder().decode(rawError);
  log.warning(errorString);
  Deno.exit(1);
}

// Check USBKeys connected
if (keys.length == 0) {
  log.critical("⚠  You are not USB key connected\n  => Connect your USB Keys!");
  Deno.exit(1);
}

/**
 * Convert format USBkey to NTFS
 * @param keys array USB keys
 */
async function convertFormatKeys(keys: Array<string>) {
  for (let index = 0; index < keys.length; index++) {
    log.info("✔ Check: clés USB " + keys[index]);
    const k = Deno.run({
      cmd: ["convert", keys[index], "/fs:ntfs", "/x"],
      stdout: "inherit",
      stderr: "inherit",
    });
    await k.status();
    const p = Deno.run({
      cmd: ["LABEL", keys[index], label],
      stdout: "inherit",
      stderr: "inherit",
    });
    await p.status();
  }
}

// Convert Keys
await convertFormatKeys(keys);

// Delete all file in keys
keys.forEach((key) => {
  for (const entry of Deno.readDirSync(key)) {
    if (entry.isFile == true) {
      Deno.removeSync(join(key + entry.name));
    }
  }
  log.info("✔ Purge fichiers clés USB " + key);
});

count = filesList.length * keys.length;
log.critical(
  "⚠  Copy files in keys, don't touch USB Keys!\nOperations files:" + count,
);

await sleep(2);

let i = 0;
let j = 0;
let k = 0;

keys.forEach((key: string) => {
  for (const entry of filesList) {
    // i++
    // try {
    //     Deno.copyFileSync( join(dir, entry.name), join(key + entry.name))
    //     log.info("✔ " + (Date.now() - timer)/1000 + 'second - filename: ' + entry.name + ' in key: ' + key)
    // } catch (err) {
    //     log.error(err);
    // }
    Deno.copyFile(join(dir, entry), join(key + entry))
      .then(() => {
        i++;
        k++;
        log.info(
          "✔ " + (Date.now() - timer) / 1000 + "second - filename: " + entry +
            " in key: " + key,
        );
        if (i >= count) {
          log.info(
            "✔ " + (Date.now() - timer) / 1000 +
              "second - All files is copied " + i,
          );
          const encoder = new TextEncoder();
          const data = encoder.encode(`
========================
    USBCopy ${version}
========================

Date: ${format(new Date(), "MM-dd-yyyy hh:mm a")}

Files:
${filesList.join("\n")}

USBKeys:
${keys.join("\n")}
----

Files copied: ${k}
Files error copy: ${j}
Time elapse: ${(Date.now() - timer) / 1000} Sec

----
`);
          Deno.writeFileSync("history.txt", data);
        }
      })
      .catch((err) => {
        i++;
        j++;
        log.warning("⚠  Error copy file: " + entry);
        log.critical(err);
      });
  }
});
