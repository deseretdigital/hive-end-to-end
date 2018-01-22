import contentCreation from 'test/contentCreation';
import varnishContentCreation from 'test/varnishContentCreation';
async function runTests() {
    await contentCreation();
    // await varnishContentCreation();
}

runTests();
