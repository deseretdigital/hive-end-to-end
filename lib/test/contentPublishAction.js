import hippie from 'hippie';
import getValue from 'lodash/get';
import findLastIndex from 'lodash/findLastIndex';

import { start, report, reportErrors, preview, promiseTimeout, suite } from 'run';


export default async function run() {

  suite('Content publish action');

  const postSendBody = {
    content_type: 'story',
    content_data: {
      body: [
        {
          text: 'Running an end-to-end test \n\n It\'s working'
        }
      ],
      sites: ['beetdiggerfan'],
      title: "End-to-end test run"
    }
  };


  // Post content
  const body = await start()
    .post(`content`)
    .send(postSendBody)
    .expectStatus(201)
    .expectKey('data')
    .expectKey('data.id')
    .expectKey('data.site_content_id')
    .expectKey('content_profile_id')
    .end()
    .then(report)
    .then(function report(message) {
      const { body } = message;
      return JSON.parse(body);
    })
    .catch(reportErrors)
  ;
  await promiseTimeout(500);
  // Check expected values
  await start()
    .get(`contentprofiles/search?cms_content_id=${body.data.id}`)
    .expectStatus(200)
    .end()
    .then(report)
    .catch(reportErrors)
  await start()
    .get(`content/${body.data.id}`)
    .expectStatus(200)
    .expectKey('content_data.title')
    .expectValue('content_data.title', 'End-to-end test run')
    .end()
    .then(report)
    .catch(reportErrors)
  await start()
    .get(`content/beetdiggerfan/${body.data.site_content_id}`)
    .expectStatus(200)
    .expectKey('content_data.title')
    .expectValue('content_data.title', 'End-to-end test run')
    .end()
    .then(report)
    .catch(reportErrors)


  // Update content
  const updatedBody = await start()
    .put(`content/${body.data.id}`)
    .send({
      ...body.data,
      content_data: {
        ...body.data.content_data,
        title: 'End-to-end test run (PUT action: update content)'
      }
    })
    .end()
    .then(report)
    .then(function report(message) {
      const { body } = message;
      return JSON.parse(body);
    })
    .catch(reportErrors)
  ;
  await promiseTimeout(500);
  // Check expected values
  await start()
    .get(`contentprofiles/search?cms_content_id=${body.data.id}`)
    .expectStatus(200)
    .end()
    .then(report)
    .catch(reportErrors)
  await start()
    .get(`content/${body.data.id}`)
    .expectStatus(200)
    .expectKey('content_data.title')
    .expectValue('content_data.title', 'End-to-end test run (PUT action: update content)')
    .expectKey('status')
    .expectValue('status', 'draft')
    .expect(function(res, body, next) {
      const timestampModified = getValue(body, 'timestamp_modified', null);
      const timestamps = getValue(body, 'timestamps', []);
      const lastModifiedTimestampIdx = findLastIndex(timestamps, timestamp => timestamp.type === 'modified');
      const lastModifiedTimestamp = lastModifiedTimestampIdx > -1 ? timestamps[lastModifiedTimestampIdx].timestamp : null;
      if(!timestampModified) {
        next(`Expected timestamp_modified to be set. '${timestampModified}' given.`);
      } else if(lastModifiedTimestampIdx < 0) {
        next(`Expected to find a modified timestamp in timestamps.`);
      } else if(Date.parse(lastModifiedTimestamp) !== Date.parse(timestampModified)) {
        next(`Expected last modified timestamp (${lastModifiedTimestamp}) in timestamps to be same as timestamp_modified (${timestampModified})`);
      }
      next(false);
    })
    .end()
    .then(report)
    .catch(reportErrors)
  await start()
    .get(`content/beetdiggerfan/${body.data.site_content_id}`)
    .expectStatus(200)
    .expectKey('content_data.title')
    .expectValue('content_data.title', 'End-to-end test run (PUT action: update content)')
    .end()
    .then(report)
    .catch(reportErrors)


  // Publish content
  const publishedBody = await start()
    .put(`content/${body.data.id}`)
    .qs({ action: 'publish' })
    .send({
      ...updatedBody.data,
      content_data: {
        ...updatedBody.data.content_data,
        title: 'End-to-end test run (PUT action: publish, status: live)'
      },
      'status': 'live'
    })
    .expectKey('data')
    .expectKey('data.content_data.title')
    .expectKey('data.status')
    .end()
    .then(report)
    .then(function report(message) {
      const { body } = message;
      return JSON.parse(body);
    })
    .catch(reportErrors)
  ;
  await promiseTimeout(500);
  // Check expected values
  await start()
    .get(`contentprofiles/search?cms_content_id=${body.data.id}`)
    .expectStatus(200)
    .end()
    .then(report)
    .catch(reportErrors)
  await start()
    .get(`content/${body.data.id}`)
    .expectStatus(200)
    .expectKey('content_data.title')
    .expectValue('content_data.title', 'End-to-end test run (PUT action: publish, status: live)')
    .expectKey('status')
    .expectValue('status', 'live')
    .expect(function(res, body, next) {
      const timestampPublished = getValue(body, 'timestamp_published', null);
      const timestampModified = getValue(body, 'timestamp_modified', null);
      const timestamps = getValue(body, 'timestamps', []);
      const lastPublishedTimestampIdx = findLastIndex(timestamps, timestamp => timestamp.type === 'published');
      const lastModifiedTimestampIdx = findLastIndex(timestamps, timestamp => timestamp.type === 'modified');
      const lastPublishedTimestamp = lastPublishedTimestampIdx > -1 ? timestamps[lastPublishedTimestampIdx].timestamp : null;
      const lastModifiedTimestamp = lastModifiedTimestampIdx > -1 ? timestamps[lastModifiedTimestampIdx].timestamp : null;
      if(!timestampPublished) {
        next(`Expected timestamp_published to be set. '${timestampPublished}' given.`);
      } else if(!timestampModified) {
        next(`Expected timestamp_modified to be set. '${timestampModified}' given.`);
      } else if(lastPublishedTimestampIdx < 0) {
        next(`Expected to find a published timestamp in timestamps.`);
      } else if(lastModifiedTimestampIdx < 0) {
        next(`Expected to find a modified timestamp in timestamps.`);
      } else if(Date.parse(lastPublishedTimestamp) !== Date.parse(timestampPublished)) {
        next(`Expected last published timestamp (${lastPublishedTimestamp}) in timestamps to be same as timestamp_published (${timestampPublished})`);
      } else if(Date.parse(lastModifiedTimestamp) !== Date.parse(timestampModified)) {
        next(`Expected last modified timestamp (${lastModifiedTimestamp}) in timestamps to be same as timestamp_modified (${timestampModified})`);
      }
      next(false);
    })
    .end()
    .then(report)
    .catch(reportErrors)
  await start()
    .get(`content/beetdiggerfan/${body.data.site_content_id}`)
    .expectStatus(200)
    .expectKey('content_data.title')
    .expectValue('content_data.title', 'End-to-end test run (PUT action: publish, status: live)')
    .end()
    .then(report)
    .catch(reportErrors)


  // Unpublish content
  const unpublishedBody = await start()
    .put(`content/${body.data.id}`)
    .qs({ action: 'publish' })
    .send({
      ...publishedBody.data,
      content_data: {
        ...publishedBody.data.content_data,
        title: 'End-to-end test run (PUT action: publish, status: draft)'
      },
      status: 'draft'

    })
    .expectKey('data')
    .expectKey('data.content_data.title')
    .expectKey('data.status')
    .end()
    .then(report)
    .then(function report(message) {
      const { body } = message;
      return JSON.parse(body);
    })
    .catch(reportErrors)
  ;
  await promiseTimeout(500);
  await start()
    .get(`contentprofiles/search?cms_content_id=${body.data.id}`)
    .expectStatus(200)
    .end()
    .then(report)
    .catch(reportErrors)
  await start()
    .get(`content/${body.data.id}`)
    .expectStatus(200)
    .expectKey('content_data.title')
    .expectValue('content_data.title', 'End-to-end test run (PUT action: publish, status: draft)')
    .expectKey('status')
    .expectValue('status', 'draft')
    .expect(function(res, body, next) {
      const timestampModified = getValue(body, 'timestamp_modified', null);
      const timestamps = getValue(body, 'timestamps', []);
      const lastUnpublishedTimestampIdx = findLastIndex(timestamps, timestamp => timestamp.type === 'unpublished');
      const lastUnpublishedTimestamp = lastUnpublishedTimestampIdx > -1 ? timestamps[lastUnpublishedTimestampIdx].timestamp : null;
      const lastModifiedTimestampIdx = findLastIndex(timestamps, timestamp => timestamp.type === 'modified');
      const lastModifiedTimestamp = lastModifiedTimestampIdx > -1 ? timestamps[lastModifiedTimestampIdx].timestamp : null;
      if(!timestampModified) {
        next(`Expected timestamp_modified to be set. '${timestampModified}' given.`);
      } else if(lastUnpublishedTimestampIdx < 0) {
        next(`Expected to find a published timestamp in timestamps.`);
      } else if(lastModifiedTimestampIdx < 0) {
        next(`Expected to find a modified timestamp in timestamps.`);
      } else if(Date.parse(lastUnpublishedTimestamp) !== Date.parse(timestampModified)) {
        next(`Expected last unpublished timestamp (${lastUnpublishedTimestamp}) in timestamps to be same as timestamp_modified (${timestampModified})`);
      } else if(Date.parse(lastModifiedTimestamp) !== Date.parse(timestampModified)) {
        next(`Expected last modified timestamp (${lastModifiedTimestamp}) in timestamps to be same as timestamp_modified (${timestampModified})`);
      }
      next(false);
    })
    .end()
    .then(report)
    .catch(reportErrors)
  await start()
    .get(`content/beetdiggerfan/${body.data.site_content_id}`)
    .expectStatus(200)
    .expectKey('content_data.title')
    .expectValue('content_data.title', 'End-to-end test run (PUT action: publish, status: draft)')
    .end()
    .then(report)
    .catch(reportErrors)


    // Delete content
    const deletedBody = await start()
      .put(`content/${body.data.id}`)
      .qs({ action: 'publish' })
      .send({
        ...publishedBody.data,
        content_data: {
          ...publishedBody.data.content_data,
          title: 'End-to-end test run (PUT action: publish, status: deleted)'
        },
        status: 'deleted'

      })
      .expectKey('data')
      .expectKey('data.content_data.title')
      .expectKey('data.status')
      .end()
      .then(report)
      .then(function report(message) {
        const { body } = message;
        return JSON.parse(body);
      })
      .catch(reportErrors)
    ;
    await promiseTimeout(500);
    await start()
      .get(`contentprofiles/search?cms_content_id=${body.data.id}`)
      .expectStatus(200)
      .end()
      .then(report)
      .catch(reportErrors)
    await start()
      .get(`content/${body.data.id}`)
      .expectStatus(200)
      .expectKey('content_data.title')
      .expectValue('content_data.title', 'End-to-end test run (PUT action: publish, status: deleted)')
      .expectKey('status')
      .expectValue('status', 'deleted')
      .expect(function(res, body, next) {
        const timestampModified = getValue(body, 'timestamp_modified', null);
        const timestamps = getValue(body, 'timestamps', []);
        const lastUnpublishedTimestampIdx = findLastIndex(timestamps, timestamp => timestamp.type === 'unpublished');
        const lastUnpublishedTimestamp = lastUnpublishedTimestampIdx > -1 ? timestamps[lastUnpublishedTimestampIdx].timestamp : null;
        const lastModifiedTimestampIdx = findLastIndex(timestamps, timestamp => timestamp.type === 'modified');
        const lastModifiedTimestamp = lastModifiedTimestampIdx > -1 ? timestamps[lastModifiedTimestampIdx].timestamp : null;
        if(!timestampModified) {
          next(`Expected timestamp_modified to be set. '${timestampModified}' given.`);
        } else if(lastUnpublishedTimestampIdx < 0) {
          next(`Expected to find a published timestamp in timestamps.`);
        } else if(lastModifiedTimestampIdx < 0) {
          next(`Expected to find a modified timestamp in timestamps.`);
        } else if(Date.parse(lastUnpublishedTimestamp) !== Date.parse(timestampModified)) {
          next(`Expected last unpublished timestamp (${lastUnpublishedTimestamp}) in timestamps to be same as timestamp_modified (${timestampModified})`);
        } else if(Date.parse(lastModifiedTimestamp) !== Date.parse(timestampModified)) {
          next(`Expected last modified timestamp (${lastModifiedTimestamp}) in timestamps to be same as timestamp_modified (${timestampModified})`);
        }
        next(false);
      })
      .end()
      .then(report)
      .catch(reportErrors)
    await start()
      .get(`content/beetdiggerfan/${body.data.site_content_id}`)
      .expectStatus(404)
      .end()
      .then(report)
      .catch(reportErrors)

  return true;
}
