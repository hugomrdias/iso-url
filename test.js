'use strict'

const test = require('fresh-tape')
const { URL, URLSearchParams, relative } = require('./index.js')

const isFirefox =
    typeof navigator !== 'undefined' &&
    /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent)
const isBrowser =
    typeof window === 'object' &&
    typeof document === 'object' &&
    document.nodeType === 9

test('unspecified base should not throw', (t) => {
  t.plan(1)

  if (isBrowser) {
    t.doesNotThrow(() => new URL('http://localhost'))
  } else {
    // Hack to force construction of a browser URL in Node to simulate a React Native-like environment where .location does not exist
    // @ts-ignore
    global.self = {
      URL: global.URL,
      URLSearchParams: global.URLSearchParams
    }
    /* eslint-disable-next-line global-require */
    const { URLWithLegacySupport: URL } = require('./src/url-browser')

    t.doesNotThrow(() => new URL('http://localhost'))

    // @ts-ignore
    delete global.self
  }
})

test('relative', (t) => {
  t.plan(1)

  const url = new URL('/test')

  if (isBrowser) {
    t.is(
      url.href,
      self.location.protocol + '//' + self.location.host + '/test'
    )
  } else {
    t.is('http://localhost/test', url.href)
  }
})

test('full properties', (t) => {
  t.plan(11)

  const url = new URL(
    'https://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash'
  )

  t.is(url.hash, '#hash')
  t.is(url.host, 'sub.host.com:8080')
  t.is(url.hostname, 'sub.host.com')
  t.is(
    url.href,
    'https://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash'
  )
  t.is(url.origin, 'https://sub.host.com:8080')
  t.is(url.password, 'pass')
  t.is(url.pathname, '/p/a/t/h')
  t.is(url.port, '8080')
  t.is(url.search, '?query=string')
  t.ok(url.searchParams instanceof URLSearchParams)
  t.is(url.username, 'user')
})

test('legacy properties', (t) => {
  t.plan(3)

  const url = new URL(
    'https://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash'
  )

  t.is(url.path, '/p/a/t/h?query=string')
  t.is(url.auth, 'user:pass')
  t.is(url.query, 'query=string')
})

test('last slash', (t) => {
  t.plan(1)

  const url = new URL('https://user:pass@sub.host.com:8080')

  t.is(url.href, 'https://user:pass@sub.host.com:8080/')
})

test('throw with invalid href assign', (t) => {
  t.plan(1)
  const url = new URL('https://user:pass@sub.host.com:8080')

  if (isBrowser && !isFirefox) {
    // browser doesn't throw but cleans the instance
    url.href = '/ll'
    t.ok(url.host === '' || url.host === 'localhost:3000')
  } else {
    t.throws(() => {
      url.href = '/ll'
    }, Error)
  }
})

test('format', (t) => {
  t.plan(2)

  const url = new URL('https://user:pass@sub.host.com:8080')

  t.is(url.toString(), 'https://user:pass@sub.host.com:8080/')
  t.is(url.format(), 'https://user:pass@sub.host.com:8080/')
})

test('format with options', (t) => {
  t.plan(2)

  const url = new URL('https://user:pass@sub.host.com:8080')

  t.is(url.toString(), 'https://user:pass@sub.host.com:8080/')
  t.is(url.format(), 'https://user:pass@sub.host.com:8080/')
})

test('suppport ws', (t) => {
  t.plan(2)

  const url = new URL('ws://localhost:2134')

  t.is(url.toString(), 'ws://localhost:2134/')
  t.is(url.format(), 'ws://localhost:2134/')
})

const map = {
  http: 'ws',
  https: 'wss'
}
const def = 'ws'

test('suppport ws in relative', (t) => {
  t.plan(1)

  t.is(relative('ws://localhost:2134'), 'ws://localhost:2134/')
})

