import hippie from "hippie";

import {
  start,
  report,
  logErrors,
  reportErrors,
  preview,
  promiseTimeout,
  suite
} from "run";
//
// const h = start()
//     .get(`/api/contentprofiles`)
//     .expectStatus(200)
//     .expectKey('results');

// end(h);

export default async function run() {
  const random = Math.random()
    .toString(36)
    .substring(7);
  suite("Content Profiles - Search");
  await start(null, "utah")
    .get(`contentprofiles/search`)
    .expectStatus(200)
    .expectKey("0")
    .expectKey("0.id")
    .expectKey("39")
    .expectKey("39.id")
    .end()
    .then(report)
    .catch(reportErrors);
  return true;
}
