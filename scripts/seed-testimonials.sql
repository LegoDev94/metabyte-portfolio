-- Удаляем старые отзывы
DELETE FROM "TestimonialTranslation";
DELETE FROM "Testimonial";

-- Обновляем статистику
UPDATE "TestimonialStats" SET
  "avgRating" = 4.9,
  "totalPositive" = 28,
  "totalNegative" = 0,
  "platform" = 'YouDo',
  "platformUrl" = 'https://youdo.com/u8042702',
  "updatedAt" = NOW()
WHERE id = 'default';

-- Если статистики нет, создаём
INSERT INTO "TestimonialStats" (id, "avgRating", "totalPositive", "totalNegative", platform, "platformUrl", "updatedAt")
VALUES ('default', 4.9, 28, 0, 'YouDo', 'https://youdo.com/u8042702', NOW())
ON CONFLICT (id) DO NOTHING;

-- 1. Стефания В. - 24 января 2026
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t1', 5, 'YouDo', '2026-01-24', 1);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t1_ru', 't1', 'ru', 'Стефания В.', 'Разработка онлайн игры «Нарды» для дипломной работы', 'Супер приятный исполнитель, очень быстро и качественно сделал работу!'),
  ('t1_ro', 't1', 'ro', 'Stefania V.', 'Dezvoltarea jocului online «Table» pentru lucrarea de diplomă', 'Un executant super plăcut, a făcut treaba foarte repede și calitativ!');

-- 2. Максим Р. - 20 января 2026
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t2', 5, 'YouDo', '2026-01-20', 2);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t2_ru', 't2', 'ru', 'Максим Р.', 'Анимация css/js на border, как на Gemeni 1в1', 'Все отлично, работа выполнена быстро и с 1 раза, рекомендую.'),
  ('t2_ro', 't2', 'ro', 'Maxim R.', 'Animație css/js pe border, ca pe Gemini 1 la 1', 'Totul excelent, lucrul efectuat rapid și din prima, recomand.');

-- 3. Олеся Ц. - 4 декабря 2025
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t3', 5, 'YouDo', '2025-12-04', 3);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t3_ru', 't3', 'ru', 'Олеся Ц.', 'Верстка сайта', 'Спасибо, все ок.'),
  ('t3_ro', 't3', 'ro', 'Olesea Ț.', 'Asamblarea site-ului', 'Mulțumesc, totul ok.');

-- 4. Роман - 19 октября 2025
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t4', 5, 'YouDo', '2025-10-19', 4);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t4_ru', 't4', 'ru', 'Роман', 'Сделать сайт рулетку CS', 'Все максимально внятно, понятно, а главное быстро. Созвонились по видео, обсудили все детали и рабочие моменты, спустя пару часов приступили к работе. Рекомендую'),
  ('t4_ro', 't4', 'ro', 'Roman', 'Crearea unui site ruletă CS', 'Totul maxim de clar, de înțeles, și cel mai important - rapid. Ne-am conectat video, am discutat toate detaliile și momentele de lucru, peste câteva ore am început lucrul. Recomand');

-- 5. Руслан - 8 сентября 2025
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t5', 5, 'YouDo', '2025-09-08', 5);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t5_ru', 't5', 'ru', 'Руслан', 'Web-программирование на Java', 'Всё отлично!'),
  ('t5_ro', 't5', 'ro', 'Ruslan', 'Programare web pe Java', 'Totul excelent!');

-- 6. Анна - 3 сентября 2025
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t6', 5, 'YouDo', '2025-09-03', 6);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t6_ru', 't6', 'ru', 'Анна', 'Сделать игру в Unity', 'Все оперативно и по делу! Очень хороший специалист, рекомендую!'),
  ('t6_ro', 't6', 'ro', 'Anna', 'Crearea unui joc în Unity', 'Totul operativ și la obiect! Specialist foarte bun, recomand!');

-- 7. Иван И. - 23 августа 2025
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t7', 5, 'YouDo', '2025-08-23', 7);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t7_ru', 't7', 'ru', 'Иван И.', 'Разработка сайта', 'Профессионально и четко проговорили, спланировали и реализовали проект сайта. Рекомендую!'),
  ('t7_ro', 't7', 'ro', 'Ivan I.', 'Dezvoltarea site-ului', 'Profesional și clar am discutat, planificat și realizat proiectul site-ului. Recomand!');

-- 8. Татьяна М. - 23 августа 2025
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t8', 5, 'YouDo', '2025-08-23', 8);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t8_ru', 't8', 'ru', 'Татьяна М.', 'Доделать сайт на React', 'Огромное спасибо Владимиру за проделанную работу. В процессе нам потребовалось сделать даже больше, чем мы планировали, и Владимир отлично со всем справился, сделав все очень качественно. Обязательно обращусь к нему в будущем!'),
  ('t8_ro', 't8', 'ro', 'Tatiana M.', 'Finalizarea site-ului pe React', 'Mulțumiri enorme lui Vladimir pentru munca depusă. În proces ne-a trebuit să facem chiar mai mult decât am planificat, și Vladimir a făcut față excelent, făcând totul foarte calitativ. Cu siguranță mă voi adresa lui în viitor!');

