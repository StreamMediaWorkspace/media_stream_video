var availableServers = [
  'default.px.skyzip.de',
  '3.px.skyzip.de',
  '4.px.skyzip.de'
];

var availableModes = [
  'none',
  'moderate',
  'medium',
  'highrrt',
  'extreme'
];

var defaultValues = {
  username: '',
  password: '',
  bypassRules: '<local>\n10.0.0.0/8\n172.16.0.0/12\n192.168.0.0/16\nfc00::/7',
  httpServer: availableServers[0],
  httpsServer: availableServers[0],
  mode: availableModes[0]
};

var parseHostPort = function(value) {
  var tuple = value.split(':');
  return {
    host: tuple[0],
    port: +tuple[1] || 443
  }
};

var setProxy = function() {
  var values = {};
  for(var k in defaultValues) {
    values[k] = localStorage.getItem(k) || defaultValues[k];
  }
  var bypassList = values.bypassRules.split('\n');

  var httpServer = parseHostPort(values.httpServer),
      httpsServer = parseHostPort(values.httpsServer);

  chrome.proxy.settings.set({
    value: {
      mode: 'fixed_servers',
      rules: {
        proxyForHttp:{
          scheme: 'https',
          host: httpServer.host,
          port: httpServer.port
        },
        proxyForHttps: {
          scheme: 'https',
          host: httpsServer.host,
          port: httpsServer.port
        },
        bypassList: bypassList
      }
    },
    scope: 'regular'
  });

  /*
  var redirectUrl = chrome.runtime.getURL('authentication_required.html');
  var lastRequestId;*/
  var callbacks = {
    onBeforeSendHeaders: function(details) {
      return {requestHeaders: details.requestHeaders.concat(headers)};
    }
/*    onAuthRequired: function(details, callback) {
      if(details.requestId == lastRequestId) {
        if(details.tabId != -1 && details.type == 'main_frame') {
          console.log('redirect', details);
          chrome.tabs.update(details.tabId, {
            url: redirectUrl
          });
        }

        callback({cancel: true});
      } else {
        lastRequestId = details.requestId;

        if(details && details.isProxy) {
          console.log(details);
          callback({
            authCredentials: {
              username: values.username,
              password: values.password
            }
          });
        } else {
          callback();
        }
      }
    }*/
  };

  var headers = [];

  if(values.mode) {
    headers.push({
      name: 'X-Skyzip-Mode',
      value: values.mode
    });
  }

  chrome.webRequest.onBeforeSendHeaders.addListener(
      callbacks.onBeforeSendHeaders,
      {urls: ['http://*/*']},
      ['requestHeaders', 'blocking']
  );

  //chrome.webRequest.onAuthRequired.addListener(
  //    callbacks.onAuthRequired,
  //    {urls: ['http://*/*', 'https://*/*']},
  //    ['asyncBlocking']
  //);

  unsetProxyStable = function() {
    chrome.webRequest.onBeforeSendHeaders.removeListener(callbacks.onBeforeSendHeaders);
    //chrome.webRequest.onAuthRequired.removeListener(callbacks.onAuthRequired);
  };

  localStorage.setItem('isSetProxy', 1);
  chrome.browserAction.setIcon({path: 'resources/on.png'});
  chrome.browserAction.setTitle({title: translate('state_on')});
};

var unsetProxy = function() {
  chrome.proxy.settings.set({
    value: {mode: 'system'},
    scope: 'regular'
  });

  unsetProxyStable();

  localStorage.setItem('isSetProxy', 0);
  chrome.browserAction.setIcon({path: 'resources/off.png'});
  chrome.browserAction.setTitle({title: translate('state_off')});
};

var unsetProxyStable = function() {
};

var reloadProxy = function() {
  if(localStorage.getItem('isSetProxy') == 1) {
    unsetProxy();
    setProxy();
  }
};

var isDebug = function() {
  return !!localStorage.getItem('debug');
};

chrome.browserAction.onClicked.addListener(function() {
  //Toggle proxy on button clicked
  localStorage.getItem('isSetProxy') == 1 ? unsetProxy() : setProxy();
});

if(localStorage.getItem('isSetProxy') == 1) {
  setProxy();
}

chrome.runtime.onInstalled.addListener(function(details) {
  if(details.reason == 'install')
    setProxy();
  else
    reloadProxy();
});
