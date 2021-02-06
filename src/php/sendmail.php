<?php

if (isset($_POST['your_massage'])) {
    $comment = $_POST['your_massage'];
} else {
    $comment = '';
}

if (isset($_POST['form_name'])) {
    $comment = $comment . ' | ' . $_POST['formname'];
}


if (isset($_POST['your_name'])) {
    $name = $_POST['your_name'];
} else {
    $name = 'Безымянный';
}

if (isset($_POST['your_email'])) {
    $your_email = $_POST['your_email'];
} else {
    $your_email = 'не указал email';
}


    $to = 'info@developer-master.ru';

    $subject = 'Письмо c сайта developer-master.ru'; //Заголовок сообщения
    $message = '
                  <html>
                    <head>
                      <title>' . $subject . '</title>
                      </head>
                  <body>
                      <p><b>Имя:</b> ' . $name . '</p>
                      <p><b>E-mail:</b> ' . $your_email . '</p>
                      <p><b>Комментарий:</b> ' . $comment . '</p>
                  </body>
                  </html>'; //Текст нащего сообщения можно использовать HTML теги
    $headers = "Content-type: text/html; charset=utf-8 \r\n"; //Кодировка письма
    $headers .= "From: Письмо с сайта  <info@developer-master.ru>\r\n"; //Наименование и почта отправителя

    mail($to, $subject, $message, $headers); //Отправка письма с помощью функции mail
