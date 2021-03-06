/*
 * Copyright (C) 2013 Google Inc., authors, and contributors <see AUTHORS file>
 * Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 * Created By:
 * Maintained By:
 */

//= require can.jquery-all
//= require models/cacheable

(function(ns, can) {

can.Model.Cacheable("CMS.Models.Person", {
   root_object : "person"
   , root_collection : "people"
   , findAll : "GET /api/people"
   , findOne : "GET /api/people/{id}"
   , create : "POST /api/people"
   , update : "PUT /api/people/{id}"
   , destroy : "DELETE /api/people/{id}"
   , search : function(request, response) {
        return $.ajax({
            type : "get"
            , url : "/api/people"
            , dataType : "json"
            , data : {s : request.term}
            , success : function(data) {
                response($.map( data, function( item ) {
                  return can.extend({}, item.person, {
                    label: item.person.email
                    , value: item.person.id
                  });
                }));
            }
        });
    }
    , attributes : {
        modified_by : "CMS.Models.Person.stub"
      , object_people : "CMS.Models.ObjectPerson.stubs"
      , language : "CMS.Models.Option.stub"
    }
    , defaults : {
      name : ""
      , email : ""
    }
    , findInCacheByEmail : function(email) {
      var result = null, that = this;
      can.each(Object.keys(this.cache || {}), function(k) {
        if(that.cache[k].email === email) {
          result = that.cache[k];
          return false;
        }
      });
      return result;
    }
  , tree_view_options: {
        show_view: GGRC.mustache_path + "/people/tree.mustache"
        , footer_view : GGRC.mustache_path + "/people/tree_footer.mustache"
    }
  , init : function() {
    this._super.apply(this, arguments);
    //H/T to Sebastian Porto for the email validation regex
    this.validatePresenceOf("email");
    this.validateFormatOf("email", /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
  }
}, {
  display_name : function() {
    return this.email;
  }
});

})(this, can);
