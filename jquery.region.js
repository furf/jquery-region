(function($) {


  /**
   *
   */
  $.Region = function() {

    var top, right, bottom, left;

    /**
     *
     */
    if (arguments.length === 1) {

      var el = $(arguments[0]),
          offset = el.offset();

      top    = offset.top;
      left   = offset.left;
      bottom = top + el.height();
      right  = left + el.width();

    /**
     *
     */
    } else if (arguments.length === 4) {
      
      top    = arguments[0];
      right  = arguments[1];
      bottom = arguments[2];
      left   = arguments[3];
    }

    this.set(top, right, bottom, left);
  };


  /**
   * 
   */
  $.Region.prototype = {


    /**
     *
     */
    _factory: function(region) {
      if (!(region instanceof $.Region)) {
        var args = Array.prototype.slice.call(arguments, 0);
        region = new $.Region;
        $.Region.apply(region, args);
      }
      return region;
    },


    /**
     * 
     */
    set: function(top, right, bottom, left) {
      this.top    = top;
      this.right  = right;
      this.bottom = bottom;
      this.left   = left;
    },


    /**
     * 
     */
    isAbove: function() {
      var region = this._factory.apply(this, arguments);
      return (this.bottom < region.top);
    },


    /**
     * 
     */
    isBelow: function() {
      var region = this._factory.apply(this, arguments);
      return (this.top > region.bottom);
    },


    /**
     * 
     */
    isLeftOf: function() {
      var region = this._factory.apply(this, arguments);
      return (this.right < region.left);
    },


    /**
     * 
     */
    isRightOf: function() {
      var region = this._factory.apply(this, arguments);
      return (this.left > region.right);
    },


    /**
     * 
     */
    intersects: function() {
      var region = this._factory.apply(this, arguments);
      return (Math.min(this.bottom, region.bottom) >= Math.max(this.top, region.top) && Math.min(this.right, region.right) >= Math.max(this.left, region.left));
    },


    /**
     * 
     */
    contains: function() {
      var region = this._factory.apply(this, arguments);
      return (this.top <= region.top && this.bottom >= region.bottom && this.left <= region.left && this.right >= region.right);
    },


    /**
     * 
     */
    isWithin: function() {
      var region = this._factory.apply(this, arguments);
      return (this.top >= region.top && this.bottom <= region.bottom && this.left >= region.left && this.right <= region.right);
    }
  };


  /**
   * 
   */
  $.fn.region = function() {
    return new $.Region(this);
  };


  /**
   * 
   */
  $.Viewport = $.extend(new $.Region(), {


    /**
     * 
     */
    init: function() {
      var V = this;
      this.window = $(window).bind('load resize scroll', function() {
        V.set();
      });
    },
    

    /**
     * 
     */
    set: function() {
      
      var top    = this.window.scrollTop(),
          left   = this.window.scrollLeft(),
          bottom = this.window.height() + top,
          right  = this.window.width() + left;

      $.Region.prototype.set.call(this, top, right, bottom, left);          
      
      this.trigger();
    },
    
    
    /**
     * 
     */
    bind: function(fn) {
      $(this).bind('viewport:change', fn);
    },
    
    
    /**
     * 
     */
    trigger: function() {
      $(this).trigger('viewport:change', this);
    }
    
  });


  /**
   * Initialize Viewport
   */
  if ($.isReady) {
    $.Viewport.init();
  } else {
    $(function() {
      $.Viewport.init();
    });
  }

})(jQuery);
