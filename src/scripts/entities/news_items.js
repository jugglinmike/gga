define(["app"], function(GeneralAssemblyApp) {
  "use strict";

  GeneralAssemblyApp.module("Entities", function(Entities, GeneralAssemblyApp, Backbone){
    Entities.NewsItem = Backbone.Model.extend();
    Entities.NewsItemsCollection = Backbone.Collection.extend({
      model: Entities.NewsItems
    });
  });
  return GeneralAssemblyApp.Entities.NewsItems;
});
