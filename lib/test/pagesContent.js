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
  suite("Pages - Content is loaded");
  const id = "542598cc3c0330892b90aaa3"; // utah.com home page
  await start(null, "utah")
    .get(`pages/${id}`)
    .expectStatus(200)
    .expectKey("status")
    .expectKey("page_data.containers")
    .expectKey("page_data.containers.1")
    .expectKey("page_data.containers.1.data.contentprofiles")
    .expectKey("page_data.containers.1.content")
    .expectKey("page_data.containers.1.content.0")
    .expectKey("page_data.containers.1.content.0.id")
    .expectKey("page_data.containers.1.content.0.content_type")
    .expectKey("page_data.containers.1.content.0.content_data")
    .expectKey("page_data.containers.6.content.0.id")
    .expectKey("page_data.containers.6.content.1.id")
    .expectKey("page_data.containers.6.content.2.id")
    .expectKey("page_data.containers.6.content.3.id")
    .end()
    .then(report)
    .catch(reportErrors);
  return true;
}