-- 9. Дмитрий - 18 августа 2025
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t9', 5, 'YouDo', '2025-08-18', 9);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t9_ru', 't9', 'ru', 'Дмитрий', 'Внесение изменений на сайте', 'Все сделал быстро и по указанной цене! Рекомендую'),
  ('t9_ro', 't9', 'ro', 'Dmitri', 'Modificări pe site', 'A făcut totul rapid și la prețul indicat! Recomand');

-- 10. Елизавета - 3 августа 2025
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t10', 5, 'YouDo', '2025-08-03', 10);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t10_ru', 't10', 'ru', 'Елизавета', 'Создать мобильное приложение', 'Владимир сделал именно то, что было нужно, был внимателен к мельчайшим деталям и изменениям, которые я вносила по ходу, уверена, если мне понадобится что-то ещё, обращаться буду именно к нему'),
  ('t10_ro', 't10', 'ro', 'Elizaveta', 'Crearea unei aplicații mobile', 'Vladimir a făcut exact ce era nevoie, a fost atent la cele mai mici detalii și modificări pe care le făceam pe parcurs, sunt sigură că dacă voi avea nevoie de ceva, mă voi adresa anume lui');

-- 11. Виталий К. - 20 мая 2025
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t11', 5, 'YouDo', '2025-05-20', 11);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t11_ru', 't11', 'ru', 'Виталий К.', 'Нужен программист для разработки тапалки в Телеграм по готовому дизайну', 'Спасибо Владимиру, хорошая работа!'),
  ('t11_ro', 't11', 'ro', 'Vitalie K.', 'E nevoie de programator pentru dezvoltarea tap-game în Telegram după design gata', 'Mulțumesc lui Vladimir, treabă bună!');

-- 12. Екатерина Х. - 27 января 2025
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t12', 5, 'YouDo', '2025-01-27', 12);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t12_ru', 't12', 'ru', 'Екатерина Х.', 'Создать бота который будет отправлять сообщение новым подписчикам в ТГ', 'Всё хорошо 👌'),
  ('t12_ro', 't12', 'ro', 'Ecaterina H.', 'Crearea unui bot care va trimite mesaje noilor abonați în TG', 'Totul bine 👌');

-- 13. Иван И. - 8 октября 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t13', 5, 'YouDo', '2024-10-08', 13);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t13_ru', 't13', 'ru', 'Иван И.', 'Единоразово спарсить аукционы с сайта bondroberts.com', 'Оперативно и профессионально, спасибо'),
  ('t13_ro', 't13', 'ro', 'Ivan I.', 'Parsare unică a licitațiilor de pe bondroberts.com', 'Operativ și profesional, mulțumesc');

-- 14. Заказчик З. - 7 октября 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t14', 5, 'YouDo', '2024-10-07', 14);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t14_ru', 't14', 'ru', 'Заказчик', 'Создать простую тап-игру в Телеграме', 'Все отлично'),
  ('t14_ro', 't14', 'ro', 'Client', 'Crearea unui tap-game simplu în Telegram', 'Totul excelent');

-- 15. Iurii C. - 8 сентября 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t15', 5, 'YouDo', '2024-09-08', 15);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t15_ru', 't15', 'ru', 'Iurii C.', 'Помочь с настройкой кастомного плагина WP', 'Качество работы и скорость на высоте. По ценам очень адекватно. Благодарю за помощь!'),
  ('t15_ro', 't15', 'ro', 'Iurii C.', 'Ajutor cu configurarea plugin-ului WP personalizat', 'Calitatea lucrului și viteza la nivel înalt. La prețuri foarte adecvat. Mulțumesc pentru ajutor!');

-- 16. Inna N. - 8 сентября 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t16', 5, 'YouDo', '2024-09-08', 16);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t16_ru', 't16', 'ru', 'Inna N.', 'Сложный Telegram бот', 'Владимир проделал отличную работу по созданию Telegram-бота, который взаимодействует с нашим API. Задание было выполнено на высоком уровне, все требования были учтены, и бот работает безупречно. Особенно хочется отметить его профессионализм, внимательность к деталям и скорость выполнения задачи. Очень довольны результатом и будем рады сотрудничать снова!'),
  ('t16_ro', 't16', 'ro', 'Inna N.', 'Bot Telegram complex', 'Vladimir a făcut o treabă excelentă la crearea bot-ului Telegram care interacționează cu API-ul nostru. Sarcina a fost îndeplinită la nivel înalt, toate cerințele au fost luate în considerare, și botul funcționează impecabil. În special vreau să remarc profesionalismul lui, atenția la detalii și viteza de execuție. Foarte mulțumiți de rezultat și vom fi bucuroși să colaborăm din nou!');

-- 17. Анна Л. - 28 августа 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t17', 5, 'YouDo', '2024-08-28', 17);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t17_ru', 't17', 'ru', 'Анна Л.', 'Создать бота для Telegram', 'Все отлично. Спасибо'),
  ('t17_ro', 't17', 'ro', 'Anna L.', 'Crearea unui bot pentru Telegram', 'Totul excelent. Mulțumesc');

