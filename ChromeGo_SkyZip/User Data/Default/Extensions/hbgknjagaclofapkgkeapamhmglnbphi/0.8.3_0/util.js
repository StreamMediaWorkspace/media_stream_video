function translate(message, args) {
  return chrome.i18n.getMessage(message, args);
}

function localizePage() {
  $("[i18n]").each(function() {
    var msg = translate($(this).attr("i18n"));
    if(msg)
      $(this).html(msg);
  });
  $("[i18n_value]").each(function() {
    var msg = translate($(this).attr("i18n_value"));
    if(msg)
      $(this).val(msg);
  });
  $("[i18n_title]").each(function() {
    var msg = translate($(this).attr("i18n_title"));
    if(msg)
      $(this).attr("title", msg);
  });
  $("[i18n_attr]").each(function() {
    $(this).attr("i18n_attr_text", translate($(this).attr("i18n_attr")));
  });
}
