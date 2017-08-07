/**
 * relationship.js
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2017, gandxiaowei@gmail.com all rights reserved.
 */
"use strict";

const $ = require('jquery');
const VAB = require('./vab');
const ConnectionsCanvas = require('./connections_canvas');

class Relationship {
    constructor() {
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

    clear_connection_creation_data() {
        this.connection_creation_data = {source: null, destination: null};
        this.connections_canvas.connection_creation_data = null;
    }

    set_connection_creation_data_by_transput(transput) {
        let data = {id: $(event.target).data('compositionId')};
        if (this._is_transput_element(transput)) {
            this.connection_creation_data.destination = data;
        }

        if (this._is_transput_process(transput)) {
            this.connection_creation_data.source = data;
        }
        this.connections_canvas.connection_creation_data = this.connection_creation_data;
    }

    add_vab(data) {
        let vab = new VAB(data);
        vab.position = {x: 50, y: 50};
        this.vabs.push(vab);
        vab.$element.appendTo(this.$element);
        vab.$element.on('mousedown', this.process_mouse_down_listener);
    }

    handler_process_mouse_down(event) {
        if (this._is_transput(event.target)) {
            this.set_connection_creation_data_by_transput(event.target);
            event.preventDefault();
            $(document).on('mousemove', this.document_mouse_move_listener);
            $(document).on('mouseup', this.document_mouse_up_listener);
        }
    }

    handler_document_mouse_move(event) {
        this.connections_canvas.draw_with_creation(event.pageX, event.pageY, this.patch);
    }

    handler_document_mouse_up(event) {
        $(document).off('mousemove', this.document_mouse_move_listener);
        $(document).off('mouseup', this.document_mouse_up_listener);
        if ((this._is_transput_process(event.target) && this.connection_creation_data.destination) || (this._is_transput_element(event.target) && this.connection_creation_data.source)) {
            this.set_connection_creation_data_by_transput(event.target);
            this.patch.push(this.connection_creation_data);

        } else {
            console.log('invalidate connection');
        }
        this.connections_canvas.draw(this.patch);
        this.clear_connection_creation_data();
    }

    handler_document_vab_move() {
        this.connections_canvas.draw(this.patch);
    }

    handler_document_patch_remove(event, patch_index) {
        this.patch.splice(patch_index, 1);
        this.connections_canvas.draw(this.patch);
    }

    _is_transput(element) {
        return this._is_transput_process(element) || this._is_transput_element(element);
    }

    static _is_transput_element(element) {
        let $element = $(element);
        return $element.hasClass('element');
    }

    static _is_transput_process(element) {
        let $element = $(element);
        return $element.hasClass('process');
    }
}

module.exports = Relationship;