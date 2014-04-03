/*! jquery.confirm*/
(function ($) {

    /**
     * Show a confirmation dialog
     * @param options {title, text, confirm, cancel, confirmButton, cancelButton, post}
     */
    var $body = $("body");
    $.confirm = function (options, e) {
        // Default options
        var settings = $.extend($.confirm.options, {
            confirm: function (o) {
                var url = e && (('string' === typeof e && e) || (e.currentTarget && e.currentTarget.attributes['href'].value));
                if (url) {
                    if (options.post) {
                        var form = $('<form method="post" class="hide" action="' + url + '"></form>');
                        $body.append(form);
                        form.submit();
                    } else {
                        window.location = url;
                    }
                }
            },
            cancel: function (o) {
            },
            button: null
        }, options);

        // Modal
        var $overlay = $('div.fb-overlay');
        if (!$overlay[0]) {
            $overlay = $('<div class="fb-overlay"></div>').appendTo($body);
        }
        $overlay.show();
        var modalHeader = '';
        if (settings.title !== '') {
            modalHeader =
                '<div class=modal-header>' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                    '<h4 class="modal-title">' + settings.title+'</h4>' +
                '</div>';
        }
        var modalHTML =
                '<div class="confirm-modal modal fade" tabindex="-1" role="dialog">' +
                    '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                            modalHeader +
                            '<div class="modal-body">' + settings.text + '</div>' +
                            '<div class="modal-footer">' +
                                '<button class="confirm gh-button primary" type="button" data-dismiss="modal">' +
                                    settings.confirmButton +
                                '</button>';
                                if (settings.cancelButton) {
                                    modalHTML += '<button class="cancel gh-button default" type="button" data-dismiss="modal">' +
                                    settings.cancelButton +
                                    '</div>';
                                }
                            modalHTML += '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

        var modal = $(modalHTML);
        modal.find(".confirm").click(function () {
            settings.confirm(settings.button);
            $overlay.hide();
            modal.remove();
        });
        modal.find(".cancel").click(function () {
            settings.cancel(settings.button);
            $overlay.hide();
            modal.remove();
        });

        // Show the modal
        $body.append(modal);
        var h = modal.outerHeight();
        modal.show().css({top: ($body.height() - h) * 0.5});
        // modal.modal('show');
    };

    /**
     * Globally definable rules
     * @type {{text: string, title: string, confirmButton: string, cancelButton: string, post: boolean, confirm: Function, cancel: Function, button: null}}
     */
    $.confirm.options = {
        text: "Are you sure?",
        title: "",
        confirmButton: "Yes",
        cancelButton: "Cancel",
        post: false
    }
})(jQuery);
