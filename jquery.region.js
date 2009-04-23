(function ($) {


  var Region,
      Viewport,
      createJQueryFunction,
      method;


  /**
   * Creates a two-dimensional region with methods for spatial comparison
   *
   * Constructor accepts variable arguments.
   *
   * If one argument is passed:
   * @param {Region|String|jQuery|DOMElement} arg
   * @throws Unable to find DOM element
   * @throws Invalid argument
   *
   * If two arguments are passed:
   * @param {Number} x1 left coordinate
   * @param {Number} y1 top coordinate
   * @throws Invalid arguments
   *
   * If four arguments are passed:
   * @param {Number} x1 left coordinate
   * @param {Number} y1 top coordinate
   * @param {Number} x2 right coordinate
   * @param {Number} y2 bottom coordinate
   * @throws Invalid arguments
   *
   * @constructs Region instance
   * @throws Invalid number of arguments
   * @returns Region instance
   */
  Region = function () {

    var el, offset, x, y, x1, y1, x2, y2;

    /**
     * If one argument is passed, attempt to resolve the argument in one of
     * four ways:
     *
     *   * Region instance
     *   * jQuery instance
     *   * jQuery selector (string)
     *   * DOM element
     */
    if (arguments.length === 1) {

      el = arguments[0];

      /**
       * If the argument is an instance of Region, clone it.
       */
      if (el instanceof Region) {

        this.left   = el.left;
        this.top    = el.top;
        this.right  = el.right;
        this.bottom = el.bottom;

      /**
       * If the argument is a jQuery selector, a jQuery instance, or a DOM
       * element, create the region from the space occupied by the element.
       */
      } else if (typeof el === 'string' || el instanceof $ || (el.nodeType && el.nodeType === 1)) {

        if (!(el instanceof $)) {
          el = $(el);
        }

        /**
         * Unable to find matching DOM element
         */
        if (el.size() === 0) {
          throw new TypeError('Region: Unable to find DOM element.');
        }

        offset = el.offset();

        this.left   = offset.left;
        this.top    = offset.top;
        this.right  = offset.left + el.width();
        this.bottom = offset.top + el.height();

      /**
       * Unable to determine usable argument.
       */
      } else {
        throw new TypeError('Region: Invalid argument.');
      }

    /**
     * If two arguments are passed, create the region from the coordinate
     * values: x (left/right), y (top/bottom).
     */
    } else if (arguments.length === 2) {

      x = parseFloat(arguments[0]);
      y = parseFloat(arguments[1]);

      /**
       * Invalid arguments
       */
      if (isNaN(x) || isNaN(y)) {
        throw new TypeError('Region: Invalid arguments. x and y must both be numbers.');
      }

      this.left   = x;
      this.top    = y;
      this.right  = x;
      this.bottom = y;

    /**
     * If four arguments are passed, create the region from the pair of
     * coordinate values: x1 (left), y1 (top), x2 (right), y2 (bottom).
     */
    } else if (arguments.length === 4) {

      x1 = parseFloat(arguments[0]);
      y1 = parseFloat(arguments[1]);
      x2 = parseFloat(arguments[2]);
      y2 = parseFloat(arguments[3]);

      /**
       * Invalid arguments
       */
      if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        throw new TypeError('Region: Invalid arguments. x1, y1, x2, and y2 must all be numbers.');
      }

      this.left   = x1;
      this.top    = y1;
      this.right  = x2;
      this.bottom = y2;

    /**
     * Incorrect number of arguments
     */
    } else {
      throw new TypeError('Region: Incorrect number of arguments.');
    }

    /**
     * Return the instance from the constructor to simplify factory
     */
    return this;
  };


  /**
   * Returns a Region instance for comparison methods
   */
  Region.factory = function (region) {
    return (region instanceof Region) ? region : Region.apply({}, arguments);
  };


  /**
   * Prototype for the Region class
   */
  Region.prototype = {


    /**
     * Determines if this region is above the supplied region
     */
    isAbove: function () {
      var region = Region.factory.apply(this, arguments);
      return (this.bottom < region.top);
    },


    /**
     * Determines if this region is below the supplied region
     */
    isBelow: function () {
      var region = Region.factory.apply(this, arguments);
      return (this.top > region.bottom);
    },


    /**
     * Determines if this region is left of the supplied region
     */
    isLeftOf: function () {
      var region = Region.factory.apply(this, arguments);
      return (this.right < region.left);
    },


    /**
     * Determines if this region is right of the supplied region
     */
    isRightOf: function () {
      var region = Region.factory.apply(this, arguments);
      return (this.left > region.right);
    },


    /**
     * Determines if this region intersects the supplied region
     */
    intersects: function () {
      var region = Region.factory.apply(this, arguments);
      return (Math.min(this.bottom, region.bottom) >= Math.max(this.top, region.top) && Math.min(this.right, region.right) >= Math.max(this.left, region.left));
    },


    /**
     * Determines if this region contains the supplied region
     */
    contains: function () {
      var region = Region.factory.apply(this, arguments);
      return (this.left <= region.left && this.top <= region.top && this.right >= region.right && this.bottom >= region.bottom);
    },


    /**
     * Determines if this region is contained by the supplied region
     */
    isContainedBy: function () {
      var region = Region.factory.apply(this, arguments);
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
  $.fn.region = function () {
    return new Region(this);
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
  Viewport = function () {

    var vp = this;

    /**
     * Update the viewport coordinates when the DOM is ready
     */
    if ($.isReady) {
      vp.update();
    } else {
      $(function () {
        vp.update();
      });
    }

    this.window = $(window).bind('resize scroll', function () {
      vp.update();
    });
  };


  /**
   * Prototype for the Viewport class
   */
  Viewport.prototype = $.extend({


    /**
     * Set the viewport coordinates to the window's visible coordinates
     */
    update: function () {

      this.left   = this.window.scrollLeft();
      this.top    = this.window.scrollTop();
      this.right  = this.window.width() + this.left;
      this.bottom = this.window.height() + this.top;

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
  }, Region.prototype);


  /**
   * Add a Viewport singleton to the jQuery namespace
   */
  $.Viewport = new Viewport();


}(jQuery));
