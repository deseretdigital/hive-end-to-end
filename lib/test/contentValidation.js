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

export default async function run() {
  const random = Math.random()
    .toString(36)
    .substring(7);
  suite("Putting bad content should fail in validation step");
  const contentSentAsArray = [
    {
      id: "5a6669567cac297a46252413",
      content_type: "story",
      content_data: {
        body: {},
        sites: ["beetdiggerfan"],
        title: `End-to-end test run (PUT update ${random})`
      },
      site_content_id: 1152
    }
  ];
  await start(null, "beetdiggerfan")
    .put(`content/5a6669567cac297a46252413`)
    .send(contentSentAsArray)
    .expectValue(
      "message",
      "Object(DDM\\CMSBundle\\Document\\Content).content_data:\n    This value should not be blank. (code c1051bb4-d103-4f74-8988-acbcafc7fdc3)\n"
    )
    .expectStatus(500)
    .end()
    .then(report)
    .catch(reportErrors);
  return true;
}
