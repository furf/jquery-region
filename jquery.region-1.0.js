(function ($) {


  var window = this,
      Region,
      ViewportRegion,
      createJQueryFunction,
      method;


  /**
   * Creates a two-dimensional region with methods for spatial comparison
   *
   * @param {Region|String|jQuery|DOMElement|window|Object} r
   * @throws Unable to find DOM element
   * @throws Invalid argument
   * @throws Invalid number of arguments
   * @constructs Region instance
   * @returns Region instance
   */
  Region = function (r /*, clone */) {


    var offset, top, left, bottom, right;

     
    /**
     * If the argument is an instance of Region, clone it or pass it.
     */
    if (r instanceof Region) {
      
      /**
       * If clone flag is true, clone the region instead of passing it.
       */
      if (arguments.length > 1 && arguments[1] == true) {
    
        this.left   = r.left;
        this.top    = r.top;
        this.right  = r.right;
        this.bottom = r.bottom;
        this.width  = r.width;
        this.height = r.height;
    
      /**
       * If clone flag is not true, pass through the original region.
       */
      } else {
        return r;
      }
      
      
    /**
     * If the argument is a jQuery selector, a jQuery instance, or a DOM
     * element, create the region from the space occupied by the element.
     */
    } else if (typeof r === 'string' || r instanceof $ || (r.nodeType && r.nodeType === 1)) {

      if (!(r instanceof $)) {
        r = $(r);
      }

      /**
       * Unable to find matching DOM element
       */
      if (r.size() === 0) {
        throw new TypeError('Region: Unable to find DOM element.');
      }

      offset = r.offset();

      this.width  = r.width();
      this.height = r.height();        
      this.left   = offset.left;
      this.top    = offset.top;
      this.right  = offset.left + this.width;
      this.bottom = offset.top + this.height;


    /**
     * If the argument is the window object, create a region from the visible
     * area of the document
     */
    } else if (r === window) {

      r = $(window);

      this.width  = r.width();
      this.height = r.height();
      
      /**
       * We need to check for document.body to avoid the error thrown by
       * calling scrollLeft or scrollTop before document.body is available.
       * But at this point (before DOMReady), it is effectively 0, so...
       */
      this.left   = (document.body) ? r.scrollLeft() : 0;
      this.top    = (document.body) ? r.scrollTop() : 0;
      this.right  = this.width + this.left;
      this.bottom = this.height + this.top;


    /**
     * ...
     */
    } else if (arguments.length === 1) {
      
      //...
      if (!('top' in r) || !('left' in r)) {
        throw new TypeError('Region: Invalid argument.');
      }

      left   = r.left;
      top    = r.top;
      right  = ('right' in r) ? r.right : r.left;
      bottom = ('bottom' in r) ? r.bottom : r.top;

      /**
       * Use Math.min and Math.max to allow any ordering of coordinates
       */
      this.left   = Math.min(left, right);
      this.right  = Math.max(left, right);
      this.top    = Math.min(top, bottom);
      this.bottom = Math.max(top, bottom);
      this.width  = this.right - this.left;
      this.height = this.bottom - this.top;


    /**
     * Incorrect number of arguments
     */
    } else {
      throw new TypeError('Region: Incorrect number of arguments.');
    }

    /**
     * Return the instance
     */
    return this;
  };


  /**
   * Prototype for the Region class
   */
  Region.prototype = {


    /**
     * Calculates the area of the space occupied by the element
     */
    area: function () {
      return this.width * this.height;
    },


    /**
     * Determines if this region is above the supplied region
     */
    isAbove: function (region) {
      region = new Region(region);
      return (this.bottom < region.top);
    },


    /**
     * Determines if this region is below the supplied region
     */
    isBelow: function (region) {
      region = new Region(region);
      return (this.top > region.bottom);
    },


    /**
     * Determines if this region is left of the supplied region
     */
    isLeftOf: function (region) {
      region = new Region(region);
      return (this.right < region.left);
    },


    /**
     * Determines if this region is right of the supplied region
     */
    isRightOf: function (region) {
      region = new Region(region);
      return (this.left > region.right);
    },


    /**
     * Determines if this region intersects the supplied region
     */
    intersects: function (region) {
      region = new Region(region);
      return (Math.min(this.bottom, region.bottom) >= Math.max(this.top, region.top) && Math.min(this.right, region.right) >= Math.max(this.left, region.left));
    },


    /**
     * Calculates and returns the intersected region 
     */
    intersection: function (region) {

      region = new Region(region);

      if (this.intersects(region)) {

        return new Region({
          left:   Math.max(this.left,   region.left),
          top:    Math.max(this.top,    region.top),
          right:  Math.min(this.right,  region.right),
          bottom: Math.min(this.bottom, region.bottom)
        });
        
      } else {
        return null;
      }
    },


    /**
     * Determines if this region contains the supplied region
     */
    contains: function (region) {
      region = new Region(region);
      return (this.left <= region.left && this.top <= region.top && this.right >= region.right && this.bottom >= region.bottom);
    },


    /**
     * Determines if this region is contained by the supplied region
     */
    isContainedBy: function (region) {
      region = new Region(region);
      return (this.top >= region.top && this.bottom <= region.bottom && this.left >= region.left && this.right <= region.right);
    }
  };


  /**
   * Add the Region class to the jQuery namespace
   */
  $.Region = Region;


  /**
   * Add Region constructor as jQuery instance method
   */    
  $.fn.region = function (/* region */) {

    var region;
    
    if (arguments.length > 0) {

      /**
       * @todo handle multiple objects, you lazy beast
       */
      
      region = new Region(arguments[0]);

      return $(this).css({
        position: 'absolute',
        left:     region.left,
        top:      region.top,
        width:    region.width,
        height:   region.height
      });
      
    } else {
      
      return new Region(this);

    }
  };


  /**
   * Extend $.fn
   */
  createJQueryFunction = function (method) {
    return function () {
      var region = new Region(this);
      return region[method].apply(region, arguments);
    };
  };
  
  for (method in Region.prototype) {
    if (Region.prototype.hasOwnProperty(method)) {
      $.fn[method] = createJQueryFunction(method);
    }
  }


  /**
   *
   */
  ViewportRegion = function () {

    var vp = this;

    if ($.isReady) {
      vp.update();
    } else {
      $(function () {
        vp.update();
      });
    }

    this.window = $(window).bind('load resize scroll', function () {
      vp.update();
    });
  };


  /**
   * Prototype for the ViewportRegion class
   */
  ViewportRegion.prototype = $.extend(new Region(window), {


    /**
     * Set the viewport coordinates to the window's visible coordinates
     */
    update: function () {

      this.width  = this.window.width();
      this.height = this.window.height();
      this.left   = this.window.scrollLeft();
      this.top    = this.window.scrollTop();
      this.right  = this.width + this.left;
      this.bottom = this.height + this.top;

      /**
       * Trigger the viewport:change event
       */
      this.trigger();
    },


    /**
     * Assign a listener to the viewport:change event
     */
    bind: function (fn) {
      $(this).bind('viewport:change', fn);
    },


    /**
     * Execute all listeners to the viewport:change event
     */
    trigger: function () {
      $(this).trigger('viewport:change', this);
    }
  });


  /**
   * Add the ViewportRegion class to the jQuery namespace
   */
  $.ViewportRegion = ViewportRegion;


  /**
   * Add a Viewport singleton to the jQuery namespace
   */
  $.Viewport = new ViewportRegion();
  

}(jQuery));
