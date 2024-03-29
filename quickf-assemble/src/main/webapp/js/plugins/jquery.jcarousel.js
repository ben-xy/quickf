/**
* jCarousel - Riding carousels with jQuery
* http://sorgalla.com/jcarousel/
*
* Copyright 2012, Jan Sorgalla
* Dual licensed under the MIT (https://github.com/jsor/jcarousel/blob/master/LICENSE-MIT)
* or GPL Version 2 (https://github.com/jsor/jcarousel/blob/master/LICENSE-GPL) licenses.
*/

 define(function(){
 	return function($){

(function ($, window) {
    'use strict';

    var toFloat = function(val) {
        return parseFloat(val) || 0;
    };

    var arraySlice = Array.prototype.slice;

    var jcarousel = $.jcarousel = {};

    jcarousel.version = '@VERSION';

    var rRelativeTarget = /^([+\-]=)?(.+)$/;

    jcarousel.parseTarget = function(target) {
        var relative = false,
            parts = typeof target !== 'object' ?
                        rRelativeTarget.exec(target) :
                        null;

        if (parts) {
            target = parseInt(parts[2], 10) || 0;

            if (parts[1]) {
                relative = true;
                if (parts[1] === '-=') {
                    target *= -1;
                }
            }
        } else if (typeof target !== 'object') {
            target = parseInt(target, 10) || 0;
        }

        return {
            target: target,
            relative: relative
        };
    };

    jcarousel.detectCarousel = function(element) {
        var carousel;

        while (element.size() > 0) {
            carousel = element.filter('[data-jcarousel]');
            if (carousel.size() > 0) {
                return carousel;
            }

            carousel = element.find('[data-jcarousel]');
            if (carousel.size() > 0) {
                return carousel;
            }

            element = element.parent();
        }

        return null;
    };

    jcarousel.basePrototype = function(pluginName) {
        return {
            version: jcarousel.version,
            _options: {},
            _element: null,
            _init: $.noop,
            _create: $.noop,
            _destroy: $.noop,
            _reload: $.noop,
            create: function() {
                this._element
                    .attr('data-' + pluginName.toLowerCase(), true)
                    .data(pluginName, this);

                if (false === this._trigger('create')) {
                    return this;
                }

                this._create();

                this._trigger('createend');

                return this;
            },
            destroy: function() {
                if (false === this._trigger('destroy')) {
                    return this;
                }

                this._destroy();

                this._trigger('destroyend');

                this._element
                    .removeData(pluginName)
                    .removeAttr('data-' + pluginName.toLowerCase());

                return this;
            },
            reload: function(options) {
                if (false === this._trigger('reload')) {
                    return this;
                }

                if (options) {
                    this.options(options);
                }

                this._reload();

                this._trigger('reloadend');

                return this;
            },
            element: function() {
                return this._element;
            },
            options: function(key, value) {
                if (arguments.length === 0) {
                    return $.extend({}, this._options);
                }

                if (typeof key === 'string') {
                    if (typeof value === 'undefined') {
                        return typeof this._options[key] === 'undefined' ?
                                null :
                                this._options[key];
                    }

                    this._options[key] = value;
                } else {
                    this._options = $.extend({}, this._options, key);
                }

                return this;
            },
            _trigger: function(type, element, data) {
                var event = $.Event((type + '.' + pluginName).toLowerCase());

                (element || this._element).trigger(event, [this].concat(data || []));

                return !event.isDefaultPrevented();
            }
        };
    };

    jcarousel.plugin = function(pluginName, pluginPrototype) {
        return jcarousel.create(pluginName, $.extend({}, {
                _carousel: null,
                carousel: function() {
                    if (!this._carousel) {
                        this._carousel = jcarousel.detectCarousel(this.options('carousel') || this._element);

                        if (!this._carousel) {
                            $.error('Could not detect carousel for plugin "' + pluginName + '"');
                        }
                    }

                    return this._carousel;
                }
            },
            pluginPrototype
        ));
    };

    jcarousel.create = function(pluginName, pluginPrototype) {
        var Plugin = function(element, options) {
            this._element = $(element);
            this.options(options);

            this._init();
            this.create();
        };

        Plugin.prototype = $.extend(
            {},
            jcarousel.basePrototype(pluginName),
            pluginPrototype
        );

        $.fn[pluginName] = function(options) {
            var args = arraySlice.call(arguments, 1),
                returnValue = this;

            if (typeof options === 'string') {
                this.each(function() {
                    var instance = $(this).data(pluginName);

                    if (!instance) {
                        return $.error(
                            'Cannot call methods on ' + pluginName + ' prior to initialization; ' +
                            'attempted to call method "' + options + '"'
                        );
                    }

                    if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                        return $.error(
                            'No such method "' + options + '" for ' + pluginName + ' instance'
                        );
                    }

                    var methodValue = instance[options].apply(instance, args);

                    if (methodValue !== instance && typeof methodValue !== 'undefined') {
                        returnValue = methodValue;
                        return false;
                    }
                });
            } else {
                this.each(function() {
                    var instance = $(this).data(pluginName);

                    if (instance) {
                        instance.reload(options);
                    } else {
                        new Plugin(this, options);
                    }
                });
            }

            return returnValue;
        };

        return Plugin;
    };

    jcarousel.create('jcarousel', {
        animating: false,
        tail: 0,
        inTail: false,
        resizeTimer: null,
        lt: null,
        vertical: false,
        rtl: false,
        circular: false,

        _options: {
            list: function() {
                return this.element().children().eq(0);
            },
            items: function() {
                return this.list().children();
            },
            animation: 400,
            wrap: null,
            vertical: null,
            rtl: null,
            center: false
        },

        // Protected, don't access directly
        _list: null,
        _items: null,
        _target: null,
        _first: null,
        _last: null,
        _visible: null,
        _fullyvisible: null,
        _init: function() {
            var self = this;

            this.onWindowResize = function() {
                if (self.resizeTimer) {
                    clearTimeout(self.resizeTimer);
                }

                self.resizeTimer = setTimeout(function() {
                    self.reload();
                }, 100);
            };

            this.onAnimationComplete = function(callback) {
                self.animating = false;

                var c = self.list().find('[data-jcarousel-clone]');

                if (c.size() > 0) {
                    c.remove();
                    self._reload();
                }

                self._trigger('animateend');

                if ($.isFunction(callback)) {
                    callback.call(self, true);
                }
            };

            return this;
        },
        _create: function() {
            this._reload();
            $(window).bind('resize.jcarousel', this.onWindowResize);
        },
        _destroy: function() {
            $(window).unbind('resize.jcarousel', this.onWindowResize);
        },
        _reload: function() {
            this.vertical = this.options('vertical');

            if (this.vertical == null) {
                this.vertical = this.list().height() > this.list().width();
            }

            this.rtl = this.options('rtl');

            if (this.rtl == null) {
                this.rtl = (function(element) {
                    if (('' + element.attr('dir')).toLowerCase() === 'rtl') {
                        return true;
                    }

                    var found = false;

                    element.parents('[dir]').each(function() {
                        if ((/rtl/i).test($(this).attr('dir'))) {
                            found = true;
                            return false;
                        }
                    });

                    return found;
                }(this._element));
            }

            this.lt = this.vertical ? 'top' : 'left';

            // Force items reload
            this._items = null;

            var item = this._target || this.closest();

            // _prepare() needs this here
            this.circular = this.options('wrap') === 'circular';
            this.list().css({'left': 0, 'top': 0});

            if (item.size() > 0) {
                this._prepare(item);
                this.list().find('[data-jcarousel-clone]').remove();

                // Force items reload
                this._items = null;

                this.circular = this.options('wrap') === 'circular' &&
                                this._fullyvisible.size() < this.items().size();

                this.list().css(this.lt, this._position(item) + 'px');
            }

            return this;
        },
        list: function() {
            if (this._list === null) {
                var option = this.options('list');
                this._list = $.isFunction(option) ? option.call(this) : this._element.find(option);
            }

            return this._list;
        },
        items: function() {
            if (this._items === null) {
                var option = this.options('items');
                this._items = ($.isFunction(option) ? option.call(this) : this.list().find(option)).not('[data-jcarousel-clone]');
            }

            return this._items;
        },
        closest: function() {
            var self = this,
                pos = this.list().position()[this.lt],
                closest = $(), // Ensure we're returning a jQuery instance
                stop = false,
                lrb = this.vertical ? 'bottom' : (this.rtl ? 'left' : 'right'),
                width;

            if (this.rtl && !this.vertical) {
                pos = (pos + this.list().width() - this.clipping()) * -1;
            }

            this.items().each(function() {
                closest = $(this);

                if (stop) {
                    return false;
                }

                var dim = self.dimension(closest);

                pos += dim;

                if (pos >= 0) {
                    width = dim - toFloat(closest.css('margin-' + lrb));

                    if ((Math.abs(pos) - dim + (width / 2)) <= 0) {
                        stop = true;
                    } else {
                        return false;
                    }
                }
            });

            return closest;
        },
        target: function() {
            return this._target;
        },
        first: function() {
            return this._first;
        },
        last: function() {
            return this._last;
        },
        visible: function() {
            return this._visible;
        },
        fullyvisible: function() {
            return this._fullyvisible;
        },
        hasNext: function() {
            if (false === this._trigger('hasnext')) {
                return true;
            }

            var wrap = this.options('wrap'),
                end = this.items().size() - 1;

            return end >= 0 &&
                ((wrap && wrap !== 'first') ||
                    (this._last.index() < end) ||
                    (this.tail && !this.inTail)) ? true : false;
        },
        hasPrev: function() {
            if (false === this._trigger('hasprev')) {
                return true;
            }

            var wrap = this.options('wrap');

            return this.items().size() > 0 &&
                ((wrap && wrap !== 'last') ||
                    (this._first.index() > 0) ||
                    (this.tail && this.inTail)) ? true : false;
        },
        clipping: function() {
            return this._element['inner' + (this.vertical ? 'Height' : 'Width')]();
        },
        dimension: function(element) {
            return element['outer' + (this.vertical ? 'Height' : 'Width')](true);
        },
        scroll: function(target, animate, callback) {
            if (this.animating) {
                return this;
            }

            if (false === this._trigger('scroll', null, [target, animate])) {
                return this;
            }

            if ($.isFunction(animate)) {
                callback = animate;
                animate = true;
            }

            var parsed = jcarousel.parseTarget(target);

            if (parsed.relative) {
                var end = this.items().size() - 1,
                    scroll = Math.abs(parsed.target),
                    first,
                    index,
                    curr,
                    i,
                    wrap = this.options('wrap');

                if (parsed.target > 0) {
                    var last = this._last.index();

                    if (last >= end && this.tail) {
                        if (!this.inTail) {
                            this._scrollTail(animate, callback);
                        } else {
                            if (wrap === 'both' || wrap === 'last') {
                                this._scroll(0, animate, callback);
                            } else {
                                this._scroll(Math.min(this._target.index() + scroll, end), animate, callback);
                            }
                        }
                    } else {
                        if (last === end &&
                            (wrap === 'both' || wrap === 'last')) {
                            this._scroll(0, animate, callback);
                        } else {
                            first = this._target.index();
                            index = first + scroll;

                            if (this.circular && index > end) {
                                i = end;
                                curr = this.items().get(-1);

                                while (i++ < index) {
                                    curr = this.items().eq(0);
                                    curr.after(curr.clone(true).attr('data-jcarousel-clone', true));
                                    this.list().append(curr);
                                    // Force items reload
                                    this._items = null;
                                }

                                this._scroll(curr, animate, callback);
                            } else {
                                this._scroll(Math.min(index, end), animate, callback);
                            }
                        }
                    }
                } else {
                    if (this.inTail) {
                        this._scroll(Math.max((this._first.index() - scroll) + 1, 0), animate, callback);
                    } else {
                        first = this._first.index();
                        index = first - scroll;

                        if (first === 0 &&
                            (wrap === 'both' || wrap === 'first')) {
                            this._scroll(end, animate, callback);
                        } else {
                            if (this.circular && index < 0) {
                                i = index;
                                curr = this.items().get(0);

                                while (i++ < 0) {
                                    curr = this.items().eq(-1);
                                    curr.after(curr.clone(true).attr('data-jcarousel-clone', true));
                                    this.list().prepend(curr);
                                    // Force items reload
                                    this._items = null;

                                    var lt = toFloat(this.list().css(this.lt)),
                                        dim = this.dimension(curr);

                                    if (this.rtl && !this.vertical) {
                                        lt += dim;
                                    } else {
                                        lt -= dim;
                                    }

                                    this.list().css(this.lt, lt + 'px');
                                }

                                this._scroll(curr, animate, callback);
                            } else {
                                this._scroll(Math.max(first - scroll, 0), animate, callback);
                            }
                        }
                    }
                }
            } else {
                this._scroll(parsed.target, animate, callback);
            }

            this._trigger('scrollend');

            return this;
        },
        _scroll: function(item, animate, callback) {
            if (this.animating) {
                if ($.isFunction(callback)) {
                    callback.call(this, false);
                }

                return this;
            }

            if (typeof item !== 'object') {
                item = this.items().eq(item);
            } else if (typeof item.jquery === 'undefined') {
                item = $(item);
            }

            if (item.size() === 0) {
                if ($.isFunction(callback)) {
                    callback.call(this, false);
                }

                return this;
            }

            this.inTail = false;

            this._prepare(item);
            var pos = this._position(item),
                currPos = toFloat(this.list().css(this.lt));

            if (pos === currPos) {
                if ($.isFunction(callback)) {
                    callback.call(this, false);
                }

                return this;
            }

            var properties = {};
            properties[this.lt] = pos + 'px';

            this._animate(properties, animate, callback);

            return this;
        },
        _scrollTail: function(animate, callback) {
            if (this.animating || !this.tail) {
                if ($.isFunction(callback)) {
                    callback.call(this, false);
                }

                return this;
            }

            var pos = this.list().position()[this.lt];

            if (this.rtl) {
                pos += this.tail;
            } else {
                pos -= this.tail;
            }

            this.inTail = true;

            var properties = {};
            properties[this.lt] = pos + 'px';

            this._update({
                target: this._target.next(),
                fullyvisible: this._fullyvisible.slice(1).add(this._visible.last())
            });

            this._animate(properties, animate, callback);

            return this;
        },
        _animate: function(properties, animate, callback) {
            if (false === this._trigger('animate')) {
                if ($.isFunction(callback)) {
                    callback.call(this, false);
                }

                return this;
            }

            this.animating = true;

            var animation = this.options('animation');

            if (!animation || animate === false) {
                this.list().css(properties);
                this.onAnimationComplete(callback);
            } else {
                var self = this;

                if ($.isFunction(animation)) {
                    animation.call(this, properties, function() {
                        self.onAnimationComplete(callback);
                    });
                } else {
                    var opts = typeof animation === 'object' ?
                                animation :
                                {duration: animation},
                        oldComplete = opts.complete;

                    opts.complete = function() {
                        self.onAnimationComplete(callback);
                        if ($.isFunction(oldComplete)) {
                            oldComplete.call(this);
                        }
                    };

                    this.list().animate(properties, opts);
                }
            }

            return this;
        },
        _prepare: function(item) {
            var index = item.index(),
                idx = index,
                wh = this.dimension(item),
                clip = this.clipping(),
                update = {
                    target: item,
                    first: item,
                    last: item,
                    visible: item,
                    fullyvisible: wh <= clip ? item : $()
                },
                lrb = this.vertical ? 'bottom' : (this.rtl ? 'left' : 'right'),
                curr,
                margin;

            if (this.options('center')) {
                wh /= 2;
                clip /= 2;
            }

            if (wh < clip) {
                while (true) {
                    curr = this.items().eq(++idx);

                    if (curr.size() === 0) {
                        if (this.circular) {
                            curr = this.items().eq(0);
                            if (item.get(0) === curr.get(0)) {
                                break;
                            }
                            curr.after(curr.clone(true).attr('data-jcarousel-clone', true));
                            this.list().append(curr);
                            // Force items reload
                            this._items = null;
                        } else {
                            break;
                        }
                    }

                    wh += this.dimension(curr);

                    update.last = curr;
                    update.visible = update.visible.add(curr);

                    // Remove right/bottom margin from total width
                    margin = toFloat(curr.css('margin-' + lrb));

                    if ((wh - margin) <= clip) {
                        update.fullyvisible = update.fullyvisible.add(curr);
                    }

                    if (wh >= clip) {
                        break;
                    }
                }
            }

            if (!this.circular && wh < clip) {
                idx = index;

                while (true) {
                    if (--idx < 0) {
                        break;
                    }

                    curr = this.items().eq(idx);

                    if (curr.size() === 0) {
                        break;
                    }

                    wh += this.dimension(curr);

                    update.first = curr;
                    update.visible = update.visible.add(curr);

                    // Remove right/bottom margin from total width
                    margin = toFloat(curr.css('margin-' + lrb));

                    if ((wh - margin) <= clip) {
                        update.fullyvisible = update.fullyvisible.add(curr);
                    }

                    if (wh >= clip) {
                        break;
                    }
                }
            }

            this._update(update);

            this.tail = 0;

            if (this.options('wrap') !== 'circular' &&
                this.options('wrap') !== 'custom' &&
                update.last.index() === (this.items().size() - 1)) {

                // Remove right/bottom margin from total width
                wh -= toFloat(update.last.css('margin-' + lrb));

                if (wh > clip) {
                    this.tail = wh - clip;
                }
            }

            return this;
        },
        _position: function(item) {
            var first = this._first,
                pos = first.position()[this.lt];

            if (this.rtl && !this.vertical) {
                pos -= this.clipping() - this.dimension(first);
            }

            if (this.options('center')) {
                pos -= (this.clipping() / 2) - (this.dimension(first) / 2);
            }

            if ((item.index() > first.index() || this.inTail) && this.tail) {
                pos = this.rtl ? pos - this.tail : pos + this.tail;
                this.inTail = true;
            } else {
                this.inTail = false;
            }

            return -pos;
        },
        _update: function(update) {
            var self = this,
                current = {
                    target: this._target || $(),
                    first: this._first || $(),
                    last: this._last || $(),
                    visible: this._visible || $(),
                    fullyvisible: this._fullyvisible || $()
                },
                back = (update.first || current.first).index() < current.first.index(),
                key,
                doUpdate = function(key) {
                    var elIn = [],
                        elOut = [];

                    update[key].each(function() {
                        if (current[key].index(this) < 0) {
                            elIn.push(this);
                        }
                    });

                    current[key].each(function() {
                        if (update[key].index(this) < 0) {
                            elOut.push(this);
                        }
                    });

                    if (back) {
                        elIn = elIn.reverse();
                    } else {
                        elOut = elOut.reverse();
                    }

                    self._trigger('item' + key + 'in', $(elIn));
                    self._trigger('item' + key + 'out', $(elOut));

                    self['_' + key] = update[key];
                };

            for (key in update) {
                doUpdate(key);
            }

            return this;
        }
    });
}(jQuery, window));

//end of define
  	}
 });