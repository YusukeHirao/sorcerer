# Sorcerer

Puppeteer manipulation utilities

**Sorcerer** is **`操作er`**. it's a silly name.

## Install

```shell
npm i puppeteer @yusukehirao/sorcerer

yarn add puppeteer @yusukehirao/sorcerer
```

:warning: Need to install with [`puppeteer`](https://github.com/puppeteer/puppeteer)

## Features

- Printing Page to PDF
- Page Visual Regression [🚧 WIP]

### Printing Page to PDF

<details open>
<summary>Demonstration</summary>

![Printing Page to PDF Demonstration Animation](./media/demo.gif)

</details>

```shell
sorcerer -p <URL>

sorcerer -p <URL1> -p <URL2> -p <URL3>
```

- Printing parallel.
- Print with note space.
- Fit width for _A4_.
- Create two document files for desktop and mobile on each page.
- Support the basic access authentication.
- Support lazy loading images and intersection observed elements because it scrolls to the page bottom.
- [PDF Samples](./samples/)

### Command Options

| Option       | Short | Default                                            | Description                                       |
| ------------ | ----- | -------------------------------------------------- | ------------------------------------------------- |
| `--print`    | `-p`  |                                                    | It accepts an URL then it prints the site to PDF. |
| `--outDir`   | `-o`  | <abbr title="Current Working Directory">CWD</abbr> | Output destination.                               |
| `--headless` |       | `true`                                             | Headless mode of Puppeteer.                       |
