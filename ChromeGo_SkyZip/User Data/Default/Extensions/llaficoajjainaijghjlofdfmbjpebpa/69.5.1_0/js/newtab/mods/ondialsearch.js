(function() {
  function BlinkingPlaceholder(elem, text) {
    this.elem = elem;
    this.text = text;
    this.interval = null;
    this.intervalMs = 500;
    this.withCaret = false;
  }
  BlinkingPlaceholder.prototype.changePlaceholder = function() {
    var text = this.text;
    if(this.withCaret) {
      text += " |";
    }
    this.withCaret = !this.withCaret;
    this.elem.setAttribute("placeholder", text);
  };
  BlinkingPlaceholder.prototype.start = function() {
    this.stop();
    this.withCaret = false;
    this.changePlaceholder();
    this.interval = setInterval(this.changePlaceholder.bind(this), this.intervalMs);
  };
  BlinkingPlaceholder.prototype.stop = function() {
    try {
      this.elem.setAttribute("placeholder", "");
      clearInterval(this.interval);
    }
    catch(ex) {
    }
  };
  const INPUT_HEIGHT_RATIO = 0.15;
  var sitesSearchUrlPromises = {};
  function getSiteSearchUrl(site, cb) {
    cb = cb || function() {};
    if(!sitesSearchUrlPromises[site]) {
      sitesSearchUrlPromises[site] = new Promise(function(resolve, reject) {
        OnDialSearch.getSearchURL(site, function(err, url) {
          if(err) {
            return reject(err);
          }
          resolve(url)
        });
      });
    }
    sitesSearchUrlPromises[site].then(function(url) {
      cb(null, url);
    });
  }
  fvdSpeedDial.SpeedDial.onBuildCompleted.addListener(function() {
    if(!_b(fvdSpeedDial.Prefs.get("sd.enable_ondial_search"))) {
      return;
    }
    var dials = document.querySelectorAll("#cellsContainer .newtabCell");
    dials = [].slice.call(dials);
    dials.forEach(function(dialElem) {
      var url = dialElem.getAttribute("data-url");
      var displayUrl = dialElem.getAttribute("data-display-url");
      if(displayUrl) {
        url = displayUrl;
      }
      if(!url) {
        return;
      }
      var search = window.OnDialSearch.getSearchForUrl(url);
      if(search && search.site === "booking") {
        // disable search on booking in favor of booking popup widget
        search = null;
      }
      if(search) {
        function empty() {
          form.classList.remove("has-input");
          input.value = "";
        }
        var dialElemBody = dialElem.querySelector(".body");
        if(!dialElemBody.querySelector(".on-dial-search-form")) {
          var form = document.createElement("div");
          form.className = "on-dial-search-form";
          var input = document.createElement("input");
          input.setAttribute("type", "text");
          input.className = "on-dial-search-input"
          form.appendChild(input);
          dialElemBody.appendChild(form);
          var blinkingPlaceholder = new BlinkingPlaceholder(input, _("newtab_ondialsearch_placeholder"));

          input.addEventListener("mousedown", function(event) {
            event.stopPropagation();
          }, false);
          input.addEventListener("mouseup", function(event) {
            event.stopPropagation();
          }, false);
          input.addEventListener("click", function(event) {
            event.stopPropagation();
          }, false);
          input.addEventListener("focus", function(event) {
            blinkingPlaceholder.stop();
            var formsWithText = document.querySelectorAll(".on-dial-search-form.has-input");
            for(var i = 0; i != formsWithText.length; i++) {
              var formWithText = formsWithText[i];
              if(formWithText === form) {
                continue;
              }
              formWithText.classList.remove("has-input");
              formWithText.querySelector("input").value = "";
            }
            form.classList.add("has-input");
          }, false);
          input.addEventListener("blur", function() {
            if(!input.value.trim()) {
              form.classList.remove("has-input");
            }
          });
          dialElem.addEventListener("mouseover", function() {
            if(document.activeElement !== input) {
              blinkingPlaceholder.start();
            }
            if(!sitesSearchUrlPromises[search.site]) {
              getSiteSearchUrl(search.site);
            }
          }, false);
          dialElem.addEventListener("mouseout", function() {
            blinkingPlaceholder.stop();
          }, false);
          input.addEventListener("keydown", function(event) {
            if(event.keyCode === 13) {
              getSiteSearchUrl(search.site, function(err, url) {
                if(err) {
                  return console.error("Fail to get site search url", err);
                }
                var value = input.value.trim();
                if(!value) {
                  return;
                }
                url = url.replace(/{query}/g, encodeURIComponent(value));
                document.location = url;
              });
            }
            else if(event.keyCode === 27) {
              input.value = "";
              form.classList.remove("has-input");
            }
          }, false);
          input.addEventListener("input", function() {
            if(input.value.length) {
              form.classList.add("has-input");
            }
            else {
              form.classList.remove("has-input");
            }
          }, false);
          var inputHeight = Math.round(dialElem.getAttribute("height") * INPUT_HEIGHT_RATIO);
          var fontSize = inputHeight - 6;
          input.style.height = inputHeight + "px";
          input.style.fontSize = fontSize + "px";
        }
      }
      else {

      }
    });
  });
})();
