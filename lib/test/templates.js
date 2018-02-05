import hippie from 'hippie';

import { start, report, logErrors, reportErrors, preview, promiseTimeout, suite } from 'run';

export default async function run() {
    const random = Math.random().toString(36).substring(7);
    suite('Putting bad content should fail in validation step');
    const sendBody = {
        data: {
            "test_key_here": random
        },
        path: `testPath/${random}`,
        site: 'beetdiggerfan'
    };
    const body = await start()
        .post(`templates`)
        .send(sendBody)
        .expectStatus(201)
        .expectKey('status')
        .expectValue(
            'status',
            'success'
        )
        .expectKey('id')
        .end()
        .then(report)
        .then(function report(message) {
            const { request, body } = message;
            return JSON.parse(body);
        })
        .catch(reportErrors)
    ;
    await start()
        .put(`templates/${body.id}`)
        .send({
            id: body.id,
            data: {
                "new_test_key_here": "notRandom"
            },
            path: sendBody.path,
            site: sendBody.site
        })
        .expectKey('status')
        .expectValue(
            'status',
            'success'
        )
        .expectKey('id')
        .expectKey('data')
        .expectKey('data.data')
        .expectKey('data.data.new_test_key_here')
        .end()
        .then(report)
        .catch(reportErrors)
    return true;
}
