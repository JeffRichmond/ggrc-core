/*
 * Copyright (C) 2013 Google Inc., authors, and contributors <see AUTHORS file>
 * Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 * Created By:
 * Maintained By:
 */

//require can.jquery-all

(function(can, $) {
  function with_params(href, params) {
    if (href.charAt(href.length - 1) === '?')
      return href + params;
    else if (href.indexOf('?') > 0)
      return href + '&' + params;
    else
      return href + '?' + params;
  }

  function get_attr(el, attrnames) {
    var attrval = null
    , $el = $(el);
    can.each(can.makeArray(attrnames), function(attrname) {
      var a = $el.attr(attrname);
      if(a) {
        attrval = a;
        return false;
      }
    });
    return attrval;
  }

CMS.Controllers.Filterable("CMS.Controllers.QuickSearch", {
  defaults : {
    list_view : GGRC.mustache_path + "/dashboard/object_list.mustache"
    , spin : true
    , tab_selector : 'ul.nav-tabs:first > li > a'
    , tab_href_attr : [ "href", "data-tab-href" ]
    , tab_target_attr : [ "data-tab-target", "href" ]
    , tab_model_attr : [ "data-model", "data-object-singular" ]
    , limit : null
  }
}, {

  setup : function(el, opts) {
    this._super && this._super.apply(this, arguments);
    if(!opts.observer) {
      opts.observer = new can.Observe();
    }
  }

  , init : function(opts) {
    var that = this;
    var $tabs = this.element.find(this.options.tab_selector);
    $tabs.each(function(i, tab) {
      var $tab = $(tab)
      , href = get_attr($tab, that.options.tab_href_attr)
      , loaded = $tab.data('tab-loaded')
      , pane = get_attr($tab, that.options.tab_target_attr)
      , $pane = $(pane)
      , template = $tab.data("template") || that.options.list_view
      , model_name = get_attr($tab, that.options.tab_model_attr)
      , model = can.getObject("CMS.Models." + model_name) || can.getObject("GGRC.Models." + model_name)
      , view_data = null
      , spinner
      , xhrs = {};

      if(!template && typeof console !== "undefined") {
        console.warn("No template defined for quick_search in ", $pane.attr("id"));
      }

      if(model && template) {
        view_data = new can.Observe({
          list: new model.List()
          , all_items: new model.List()
          , filtered_items: new model.List()
          , observer: that.options.observer
          , model : model
        });

        $tab.data("view_data", view_data);
        $tab.data("model", model);
        $pane.trigger("loading");
        model.findAll().done(function(data) {
          view_data.attr('all_items', data);
          view_data.attr('filtered_items', data.slice(0));
          if($tab.is("li.active a")) {
            can.Observe.startBatch();
            if(that.options.limit != null) {
              view_data.attr('list').replace(data.slice(0, that.options.limit));
            } else {
              view_data.attr('list', data);
            }
            can.Observe.stopBatch();
            $pane.trigger("loaded", xhrs[$pane.attr("id")], $tab.data("list"));
          } else {
            GGRC.queue_event(function() {
              if(that.options.limit != null) {
                view_data.attr('list').replace(data.slice(0, that.options.limit));
              } else {
                view_data.attr('list', data);
              }
              $pane.trigger("loaded", xhrs[$pane.attr("id")], $tab.data("list"));
            });
          }
          $tab.find(".item-count").html(data ? data.length : 0);
        });

        model.bind("created", function(ev, instance) {
          if(instance.constructor === model) {
            view_data.list.unshift(instance.serialize());
          }
        });
      }

      if(that.options.spin) {
        spinner = new Spinner({ }).spin();
        $pane.html(spinner.el);
        // Scroll up so spinner doesn't get pushed out of visibility
        $pane.scrollTop(0);
        $(spinner.el).css({ width: '100px', height: '100px', left: '50px', top: '50px', zIndex : calculate_spinner_z_index });
      }

      if (view_data) {
        $pane.html(
          $(new Spinner().spin().el)
          .css({
            width: '100px', height: '100px',
            left: '38%', top: '50%',
            zIndex : calculate_spinner_z_index
          }));
        can.view(template, view_data, function(frag, xhr) {
          $tab.data('tab-loaded', true);
          $pane.html(frag);
          xhrs[$pane.attr("id")] = xhr;
        });
      }
    });
  }

  , ".view-more click" : function(el, ev) {
    var that = this
    , $tab = this.element
              .find(this.options.tab_selector)
              .map(function(i, v) {
                if(that.element.find(get_attr(v, that.options.tab_target_attr)).has(el).length) {
                  return v;
                }
              })
    , view_data = $tab.data("view_data");

    //show twice as many items each time.
    view_data.list.replace(view_data.filtered_items.slice(0, view_data.list.length * 2));
  }


  , "{observer} value" : function(el, ev, newval) {
    this.filter(newval);
    this.element.trigger('kill-all-popovers');
  }

  // @override
  , redo_last_filter : function(id_to_add) {
    var that = this;
    var $tabs = $(this.element).find(this.options.tab_selector);
    var old_sel = this.options.filterable_items_selector;
    var old_ids = this.last_filter_ids;

    $tabs.each(function(i, tab) {
      var $tab = $(tab)
      , model = $tab.data("model")
      , res = old_ids ? that.last_filter.getResultsFor(model) : null
      , view_data = $tab.data("view_data");

      //that.options.filterable_items_selector = $(get_attr($tab, that.options.tab_href_attr)).find("li:not(.view-more, .add-new)");
      that.last_filter_ids = res = res ? can.unique(can.map(res, function(v) { return v.id; })) : null; //null is the show-all case
      if(res) {
        view_data.filtered_items.replace(can.map(view_data.all_items, function(item) { return ~can.inArray(item.id, res) ? item : undefined; }));
      } else {
        view_data.filtered_items.replace(view_data.all_items.slice(0));
      }
      view_data.list.replace(that.options.limit ? view_data.filtered_items.slice(0, that.options.limit) : view_data.filtered_items);

      //that._super();
      // res = can.map(res, function(obj, i) {
      //   var m = new model(obj);
      //   if(!m.selfLink) {
      //     m.refresh();
      //   }
      //   return m;
      // });
      $tab.find(".item-count").html(res ? res.length : $tab.data("view_data").filtered_items.length);
    });
  }

  , ".tabbable loaded" : function(el, ev) {
    $(el).scrollTop(0);
  }

  , ".nav-tabs li click" : function(el, ev) {
    var plural = el.children("a").attr("data-object-plural");
    var singular = can.map(window.cms_singularize(plural).split("_"), can.capitalize).join(" ");
    el.closest(".widget").find(".object-type").text(singular)
      .closest("a").attr("data-object-plural", plural.split(" ").join("_").toLowerCase())
      .attr("data-object-singular", singular.replace(" ", ""));
  }
});

can.Control("CMS.Controllers.LHN_Search", {
    defaults : {
        list_view : GGRC.mustache_path + "/base_objects/search_result.mustache"
      , list_selector: 'ul.top-level > li'
      , model_attr_selector: null
      , model_attr: 'data-model-name'
      , count_selector: '.item-count'
      , list_content_selector: 'ul'
      , spinner_selector: '.spinner'
      , limit : 6
      , observer : null
    }
}, {
    init: function() {
      var self = this;

      this.init_object_lists();
      this.init_list_views();
      this.run_search("");

      can.Model.Cacheable.bind("created", function(ev, instance) {
        var visible_model_names =
              can.map(self.get_visible_lists(), self.proxy("get_list_model"))
          , model_name = instance.constructor.shortName
          ;

        if(visible_model_names.indexOf(model_name) > -1) {
          self.options.visible_lists[model_name].unshift(instance);
          self.options.results_lists[model_name].unshift(instance);
          // Refresh the counts whenever the lists change
          self.refresh_counts();
        }
      });
    }

  , make_spinner: function() {
      var spinner = new Spinner({
          radius: 4
        , length: 7
        , width: 2
        }).spin();
      $(spinner.el).css({
        width: '30px',
        height: '30px',
        left: '30px',
        top: '15px',
        //zIndex : calculate_spinner_z_index
      });
      return spinner.el;
    }

  , "{list_selector} {list_content_selector} show": "on_show_list"

  , on_show_list: function(el, ev) {
      var $list = $(el).closest(this.get_lists())
        , model_name = this.get_list_model($list)
        ;

      setTimeout(this.proxy("refresh_visible_lists"), 20);
    }

  , "{observer} value" : function(el, ev, newval) {
      this.run_search(newval);
      //this.element.trigger('kill-all-popovers');
    }

  , ".view-more click" : function(el, ev) {
      var self = this
        , $list = $(el).closest(this.get_lists())
        , model_name = this.get_list_model($list)
        , visible_list = this.options.visible_lists[model_name]
        , results_list = this.options.results_lists[model_name]
        ;

      var refresh_queue = new RefreshQueue()
        , new_visible_list = results_list.slice(0, visible_list.length * 2);
      can.each(new_visible_list, function(item) {
        refresh_queue.enqueue(item);
      });
      refresh_queue.trigger().then(function() {
        visible_list.replace(new_visible_list);
      });
    }

  , init_object_lists: function() {
      var self = this;
      if (!this.options.results_lists)
        this.options.results_lists = {};
      if (!this.options.visible_lists)
        this.options.visible_lists = {};

      can.each(this.get_lists(), function($list) {
        var model_name;
        $list = $($list);
        model_name = self.get_list_model($list);
        self.options.results_lists[model_name] = new can.Observe.List();
        self.options.visible_lists[model_name] = new can.Observe.List();
      });
    }

  , init_list_views: function() {
      var self = this;
      can.each(this.get_lists(), function($list) {
        var model_name;
        $list = $($list);
        model_name = self.get_list_model($list);

        var context = {
            model: CMS.Models[model_name]
          , list: self.options.visible_lists[model_name]
          , count: can.compute(function() {
              return self.options.results_lists[model_name].attr('length');
            })
        };

        can.view(self.options.list_view, context, function(frag, xhr) {
          $list.find(self.options.list_content_selector).html(frag);
        });
      });
    }

  , get_list_model: function($list) {
      $list = $($list);
      if (this.options.model_attr_selector)
        $list = $list.find(this.options.model_attr_selector).first();
      return $list.attr(this.options.model_attr);
    }

  , display_counts: function(search_result) {
      var self = this;
      can.each(this.get_lists(), function($list) {
        var model_name, count;
        $list = $($list);
        model_name = self.get_list_model($list);
        if (model_name) {
          count = search_result.getCountFor(model_name);

          if (!isNaN(parseInt(count))) {
            $list
              .find(self.options.count_selector)
              .text(count);
          }
        }
      });
    }

  , display_lists: function(search_result) {
      var self = this
        , lists = this.get_visible_lists()
        ;

      can.each(lists, function(list) {
        var $list = $(list)
          , model_name = self.get_list_model($list)
          , results = search_result.getResultsForType(model_name)
          , refresh_queue = new RefreshQueue()
          , initial_visible_list = null;
          ;

        self.options.results_lists[model_name].replace(results);
        initial_visible_list =
          self.options.results_lists[model_name].slice(0, self.options.limit);

        can.each(initial_visible_list, function(obj) {
          refresh_queue.enqueue(obj);
        });
        refresh_queue.trigger().then(function(_) {
          self.options.visible_lists[model_name].replace(initial_visible_list);
          // Stop spinner when request is complete
          $list.find(self.options.spinner_selector).html("");
        });
      });
    }

  , refresh_counts: function() {
      var models;
      models = can.map(this.get_lists(), this.proxy("get_list_model"));

      // Retrieve and display counts
      GGRC.Models.Search.counts_for_types(this.current_term, models)
        .then(this.proxy("display_counts"));
    }

  , refresh_visible_lists: function() {
      var self = this
        , lists = this.get_visible_lists()
        , models = can.map(lists, this.proxy("get_list_model"))
        ;

      models = can.map(models, function(model_name) {
        if (self.options.loaded_lists.indexOf(model_name) == -1)
          return model_name;
      });

      if (models.length > 0) {
        // Register that the lists are loaded
        can.each(models, function(model_name) {
          self.options.loaded_lists.push(model_name);
        });

        // Start the spinners before the request
        can.each(lists, function(list) {
          var $list = $(list);
          $list.find('.spinner').html(self.make_spinner());
        });

        GGRC.Models.Search.search_for_types(this.current_term, models)
          .then(this.proxy("display_lists"));
      }
    }

  , run_search: function(term) {
      var self = this;
      if (term !== this.current_term) {
        // Clear current result lists
        can.each(this.options.results_lists, function(list) {
          list.replace([]);
        });
        can.each(this.options.visible_lists, function(list) {
          list.replace([]);
        });
        this.options.loaded_lists = [];

        this.current_term = term;
        this.refresh_counts();
        // Retrieve and display results for visible lists
        this.refresh_visible_lists();
      }
    }

  , get_lists: function() {
      return $.makeArray(
          this.element.find(this.options.list_selector));
    }

  , get_visible_lists: function() {
      var self = this;
      return can.map(this.get_lists(), function($list) {
        $list = $($list);
        if ($list.find(self.options.list_content_selector).hasClass('in'))
          return $list;
      });
    }
});


can.Control("CMS.Controllers.LHN_Tooltips", {
    defaults : {
        tooltip_view: GGRC.mustache_path + "/base_objects/extended_info.mustache"
      , trigger_selector: ".show-extended"
      , fade_in_delay: 300
      , fade_out_delay: 300
    }
}, {
    init: function() {
      if (!this.options.$extended) {
        this.options.$extended = $('#extended-info');
        if (this.options.$extended.length < 1)
          this.options.$extended =
            $('<div id="extended-info" class="extended-info hide" />')
              .appendTo('body');
      }
      if (!this.options.$lhs)
        this.options.$lhs = $('#lhs');
      // Renew event listening, since we assigned $extended, $lhs
      this.on();
    }

  // Tooltip / popover handling
  , "{trigger_selector} mouseenter": "on_mouseenter"
  , "{trigger_selector} mouseleave": "on_mouseleave"
  , "{$extended} mouseleave": "on_mouseleave"
  , "{$extended} mouseenter": "on_tooltip_mouseenter"

  , on_mouseenter: function(el, ev) {
      var instance = el.closest("[data-model]").data("model")
                      || el.closest(":data(model)").data("model")
        , delay = this.options.fade_in_delay
        ;

      if (this.options.$extended.data('model') !== instance) {
        clearTimeout(this.fade_in_timeout);
        // If tooltip is already showing, show new content without delay
        if (this.options.$extended.hasClass('in'))
          delay = 0;
        this.fade_in_timeout = setTimeout(
            this.proxy('on_fade_in_timeout', el, instance), delay);
        clearTimeout(this.fade_out_timeout);
        this.fade_out_timeout = null;
      } else if (this.fade_out_timeout) {
        clearTimeout(this.fade_out_timeout);
        this.fade_out_timeout = null;
      }
    }

  , ensure_tooltip_visibility: function() {
      var offset = this.options.$extended.offset().top
        , height = this.options.$extended.height()
        // "- 24" compensates for the Chrome URL display when hovering a link
        , window_height = $(window).height() - 24
        , new_offset
        ;

      if (offset + height > window_height) {
        if (height > window_height)
          new_offset = 0;
        else
          new_offset = window_height - height;
        this.options.$extended.css({ top: new_offset });
      }
    }

  , get_tooltip_view: function(el) {
      var tooltip_view = $(el)
            .closest('[data-tooltip-view]').attr('data-tooltip-view');
      if (tooltip_view && tooltip_view.length > 0)
        return GGRC.mustache_path + tooltip_view;
      else
        return this.options.tooltip_view;
    }

  , on_fade_in_timeout: function(el, instance) {
      var self = this
        , tooltip_view = this.get_tooltip_view(el)
        ;

      this.fade_in_timeout = null;
      can.view(tooltip_view, instance, function(frag) {
        self.options.$extended
          .html(frag)
          .addClass('in')
          .removeClass('hide')
          .css({ top: el.offset().top, left: self.options.$lhs.width() })
          .data('model', instance);
        self.ensure_tooltip_visibility();
      });
    }

  , on_tooltip_mouseenter: function() {
      clearTimeout(this.fade_out_timeout);
      this.fade_out_timeout = null;
    }

  , on_fade_out_timeout: function() {
      clearTimeout(this.fade_in_timeout);
      this.fade_in_timeout = null;
      this.fade_out_timeout = null;
      this.options.$extended
        .removeClass('in')
        .addClass('hide')
        .data('model', null);
    }

  , on_mouseleave: function(el, ev) {
      // Cancel fade_in, if we haven't displayed yet
      clearTimeout(this.fade_in_timeout);
      this.fade_in_timeout = null;

      clearTimeout(this.fade_out_timeout);
      this.fade_out_timeout =
        setTimeout(
            this.proxy("on_fade_out_timeout"),
            this.options.fade_out_delay);
    }
});

})(this.can, this.can.$);
