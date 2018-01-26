import hippie from 'hippie';

import { start, report, logErrors, preview, promiseTimeout, suite } from 'run';
//
// const h = start()
//     .get(`/api/contentprofiles`)
//     .expectStatus(200)
//     .expectKey('results');

// end(h);


export default async function run() {
const random = Math.random().toString(36).substring(7);
    suite('Getting and putting content cross-site-access should fail');
    const body = {
        id: "5a6669567cac297a46252413",
        content_type: 'story',
        content_data: {
            body: [
                {
                    text: 'Running an end-to-end test \n\n It\'s working'
                }
            ],
            sites: ['beetdiggerfan'],
            title: `End-to-end test run (PUT update ${random})`
        },
        site_content_id: 1152
    };
    await start(null, 'rslpride')
        .get(`content/${body.id}`)
        .expectStatus(403)
        .expectBody({
            status: 'failure',
            message: 'You do not have access to this content'
        })
        .end()
        .then(report)
        .catch(logErrors);
    await start(null, 'rslpride')
        .put(`content/${body.id}`)
        .send(body)
        .expectBody({
            status: 'failure',
            message: 'You do not have access to this content'
        })
        .expectStatus(403)
        .end()
        .then(report)
        .catch(logErrors)
    await start(null, 'rslpride')
        .post(`content`)
        .send(body)
        .expectBody({
            status: 'failure',
            message: 'You do not have access to this content'
        })
        .expectStatus(403)
        .end()
        .then(report)
        .catch(logErrors)
    return true;
}
