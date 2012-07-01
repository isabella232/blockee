define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",
  "kinetic",
  "googlylogo",
  "models"
],

function(app, Backbone, Kinetic, Googlylogo, Models) {

  var Blockee = app.module();
  // kinetic.js elements required for rendering bling models on canvas
  var stage = null;
  var layer = null;
  var vent = _.extend({}, Backbone.Events);

  // a set of bling to load when the app starts
  var bootstrapModels = Models; 

  // the decorate view
  Blockee.Views.Decorate = Backbone.View.extend({
    template: "app/templates/decorate",

    initialize: function(options) {
      // bind this (Decorate view) to all evented calls of addBling* method
      _.bindAll(this, "addBlingToCollection");
      // bind "clone" events to addBling* method
      // when bling objects clone themselves, they fire the clone event
      vent.bind("clone", this.addBlingToCollection);
      // a collection of blings
      this.blingCollection = new Blings();
      // load the initial bling models
      this.blingCollection.reset(bootstrapModels);
      this.blingCollection.on("add", function(bling) {
        console.log("add");
        console.log(bling);
      });
      self = this;
    },
   
    /*
     * Load any bling objects defined in URL
     */ 
    setBling: function(blocks) {

      for (var i=0; i<blocks.length; i++) { 
        var block = blocks[i];

        var x = (block.hasOwnProperty("x")) ? block.x : 20;
        var y = (block.hasOwnProperty("y")) ? block.y : 100;

        // XXX: this should go away after images are used instead of colors
        var fill = (block.hasOwnProperty("fill")) ? block.fill : "blue";

        // the id of the of the bling should be stored in the url so we can look it
        // up in the bootstrap loaded collection here, then just update the x,y,width,height,fill 
        var bling = new Blockee.Bling({
            x: x,
            y: y,
            width: 100,
            height: 100,
            fill: fill 
        });

        // if multiple objects of the same type are to be supported, will need
        // to COPY original object from collection and then add to a 
        // "display collection". the display collection is everything that is
        // on the main scene

        //self.blings.push(self.bling);
      }
    },

    addBlingToLayer: function(bling) {
      this.layer.add(bling.render());
    },

    addBlingToCollection: function(bling) {
      console.log(bling.cid);
      console.log("adding bling to collection");
      this.blingCollection.add(bling);
      console.log(this.blingCollection);
      this.addBlingToLayer(clone);
    },

    render: function(done) {
      // Fetch the template
      var tmpl = app.fetchTemplate(this.template);
      
      // Set the template contents
      this.$el.html(tmpl());

      Googlylogo.drawLogo();
      this.initializeStage();

      var self = this; 
       
      this.blingCollection.each(function(bling) {
        self.addBlingToLayer(bling);
      });

      this.stage.draw();
    },

    /*
     * Setup the Kinetic Stage object 
     */
    initializeStage: function() {

      var viewportWidth = $('#stage').width();
      var viewportHeight = 600;

      // blockee has a single stage (for now, there could easily be multiple)
      this.stage = new Kinetic.Stage({
        container: "stage",
        width: viewportWidth,
        height: viewportHeight 
      });

      // and a single view
      this.layer = new Kinetic.Layer();
      this.stage.add(this.layer);

      var layer = this.layer;
      var stage = this.stage;

      // load the preview, help, and help icon-buttons
      // XXX: this is a little ugly! reactor!
      var buttonIcons = ["/assets/img/preview.png",
                         "/assets/img/help.png",
                         "/assets/img/trash.png"];
      var preview = new Image();
      preview.onload = function() {
        var image = new Kinetic.Image({
          x: 630,
          y: 0,
          image: preview,
          width: 42,
          height: 29 
        });
        layer.add(image);
        stage.draw();
      };
      preview.src = buttonIcons[0];
      var help = new Image();
      help.onload = function() {
        var image = new Kinetic.Image({
          x: 635,
          y: 70,
          image: help,
          width: 33,
          height: 38 
        });
        layer.add(image);
        stage.draw();
      };
      help.src = buttonIcons[1];
      var trash = new Image();
      trash.onload = function() {
        var image = new Kinetic.Image({
          x: 630,
          y: 400,
          image: trash,
          width: 44,
          height: 49 
        });
        layer.add(image);
        stage.draw();
      };
      trash.src = buttonIcons[2];

      // XXX: add an image for testing / mockup - REMOVE THIS
      var imageObj = new Image();
      imageObj.onload = function() {
        var image = new Kinetic.Image({
          x: 10,
          y: 0,
          image: imageObj,
          width: 600,
          height: 450 
        });
        layer.add(image);
        image.moveToBottom();
        stage.draw();
      };
      imageObj.src = "/assets/img/storek_test.jpg";
      //imageObj.src = "http://www.html5canvastutorials.com/demos/assets/yoda.jpg";
      // draw the stage in its initial state
      this.stage.draw();
    }

  });

  /*
   * Bling object represents a civic item that can be 
   * placed and manipulated on the main stage and subject
   * image.
   */
  Blockee.Bling = Backbone.Model.extend({

    // default properties
    defaults: {
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "fill": "red"
    },

    /*
     * Return a Kinetic group object that represents the
     * attributes of this Bling model to be drawn on stage.
     */
    render: function() {

      // capture the Bling model as "that"
      var that = this;

      var createGroup = function() {
        // XXX: this needs to be an "animated image view"
        // can use new Bling object image collection to construct it
        var rectangle = new Kinetic.Rect({
          x: 0,
          y: 0,
          width: that.get("width"),
          height: that.get("height"),
          fill: that.get("fill"),
          stroke: "black",
          strokeWidth: 4
        });

        // create Kinetic group
        var group = new Kinetic.Group({
          x: that.get("x"),
          y: that.get("y"),
          draggable: true
        });

        group.add(rectangle);

        return group;
      }

      var group = createGroup();

      ////
      // drag events
      ////
      
      // when group is moved update model attributes 
      group.on("dragend", function() {
        //self.group.moveToTop();
        
        that.set("x", this.getX());
        that.set("y", this.getY());
        
        // XXX: This only updates clicked block, need to forward 
        // this to an object that can construct a comprehensive
        // "scene state" that includes not just this object
        // but all other objects so that the full scene can 
        // be re-rendered when a user shares a URL 
        var blockState = '/blocks/[{"x":' + that.get("x") +
                                  ',"y":' + that.get("y") + "}]";
        app.router.navigate(blockState);
        console.log(that);
        this.off("dragstart");
      });

      group.on("dragstart", function() {
        clone = that.clone();
        // XXX: need to build id generator
        clone.id = that.id + cloneId;
        vent.trigger("clone", clone);
      });

      return group;
    }

  });
  
  // XXX: need to build id generator
  var cloneId = 1;

  var Blings = Backbone.Collection.extend({
      model: Blockee.Bling
  });

  return Blockee;
});