test('suppport ws in relative with options', (t) => {
  t.plan(1)

  t.is(relative('ws://localhost:2134', {}, map, def), 'ws://localhost:2134/')
})

test('suppport wss in relative from an http location object', (t) => {
  t.plan(1)

  t.is(
    relative(
      'wss://localhost:4433',
      {
        host: 'localhost:3000',
        hostname: 'localhost',
        href: 'http://localhost:3000/',
        origin: 'http://localhost:3000',
        pathname: '/debug.html',
        port: '3000',
        protocol: 'http:'
      },
      map,
      def
    ),
    'wss://localhost:4433/'
  )
})

test('test handle ipv6 with brackets', (t) => {
  t.plan(1)

  t.is(relative('wss://[::1]:4002', {}, map, def), 'wss://[::1]:4002/')
})

test('map from a relative url to one for this domain', (t) => {
  const location = {
    protocol: 'http',
    host: 'foo.com',
    pathname: '/whatever',
    search: '?okay=true'
  }

  t.equal(relative('//bar.com', location, map, def), 'ws://bar.com/')
  t.equal(relative('/this', location, map, def), 'ws://foo.com/this')

  t.end()
})

test('same path works on dev and deployed', (t) => {
  t.equal(
    relative(
      '/',
      {
        protocol: 'http',
        host: 'localhost:8000'
      },
      map,
      def
    ),
    'ws://localhost:8000/'
  )
  t.equal(
    relative(
      '/',
      {
        protocol: 'http',
        host: 'server.com'
      },
      map,
      def
    ),
    'ws://server.com/'
  )
  t.equal(
    relative(
      '/',
      {
        protocol: 'https',
        host: 'server.com'
      },
      map,
      def
    ),
    'wss://server.com/'
  )

  t.end()
})

test('universal url still works', (t) => {
  const location = {
    protocol: 'http',
    host: 'localhost:8000'
  }

  t.equal(
    relative('ws://what.com/okay', location, map, def),
    'ws://what.com/okay'
  )
  t.equal(
    relative('wss://localhost/', location, map, def),
    'wss://localhost/'
  )
  t.end()
})

test('protocol defaults to not change', (t) => {
  t.equal(
    relative('/', {
      protocol: 'http',
      host: 'localhost:8000'
    }),
    'http://localhost:8000/'
  )
  t.equal(
    relative('/', {
      protocol: 'http',
      host: 'server.com'
    }),
    'http://server.com/'
  )
  t.equal(
    relative('/', {
      protocol: 'https',
      host: 'server.com'
    }),
    'https://server.com/'
  )

  t.end()
})

test('query string, if you want that!', (t) => {
  const location = {
    protocol: 'http',
    host: 'localhost:8000',
    pathname: '/foo/bar'
  }

  t.equal(
    relative('?whatever=true', location, map, def),
    'ws://localhost:8000/foo/bar?whatever=true'
  )

  t.end()
})

test.skip('same domain, different port', (t) => {
  t.equal(
    relative(
      '//:9999/okay',
      {
        protocol: 'http',
        host: 'localhost:8000',
        hostname: 'localhost'
      },
      map,
      def
    ),
    'ws://localhost:9999/okay'
  )

  t.equal(
    relative(
      '//:9999/okay',
      {
        protocol: 'http',
        host: 'server.com',
        hostname: 'server.com'
      },
      map,
      def
    ),
    'ws://server.com:9999/okay'
  )

  t.end()
})

test("don't mess with url that starts out absolute", (t) => {
  t.equal(
    relative(
      'ws://localhost:8000/',
      {
        protocol: 'http',
        host: 'localhost:8000'
      },
      map,
      def
    ),
    'ws://localhost:8000/'
  )
  t.equal(
    relative(
      'ws://localhost:8000/',
      {
        protocol: 'https',
        host: 'server.com'
      },
      map,
      def
    ),
    'ws://localhost:8000/'
  )

  t.end()
})
