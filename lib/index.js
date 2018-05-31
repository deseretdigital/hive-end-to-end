import { promisify } from "util";
import { readdir } from "fs";
import { prompt } from "promptly";
import path from "path";
import config from "../config.dev.json";

import {
  yellow,
  bgYellow,
  blue,
  bgBlue,
  green,
  bgGreen,
  red,
  bgRed,
  white,
  whiteBright,
  bgWhite,
  black,
  bgBlack,
  bgBlackBright
} from "chalk";

const readdirPromise = promisify(readdir);

const mode = typeof process.argv[2] !== "undefined" ? "single" : "continuous";

async function askAboutTests() {
  console.log(whiteBright(bgBlack(` Hive end-to-end test runner `)));
  console.log(
    whiteBright(bgBlue(` Running against ${config.base} `.padRight(120)))
  );
  console.log(
    whiteBright(
      bgBlue(` Running Varnish against ${config.base_varnish} `.padRight(120))
    )
  );
  const paths = await readdirPromise(path.resolve(__dirname, "test"));
  // ask which test you'd like to run
  paths.forEach((path, idx) => {
    console.log(`${blue(idx.toString().padLeft(3))}: ${path}`);
  });
  let testToRun;
  if (mode === "single") {
    testToRun = paths.indexOf(process.argv[2]);
  }
  if (testToRun === -1) {
    testToRun = await prompt(
      whiteBright(bgGreen(" Which test would you like to run? "))
    );
  }
  if (testToRun !== "") {
    console.log(
      whiteBright(bgGreen(` Running ${paths[testToRun]}`.padRight(131)))
    );
    try {
      runTests(paths[testToRun]);
    } catch (e) {
      console.error(e);
    }
  }
}
async function runTests(filename) {
  // await contentCreation();
  const test = require(`test/${filename}`).default;
  try {
    await test();
  } catch (e) {
    console.log(e);
    if (mode === "single") {
      process.exit(1);
    }
  }
  console.log(`\n\n`);
  delete require.cache[require.resolve(`test/${filename}`)];
  if (mode === "single") {
    process.exit();
  }
  await askAboutTests();
}

// runTests();

askAboutTests();
