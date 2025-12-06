const http = require('http');

function checkUrl(url) {
    console.log(`Checking: ${url}`);
    http.get(url, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        if (res.statusCode >= 300 && res.statusCode < 400) {
            console.log(`Redirect to: ${res.headers.location}`);
            if (res.headers.location) {
                // Handle relative redirects
                let nextUrl = res.headers.location;
                if (nextUrl.startsWith('/')) {
                    nextUrl = `http://localhost:3000${nextUrl}`;
                }
                checkUrl(nextUrl);
            }
        }
    }).on('error', (e) => {
        console.error(`Error: ${e.message}`);
    });
}

console.log('--- Test 1: Brussels Hub ---');
checkUrl('http://localhost:3000/fr/reparation/smartphone/bruxelles');

setTimeout(() => {
    console.log('\n--- Test 2: Store Loop ---');
    checkUrl('http://localhost:3000/fr/magasins/anderlecht');
}, 2000);
