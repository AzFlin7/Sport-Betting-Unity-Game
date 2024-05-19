import ReactDOMServer from 'react-dom/server';
import { Resolver } from 'found-relay';
import { Provider } from 'react-redux';
import { RouterProvider } from 'found/lib/server';
import RelayServerSSR from 'react-relay-network-modern-ssr/lib/server';
import serialize from 'serialize-javascript';
import { Actions as FarceActions, ServerProtocol } from 'farce';
import { getStoreRenderArgs, RedirectException } from 'found';
import React from 'react';
import createRelayEnvironment from './createRelayEnvironment';
import configureStore from './store/configureStore';
import { render } from './router';
import App from './components/App';

import Helmet from 'react-helmet';

import JssProvider from 'react-jss/lib/JssProvider';
import { SheetsRegistry } from 'jss';
import {
  MuiThemeProvider,
  createMuiTheme,
  createGenerateClassName,
} from '@material-ui/core/styles';

function renderPageToString(html, css, state, relay, meta) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          ${meta.title.toString()}
          ${meta.meta.toString()}
          <link rel="stylesheet" href="/css/reset.css">
          <link rel="stylesheet" href="/css/base.css">
          <link rel="stylesheet" href="/css/styles.css" media="none" onload="if(media!='all')media='all'">
          <link rel="stylesheet" href="/css/font-awesome.min.css" media="none" onload="if(media!='all')media='all'">
          <link rel="stylesheet" href="/css/ReactCrop.css" media="none" onload="if(media!='all')media='all'">
          <link rel="stylesheet" type="text/css" charset="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" media="none" onload="if(media!='all')media='all'" />
          <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" media="none" onload="if(media!='all')media='all'" />
          <link rel="stylesheet" type="text/css" href="https://rawcdn.githack.com/nadbm/react-datasheet/dc54882fc0fd2aabc048e36281f1075929f172b0/lib/react-datasheet.css" media="none" onload="if(media!='all')media='all'" />
          <link rel="shortcut icon" type="image/ico" href="/favicon.ico" />
          <link rel="icon" type="image/x-icon" href="/favicon.ico">
          <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet">
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
          <script async src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBgGYouaXhHOdcQh_xavWcixXZTVdAsDBw&libraries=places"></script>
          <!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TJMPCMW');</script><!-- End Google Tag Manager -->
          <!-- Facebook Pixel Code --><script>  !function(f,b,e,v,n,t,s)  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?  n.callMethod.apply(n,arguments):n.queue.push(arguments)};  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';  n.queue=[];t=b.createElement(e);t.async=!0;  t.src=v;s=b.getElementsByTagName(e)[0];  s.parentNode.insertBefore(t,s)}(window, document,'script',  'https://connect.facebook.net/en_US/fbevents.js');  fbq('init', '1261089323989181');  fbq('track', 'PageView');</script><noscript><img height="1" width="1" style="display:none"  src="https://www.facebook.com/tr?id=1261089323989181&ev=PageView&noscript=1"/></noscript><!-- End Facebook Pixel Code -->
      </head>
      <body>
        <!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TJMPCMW"height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->
        <div id="root">${html}</div>
        <style id="jss-server-side">${css}</style>
        <script>
          window.__PRELOADED_STATE__ = ${serialize(state, { isJSON: true })};
          window.__RELAY_PAYLOADS__ = ${serialize(relay, { isJSON: true })};
        </script>
        <script src="/bundle.js"></script>
        <script>
        (function (i, s, o, g, r, a, m) {
          i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
          }, i[r].l = 1 * new Date(); a = s.createElement(o),
            m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        ga('create', 'UA-86793644-1', 'auto');
        ga('send', 'pageview');
      </script>
      </body>
    </html>
  `;
}

export default async (req, res) => {
  const store = configureStore(new ServerProtocol(req.url));
  store.dispatch(FarceActions.init());
  const matchContext = { store };
  const relaySsr = new RelayServerSSR();
  const sheetsRegistry = new SheetsRegistry();
  const sheetsManager = new Map();
  // theme & generateClassName also in components/App.js
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#5EA1D9',
        contrastText: '#fff',
      },
      secondary: {
        main: '#A6A6A6',
        contrastText: '#fff',
      },
    },
    typography: { useNextVariants: true },
  });
  const generateClassName = createGenerateClassName();
  let renderArgs;

  try {
    const resolver = new Resolver(createRelayEnvironment);
    renderArgs = await getStoreRenderArgs({
      store,
      matchContext,
      resolver,
    });
  } catch (e) {
    if (e instanceof RedirectException) {
      res.redirect(302, store.farce.createHref(e.location));
      return;
    }
    throw e;
  }
  const relayData = await createRelayEnvironment.cache;
  const html = ReactDOMServer.renderToString(
    <JssProvider
      registry={sheetsRegistry}
      generateClassName={generateClassName}
    >
      <MuiThemeProvider theme={theme} sheetsManager={sheetsManager}>
        <Provider store={store}>
          <RouterProvider router={renderArgs.router}>
            <App radiumConfig={{ userAgent: req.headers['user-agent'] }}>
              {render(renderArgs)}
            </App>
          </RouterProvider>
        </Provider>
      </MuiThemeProvider>
    </JssProvider>,
  );
  const css = sheetsRegistry.toString();
  const meta = Helmet.rewind();
  res
    .status(renderArgs.error ? renderArgs.error.status : 200)
    .send(renderPageToString(html, css, store.getState(), relayData, meta));
};
