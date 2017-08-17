/**
 * connections_canvas.js
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2017, gandxiaowei@gmail.com all rights reserved.
 */
"use strict";

const $ = require('jquery');

class ConnectionsCanvas {
    constructor() {
        this.$container = $('.draw-area');
        this.$canvas = $('.draw-area canvas');
        this.canvas = this.$canvas[0];
        this.context = this.canvas.getContext('2d');
        this.canvas_click_listener = this.handler_canvas_click.bind(this);
        this.$canvas.on('click', this.canvas_click_listener);
        this.resize();
        this.clear();
    }

    draw_line(line) {
        this.context.strokeStyle = "#999";
        this.context.lineWidth = 2;

        this.context.beginPath();
        this.context.moveTo(line.fromX, line.fromY);
        this.context.lineTo(line.toX, line.toY);
        this.context.closePath();
        this.context.stroke();

    }

    draw_segment_line(connection_creation_data, index) {
        let $source = $(`[data-composition-id="${connection_creation_data.source['id']}"]`);
        let $destination = $(`[data-composition-id="${connection_creation_data.destination['id']}"]`);
        let {left: fromX, top: fromY} = $source.offset();
        let {left: toX, top: toY} = $destination.offset();
        let base_offset_x = 20;

        fromX = fromX - this.offset.left + $source.outerWidth();
        toX = toX - this.offset.left;
        fromY = fromY - this.offset.top + 0.5 * $source.outerHeight();
        toY = toY - this.offset.top + 0.5 * $destination.outerHeight();

        let arrowWidth = 12;
        let arrowLength = 10;
        let arrowBack = 2;

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
        for (let i = 1; i < this.grid[index].length; i++) {
            this.context.lineTo(this.grid[index][i].x, this.grid[index][i].y);
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

    draw_with_creation(x, y, patch) {
        this.draw(patch);

        let line = {
            toX: x - this.offset.left,
            toY: y - this.offset.top
        };

        if (this._connection_creation_data) {
            let $transput;
            if (this._connection_creation_data.source) {
                $transput = $(`[data-composition-id="${this._connection_creation_data.source['id']}"]`);
            } else {
                $transput = $(`[data-composition-id="${this._connection_creation_data.destination['id']}"]`);
            }

            let offset = $transput.offset();

            line.fromX = offset.left - this.offset.left + (this._connection_creation_data.source ? 1 : 0) * $transput.outerWidth();
            line.fromY = offset.top - this.offset.top + 0.5 * $transput.outerHeight();

            this.draw_line(line);
        }
    }

    draw(patch) {
        this.clear();
        if (!patch || !patch.length) {
            return;
        }
        patch.forEach((connection_creation_data, index) => {
            this.draw_segment_line(connection_creation_data, index)
        });
    }

    resize() {
        this.width = this.$container.outerWidth();
        this.height = this.$container.outerHeight();
        this.offset = this.$canvas.offset();
        this.$canvas.attr({width: this.width, height: this.height});
    }

    clear() {
        this.grid = [];
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    handler_canvas_click(event) {
        let point = new Point(event.pageX - this.$canvas.position().left, event.pageY - this.$canvas.position().top);
        let index = -1;
        for (let m = 0; m < this.grid.length; m++) {
            let tmp_grid = this.grid[m];
            for (let n = 1; n < tmp_grid.length; n++) {
                let tmp_grid_previous = tmp_grid[n - 1];
                let tmp_grid_next = tmp_grid[n];
                let start_point, end_point;
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

    set connection_creation_data(connection_creation_data) {
        this._connection_creation_data = connection_creation_data;
    }

}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    is_in_react(point_start, point_end) {
        let x = this.x;
        let y = this.y;
        return x >= Math.min(point_start.x, point_end.x) && x <= Math.max(point_start.x, point_end.x) && y >= Math.min(point_start.y, point_end.y) && y <= Math.max(point_start.y, point_end.y);
    }
}

module.exports = ConnectionsCanvas;