require([
  "app",

  // Libs
  "jquery",
  "backbone",

  // Modules
  "modules/blockee"
],

function(app, $, Backbone, Blockee) {
  
  //var decorate = new Blockee.Views.Decorate();

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "?blocks=:blocks+:url": "blocks",
      "share?blocks=:blocks+:url": "share"      
    },

    index: function() {
      var decorate = new Blockee.Views.Decorate();
      this.showView(decorate);
      Blockee.loadContent(null, null, decorate, {showBlingBox: true});
    },

    share: function(blocks, url) {
      var blocksObject = $.parseJSON(unescape(blocks));    
      var googleStreetViewUrl = "http://maps.googleapis.com/maps/api/streetview?" + decodeURIComponent(url);

      var share = new Blockee.Views.Share();
      this.showView(share);

      // in sharing mode for version 1.0, we will only show the actual image
      Blockee.loadContent(blocksObject, googleStreetViewUrl, share, {showBlingBox: false});
    },

    /*
     * Parse block objects and use to render view
     */
    blocks: function(blocks, url) { 
      var blocksObject = $.parseJSON(unescape(blocks));    
      var googleStreetViewUrl = "http://maps.googleapis.com/maps/api/streetview?" + decodeURIComponent(url);

      var decorate = new Blockee.Views.Decorate();
      this.showView(decorate);
      Blockee.loadContent(blocksObject, googleStreetViewUrl, decorate, {showBlingBox: true});
    },

    /*
     * Utility for handling the display (and closing) of views
     */
    showView: function(view) {
      if (this.currentView) {
        this.currentView.close();
      }
      this.currentView = view;
      this.currentView.$el.appendTo("#main");
    }
  });

  // Treat the jQuery ready function as the entry point to the application.
  // Inside this function, kick-off all initialization, everything up to this
  // point should be definitions.
  $(function() {
    // Define your master router on the application namespace and trigger all
    // navigation from this instance.
    app.router = new Router();

    // Trigger the initial route and enable HTML5 History API support
    Backbone.history.start({ pushState: true });

    // extend Backbone View object to include close/cleanup function  
    Backbone.View.prototype.close = function() {
      this.remove();
      this.unbind();
      if (this.onClose) {
        this.onClose();
      }
    };
  });

  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router.  If the link has a data-bypass
  // attribute, bypass the delegation completely.
  $(document).on("click", "a:not([data-bypass])", function(evt) {
    // Get the anchor href and protcol
    var href = $(this).attr("href");
    var protocol = this.protocol + "//";

    // Ensure the protocol is not part of URL, meaning its relative.
    if (href && href.slice(0, protocol.length) !== protocol &&
        href.indexOf("javascript:") !== 0) {
      // Stop the default event to ensure the link will not cause a page
      // refresh.
      evt.preventDefault();

      // `Backbone.history.navigate` is sufficient for all Routers and will
      // trigger the correct events.  The Router's internal `navigate` method
      // calls this anyways.
      Backbone.history.navigate(href, true);
    }
  });
});
