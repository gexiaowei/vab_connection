/**
 * vab_connection.js
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2017, gandxiaowei@gmail.com all rights reserved.
 */
'use strict';

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var VAB = function () {
    function VAB(data, offset) {
        _classCallCheck(this, VAB);

        this.init(data);
        this.offset = offset;
    }

    _createClass(VAB, [{
        key: 'init',
        value: function init(data) {
            var _this = this;

            this.$element = $('<div class="vab"></div>');
            this.$header = $('<div class="header"></div>');
            this.$header.text(data['name']);
            this.$header.appendTo(this.$element);
            this.$body = $('<div class="body"></div>');
            data.elements.forEach(function (item, index) {
                $('<div class="composition element"></div>').text(item['name']).attr('data-composition-id', item['id']).css('top', 6 + 30 * index).appendTo(_this.$body);
            });

            data.process.forEach(function (item, index) {
                $('<div class="composition process"></div>').text(item['name']).attr('data-composition-id', item['id']).css('top', 6 + 30 * index).appendTo(_this.$body);
            });

            this.$body.css('height', Math.max(data.elements.length, data.process.length) * 30 + 4);
            this.$body.appendTo(this.$element);

            this.header_mouse_down_listener = this.handler_header_mouse_down.bind(this);
            this.document_mouse_move_listener = this.handler_document_mouse_move.bind(this);
            this.document_mouse_up_listener = this.handler_document_mouse_up.bind(this);
            this.$header.on('mousedown', this.header_mouse_down_listener);
        }
    }, {
        key: 'handler_header_mouse_down',
        value: function handler_header_mouse_down() {
            $(document).on('mousemove', this.document_mouse_move_listener);
            $(document).on('mouseup', this.document_mouse_up_listener);
        }
    }, {
        key: 'handler_document_mouse_move',
        value: function handler_document_mouse_move(event) {
            var moveX = event.originalEvent.movementX || event.originalEvent.mozMovementX || 0;
            var moveY = event.originalEvent.movementY || event.originalEvent.mozMovementY || 0;

            this.position = {
                x: this._position.x + moveX,
                y: this._position.y + moveY
            };

            $(document).trigger('vab_move', event);
        }
    }, {
        key: 'handler_document_mouse_up',
        value: function handler_document_mouse_up() {
            $(document).off('mousemove', this.document_mouse_move_listener);
            $(document).off('mouseup', this.document_mouse_up_listener);
        }
    }, {
        key: 'position',
        set: function set(position) {
            this._position = position;
            this.$element.css({
                'left': this._position.x,
                'top': this._position.y
            });
        }
    }, {
        key: 'offset',
        set: function set(offset) {
            this._offset = offset;
        }
    }]);

    return VAB;
}();

