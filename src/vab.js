/**
 * vab.js
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2017, gandxiaowei@gmail.com all rights reserved.
 */
"use strict";

const $ = require('jquery');

class VAB {
    constructor(data, range) {
        this.init(data);
        this.data = data;
        this.range = range;
    }

    init(data) {
        this.$element = $(`<div class="vab" data-vab-id="${data['id']}" data-level-id="${data['level']}"></div>`);
        let $header_container = $('<div class="header-container grid"><div class="element grid-cell" data-composition-id="vab#element#' + data['id'] + '">&nbsp;</div><div class="header grid-cell none"></div><div class="process grid-cell" data-composition-id="vab#process#' + data['id'] + '">&nbsp;</div></div>');
        this.$header = $header_container.find('.header');
        this.$header.text(data['name']);
        $header_container.appendTo(this.$element);
        this.$body = $('<div class="body"></div>');
        data.elements.forEach((item, index) => {
            $('<div class="composition element"></div>').text(item['name']).attr('data-composition-id', item['id']).css('top', 6 + 30 * index).appendTo(this.$body);
        });

        data.process.forEach((item, index) => {
            $('<div class="composition process"></div>').text(item['name']).attr('data-composition-id', item['id']).css('top', 6 + 30 * index).appendTo(this.$body);
        });

        this.$body.css('height', Math.max(data.elements.length, data.process.length) * 30 + 4);
        this.$body.appendTo(this.$element);

        this.$foot = $('<div class="foot"><button class="btn btn-danger btn-xs waves-effect btn-block delete">DELETE</button></div>')
        this.$foot.appendTo(this.$element);

        this.header_mouse_down_listener = this.handler_header_mouse_down.bind(this);
        this.document_mouse_move_listener = this.handler_document_mouse_move.bind(this);
        this.document_mouse_up_listener = this.handler_document_mouse_up.bind(this);
        this.foot_delete_click_listener = this.handler_foot_delete_click.bind(this);
        this.$header.on('mousedown', this.header_mouse_down_listener);
        this.$foot.find('.delete').on('click', this.foot_delete_click_listener);
    }

    set position(position) {
        let width = this.$element.width();
        let height = this.$element.height();

        let x = Math.min(Math.max(this.range.x, position.x), this.range.x + this.range.width - width);
        let y = Math.min(Math.max(this.range.y, position.y), this.range.y + this.range.height - height);

        this._position = {x, y};
        this.$element.css({
            'left': this._position.x,
            'top': this._position.y
        });
    }

    get position() {
        return this._position;
    }

    handler_header_mouse_down() {
        $(document).on('mousemove', this.document_mouse_move_listener);
        $(document).on('mouseup', this.document_mouse_up_listener);
    }

    handler_document_mouse_move(event) {
        var moveX = event.originalEvent.movementX || event.originalEvent.mozMovementX || 0;
        var moveY = event.originalEvent.movementY || event.originalEvent.mozMovementY || 0;

        this.position = {
            x: this._position.x + moveX,
            y: this._position.y + moveY
        };

        $(document).trigger('vab_move', event);
    }

    handler_document_mouse_up() {
        $(document).off('mousemove', this.document_mouse_move_listener);
        $(document).off('mouseup', this.document_mouse_up_listener);
    }

    handler_foot_delete_click() {
        this.$element.remove();
        $(document).trigger('vab_remove', {vab_id: this.data['id']})
    }
}

module.exports = VAB;
