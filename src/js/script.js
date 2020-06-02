//= jquery-3.5.1.min.js

/* BEGIN: Menu toggle */
function clickHeaderToggle() {
    document.querySelector('body').classList.toggle('menu-opened');
}

window.addEventListener("DOMContentLoaded", function () {
    document.querySelector('.nav-menu__toggle').addEventListener("click", clickHeaderToggle);
});
/* END: Menu toggle */

/* Код для отправки писем на почту */
let contactForm = $('.contact-form');//класс формы для отправки
let thanksVar = $('.thanks');//Класс блока после успешной отправки

contactForm.submit(function () {
    $.ajax({
        type: "POST",
        url: "./php/sendmail.php",
        dataType: "html",
        data: $(this).serialize()
    }).done(function () {
        thanksVar.fadeIn();

        contactForm.trigger("reset");

        setTimeout(function () {
            thanksVar.fadeOut();
        }, 3000);

    });
    return false;
});
/* END */
