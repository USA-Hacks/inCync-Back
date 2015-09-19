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
  query.get(request.params.id, {
    success: function(presentation) {
      response.success(JSON.stringify(presentation));
    },
    error: function(object, error) {
      response.error(error.message);
    }
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