-- 18. Максим С. - 27 августа 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t18', 5, 'YouDo', '2024-08-27', 18);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t18_ru', 't18', 'ru', 'Максим С.', 'Создать сайт на WordPress', 'Быстро, качественно, спасибо!'),
  ('t18_ro', 't18', 'ro', 'Maxim S.', 'Crearea unui site pe WordPress', 'Rapid, calitativ, mulțumesc!');

-- 19. Евгения - 24 августа 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t19', 5, 'YouDo', '2024-08-24', 19);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t19_ru', 't19', 'ru', 'Евгения', 'Заявки с сайта идут в AmoCRM', 'Всё прошло быстро и хорошо.'),
  ('t19_ro', 't19', 'ro', 'Evghenia', 'Cererile de pe site merg în AmoCRM', 'Totul a decurs rapid și bine.');

-- 20. Кира - 7 августа 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t20', 5, 'YouDo', '2024-08-07', 20);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t20_ru', 't20', 'ru', 'Кира', 'Регистрация в ChatGPT 10 аккаунтов', 'Владимир быстро вышел на связь, выполнил работу, учел мои пожелания и помог разобраться. Благодарю за помощь!'),
  ('t20_ro', 't20', 'ro', 'Kira', 'Înregistrare în ChatGPT 10 conturi', 'Vladimir a luat rapid legătura, a îndeplinit lucrarea, a ținut cont de dorințele mele și m-a ajutat să înțeleg. Mulțumesc pentru ajutor!');

-- 21. Максим Б. - 29 июля 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t21', 5, 'YouDo', '2024-07-29', 21);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t21_ru', 't21', 'ru', 'Максим Б.', 'Сделать квиз на Тильде', 'Все супер! Рекомендую к работе'),
  ('t21_ro', 't21', 'ro', 'Maxim B.', 'Crearea unui quiz pe Tilda', 'Totul super! Recomand pentru lucru');

-- 22. Андрей - 22 апреля 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t22', 5, 'YouDo', '2024-04-22', 22);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t22_ru', 't22', 'ru', 'Андрей', 'Продлить лицензию на WordPress', 'Быстро и качественно. Надёжный исполнитель. Рекомендую!'),
  ('t22_ro', 't22', 'ro', 'Andrei', 'Prelungirea licenței WordPress', 'Rapid și calitativ. Executant de încredere. Recomand!');

-- 23. Вадим С. - 2 марта 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t23', 5, 'YouDo', '2024-03-02', 23);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t23_ru', 't23', 'ru', 'Вадим С.', 'Верстка сайта (Bootstrap 5)', 'Всё хорошо!'),
  ('t23_ro', 't23', 'ro', 'Vadim S.', 'Asamblarea site-ului (Bootstrap 5)', 'Totul bine!');

-- 24. Марат Т. - 2 марта 2024
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t24', 5, 'YouDo', '2024-03-02', 24);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t24_ru', 't24', 'ru', 'Марат Т.', 'Разработать сайт', 'Быстро и без проблем. Без вопросов. Четко'),
  ('t24_ro', 't24', 'ro', 'Marat T.', 'Dezvoltarea unui site', 'Rapid și fără probleme. Fără întrebări. Clar');

-- 25. Юлия - 11 декабря 2023
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t25', 5, 'YouDo', '2023-12-11', 25);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t25_ru', 't25', 'ru', 'Юлия', 'Создать главную страницу сайта', 'Быстро, качественно'),
  ('t25_ro', 't25', 'ro', 'Iulia', 'Crearea paginii principale a site-ului', 'Rapid, calitativ');

-- 26. Ростислав К. - 8 декабря 2023
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t26', 5, 'YouDo', '2023-12-08', 26);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t26_ru', 't26', 'ru', 'Ростислав К.', 'Разработка в Telegram', 'Очень рекомендую этого человека для сотрудничества: он вежлив, доброжелателен и всегда придерживается установленных сроков. 👍👍👍'),
  ('t26_ro', 't26', 'ro', 'Rostislav K.', 'Dezvoltare în Telegram', 'Recomand foarte mult această persoană pentru colaborare: este politicos, binevoitor și întotdeauna respectă termenele stabilite. 👍👍👍');

-- 27. Алексей Б. - 7 декабря 2023
INSERT INTO "Testimonial" (id, rating, source, "createdAt", "order")
VALUES ('t27', 5, 'YouDo', '2023-12-07', 27);
INSERT INTO "TestimonialTranslation" (id, "testimonialId", locale, author, task, text)
VALUES
  ('t27_ru', 't27', 'ru', 'Алексей Б.', 'Сделать парсер для сайта', 'Полное понимание с первых слов. Всё быстро чётко по существу. Рекомендую.'),
  ('t27_ro', 't27', 'ro', 'Alexei B.', 'Crearea unui parser pentru site', 'Înțelegere completă din primele cuvinte. Totul rapid, clar, la subiect. Recomand.');
