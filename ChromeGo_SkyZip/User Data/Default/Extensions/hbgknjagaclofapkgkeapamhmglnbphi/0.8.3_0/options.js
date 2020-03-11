function addOptions(node, selected, values, i18nPrefix) {
  values.forEach(function(s) {
    var opt = document.createElement('option');
    if(s == selected)
      opt.setAttribute('selected', '1');

    if(i18nPrefix)
      opt.setAttribute('i18n', i18nPrefix + s);

    opt.setAttribute('value', s);

    opt.appendChild(document.createTextNode(s));
    node.appendChild(opt);
  });
}

function loadValues() {
  var fields = ['username', 'password', 'bypassRules'];
  var bgPage = chrome.extension.getBackgroundPage();

  fields.forEach(function(f) {
    document.getElementById(f).value = localStorage.getItem(f) || bgPage.defaultValues[f];
  });

  addOptions(
      document.getElementById('httpServer'),
      localStorage.getItem('httpServer') || bgPage.defaultValues.httpServer,
      bgPage.availableServers);
  addOptions(
      document.getElementById('httpsServer'),
      localStorage.getItem('httpsServer') || bgPage.defaultValues.httpsServer,
      bgPage.availableServers);
  addOptions(
      document.getElementById('mode'),
      localStorage.getItem('mode') || bgPage.defaultValues.mode,
      bgPage.availableModes, 'mode_');
}

function saveValues() {
  var fields = ['username', 'password', 'bypassRules', 'httpServer', 'httpsServer', 'mode'];

  fields.forEach(function(f) {
    localStorage.setItem(f, document.getElementById(f).value);
  });

  chrome.extension.getBackgroundPage().reloadProxy();

  document.getElementById('status').style.display = 'block';
  setTimeout(function() {
    document.getElementById('status').style.display = '';
  }, 1000);
}

function main() {
  if(!chrome.extension.getBackgroundPage().isDebug()) {
    var style = document.createElement('style');
    style.appendChild(document.createTextNode('.debug { display: none; }'));
    document.getElementsByTagName('head')[0].appendChild(style);
  }

  loadValues();
  document.getElementById('save').addEventListener('click', saveValues);
  localizePage();
}

document.addEventListener('DOMContentLoaded', function() {
  main();
});