import {
  start,
  report,
  reportErrors,
  preview,
  promiseTimeout,
  suite
} from "run";

export default async function run() {
  suite("Content creation with Varnish");
  const sendBody = {
    content_type: "story",
    content_data: {
      body: [
        {
          text: "Running an end-to-end test \n\n It's working"
        }
      ],
      sites: ["beetdiggerfan"],
      title: "End-to-end test run"
    }
  };
  const body = await start()
    .post(`content`)
    .send(sendBody)
    .expectStatus(201)
    .expectKey("data")
    .expectKey("data.id")
    .expectKey("data.site_content_id")
    .expectKey("content_profile_id")
    .end()
    .then(report)
    .then(function report(message) {
      const { request, body } = message;
      return JSON.parse(body);
    })
    .catch(reportErrors);
  await promiseTimeout(5000);
  await start()
    .get(`contentprofiles/search?cms_content_id=${body.data.id}`)
    .expectStatus(200)
    .end()
    .then(report)
    .catch(reportErrors);
  await start(true)
    .get(`content/${body.data.id}`)
    .expectStatus(200)
    .expectKey("content_data.title")
    .expectValue("content_data.title", "End-to-end test run")
    .end()
    .then(report)
    .catch(reportErrors);

  await start(true)
    .get(`content/beetdiggerfan/${body.data.site_content_id}`)
    .expectStatus(200)
    .expectKey("content_data.title")
    .expectValue("content_data.title", "End-to-end test run")
    .end()
    .then(report)
    .catch(reportErrors);
  await start()
    .put(`content/${body.data.id}`)
    .send({
      ...sendBody,
      content_data: {
        ...sendBody.content_data,
        title: "End-to-end test run (PUT update)"
      }
    })
    .expectKey("data")
    .expectKey("data.content_data.title")
    .end()
    .then(report)
    .catch(reportErrors);
  await promiseTimeout(5000);
  await start()
    .get(`content/${body.data.id}`)
    .expectStatus(200)
    .expectKey("content_data.title")
    .expectValue("content_data.title", "End-to-end test run (PUT update)")
    .end()
    .then(report)
    .catch(reportErrors);
  await start(true)
    .get(`content/${body.data.id}`)
    .expectStatus(200)
    .expectKey("content_data.title")
    .expectValue("content_data.title", "End-to-end test run (PUT update)")
    .end()
    .then(report)
    .catch(reportErrors);
  await start()
    .get(`content/beetdiggerfan/${body.data.site_content_id}`)
    .expectStatus(200)
    .expectKey("content_data.title")
    .expectValue("content_data.title", "End-to-end test run (PUT update)")
    .end()
    .then(report)
    .catch(reportErrors);
  await start(true)
    .get(`content/beetdiggerfan/${body.data.site_content_id}`)
    .expectStatus(200)
    .expectKey("content_data.title")
    .expectValue("content_data.title", "End-to-end test run (PUT update)")
    .end()
    .then(report)
    .catch(reportErrors);
  return true;
}
