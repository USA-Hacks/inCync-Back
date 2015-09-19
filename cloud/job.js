var pubnub = {
  publish_key:'pub-c-5f5b4359-bec5-4bb4-a396-db7ccb6282ce',
  subscribe_key:'sub-c-8495b6b2-5f09-11e5-a028-0619f8945a4f'
};

var publish_cync = function(channel, message) {
  Parse.Cloud.httpRequest({
    url: 'http://pubsub.pubnub.com/publish/' +
         pubnub.publish_key   +   '/' +
         pubnub.subscribe_key + '/0/' +
         channel          + '/0/' +
         encodeURIComponent(JSON.stringify(message)),

    success: function(httpResponse) {
        console.log(httpResponse.text);
    },
    error: function(httpResponse) {
        console.error('Request failed ' + httpResponse.status);
    }
  });
}

Parse.Cloud.define("cync", function(request, response) {
  response.success("Hello world");
});
