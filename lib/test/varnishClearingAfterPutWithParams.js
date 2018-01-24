import { start, report, logErrors, reportErrors, preview, promiseTimeout, suite, retry } from 'run';

export default async function run() {
    suite('Content updating w/ publish action, with Varnish');
    const random = Math.random().toString(36).substring(7);
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
    await start()
        .put(`content/${body.id}?action=publish&_import=true&_parseInlines=false`)
        .send(body)
        .expectStatus(200)
        .expectKey('data')
        .expectKey('data.content_data.title')
        .end()
        .then(report)
        .catch(reportErrors)
    await promiseTimeout(10000);
    await start()
        .get(`content/${body.id}`)
        .expectStatus(200)
        .expectKey('content_data.title')
        .expectValue('content_data.title', body.content_data.title)
        .end()
        .then(report)
        .catch(reportErrors);
    await start('http://varnish.hive.pub/api/') // varnish
        .get(`content/${body.id}`)
        .expectStatus(200)
        .expectKey('content_data.title')
        .expectValue('content_data.title', body.content_data.title)
        .end()
        .then(report)
        .catch(logErrors)
    await start('https://varnish.hive.pub/api/') // varnish
        .get(`content/${body.id}`)
        .expectStatus(200)
        .expectKey('content_data.title')
        .expectValue('content_data.title', body.content_data.title)
        .end()
        .then(report)
        .catch(logErrors)
    await start('https://varnish.hive.pub/api/') // varnish
        .get(`content/${body.id}?_loadrelated=true&_shortcodes=true`)
        .expectStatus(200)
        .expectKey('content_data.title')
        .expectValue('content_data.title', body.content_data.title)
        .end()
        .then(report)
        .catch(logErrors)
    await start('http://varnish-secondary01.hive.pub/api/') // varnish
        .get(`content/${body.id}`)
        .expectStatus(200)
        .expectKey('content_data.title')
        .expectValue('content_data.title', body.content_data.title)
        .end()
        .then(report)
        .catch(logErrors)
    await start('http://varnish-secondary02.hive.pub/api/') // varnish
        .get(`content/${body.id}`)
        .expectStatus(200)
        .expectKey('content_data.title')
        .expectValue('content_data.title', body.content_data.title)
        .end()
        .then(report)
        .catch(logErrors)
    await retry(async () => {
        await start()
            .get(`content/beetdiggerfan/${body.site_content_id}?_loadrelated=true&_shortcodes=true`)
            .expectStatus(200)
            .expectKey('content_data.title')
            .expectValue('content_data.title', body.content_data.title)
            .end()
            .then(report)
            .catch(logErrors)
        await start('http://varnish.hive.pub/api/') // varnish
            .get(`content/beetdiggerfan/${body.site_content_id}?_loadrelated=true&_shortcodes=true`)
            .expectStatus(200)
            .expectKey('content_data.title')
            .expectValue('content_data.title', body.content_data.title)
            .end()
            .then(report)
            .catch(logErrors)
        await start('https://varnish.hive.pub/api/') // varnish
            .get(`content/beetdiggerfan/${body.site_content_id}?_loadrelated=true&_shortcodes=true`)
            .expectStatus(200)
            .expectKey('content_data.title')
            .expectValue('content_data.title', body.content_data.title)
            .end()
            .then(report)
            .catch(logErrors)
    })
    return true;
}
