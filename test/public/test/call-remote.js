(function(){

function build_form(attrs) {
  attrs = $.extend({ action: '/echo', 'data-remote': 'true' }, attrs);

  $('#qunit-fixture').append($('<form />', attrs))
    .find('form').append($('<input type="text" name="user_name" value="john">'));
};

module('call-remote');

function submit(fn) {
  $('form[data-remote]')
    .bind('ajax:success', fn)
    .bind('ajax:complete', function() { start() })
    .trigger('submit');
}

asyncTest('form method is read from "method" and not from "data-method"', 1, function() {
  build_form({ method: 'post', 'data-method': 'get' });

  submit(function(e, data, status, xhr) {
    App.assert_post_request(data);
  });
});

asyncTest('form method is not read from "data-method" attribute in case of missing "method"', 1, function() {
  build_form({ 'data-method': 'put' });

  submit(function(e, data, status, xhr) {
    App.assert_get_request(data);
  });
});

asyncTest('form default method is GET', 1, function() {
  build_form();

  submit(function(e, data, status, xhr) {
    App.assert_get_request(data);
  });
});

asyncTest('form url is picked up from "action"', 1, function() {
  build_form({ method: 'post' });

  submit(function(e, data, status, xhr) {
    App.assert_request_path(data, '/echo');
  });
});

asyncTest('form url is read from "action" not "href"', 1, function() {
  build_form({ method: 'post', href: '/echo2' });

  submit(function(e, data, status, xhr) {
    App.assert_request_path(data, '/echo');
  });
});

asyncTest('prefer JS, but accept any format', 1, function() {
  build_form({ method: 'post' });

  submit(function(e, data, status, xhr) {
    var accept = data.HTTP_ACCEPT;
    // HACK to normalize header sent by jQuery 1.4.4 and below:
    accept = accept.replace('*/*, */*', '*/*');
    equal(accept, '*/*;q=0.5, text/javascript, application/javascript');
  });
});

asyncTest('accept application/json if "data-type" is json', 1, function() {
  build_form({ method: 'post', 'data-type': 'json' });

  submit(function(e, data, status, xhr) {
    equal(data.HTTP_ACCEPT, 'application/json, text/javascript, */*; q=0.01');
  });
});

})();
