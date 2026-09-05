# Chips HOWTO

В данном репозитории собраны заметки и руководство по исследованию интегральных микросхем (чипов) в условиях, приближенных к домашним.

![chips_howto_1](/imgstore/chips_howto_1.jpg)

(Так в представлении нейросети выглядит изучение микросхем).

## Независимое руководство

Новое независимое двуязычное руководство собрано из проверяемых источников и семи локальных иллюстраций:

- [Текст руководства на русском](specs/workflow.ru.md) · [English guide source](specs/workflow.en.md)
- [Руководство на русском](docs/workflow.ru.html) · [English guide](docs/workflow.en.html)
- [Русская главная страница](docs/index.ru.html) · [English landing page](docs/index.html)
- [Реестр иллюстраций](docs/illustrations.html)

Оно дополняет старые исходные заметки проекта: `methods.md`, `hf.md` и `gds.md`.

### Сборка и локальный просмотр

Для пересборки нужен Node.js 20 или новее: `marked` 17 требует эту версию. Установите зафиксированную зависимость только для сборки и запустите:

```sh
npm ci
npm run build
npm run check
python3 -m http.server --directory docs 8765
```

Для GitHub Pages выберите Settings → Pages → branch `issue-8-independent-workflow` и папку `/docs` (либо явно выбранную ветку публикации). Сборка уже содержит HTML, CSS, JavaScript и изображения и не требует build runtime на Pages.
