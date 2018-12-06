'use strict';

const test = require('tape');
const { URL, URLSearchParams } = require('.');

const isBrowser =
    typeof window === 'object' &&
    typeof document === 'object' &&
    document.nodeType === 9;

test('relative', (t) => {
    t.plan(1);

    const url = new URL('/test');

    if (isBrowser) {
        t.is(
            url.href,
            self.location.protocol + '//' + self.location.host + '/test'
        );
    } else {
        t.is('http://localhost/test', url.href);
    }
});

test('full properties', (t) => {
    t.plan(11);

    const url = new URL(
        'https://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash'
    );

    t.is(url.hash, '#hash');
    t.is(url.host, 'sub.host.com:8080');
    t.is(url.hostname, 'sub.host.com');
    t.is(
        url.href,
        'https://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash'
    );
    t.is(url.origin, 'https://sub.host.com:8080');
    t.is(url.password, 'pass');
    t.is(url.pathname, '/p/a/t/h');
    t.is(url.port, '8080');
    t.is(url.search, '?query=string');
    t.ok(url.searchParams instanceof URLSearchParams);
    t.is(url.username, 'user');
});

test('legacy properties', (t) => {
    t.plan(3);

    const url = new URL(
        'https://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash'
    );

    t.is(url.path, '/p/a/t/h?query=string');
    t.is(url.auth, 'user:pass');
    t.is(url.query, 'query=string');
});

test('last slash', (t) => {
    t.plan(1);

    const url = new URL('https://user:pass@sub.host.com:8080');

    t.is(url.href, 'https://user:pass@sub.host.com:8080/');
});

test('throw with invalid href assign', (t) => {
    t.plan(1);
    const url = new URL('https://user:pass@sub.host.com:8080');

    if (isBrowser) {
        // browser doesn't throw but cleans the instance
        url.href = '/ll';
        t.is(url.host, '');
    } else {
        t.throws(() => {
            url.href = '/ll';
        }, Error);
    }
});
