#!/usr/bin/env deno run -A --unstable ./USBCopy

import { join } from "https://deno.land/std@0.106.0/path/mod.ts";
import * as log from "https://deno.land/std@0.106.0/log/mod.ts";

const __dirname = new URL(".", import.meta.url).pathname;
const dir = join(__dirname, 'Kit_cle_USB').slice(1);

/**
 * Sleep
 * @param seconds 
 * @returns 
 */
function sleep(seconds: number){
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

const version = '0.0.1';
// Timer
var timer = Date.now();

log.info(`
=================================
  WELCOME TO USBCopy v${version}
=================================
`);

// Get list drive USB
const drive = Deno.run({
    cmd: ['wmic', 'logicaldisk', 'where', 'drivetype=2', 'get', 'caption'],
    stdout: "piped",
    stderr: "piped",
});

let keys: Array<string> = [];

// await its completion
const { code } = await drive.status();
const rawOutput = await drive.output();
const rawError = await drive.stderrOutput();

if (code === 0) {
    let output = new TextDecoder().decode(rawOutput);
    keys = output.replace('Caption', '')
        .replace(/\r?\n|\r/g, '')
        .split(':')
        .map( (x: string) => x.trim())
        .filter( (x:string) => x)
        .map( (x:string) => x + ':');

} else {
  const errorString = new TextDecoder().decode(rawError);
  log.warning(errorString);
}


// Prepare all keys
keys.forEach( (key) => {
    log.info("✔ Check: clés USB " + key);
    Deno.run({
        cmd: [ 'convert', key,  '/fs:ntfs', '/x'],
        stdout: "inherit",
        stderr: "inherit",
    });
});

await sleep(5);

// Delete all file in keys
keys.forEach( (key) => {
    for (const entry of Deno.readDirSync(key)) {
        if(entry.isFile == true) {
            Deno.removeSync(join(key + entry.name));
            
        }
    }
    log.info("✔ Purge fichiers clés USB " + key );
});

log.critical("⚠  Copy files in keys, don't touch USB Keys!\n");

let table = [];
let i = 0;

keys.forEach( (key:string) => {
    for (const entry of Deno.readDirSync(dir)) {
        i++;
        if(entry.isFile == true) {
            // try {
            //     Deno.copyFileSync( join(dir, entry.name), join(key + entry.name))
            //     log.info("✔ " + (Date.now() - timer)/1000 + 'second - filename: ' + entry.name + ' in key: ' + key)
            // } catch (err) {
            //     log.error(err);
            // }
            Deno.copyFile( join(dir, entry.name), join(key + entry.name))
            .then( () => {
                log.info("✔ " + (Date.now() - timer)/1000 + 'second - filename: ' + entry.name + ' in key: ' + key)
                table.push(entry.name)
                if (table.length >= (keys.length + i)){
                    log.info("\n");
                    log.info("✔ " + (Date.now() - timer)/1000 + 'second - All files is copied ' + i);
                }
            })
            .catch( err => log.critical(err))
        }
    }
});