var ConnectionsCanvas = function () {
    function ConnectionsCanvas() {
        _classCallCheck(this, ConnectionsCanvas);

        this.$container = $('.draw-area');
        this.$canvas = $('.draw-area canvas');
        this.canvas = this.$canvas[0];
        this.context = this.canvas.getContext('2d');
        this.canvas_click_listener = this.handler_canvas_click.bind(this);
        this.$canvas.on('click', this.canvas_click_listener);
        this.resize();
        this.clear();
    }

    _createClass(ConnectionsCanvas, [{
        key: 'draw_line',
        value: function draw_line(line) {
            this.context.strokeStyle = "#999";
            this.context.lineWidth = 2;

            this.context.beginPath();
            this.context.moveTo(line.fromX, line.fromY);
            this.context.lineTo(line.toX, line.toY);
            this.context.closePath();
            this.context.stroke();
        }
    }, {
        key: 'draw_segment_line',
        value: function draw_segment_line(connection_creation_data, index) {
            var $source = $('[data-composition-id="' + connection_creation_data.source['id'] + '"]');
            var $destination = $('[data-composition-id="' + connection_creation_data.destination['id'] + '"]');

            var _$source$offset = $source.offset(),
                fromX = _$source$offset.left,
                fromY = _$source$offset.top;

            var _$destination$offset = $destination.offset(),
                toX = _$destination$offset.left,
                toY = _$destination$offset.top;

            var base_offset_x = 20;

            fromX = fromX - this.offset.left + $source.outerWidth();
            toX = toX - this.offset.left;
            fromY = fromY - this.offset.top + 0.5 * $source.outerHeight();
            toY = toY - this.offset.top + 0.5 * $destination.outerHeight();

            var arrowWidth = 12;
            var arrowLength = 10;
            var arrowBack = 2;

            this.context.strokeStyle = "#999";
            this.context.lineWidth = 2;

            this.grid[index] = [];

            this.grid[index].push(new Point(fromX, fromY));
            this.grid[index].push(new Point(fromX + base_offset_x, fromY));
            if (fromX > toX - base_offset_x - arrowWidth) {
                this.grid[index].push(new Point(fromX + base_offset_x, (fromY + toY) / 2));
                this.grid[index].push(new Point(toX - base_offset_x, (fromY + toY) / 2));
                this.grid[index].push(new Point(toX - base_offset_x, toY));
            } else {
                this.grid[index].push(new Point(fromX + base_offset_x, toY));
            }
            this.grid[index].push(new Point(toX, toY));

            this.context.beginPath();
            this.context.moveTo(fromX, fromY);
            for (var _i = 1; _i < this.grid[index].length; _i++) {
                this.context.lineTo(this.grid[index][_i].x, this.grid[index][_i].y);
            }

            this.context.stroke();

            this.context.fillStyle = '#999';

            this.context.beginPath();
            this.context.moveTo(toX, toY);
            this.context.lineTo(toX - arrowLength, toY - 0.5 * arrowWidth);
            this.context.lineTo(toX - arrowLength + arrowBack, toY);
            this.context.lineTo(toX - arrowLength, toY + 0.5 * arrowWidth);
            this.context.lineTo(toX, toY);
            this.context.closePath();
            this.context.fill();
        }
    }, {
        key: 'draw_with_creation',
        value: function draw_with_creation(x, y, patch) {
            this.draw(patch);

            var line = {
                toX: x - this.offset.left,
                toY: y - this.offset.top
            };

            if (this._connection_creation_data) {
                var $transput = void 0;
                if (this._connection_creation_data.source) {
                    $transput = $('[data-composition-id="' + this._connection_creation_data.source['id'] + '"]');
                } else {
                    $transput = $('[data-composition-id="' + this._connection_creation_data.destination['id'] + '"]');
                }

                var offset = $transput.offset();
                line.fromX = offset.left - this.offset.left + (this._connection_creation_data.source ? 1 : 0) * $transput.outerWidth();
                line.fromY = offset.top - this.offset.top + 0.5 * $transput.outerHeight();

                this.draw_line(line);
            }
        }
    }, {
        key: 'draw',
        value: function draw(patch) {
            var _this2 = this;

            this.clear();
            this.offset = this.$canvas.offset();
            if (!patch || !patch.length) {
                return;
            }
            patch.forEach(function (connection_creation_data, index) {
                _this2.draw_segment_line(connection_creation_data, index);
            });
        }
    }, {
        key: 'resize',
        value: function resize() {
            this.width = this.$container.outerWidth() || $('#introduce_panel').outerWidth();
            this.height = this.$container.outerHeight();
            this.offset = this.$canvas.offset();
            this.$canvas.attr({width: this.width, height: this.height});
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.grid = [];
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }, {
        key: 'handler_canvas_click',
        value: function handler_canvas_click(event) {
            var point = new Point(event.pageX - this.$canvas.position().left, event.pageY - this.$canvas.position().top);
            var index = -1;
            for (var m = 0; m < this.grid.length; m++) {
                var tmp_grid = this.grid[m];
                for (var n = 1; n < tmp_grid.length; n++) {
                    var tmp_grid_previous = tmp_grid[n - 1];
                    var tmp_grid_next = tmp_grid[n];
                    var start_point = void 0,
                        end_point = void 0;
                    if (tmp_grid_previous.x == tmp_grid_next.x) {
                        start_point = new Point(tmp_grid_previous.x - 5, tmp_grid_previous.y);
                        end_point = new Point(tmp_grid_next.x + 5, tmp_grid_next.y);
                    } else {
                        start_point = new Point(tmp_grid_previous.x, tmp_grid_previous.y - 5);
                        end_point = new Point(tmp_grid_next.x, tmp_grid_next.y + 5);
                    }

                    if (point.is_in_react(start_point, end_point)) {
                        index = m;
                        break;
                    }
                }
            }
            if (index > -1) {
                $(document).trigger('patch_remove', index);
            }
        }
    }, {
        key: 'connection_creation_data',
        set: function set(connection_creation_data) {
            this._connection_creation_data = connection_creation_data;
        }
    }]);

    return ConnectionsCanvas;
}();

var Point = function () {
    function Point(x, y) {
        _classCallCheck(this, Point);

        this.x = x;
        this.y = y;
    }

    _createClass(Point, [{
        key: 'is_in_react',
        value: function is_in_react(point_start, point_end) {
            var x = this.x;
            var y = this.y;
            return x >= Math.min(point_start.x, point_end.x) && x <= Math.max(point_start.x, point_end.x) && y >= Math.min(point_start.y, point_end.y) && y <= Math.max(point_start.y, point_end.y);
        }
    }]);

    return Point;
}();

var Relationship = function () {
    function Relationship() {
        _classCallCheck(this, Relationship);

        this.$element = $('.draw-area');
        this.connections_canvas = new ConnectionsCanvas();
        this.process_mouse_down_listener = this.handler_process_mouse_down.bind(this);
        this.document_mouse_move_listener = this.handler_document_mouse_move.bind(this);
        this.document_mouse_up_listener = this.handler_document_mouse_up.bind(this);
        this.document_vab_move_listener = this.handler_document_vab_move.bind(this);
        this.document_patch_remove_listener = this.handler_document_patch_remove.bind(this);
        $(document).on('vab_move', this.document_vab_move_listener);
        $(document).on('patch_remove', this.document_patch_remove_listener);
        this.vabs = [];
        this.patch = [];
        this.clear_connection_creation_data();
    }

    _createClass(Relationship, [{
        key: 'clear_connection_creation_data',
        value: function clear_connection_creation_data() {
            this.connection_creation_data = {source: null, destination: null};
            this.connections_canvas.connection_creation_data = null;
        }
    }, {
        key: 'set_connection_creation_data_by_transput',
        value: function set_connection_creation_data_by_transput(transput) {
            var data = {id: $(event.target).data('compositionId')};
            if (Relationship._is_transput_element(transput)) {
                this.connection_creation_data.destination = data;
            }

            if (Relationship._is_transput_process(transput)) {
                this.connection_creation_data.source = data;
            }
            this.connections_canvas.connection_creation_data = this.connection_creation_data;
        }
    }, {
        key: 'add_vab',
        value: function add_vab(data, x, y) {
            var vab = new VAB(data);
            vab.position = {x: x || 50, y: y || 50};
            this.vabs.push(vab);
            vab.$element.appendTo(this.$element);
            vab.$element.on('mousedown', this.process_mouse_down_listener);
        }
    }, {
        key: 'handler_process_mouse_down',
        value: function handler_process_mouse_down(event) {
            if (Relationship._is_transput(event.target)) {
                this.set_connection_creation_data_by_transput(event.target);
                event.preventDefault();
                $(document).on('mousemove', this.document_mouse_move_listener);
                $(document).on('mouseup', this.document_mouse_up_listener);
            }
        }
    }, {
        key: 'handler_document_mouse_move',
        value: function handler_document_mouse_move(event) {
            this.connections_canvas.draw_with_creation(event.pageX, event.pageY, this.patch);
        }
    }, {
        key: 'handler_document_mouse_up',
        value: function handler_document_mouse_up(event) {
            $(document).off('mousemove', this.document_mouse_move_listener);
            $(document).off('mouseup', this.document_mouse_up_listener);
            if (Relationship._is_transput_process(event.target) && this.connection_creation_data.destination || Relationship._is_transput_element(event.target) && this.connection_creation_data.source) {
                this.set_connection_creation_data_by_transput(event.target);
                this.patch.push(this.connection_creation_data);
            } else {
                console.log('invalidate connection');
            }
            this.connections_canvas.draw(this.patch);
            this.clear_connection_creation_data();
        }
    }, {
        key: 'handler_document_vab_move',
        value: function handler_document_vab_move() {
            this.connections_canvas.draw(this.patch);
        }
    }, {
        key: 'handler_document_patch_remove',
        value: function handler_document_patch_remove(event, patch_index) {
            this.patch.splice(patch_index, 1);
            this.connections_canvas.draw(this.patch);
        }
    }], [{
        key: '_is_transput',
        value: function _is_transput(element) {
            return Relationship._is_transput_process(element) || Relationship._is_transput_element(element);
        }
    }, {
        key: '_is_transput_element',
        value: function _is_transput_element(element) {
            var $element = $(element);
            return $element.hasClass('element');
        }
    }, {
        key: '_is_transput_process',
        value: function _is_transput_process(element) {
            var $element = $(element);
            return $element.hasClass('process');
        }
    }]);

    return Relationship;
}();