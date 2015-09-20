Parse.Cloud.define("start_presentation", function(request, response) {
  var Presentation = Parse.Object.extend("Presentation");
  var query = new Parse.Query(Presentation);
  query.get(request.params.id, {
    success: function(presentation) {
      // Add PubNub code, and define the times for this presentation

      var settings = presentation.get("settings");
      var start = new Date();
      var times = [];
      for(var i = 0; i < settings.length; i++) {
        times.push({
          time: new Date(start.getTime() + (settings[i])*1000),
          visited: false
        });
      }

      presentation.set("times", times);
      presentation.set("started", true);

      presentation.save(null, {
        success: function(presentation) {
          publish_cync(presentation.id.toString(), {type: "start", presentation: JSON.stringify(presentation)});
          response.success(presentation.id);
        },
        error: function(object, error) {
          response.error(error.message);
        }
      });
    },
    error: function(object, error) {
      response.error(error.message);
    }
  });
});

Parse.Cloud.define("update_presentation", function(request, response) {
  var Presentation = Parse.Object.extend("Presentation");
  var query = new Parse.Query(Presentation);
  query.get(request.params.id, {
    success: function(presentation) {
      var settings = presentation.set("settings", request.params.settings);
      presentation.save(null, {
        success: function(presentation) {
          response.success(presentation.id);
        },
        error: function(object, error) {
          response.error(error.message);
        }
      });
    },
    error: function(object, error) {
      response.error(error.message);
    }
  });
});

Parse.Cloud.define("get_presentation", function(request, response) {
  var Presentation = Parse.Object.extend("Presentation");
  var query = new Parse.Query(Presentation);
  query.equalTo("name", request.params.name);
  query.find({
    success: function(results) {
      var result = results[0]
      response.success(JSON.stringify(result));
    },
    error: function(error) { response.error(); }
  });
});

Parse.Cloud.define("create_presentation", function(request, response) {
  var Presentation = Parse.Object.extend("Presentation");
  var presentation = new Presentation();

  if(!request.params.name || !request.params.settings) {
    response.error("Please supply a name and settings");
  }
  else {
    presentation.set("name", request.params.name);
    presentation.set("settings", request.params.settings);
    presentation.set("times", []);
    presentation.set("started", false);

    presentation.save(null, {
      success: function(presentation) {
        response.success(presentation.id);
      },
      error: function(object, error) {
        response.error(error.message);
      }
    });
  }
})

Parse.Cloud.define("validate", function(request, response) {
  var Presentation = Parse.Object.extend("Presentation");
  var query = new Parse.Query(Presentation);
  query.equalTo("name", request.params.name);
  query.find({
    success: function(results) {
      var found = false;
      if(results.length) found = true;
      response.success(found);
    },
    error: function(error) { response.error(); }
  });
});














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
  var query = new Parse.Query("Presentation");
  query.equalTo("started", true);

  query.find({
    success: function(results) {
      for(var i = 0; i < results.length; i++) {
        var now = new Date();
        var result = results[i];
        var times = result.get("times");
        var id = result.id;

        for(var j = 0; j < times.length; j++) {
          var time = times[j];
          if(time.time <= now && !time.visited) {
            console.log("Telling " + id.toString() + " to vibrate!");
            publish_cync(id.toString(), {type: "vibrate"});
            time.visited = true;
            if(j === (times.length - 1)) {
              result.set("started", false);
              result.set("times", []);
            }
            result.save();
          }
        }
      }

      response.success();
    },
    error: function(error) {
      console.log(error.message);
      response.error();
    }
  });
});
