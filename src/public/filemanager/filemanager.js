"use strict";
let Filemanager = function ($el, options) {
    this.$0 = $el;
    this.options = {
        url: 'filemanager',
        _token: 0,
        height: 500,
        callback: (data) => {},
    };
    $.extend(this.options, options);
    this.$0.data('filemanager', this);
    this.active_folder = '';
    this.multiple_select = false;
    this.items_selected = {};
    this.files = {};
}

Filemanager.prototype = {
    init: function () {
        this.templates();
        this.trees(`/api/${this.options.url}/folders`, this.active_folder);
        this.fetch(`/api/${this.options.url}`);
        this.events.a(this);
    },
    fetch: function (url) {
        $.get(url, this.options.query).done((res) => {
            if (res) {
                this.$main.find(`.scroll-view`).html('');
                $.each(res, (i, f) => {
                    this.$main.find(`.scroll-view`).append(this.item(f));
                });
            }
        });
    },
    trees: function (url, active) {
        var children = ($folder, folders) => {
            if (folders.length) {
                $.each(folders, (i, folder) => {
                    var $f = this.tree(folder, active);
                    if (folder.children.length) {
                        children($f, folder.children);
                    }
                    if ($folder.find(`>.fm_tree-list`).length) {
                        $folder.find(`>.fm_tree-list`).append($f);
                    } else {
                        $folder.append($f);
                    }
                });
            }
        }

        $.get(url).done((res) => {
            var $folders = $(`<ul class="fm_widget fm_tree"></ul>`);

            if (res) {
                children($folders, res);
            }

            this.$left.find(`[fm_id="folders"]`).html($folders);

        });
    },
    tree: function (data, active) {
        var $folder = $(`<li class="fm_tree-list-item fm_tree-list-item--parent" fm_id="${data.id}">
            <div class="fm_tree-folder ${ active == data.id ? 'fm_tree-folder--focused fm_tree-folder--selected' : null }">
                ${data.id == active|| data.children.find(o => o.id === active) ? `
                <div class="pl-1" fm_id="show_folder">
                    <i class="${ data.children.length ? null : 'invisible' } fa fa-sort-up"></i>
                </div>
                ` : `
                <div class="pl-1" fm_id="show_folder">
                    <i class="${ data.children.length ? null : 'invisible' } fa fa-sort-down"></i>
                </div>
                `}
                <div class="fm_tree-list-item__content">
                    <a class="d-flex" href="/${this.options.url}${data.id ? `/folder/${data.id}` : '' }">
                        <i
                            class="fa ${ data.id == active || data.children.find(o => o.id === active) ? 'fa-folder-open' : 'fa-folder' }"></i>
                        <span class="fm_tree-list-item__text">${data.name}</span>
                    </a>
                </div>
            </div>
            <ul class="fm_tree-list ${ data.id == active ||data.children.find(o => o.id === active) ? null : 'd-none' }">

            </ul>
        </li>`);
        this.events.folder(this, $folder, data);
        return $folder;
    },
    breadcrumb: function (data) {
        var $li = $(`<li class="breadcrumb-item"><a href="/${this.options.url}"><i class="fa fa-home"></i></a></li>`);
        $li.click((e) => {
            e.preventDefault();
            this.$left.find(`li[fm_id]:first a:first`).trigger('click');
        });
        this.$main.find('.breadcrumb').html($li);
        $.fn.reverse = [].reverse;

        var parents = [];
        var parent = (d) => {
            if (d.parent) {
                parents.push(d.parent);
                parent(d.parent);
            }
        };
        parent(data);
        if (parents.length) {
            $.each(parents.reverse(), (i, d) => {
                var $li = $(`<li class="breadcrumb-item"><a href="/${this.options.url}/folder/${d.id}">${d.name}</a></li>`);
                $li.click((e) => {
                    e.preventDefault();
                    this.$left.find(`li[fm_id="${d.id}"] a:first`).trigger('click');
                });
                this.$main.find('.breadcrumb').append($li);

            });
        }

        if (data.id) {
            var $li = $(`<li class="breadcrumb-item active">${data.name}</li>`);
            this.$main.find('.breadcrumb').append($li);
            $li.click((e) => {
                e.preventDefault();
                this.$left.find(`li[fm_id="${data.id}"] a:first`).trigger('click');
            });
        }
    },
    refresh() {
        this.$left.find(`li[fm_id="${this.active_folder}"]:first a:first`).trigger('click');
    },
    templates: function () {
        this.$container = $(`<div class="container-fluid h-100"><div class="row"></div></div>`);
        this.$left = $(` <div fm_id="left" class="${this.options.hide_information? 'col-xl-4' : 'col-xl-2'} px-0 py-2">
                <div class="fm_sidebar ">
                    <div class="fm_widget fm_layout fm_layout-rows">
                        <div aria-label="tab-content-topSection" class="fm_addingForm">
                            <div class="fm_widget fm_layout fm_layout-rows fm_form">
                                <button class="btn btn-primary btn-block" fm_id="add_button">
                                    <i class="fa fa-plus" aria-hidden="true"></i>
                                    ${Filemanager.prototype.languages.add}
                                </button>
                            </div>
                        </div>
                        <div class="pl-3 d-none d-lg-block" fm_id="folders">

                        </div>
                    </div>
                </div>
            </div>`);
        this.events.add(this, this.$left.find(`[fm_id="add_button"]`));
        this.$right = $(`<div fm_id="right" class="col-xl-2 d-none p-0">
                <div class="card shadow-none ">
                    <div class="card-header text-center py-2">
                    ${Filemanager.prototype.languages.information}
                    </div>
                    <div class="card-body p-0">
                        <div aria-label="tab-content-information-image" class="fm_layout-cell">
                            <div class="fm_layout-cell-content">

                            </div>
                        </div>
                    </div>
                </div>
            </div>`);


        this.$main = $(`<div fm_id="main" class="${this.options.hide_information? 'col-xl-8' : 'col-xl-10'} border">
                <div class="row align-items-center no-gutters d-none py-2" fm_id="upload">
                    <div tabindex="1" role="dialog" aria-modal="true" class="fm_widget w-100">
                    <div aria-label="tab-content-" class="fm_widget fm_layout fm_layout-rows fm_window fm_window--modal">
                        <div aria-label="tab-content-content" class="fm_window-content-without-header p-0">
                            <div class="fm_widget fm_layout fm_layout-rows fm_form">
                                <div class="fm_form-element p-2 border-bottom">
                                    <h5>${Filemanager.prototype.languages.upload_files}</h5>
                                </div>

                                <div class="fm_form-element scroll-upload p-2" style="min-height: 130px;max-height: 540px;height:100%;overflow-y: auto">

                                </div>

                                <div class="fm_layout-columns fm_layout-columns--around fm_window__buttons border-top py-2">
                                    <div aria-label="tab-content-cancel" class="fm_form-element">
                                        <button id="" fm_id="cancel" type="button"
                                            class="fm_button fm_button--color_primary fm_button--size_medium fm_button--view_link">
                                            <span class="fm_button__text">${Filemanager.prototype.languages.cancel}</span>
                                        </button>
                                    </div>
                                    <div aria-label="tab-content-apply" class="fm_form-element">
                                        <button id="" fm_id="apply" type="button"
                                            class="fm_button fm_button--color_primary fm_button--size_medium fm_button--view_flat">
                                            <span class="fm_button__text">${Filemanager.prototype.languages.upload}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                <div class="row align-items-center no-gutters  py-2">
                    <div class="col-xl-9">
                        <nav aria-label="breadcrumb" class="p-2 border">
                            <ol class="breadcrumb breadcrumb-links breadcrumb-light">
                                <li class="breadcrumb-item">
                                    <a href="/filemanager">
                                        <i class="fa fa-home"></i>
                                    </a>
                                </li>
                            </ol>
                        </nav>
                    </div>
                    <div class="col-xl-3">
                        <div class="input-group input-group-merge ">
                            <input fm_id="filter" class="form-control rounded-0" placeholder=" ${Filemanager.prototype.languages.search}" type="text">
                            <div class="input-group-append">
                                <span class="input-group-text"><i class="fa fa-search"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-row  d-none">
                    <div class="col-auto">
                        <button class="btn btn-primary">
                            <i class="fa fa-th-large"></i>
                        </button>
                        <button class="btn btn-primary">
                            <i class="fa fa-bars"></i>
                        </button>
                        <button class="btn btn-primary">
                            <i class="fa fa-sort-amount-up-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="scroll-view">

                </div>
            </div>`);
        this.events.filter(this, this.$main.find(`[fm_id="filter"]`));
        this.events.add_upload(this, this.$main.find(`.scroll-upload`));
        this.$main.find('.scroll-view').css({
            overflowY: 'auto',
            height: 450
        });
        this.$container.find('>.row').append(this.$left);
        this.$container.find('>.row').append(this.$main);
        this.$container.find('>.row').append(this.$right);
        this.$0.html(this.$container);
    },
    item: function (data) {
        var $item = $(`<div class="fm_dataview-item fm_dataview-item--with-gap" fm_id="${data.id}">
            <div class="fm_dataview-item__inner-html">
                <div class="fm_card_image-wrapper">
                    <div class="fm_card_image-sizer">
                        ${data.type == 'folder' ? `<div class="fm_grid-card__bg-icon fm_file-icon fm_file-icon--folder"></div>` :
                        data.extension == 'image' ? `<img draggable="false" class="fm_card_image" src="${data.path}">` :
                            `<div class="fm_grid-card__bg-icon fm_file-icon fm_file-icon--${data.extension}"></div>`
                        }

                    </div>
                </div>
                <div class="fm_grid-card__caption text-truncate">
                    ${data.name}
                </div>
            </div>
        </div>`);

        $item.data('fm', data);
        this.events.select(this, $item);
        this.events.contextmenu(this, $item);
        return $item;
    },
    selected: function (data, $el, event) {


        if (this.multiple_select) {
            this.items_selected[data.id] = data;
        } else {
            if (event.type == 'click') {
                this.items_selected = {};
            }
            this.items_selected[data.id] = data;
        }


        if ($el.find('.fm_dataview-item--selected').length) {
            if (event.type == 'contextmenu') {
                return;
            }
            $el.find('.fm_card_image-wrapper').removeClass('fm_dataview-item--selected').removeClass('fm_dataview-item--focus');
            return delete(this.items_selected[data.id]);
        } else {
            if (!this.options.hide_information) {
                this.$main.addClass('col-xl-8').removeClass('col-xl-10');
                this.$right.addClass('d-lg-block');
            }

        }
        if (!this.multiple_select) {
            this.$main.find(`.scroll-view`).find('.fm_card_image-wrapper').removeClass('fm_dataview-item--selected').removeClass('fm_dataview-item--focus');
        }
        $el.find('.fm_card_image-wrapper').addClass('fm_dataview-item--selected fm_dataview-item--focus');


    },
    information: function (data) {
        if (data.extension == 'image') {
            this.$right.find(`.fm_layout-cell-content`).html(`<img draggable="false" class="fm_tabbar__image" src=" ${data.path}">`);
        } else {
            this.$right.find(`.fm_layout-cell-content`).html(`<div class="fm_tabbar__bg-icon fm_file-icon fm_file-icon--${data.extension}"></div>`);
        }

        this.$right.find(`.fm_layout-cell-content`).append(`
                    <div aria-label="tab-content-information" class="fm_layout-cell">
                        <div class="fm_widget fm_layout fm_layout-rows fm_tabbar__form fm_form">
                            <div class="fm_form-element">
                                <div class="fm_form-group fm_form-group--textinput  fm_form-group--inline ">
                                <label class="fm_label" style="width: 90px; max-width: 100%;"> ${Filemanager.prototype.languages.name}</label>
                                <div class="fm_input__wrapper">
                                    <input type="text" readonly="" fm_id="name" name="name" value="${data.name}" aria-label="Name" class="fm_input fm_input--textinput">
                                </div>
                            </div>
                        </div>
                        <div aria-label="tab-content-size" class="fm_form-element">
                        <div class="fm_form-group fm_form-group--textinput  fm_form-group--inline ">
                            <label class="fm_label" style="width: 90px; max-width: 100%;"> ${Filemanager.prototype.languages.size}</label>
                            <div class="fm_input__wrapper">
                                <input type="text" readonly="" fm_id="size" name="size" value="${ this.helpers.formatSizeUnits(data.size)}" aria-label="Size" class="fm_input fm_input--textinput">
                            </div>
                        </div>
                    </div>
                    <div aria-label="tab-content-modified" class="fm_form-element ${data.type == 'folder'?  null :  'd-none'}">
                    <div class="fm_form-group fm_form-group--textinput  fm_form-group--inline ">
                    <label class="fm_label" style="width: 90px; max-width: 100%;"> ${Filemanager.prototype.languages.files_count}</label>
                        <div class="fm_input__wrapper">
                            <input type="text" readonly="" fm_id="files_count" name="filescount" value="${data.files_count}"aria-label="Modified" class="fm_input fm_input--textinput">
                        </div>
                    </div>
                </div>
                    <div aria-label="tab-content-modified" class="fm_form-element ${data.type == 'folder'? 'd-none' : null}">
                        <div class="fm_form-group fm_form-group--textinput  fm_form-group--inline ">
                        <label class="fm_label" style="width: 90px; max-width: 100%;"> ${Filemanager.prototype.languages.modified}</label>
                            <div class="fm_input__wrapper">
                                <input type="text" readonly="" fm_id="modified" name="modified" value="${this.helpers.timeago(new Date(data.updated_at))}"aria-label="Modified" class="fm_input fm_input--textinput">
                            </div>
                        </div>
                    </div>
                    <div aria-label="tab-content-created" class="fm_form-element ${data.type == 'folder'? 'd-none' : null}">
                        <div class="fm_form-group fm_form-group--textinput  fm_form-group--inline ">
                        <label class="fm_label" style="width: 90px; max-width: 100%;"> ${Filemanager.prototype.languages.created}</label>
                            <div class="fm_input__wrapper">
                                <input type="text" readonly="" fm_id="created" name="created" value="${this.helpers.timeago(new Date(data.created_at))}" aria-label="Created" class="fm_input fm_input--textinput">
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);
    },

    events: {
        a: function (self) {
            this.resize(self);
            $(window).resize(() => this.resize(self));
            this.drop(self);
            $(document).click((e) => {
                self.$0.find(`.fm_context-menu`).remove();
            }).keydown(e => {
                if (self.options.multiple == false) {
                    self.multiple_select = false;
                } else {
                    self.multiple_select = e.ctrlKey;
                }

            }).keyup(e => {
                self.multiple_select = e.ctrlKey;
            });


            self.$main.find(`[fm_id="upload"]`).find(`[fm_id="cancel"]`).click(e => {
                self.files = {};
                self.$main.find(`[fm_id="upload"]`).find(`.scroll-upload`).html('');
                self.$main.find(`[fm_id="upload"]`).addClass('d-none');
            });

        },
        add: function (self, $el) {
            $el.click(() => {
                self.$0.find(`.fm_context-menu`).remove();
                var $t = $(`<div class="fm_context-menu">
                <ul class="fm_widget fm_menu fm_add-menu position-absolute"
                    style="width: calc(100% - 23px)" aria-live="polite">
                    <li class="fm_menu-item" role="none">
                        <button class="fm_button fm_menu-button" fm_id="add_folder" type="button"
                            role="menuitem" aria-disabled="false">
                            <span class="fm_menu-button__block fm_menu-button__block--left">
                                <i class="fa fa-folder-plus text-gray pr-2"></i>
                                <span class="fm_menu-button__text">${Filemanager.prototype.languages.add_folder}</span>
                            </span>
                        </button>
                    </li>
                    <li class="fm_menu-item" role="none">
                        <button class="fm_button fm_menu-button" fm_id="add_file" type="button"
                            role="menuitem" aria-disabled="false">
                            <span class="fm_menu-button__block fm_menu-button__block--left">
                                <i class="fa fa-file text-gray pr-2"></i>
                                <span class="fm_menu-button__text">${Filemanager.prototype.languages.add_file}</span>
                            </span>
                        </button>
                    </li>
                    <li class="fm_menu-item" role="none">
                        <button class="fm_button fm_menu-button" fm_id="add_upload" type="button"
                            role="menuitem" aria-disabled="false">
                            <span class="fm_menu-button__block fm_menu-button__block--left">
                                <i class="fa fa-upload text-gray pr-2"></i>
                                <span class="fm_menu-button__text">${Filemanager.prototype.languages.upload_files}</span>
                            </span>
                        </button>
                    </li>
                </ul>
            </div>`);
                this.add_folder(self, $t.find(`[fm_id="add_folder"]`));
                this.add_file(self, $t.find(`[fm_id="add_file"]`));
                this.add_upload(self, $t.find(`[fm_id="add_upload"]`));
                $el.parent().parent().append($t);
                return false;
            });
        },
        add_folder: function (self, $el) {
            $el.click(() => {
                var $overlay = $(`<div class="fm_window__overlay"></div>`);
                var $t = $(`<div tabindex="1" role="dialog" aria-modal="true" class="fm_popup fm_widget fm_popup--window_modal"
                style="position: fixed; width: 400px; ">
                <div aria-label="tab-content-" class="fm_widget fm_layout fm_layout-rows fm_window fm_window--modal">
                    <div aria-label="tab-content-content" class="fm_window-content-without-header">
                        <div class="fm_widget fm_layout fm_layout-rows fm_form">
                            <div class="fm_form-element">
                                <div class="fm_form-group ">
                                    <label for=""
                                        class="fm_label">${Filemanager.prototype.languages.add_new_folder_to_current_folder}</label>
                                    <div class="fm_input__wrapper">
                                        <div class="fm_input__container">
                                            <input type="text" fm_id="name" id="" placeholder="${Filemanager.prototype.languages.folder_name}" name="name"
                                                class="fm_input " autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div aria-label="tab-content-" class="fm_form-element">
                                <div></div>
                            </div>
                            <div class="fm_layout-columns fm_layout-columns--around fm_window__buttons">
                                <div aria-label="tab-content-cancel" class="fm_form-element">
                                    <button id="" fm_id="cancel" type="button"
                                        class="fm_button fm_button--color_primary fm_button--size_medium fm_button--view_link">
                                        <span class="fm_button__text">${Filemanager.prototype.languages.cancel}</span>
                                    </button>
                                </div>
                                <div aria-label="tab-content-apply" class="fm_form-element">
                                    <button id="" fm_id="apply" type="button"
                                        class="fm_button fm_button--color_primary fm_button--size_medium fm_button--view_flat">
                                        <span class="fm_button__text">${Filemanager.prototype.languages.apply}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);
                $overlay.click(e => {
                    $overlay.remove();
                    $t.remove();
                });
                $t.find(`[fm_id="cancel"]`).click(() => {
                    $t.remove();
                    $overlay.remove();
                });
                $t.find(`[fm_id="apply"]`).click(() => {

                    $t.find(`[fm_id="waring"]`).remove();
                    var name = $t.find(`[fm_id="name"]`).val();
                    var formData = new FormData();
                    formData.append('name', name);
                    formData.append('parent_id', self.active_folder);
                    formData.append('type', 'folder');
                    formData.append('extension', 'folder');
                    formData.append('_token', self.options._token);
                    if (name) {
                        $.ajax({
                            url: `/api/${self.options.url}`,
                            method: 'POST',
                            processData: false,
                            contentType: false,
                            data: formData,
                            success: (res) => {
                                if (res) {
                                    self.$left.find(`li[fm_id="${self.active_folder}"]>div>div>i`).removeClass('invisible');
                                    self.$left.find(`li[fm_id="${self.active_folder}"]>.fm_tree-list`).append(self.tree(res));
                                    self.$main.find(`.scroll-view`).prepend(self.item(res));
                                    $t.remove();
                                    $overlay.remove();
                                } else {
                                    $t.find(`[fm_id="name"]`).after(`<div fm_id="waring" class="my-2 text-red text-sm">Folder already exists.</div>`);
                                }
                            },

                        });


                    }
                });

                self.$0.append($overlay);
                self.$0.append($t);
                self.events.resize(self);
            });
        },
        add_file: function (self, $el) {
            $el.click(() => {
                var $overlay = $(`<div class="fm_window__overlay"></div>`);
                var $t = $(`<div tabindex="1" role="dialog" aria-modal="true" class="fm_popup fm_widget fm_popup--window_modal"
                style="position: fixed; width: 400px; ">
                <div aria-label="tab-content-" class="fm_widget fm_layout fm_layout-rows fm_window fm_window--modal">
                    <div aria-label="tab-content-content" class="fm_window-content-without-header">
                        <div class="fm_widget fm_layout fm_layout-rows fm_form">
                            <div class="fm_form-element">
                                <div class="fm_form-group ">
                                    <label for=""
                                        class="fm_label">${Filemanager.prototype.languages.add_new_file_to_current_folder}</label>
                                    <div class="fm_input__wrapper">
                                        <div class="fm_input__container">
                                            <input type="text" fm_id="name" id="" placeholder="${Filemanager.prototype.languages.file_name}" name="name"
                                                class="fm_input " autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div aria-label="tab-content-" class="fm_form-element">
                                <div></div>
                            </div>
                            <div class="fm_layout-columns fm_layout-columns--around fm_window__buttons">
                                <div aria-label="tab-content-cancel" class="fm_form-element">
                                    <button id="" fm_id="cancel" type="button"
                                        class="fm_button fm_button--color_primary fm_button--size_medium fm_button--view_link">
                                        <span class="fm_button__text">${Filemanager.prototype.languages.cancel}</span>
                                    </button>
                                </div>
                                <div aria-label="tab-content-apply" class="fm_form-element">
                                    <button id="" fm_id="apply" type="button"
                                        class="fm_button fm_button--color_primary fm_button--size_medium fm_button--view_flat">
                                        <span class="fm_button__text">${Filemanager.prototype.languages.apply}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);
                $overlay.click(e => {
                    $overlay.remove();
                    $t.remove();
                });
                $t.find(`[fm_id="cancel"]`).click(function () {
                    $t.remove();
                    $overlay.remove();
                });
                $t.find(`[fm_id="apply"]`).click(function () {
                    var name = $t.find(`[fm_id="name"]`).val();
                    var formData = new FormData();
                    formData.append('name', name);
                    formData.append('parent_id', self.active_folder);
                    formData.append('type', 'file');
                    formData.append('_token', self.options._token);
                    if (name) {
                        $.ajax({
                            url: `/api/${self.options.url}`,
                            method: 'POST',
                            processData: false,
                            contentType: false,
                            data: formData,
                            success: (res) => {
                                if (res) {
                                    self.$main.find(`.scroll-view`).prepend(self.item(res));
                                    $t.remove();
                                    $overlay.remove();
                                } else {
                                    $t.find(`[fm_id="name"]`).after(`<div fm_id="waring" class="my-2 text-red text-sm">File already exists.</div>`);
                                }
                            },


                        });

                    }
                });

                self.$0.append($overlay);
                self.$0.append($t);
                self.events.resize(self);
            });
        },
        files: function (self, files) {
            $.each(files, (i, file) => {
                var $ajax;
                if (self.files[file.name]) {
                    return;
                }
                var ext = self.helpers.types(file.name.split('.').pop());
                var data = {
                    name: file.name,
                    path: URL.createObjectURL(file),
                    extension: ext,
                    size: file.size,
                    mime: file.type
                };
                self.files[file.name] = data;
                var $btndel = $(`<i class="fa fa-times fa-z position-absolute text-danger p-1" style=" z-index: 1; right: 0;"></i>`);
                var $item = $(`<div class="fm_dataview-item fm_dataview-item--with-gap position-relative" fm_id="">
                    <div class="fm_dataview-item__inner-html">
                        <div class="fm_card_image-wrapper">
                            <div class="fm_card_image-sizer">
                                ${ ext == 'image' ? `<img draggable="false" class="fm_card_image" src="${URL.createObjectURL(file)}">` :
                                    `<div class="fm_grid-card__bg-icon fm_file-icon fm_file-icon--${ext}"></div>`
                                }

                            </div>
                        </div>
                        <div class="fm_grid-card__caption text-truncate">
                            ${file.name}
                        </div>
                    </div>
                </div>`);
                $item.prepend($btndel);
                $btndel.click(e => {
                    delete self.files[file.name];
                    $item.remove();
                    if ($ajax) {
                        $ajax.abort();
                    }
                    if (Object.values(self.files).length == 0) {
                        self.$main.find(`[fm_id="upload"]`).find(`[fm_id="cancel"]`).click();
                        self.refresh();
                    }
                    return false;
                });
                $item.data('fm', data);
                self.$main.find(`[fm_id="upload"]`).find(`.scroll-upload`).append($item);
                self.events.select(self, $item);

                var formData = new FormData();
                formData.append('_token', self.options._token);
                formData.append('file', file);
                $ajax = $.ajax({
                    url: `/api/${self.options.url}/temp/upload`,
                    method: 'POST',
                    processData: false,
                    contentType: false,
                    data: formData,
                    success: (res) => {
                        if (res) {

                        }
                    },
                });

            });
            if (Object.values(self.files).length) {
                self.$main.find(`[fm_id="upload"]`).find(`[fm_id="apply"]`).unbind().click(e => {

                    var formData = new FormData();
                    formData.append('parent_id', self.active_folder);
                    formData.append('type', 'file');
                    formData.append('_token', self.options._token);
                    $.each(Object.values(self.files), (i, file) => {
                        formData.append(`allfiles[${i}][name]`, file.name);
                        formData.append(`allfiles[${i}][size]`, file.size);
                        formData.append(`allfiles[${i}][extension]`, file.extension);
                        formData.append(`allfiles[${i}][mime]`, file.mime);
                    });

                    $.ajax({
                        url: `/api/${self.options.url}/temp/store`,
                        method: 'POST',
                        processData: false,
                        contentType: false,
                        data: formData,
                        success: (res) => {
                            self.$main.find(`[fm_id="upload"]`).find(`[fm_id="cancel"]`).click();
                            self.refresh();
                        },
                    });

                });
            }

        },
        add_upload: function (self, $el) {
            $el.click(() => {
                var $input = $(`<input type="file" multiple style="display:none">`);

                $input.on('input', (e) => {
                    self.$main.find(`[fm_id="upload"]`).removeClass('d-none');
                    this.files(self, e.target.files);
                });
                self.$0.append($input);
                $input.trigger('click');
            });
        },
        drop: function (self) {
            self.$0
                .on('dragover', (e) => {
                    e.preventDefault();
                    self.$main.find(`[fm_id="upload"]`).removeClass('d-none');
                })
                .on('drop', (e) => {
                    this.files(self, e.originalEvent.dataTransfer.files);
                    e.preventDefault();
                    return false;
                })
                .on('dragleave', (e) => {

                });
        },
        folder: function (self, $el, data) {
            $el.find(`[fm_id="show_folder"]:first`).click(e => {
                if ($el.find(`[fm_id="show_folder"]:first>i`).hasClass('fa-sort-down')) {
                    $el.find(`[fm_id="show_folder"]:first>i`).addClass('fa-sort-up').removeClass('fa-sort-down');
                    $el.find('.fm_tree-list-item__content').find('i').addClass('fa-folder-open').removeClass('fa-folder');
                    $el.find('>.fm_tree-list:first').removeClass('d-none');
                } else {
                    $el.find(`[fm_id="show_folder"]:first>i`).addClass('fa-sort-down').removeClass('fa-sort-up');
                    $el.find('.fm_tree-list-item__content').find('i').addClass('fa-folder').removeClass('fa-folder-open');
                    $el.find('>.fm_tree-list:first').addClass('d-none');
                }
            });
            $el.find('a').click(e => {
                e.preventDefault();
                self.active_folder = data.id;
                self.$left.find(`[fm_id="${data.id}"]`).find('>.fm_tree-list').removeClass('d-none');
                self.$left.find('.fm_tree-folder').removeClass().addClass('fm_tree-folder');
                if (data.id) {
                    self.fetch(`/api/${self.options.url}/folder/${data.id}`);
                } else {
                    self.fetch(`/api/${self.options.url}`);
                }

                $el.find('>.fm_tree-folder').addClass('fm_tree-folder--focused fm_tree-folder--selected');

                if ($el.find(`[fm_id="show_folder"]:first>i`).hasClass('invisible')) {
                    $el.find(`[fm_id="show_folder"]:first>i`).removeClass().addClass('fa fa-sort-up invisible');
                } else {
                    $el.find(`[fm_id="show_folder"]:first>i`).removeClass().addClass('fa fa-sort-up');
                }

                $el.find(`.fm_tree-list-item__content:first i`).removeClass().addClass('fa fa-folder-open');


                self.breadcrumb(data);



            });
        },
        select: function (self, $el) {
            $el.click((e) => {
                var data = $el.data('fm');
                self.selected(data, $el, e);
                self.information(data);
                self.options.callback(data);
                return false;
            }).dblclick(e => {
                var data = $el.data('fm');
                if (data.type == 'folder') {
                    self.$left.find(`[fm_id="${data.id}"]`).find('a:first').click();
                }

                return false;
            });
        },
        contextmenu: function (self, $el) {
            $el.contextmenu(e => {
                e.preventDefault();
                var data = $el.data('fm');
                self.selected(data, $el, e);
                self.information(data);
                self.$0.find(`.fm_context-menu`).remove();
                var $t = $(`<div class="fm_context-menu">
                        <ul class="fm_widget fm_menu" tabindex="0" role="menu" aria-live="polite"
                            style="min-width: 190px; position: fixed;">
                            <li class="fm_menu-item" role="none">
                                <button class="fm_button fm_menu-button" fm_id="add_file" type="button" role="menuitem"
                                    aria-disabled="false">
                                    <span class="fm_menu-button__block fm_menu-button__block--left">
                                        <i class="fa fa-file text-gray pr-2"></i>
                                        <span class="fm_menu-button__text">${Filemanager.prototype.languages.add_file}</span>
                                    </span>
                                </button>
                            </li>
                            <li class="fm_menu-item" role="none">
                                <button class="fm_button fm_menu-button" fm_id="add_folder" type="button" role="menuitem"
                                    aria-disabled="false">
                                    <span class="fm_menu-button__block fm_menu-button__block--left">
                                      <i class="fa fa-folder-plus text-gray pr-2"></i>
                                        <span class="fm_menu-button__text">${Filemanager.prototype.languages.add_folder}</span>
                                    </span>
                                </button>
                            </li>
                            <li class="fm_menu-item ${data == undefined ?'d-none':null}" role="none">
                                <button class="fm_button fm_menu-button" fm_id="rename" type="button" role="menuitem"
                                    aria-disabled="false">
                                    <span class="fm_menu-button__block fm_menu-button__block--left">
                                         <i class="fa fa-edit text-gray pr-2"></i>
                                        <span class="fm_menu-button__text">${Filemanager.prototype.languages.rename}</span>
                                    </span>
                                </button>
                            </li>
                            <li class="fm_menu-item ${data == undefined ?'d-none':null}" role="none">
                                <button class="fm_button fm_menu-button" fm_id="delete" type="button" role="menuitem"
                                    aria-disabled="false">
                                    <span class="fm_menu-button__block fm_menu-button__block--left">
                                        <i class="fa fa-trash text-gray pr-2"></i>
                                        <span class="fm_menu-button__text">${Filemanager.prototype.languages.delete}</span>
                                    </span>
                                    <span class="fm_menu-button__block fm_menu-button__block--right">
                                        <span class="fm_menu-button__hotkey">Del</span>
                                    </span>
                                </button>
                            </li>
                        </ul>
                    </div>`);
                this.add_file(self, $t.find(`[fm_id="add_file"]`));
                this.add_folder(self, $t.find(`[fm_id="add_folder"]`));
                this.rename(self, $el, $t.find(`[fm_id="rename"]`), data);
                this.delete(self, $t.find(`[fm_id="delete"]`));
                $t.find(`.fm_menu`).css({
                    top: e.pageY,
                    left: e.pageX,
                });
                self.$0.append($t);
            });
        },
        filter: function (self, $el) {
            $el.on('input', (e) => {
                var val = $el.val();
                if (val) {
                    self.$main.find(`.scroll-view >.fm_dataview-item`).each(function () {
                        var data = $(this).data('fm');
                        var patt = new RegExp(val);
                        var res = patt.test(data.name);
                        if (res) {
                            $(this).removeAttr('style');
                        } else {
                            $(this).css('display', 'none');
                        }
                    });
                } else {
                    self.$main.find(`.scroll-view >.fm_dataview-item`).removeAttr('style');
                }
            });
        },
        rename: function (self, $item, $el, data) {
            $el.click(() => {
                var $overlay = $(`<div class="fm_window__overlay"></div>`);
                var $t = $(`
                <div tabindex="1" role="dialog" aria-modal="true" class="fm_popup fm_widget fm_popup--window_modal" style="position: fixed; width: 400px; ">
                    <div aria-label="tab-content-" class="fm_widget fm_layout fm_layout-rows fm_window fm_window--modal" >
                        <div aria-label="tab-content-content" class="fm_window-content-without-header" >
                            <div class="fm_widget fm_layout fm_layout-rows fm_form" >
                                <div class="fm_form-element">
                                    <div class="fm_form-group ">
                                        <label for="" class="fm_label">Rename "${data.name}" ${data.type == 'file' ? Filemanager.prototype.languages.file : Filemanager.prototype.languages.folder }</label>
                                        <div class="fm_input__wrapper">
                                            <div class="fm_input__container">
                                                <input type="text" fm_id="name" id="" placeholder="${data.name}" name="name" class="fm_input " autocomplete="off">
                                             </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div aria-label="tab-content-" class="fm_form-element" >
                                        <div></div>
                                    </div>
                                <div class="fm_layout-columns fm_layout-columns--around fm_window__buttons">
                                    <div aria-label="tab-content-cancel" class="fm_form-element">
                                        <button id="" fm_id="cancel" type="button" class="fm_button fm_button--color_primary fm_button--size_medium fm_button--view_link">
                                            <span class="fm_button__text">${Filemanager.prototype.languages.cancel}</span>
                                        </button>
                                    </div>
                                    <div aria-label="tab-content-apply" class="fm_form-element">
                                        <button id="" fm_id="apply" type="button" class="fm_button fm_button--color_primary fm_button--size_medium fm_button--view_flat">
                                            <span class="fm_button__text">${Filemanager.prototype.languages.apply}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `);
                $overlay.click(e => {
                    $overlay.remove();
                    $t.remove();
                });
                $t.find(`[fm_id="name"]`).val(data.name);
                $t.find(`[fm_id="cancel"]`).click(function () {
                    $t.remove();
                    $overlay.remove();
                });
                $t.find(`[fm_id="apply"]`).click(function () {
                    var name = $t.find(`[fm_id="name"]`).val();
                    var formData = new FormData();
                    formData.append('name', name);
                    //formData.append('parent_id', self.active_folder);
                    formData.append('type', data.type);
                    formData.append('_token', self.options._token);
                    formData.append('_method', 'put');
                    if (name != data.name) {
                        $.ajax({
                            url: `/api/${self.options.url}/${data.id}`,
                            method: 'POST',
                            processData: false,
                            contentType: false,
                            data: formData,
                            success: (res) => {
                                if (res) {
                                    $item.data('fm', res);
                                    self.information(res);
                                    $(`[fm_id="${res.id}"]`).find(`>.fm_tree-folder .fm_tree-list-item__text`).text(res.name);
                                    $item.find(`.fm_grid-card__bg-icon`).attr('class', `fm_grid-card__bg-icon fm_file-icon fm_file-icon--${res.extension}`);
                                    $item.find(`.fm_grid-card__caption`).text(res.name);
                                    $t.remove();
                                    $overlay.remove();
                                } else {
                                    $t.find(`[fm_id="name"]`).after(`<div fm_id="waring" class="my-2 text-red text-sm">File already exists.</div>`);
                                }
                            },

                        });
                        $t.remove();
                        $overlay.remove();
                    }
                });

                self.$0.append($overlay);
                self.$0.append($t);
                self.events.resize(self);
            });
        },
        delete: function (self, $el) {
            $el.click(() => {
                var formData = new FormData();
                formData.append('_token', self.options._token);
                formData.append('_method', 'delete');
                $.ajax({
                    url: `/api/${self.options.url}/${Object.keys(self.items_selected).join()}`,
                    method: 'POST',
                    processData: false,
                    contentType: false,
                    data: formData,
                    success: (res) => {
                        if (res) {
                            self.$right.find(`.fm_layout-cell-content`).html('');
                            $.each(Object.values(self.items_selected), (i, data) => {
                                self.$main.find(`[fm_id="${data.id}"]`).remove();
                                if (data.type == 'folder') {
                                    self.$left.find(`li[fm_id="${data.id}"]`).remove();
                                    if (self.$left.find(`li[fm_id="${data.parent_id}"] .fm_tree-list:first`).find('li').length == 0) {
                                        self.$left.find(`li[fm_id="${data.parent_id}"] [fm_id="show_folder"]:first>i`).addClass('invisible');
                                    }
                                }

                            });



                        }
                    },

                });
            });

        },
        resize: function (self) {

            self.$0.find(`.fm_context-menu`).remove();
            self.$0.find(`.fm_popup`).css({
                top: window.innerHeight / 2 - 150,
                left: window.innerWidth / 2 - 200,
            });
        }
    },
    helpers: {
        types: function (t) {
            var types = {
                'jpg': 'image',
                'jpeg': 'image',
                'png': 'image',
                'doc': 'document',
                'docx': 'document',
                'dmg': 'apple',
                'dmg': 'apple',
                'txt': 'text',
                'log': 'text',
                'exe': 'application',
                'msi': 'application',
                'dll': 'application',
                'sys': 'application',
                'bat': 'application',
                'html': 'web',
                'htm': 'web',
                'xml': 'web',
                'pdf': 'pdf',
                'ppt': 'presentation',
                'psd': 'psd',
                'wav': 'audio',
                'mp3': 'audio',
                'xls': 'table',
                'xlsx': 'table',
                'zip': 'archive',
                'rar': 'archive',
                'iso': 'archive',
                'mp4': 'video',
                'mov': 'video',
                'flv': 'video',
            };
            return types[t] != undefined ? types[t] : 'other';
        },
        formatSizeUnits: function (bytes) {
            if (bytes >= 1073741824) {
                bytes = (bytes / 1073741824).toFixed(2) + ` ${Filemanager.prototype.languages.gb}`;
            } else if (bytes >= 1048576) {
                bytes = (bytes / 1048576).toFixed(2) + ` ${Filemanager.prototype.languages.mb}`;
            } else if (bytes >= 1024) {
                bytes = (bytes / 1024).toFixed(2) + ` ${Filemanager.prototype.languages.kb}`;
            } else if (bytes > 1) {
                bytes = `${bytes} ${Filemanager.prototype.languages.byte}`;
            } else if (bytes == 1) {
                bytes = `${bytes} ${Filemanager.prototype.languages.byte}`;
            } else {
                bytes = `0 ${Filemanager.prototype.languages.bytes}`;
            }
            return bytes;
        },
        timeago: function (date) {

            var seconds = Math.floor((new Date() - date) / 1000);

            var interval = seconds / 31536000;

            if (interval > 1) {
                return `${Math.floor(interval)} ${Filemanager.prototype.languages.years}`;
            }
            interval = seconds / 2592000;
            if (interval > 1) {
                return `${Math.floor(interval)} ${Filemanager.prototype.languages.months}`;

            }
            interval = seconds / 86400;
            if (interval > 1) {
                return `${Math.floor(interval)} ${Filemanager.prototype.languages.days}`;

            }
            interval = seconds / 3600;
            if (interval > 1) {

                return `${Math.floor(interval)} ${Filemanager.prototype.languages.hours}`;
            }
            interval = seconds / 60;
            if (interval > 1) {

                return `${Math.floor(interval)} ${Filemanager.prototype.languages.minutes}`;
            }
            return `${Math.floor(seconds)} ${Filemanager.prototype.languages.seconds}`;

        }
    },
    languages: {
        years: 'years',
        months: 'months',
        days: 'days',
        hours: 'hours',
        minutes: 'minutes',
        seconds: 'seconds',
        add: 'Add',
        folder: 'folder',
        file: 'file',
        add_folder: 'Add folder',
        add_file: 'Add file',
        add_new_folder_to_current_folder: 'Add new folder to current folder',
        add_new_file_to_current_folder: 'Add new file to current folder',
        upload: 'Upload',
        upload_files: 'Upload files',
        folder_name: 'Folder name',
        file_name: 'File name',
        cancel: 'Cancel',
        rename: 'Rename',
        delete: 'Delete',
        apply: 'Apply',
        search: 'Search',
        information: 'Information',
        size: 'Size',
        name: 'Name',
        modified: 'Modified',
        created: 'Created',
        ok: 'Ok',
        files_count: 'Files count',
        byte: 'byte',
        bytes: 'bytes',
        kb: 'KB',
        mb: 'MB',
        gb: 'GB',
    },
}

$.fn.filemanager = function (opts) {
    var filemanager;
    var $modal = $(`<div id="filemanager-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-xl" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            <div id="filemanager"></div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary disabled" id="submit">${Filemanager.prototype.languages.ok}</button>
                        </div>
                    </div>
                </div>
        </div>`);
    var options = {
        callback: data => {
            $modal.find('.modal-footer #submit').removeClass('disabled');
        },
        template: data => {
            //multiple
            var $t = $(`<div class="border m-1" style="width:120px;height:120px;float:left;position: relative;">
                <i id="del" class="fa fa-times fa-z position-absolute text-danger p-1" style=" z-index: 1; right: 0;"></i>
                <input type="hidden" class="form-control" name="${options.input_name}" value="${data.path}">
                <img width="100%" height="100%" src="${data.path}" style="object-fit: contain">
                </div>`);
            $t.find('#del').click(() => {
                $t.remove();
            });
            var target = $(this).data('target');
            $(target).append($t);
        }
    }
    $.extend(options, opts);
    filemanager = new Filemanager($modal.find(`#filemanager`), options);

    $modal.find('.modal-footer #submit').click((e) => {

        $modal.modal('hide');
        $.each(Object.values(filemanager.items_selected), (i, data) => {

            //One
            var input = $(this).data('target-input');
            var image = $(this).data('target-image');
            $(input).val(data.path);

            if (data.extension == 'image') {
                $(image).attr('src', `${data.path}`);
            }

            options.template(data);

        });
        filemanager.items_selected = {};
    });
    $(this).click(e => {
        e.preventDefault();
        $modal.modal();
        filemanager.init();
    });
    return filemanager;
}
