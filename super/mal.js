/* style 423 v.4.40 */

@import url('https://fonts.googleapis.com/css2?family=Dosis:wght@200..800&display=swap');
@import url('https://unpkg.com/open-props/easings.min.css');

/* root variables */

html.theme-light {
    --text-weight: 240 !important;
    --color-text-default: #271d23 !important;
    --color-card-bg: var(--color-bg-defaul) !important;
    --color-card-bg-hover: #fcfcfc !important;
    --color-backdrop-bg: #ffffff70;
    --color-bg-default: #FAFAFA !important;
    --color-bg-transparent: #FAFAFA;
    --ilu-image: invert(0);
    --cta-background: #e200b1;
    --cta-text: #ffffff;
    --cta-icon-color: invert(1);
    --link-text: #e200b1;
    --blend-mode: darken;
    --mode-potrait-d: url('https://res.cloudinary.com/assest423/image/upload/v1723626882/potraits/matze423-dl.png');
    --mode-potrait-m: url('https://res.cloudinary.com/assest423/image/upload/v1723626893/potraits/matze423-ml.png');
}

html.theme-dark {
    --text-weight: 240 !important;
    --color-text-default: #F0EEEF !important;
    --color-card-bg: var(--color-bg-defaul) !important;
    --color-card-bg-hover: #353532 !important;
    --color-backdrop-bg: #00000070;
    --color-bg-default: #2E2E2B !important;
    --color-bg-transparent: #2E2E2B;
    --ilu-image: invert(1);
    --cta-background: #00e2ab;
    --cta-text: #000000;
    --cta-icon-color: invert(0);
    --link-text: #00e2ab;
    --blend-mode: lighten;
    --mode-potrait-d: url('https://res.cloudinary.com/assest423/image/upload/v1723626882/potraits/matze423-dd.png');
    --mode-potrait-m: url('https://res.cloudinary.com/assest423/image/upload/v1723626893/potraits/matze423-md.png');
}

:root {
    /* -- Typo -- */
    --primary-font: Dosis, Quicksand, Quicksand-fallback, Helvetica, sans-serif !important;
    --secondary-font: Dosis, Quicksand, Quicksand-fallback, Helvetica, sans-serif !important;
    --body-font-size: 1.42rem !important;
    --body-font-letterspacing: 0.123rem !important;
    --text-weight: 240 !important;

    --heading-weight: 800 !important;
    --heading1-size: calc(var(--body-font-size) * 1.875) !important;
    --heading2-size: calc(var(--body-font-size) * 1.5) !important;
    --heading3-size: calc(var(--body-font-size) * 1.25) !important;

    /* Colors */
    --color-text-default: #F0EEEF !important;
    --color-card-bg: var(--color-bg-defaul) !important;
    --color-card-bg-hover: #292929 !important;
    --color-backdrop-bg: #00000070;
    --color-bg-default: #2E2E2B !important;
    --color-bg-transparent: #2E2E2B;
    --cta-background: #00e2ab;
    --cta-text: #000000;
    --link-text: #00e2ab;
    /* Shapes */
    --content-max-desktop: 800px;
    --column-spacing: 2em !important;
    --m423-radius: 23px !important;
    --m423-width: 1440px !important;
    --m423-width-med: 60vw !important;
    --collection-card-title-size: var(--heading3-size) !important;
    --collection-card-property-size: var(--body-font-size) !important;
    --collection-card-padding: 0px;
    --collection-card-content-padding: 10px;
    --collection-card-title-padding: 0px;
    /* -- page paddings -- */
    --padding-mob: 24px;
    --padding-tablet: 32px;
    --padding-desktop: 120px;
    --padding-right: calc(env(safe-area-inset-right) + var(--padding-desktop));
    --padding-left: calc(env(safe-area-inset-left) + var(--padding-desktop));
    --padding-right-tablet: calc(env(safe-area-inset-right) + var(--padding-tablet));
    --padding-left-tablet: calc(env(safe-area-inset-left) + var(--padding-tablet));
    /* -- my nav vriables -- */
    --nav-ovefloat: 1em;
    /* responsiv illustrations logos etc. */
    --ilu-image: invert(1);
    --cta-icon-color: invert(0);
    --blend-mode: lighten;
    /* -- about potrait --*/
    --mode-potrait-d: url('https://res.cloudinary.com/assest423/image/upload/v1723626882/potraits/matze423-dd.png');
    --mode-potrait-m: url('https://res.cloudinary.com/assest423/image/upload/v1723626893/potraits/matze423-md.png');
}

@supports (font: -apple-system-body) {
    html {
        font: -apple-system-body !important;
    }
}

@media(max-width: 546px){

    :root {
        --body-font-size: 1.123rem !important; 
    }
}       


/* 
    ------------ Page & ID rooted elements --------------
*/

body {
    font-family: var(--primary-font) !important;
    font-size: var(--body-font-size);
    font-weight: var(--text-weight);
    letter-spacing: var(--body-font-letterspacing);
    height: 100%;
    color: var(--color-text-default);
    background: var(--color-bg-default);
    fill: currentColor;
    margin: 0;
    transition-property: color, border-color, text-decoration-color, fill, stroke, -webkit-text-decoration-color;
    transition-timing-function: cubic-bezier(.4, 0, .2, 1);
    transition-duration: .15s;
}

.notion-root.max-width {
    max-width: var(--m423-width) !important;
    padding-left: 0px;
    padding-right: 0px;
    /*overflow-x: hidden;*/
}


/* Element specifics - HOME --- */

div#block-98667ca7aebf4dfdb339cd7c0a9d84e6 {
    margin-bottom: 8rem;
}


/* Logo desert */

div#block-45841df76bdc46a9b1702a9ac03add65 {
    width: 100% !important;
    overflow: hidden !important;
    margin: auto !important;
}

div#block-45841df76bdc46a9b1702a9ac03add65 .notion-column-list {
    margin: 0 !important;
}

div#block-45841df76bdc46a9b1702a9ac03add65 .notion-column-list .notion-column {
    margin: 0px !important;
    width: 50% !important;
}

@media screen and (max-width: 546px) {
    div#block-45841df76bdc46a9b1702a9ac03add65 .notion-column-list .notion-column {
        margin: 0px !important;
        width: 100% !important;
    }
}


/* -------- My design process ---------- */

.page__index .notion-column-list:has(.bg-gray-light) {
    max-width: 1080px;
    margin-top: 0;
    margin-bottom: 6rem;
}


/* -------- BW responsive images --------- */

.page__index .notion-callout.bg-gray-light .notion-image {
    width: 8rem;
    margin: auto;
    padding: 0;
}

@media(max-width:546px) {
    .page__index .notion-callout.bg-gray-light .notion-image {
        width: 6rem;
    }
    .page__index .notion-column-list:has(.bg-gray-light) .notion-column {
        margin-bottom: 2rem !important;
    }
}

.page__index .notion-column>.notion-heading {
    margin: 0 !important;
    text-align: center;
}

.page__index .notion-column .notion-text__content {
    margin: 0 auto;
    padding-bottom: 1rem;
    text-align: center;
    word-break: normal;
}


/* layout overrides */

body:is([modal="true"]) {
    height: 100vh;
    overflow-y: hidden;
}

.notion-header {
    display: none;
}


/* pages */

.super-content {
    padding-top: 23vh !important;
    padding-bottom: 4em !important;
    padding-left: var(--padding-left) !important;
    padding-right: var(--padding-right) !important;
}

.super-conten.page__index {
    margin-top: 11vh;
}

.notion-text__children {
    margin-inline-start: 0;
    -webkit-margin-start: 0;
}

.super-content.page__blog423 .notion-collection.inline {
    width: 832px;
    margin: auto;
}


/*---------  TYPOGRAPHY ---------*/


/* HEADINGS */

h1.notion-heading,
h2.notion-heading,
h3.notion-heading,
.notion-text,
.notion-quote,
.notion-toggle {
    max-width: var(--content-max-desktop);
    width: 100%;
    margin: auto;
}

h1 {
    font-size: var(--heading1-size) !important;
    font-style: normal !important;
    font-weight: 800 !important;
    letter-spacing: 0.0123em !important;
    margin-bottom: 0 !important;
    padding: 0 ! important;
    -webkit-animation: fadeIn 4s !important;
    -moz-animation: fadeIn 4s !important;
    -ms-animation: fadeIn 4s !important;
    -o-animation: fadeIn 4s !important;
    animation: fadeIn 4s !important;
}

h2 {
    font-style: normal !important;
    font-size: var(--heading2-size) !important;
    font-weight: 700 !important;
    letter-spacing: 0.0423rem !important;
    margin-bottom: 1rem !important;
    -webkit-animation: fadeIn 0.75s !important;
    -moz-animation: fadeIn 0.75s !important;
    -ms-animation: fadeIn 0.75s !important;
    -o-animation: fadeIn 0.75s !important;
    animation: fadeIn 0.75s !important;
}

h3 {
    font-style: normal !important;
    font-size: var(--heading3-size) !important;
    font-weight: 700 !important;
    letter-spacing: 0.0123em !important;
    margin-bottom: 0.5em !important;
    -webkit-animation: fadeIn 1s !important;
    -moz-animation: fadeIn 1s !important;
    -ms-animation: fadeIn 1s !important;
    -o-animation: fadeIn 1s !important;
    animation: fadeIn 1s !important;
    font-weight: 600 !important;
}

@media(max-width: 880px) {
    h2 {
        font-size: var(--heading2-size) !important;
    }
    h3 {
        font-size: var(--heading3-size) !important;
    }
}

h2.notion-heading:not(.toggle) {
    margin-top: -.6rem !important;
    margin-bottom: 2rem !important;
    transform: translateX(1px);
}

h3.notion-heading:not(.toggle) {
    margin-top: 0 !important;
    margin-bottom: 1rem !important;
    transform: translateX(1px);
}

.notion-heading.notion-semantic-string {
    line-height: 1.23em !important;
}


/* ------- Hedline Comps -----------*/

.notion-text__content:has(+.notion-heading__anchor+h2) {
    position: relative;
    font-size: var(--heading2-size) !important;
    line-height: 123% !important;
    left: -1px;
    padding-bottom: 0.8rem !important;
    color: var(--link-text);
}

.notion-text__content:has(+.notion-heading__anchor+h3) {
    position: relative;
    font-size: var(--heading3-size) !important;
    left: -1px;
    padding-bottom: 0rem !important;
    color: var(--link-text);
}


/* ----- Headline big animated ----------------------- */

.page__index h1.notion-heading,
.page__i-about h1.notion-heading,
.page__think h1.notion-heading,
.page__projects h1.notion-heading {
    transform: translateX(-6px);
    mix-blend-mode: var(--blend-mode) !important;
    color: var(--color-bg-default);
}

.page__i-about h1.notion-heading strong,
.page__think h1.notion-heading strong,
.page__projects h1.notion-heading strong,
.page__index h1.notion-heading strong {
    font-size: 8.42rem !important;
    font-weight: 900;
    line-height: 33%;
    letter-spacing: -.0123em !important;
    -webkit-hyphens: auto;
    -moz-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
    color: transparent;
    background: radial-gradient(circle at 50%, var(--link-text) 10%, var(--color-bg-default) 42%), var(--link-text) 100%;
    background-clip: text;
    background-size: 200% auto;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    -webkit-text-stroke: .423px solid var(--link-text);
    animation: animatedHeadline 42.3s ease-in-out infinite;    
}

@media(max-width: 546px) {
    .page__think h1.notion-heading strong,
    .page__index h1.notion-heading strong {
        font-size: 96px !important;
        line-height: 33%
    }
    .page__projects h1.notion-heading strong,
    .page__i-about h1.notion-heading strong {
        font-size: 83px !important;
        line-height: 33%
    }
}

@keyframes animatedHeadline {
    0% {
        background-position: 0% center;
    }
    50% {
        background-position: 180% 23%;
    }
    100% {
        background-position: 0% center;
    }
}


/* Headline big subline -------------------------------*/

.page__index h1.notion-heading+.notion-text,
.page__i-about h1.notion-heading+.notion-text,
.page__projects h1.notion-heading+.notion-text,
.page__think h1.notion-heading+.notion-text {
    margin-top: 1.23rem;
    color: var(--link-text);
}

.notion-text__content:has(+.notion-text__children) {
    padding-bottom: 1rem;
}

.notion-text {
    /* max-height: 100%; */
    min-height: auto;
}

.notion-text.bg-purple {
    font-size: 1.23rem;
    line-height: 144% !important;
}

.notion-semantic-string {
    line-height: 142% !important;
    white-space: pre-wrap;
    word-break: normal;
}


/* reading time */

span.highlighted-color.color-yellow {
    font-size: 1rem;
    color: var(--color-text-default);
    padding-left: 24px;
}


/*----- IMAGES  -----*/

.my_background_portrait {
    content: '';
    display: block;
    position: fixed;
    top: 0;
    width: 100vw;
    height: 100vh;
    opacity: 0.9;
    background-image: var(--mode-potrait-d);
    background-repeat: no-repeat;
    background-size: auto 100%;
    background-position: right;
    z-index: -1;
}

.notion-image {
    margin-top: .5rem;
    margin-bottom: .5rem;
    align-items: center;
    position: relative;
    line-height: 0px;
    display: flex;
    flex-direction: column;
}


/* case header images teaser */

div.notion-image:nth-child(5) {
    max-width: 98%;
    margin-top: 2rem;
}

.notion-image.align-start {
    align-items: start;
}

.notion-image.align-end {
    align-items: end;
}

.notion-image img {
    object-fit: cover;
}


/* Images content width (page) */

.notion-image.page-width {
    width: 100%;
    max-width: calc(var(--content-max-desktop) + 24px);
    margin: 0 auto;
}

.notion-image.page-width img {
    width: 100%;
    max-width: 100%;
    height: 100% !important;
    object-fit: contain;
    border-radius: var(--image-border-radii);
    object-fit: cover !important;
}

.notion-image.page-width span {
    height: 100% !important;
}

img {
    border-radius: var(--m423-radius) !important;
    -webkit-animation: fadeIn 1.5s !important;
    -moz-animation: fadeIn 1.5s !important;
    -ms-animation: fadeIn 1.5s !important;
    -o-animation: fadeIn 1.5s !important;
    animation: fadeIn 1.5s !important;
}

.notion-text+.notion-image {
    margin: 1rem auto 4rem auto;
}


/* Images sized */

.notion-image.normal {
    max-width: 1440px;
}

.notion-image.normal img {
    position: relative;
    height: auto;
}


/* Tagged Images (super embed before) */

.super-embed:has(.next-xl-imgage)+.notion-image.align-start.page-width {
    /* position: relative; */
    width: 1000px;
    max-width: 1000px;
    left: -100px;
    margin-bottom: 2rem;
}

.super-embed:has(.next-xl-imgage)+.notion-image.align-start.page-width>figcaption {
    position: relative;
    left: 100px;
}

.notion-caption {
    padding: 6px 2px;
    color: var(--color-text-default-light);
    font-size: .875rem;
    text-align: center;
}


/*--     EMBED VIDEOS    --*/

.my-video-small {
    display: block;
    width: 423px;
    margin: auto;
    border-radius: var(--m423-radius);
}

.my-video-content {
    display: block;
    width: var(--content-max-desktop);
    margin: auto;
    border-radius: var(--m423-radius);
}


/* my super nav menu - backdrop  ----------------------------- */

.super-navbar {
    display: none;
}

.my-super-navbar {
    width: 100%;
    display: block;
    position: fixed;
    top: 1em;
    left: 0px;
    z-index: 423;
    margin: 1em 0 1em 0 !important;
    padding-left: var(--padding-left) !important;
    padding-right: var(--padding-right) !important;
}

.my-super-navbar__actions {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    grid-gap: 6px;
    gap: 6px;
    padding: 0 16px;
    height: 100%;
    justify-content: end;
}

.my-super-navbar__content {
    width: 100%;
    max-width: 1440px;
    margin: auto;
    display: grid;
    grid-template-columns: 1fr 20fr 1fr;
    flex-direction: row;
    justify-content: center;
    border-radius: var(--m423-radius) !important;
    background-color: none;
    -webkit-backdrop-filter: blur(16px) !important;
    backdrop-filter: blur(16px) !important;
}

.my-menuburger {
    display: none;
}

li.my-contacts {
    display: none;
}

.my-super-navbar__item-list {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    width: auto;
    flex-wrap: wrap;
    height: 100%;
    overflow: hidden;
    justify-content: center;
}

.super-navbar__item {
    gap: 4px;
    transition: opacity .2s ease-in-out;
    font-weight: 500;
    padding: 0px 20px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    white-space: nowrap;
    opacity: .7;
    cursor: pointer;
}

.mylogo {
    position: fixed;
    margin-left: calc((100vw - 1440px) / 2);
    top: 1.5em;
    z-index: 423;
}


/* -------  CALLOUTS  ------ */

.notion-callout {
    width: 100%;
    margin: auto;
    border-radius: var(--m423-radius) !important;
    overflow: visible !important;
    margin-bottom: 1em !important;
    text-align: left;
    padding: calc(var(--m423-radius));
}

.notion-callout.bg-gray-light,
.notion-callout.bg-brown-light,
.notion-callout.bg-orange-light,
.notion-callout.bg-yellow-light,
.notion-callout.bg-green-light,
.notion-callout.bg-blue-light,
.notion-callout.bg-purple-light,
.notion-callout.bg-pink-light,
.notion-callout.bg-red-light {
    border: none !important;
}

.notion-callout__icon {
    display: none !important;
}


/* ALLOUT GRAY_BG – dark / light mode images */

.notion-callout.bg-gray-light .notion-image {
    filter: var(--ilu-image);
    padding: 0;
}

.notion-callout.bg-gray-light .notion-image img {
    border-radius: 0 !important;
}


/* Overview */

.notion-callout.color-default {
    position: relative;
    max-width: calc(var(--content-max-desktop) + 2rem);
    width: calc(var(--content-max-desktop) + 2rem);
    height: auto;
    left: -1rem;
    margin: 2rem auto 4rem auto;
    padding: 1em !important;
    border: 1px solid var(--color-border-default) !important;
}

.notion-callout.color-default .notion-callout__content p {
    margin: 0;
    padding: 0;
    height: auto;
}

.notion-callout.bg-gray-light {
    position: relative;
    max-width: 900px;
    margin: 0px !important;
    padding: 0px !important;
    background: transparent !important;
    border-radius: 0px !important;
    height: fit-content;
}

.notion-callout.bg-gray-light .notion-callout__content {
    margin: 0px auto;
    max-width: 100%;
}


/* ---- custom menu for individual cases ---------- */

.notion-callout.bg-brown-light.border {
    display: inline;
    margin: 0px !important;
    padding: 0px !important;
    border-radius: 0px !important;
    height: auto !important;
    background-color: transparent !important;
    position: fixed;
    z-index: 423;
    top: 1em;
}


/* Disclamer --------------------------------- */


.notion-callout.bg-yellow-light {
    height: auto;
    max-width: 860px;
    font-size: .8rem !important;
    text-align: center;
}

.notion-callout.bg-yellow-light p {
    padding-bottom: 0 !important;
}


/* Painspoints and Insights -------------------------------------- */

.notion-callout.bg-blue-light, 
.notion-callout.bg-purple-light{
    height: -webkit-fill-available;
}

.notion-callout.bg-pink-light {
    min-width: 240px;
    width: 100%;
    max-width: 420px;
}

.highlighted-background.bg-brown {
    display: inline-block !important;
    padding: 0px !important;
    border: none !important;
    opacity: 1 !important;
    border-radius: 0px !important;
    background-color: transparent !important;
    cursor: default;
}

.highlighted-background.bg-brown a {
    background-color: transparent;
    color: var(--color-text-default) !important;
    font-weight: 500;
}


/* STYLES */

.notion-header__title-wrapper {
    max-width: var(--m423-width) !important;
}

.notion-header__title {
    display: none !important;
}

.notion-header__content.max-width {
    max-width: var(--m423-width) !important;
}


/*
  Notion Embeds like youtube video
*/

.notion-embed {
    width: 100%;
    align-self: center;
}

.notion-embed__content {
    display: flex;
    justify-content: center;
    border-radius: var(--m423-radius) !important;
    overflow: hidden !important;
}

.notion-embed__container__wrapper,
.notion-embed__loader {
    width: var(--content-max-desktop);
    min-height: calc(var(--content-max-desktop)/16*9);
    display: flex;
    padding: 0 !important;
    border-radius: var(--m423-radius);
    overflow: hidden;
}

.notion-embed__container {
    position: relative;
    max-width: 100%;
    height: 100% !important;
    width: 100% !important;
}

.notion-embed__container>iframe[title="www.youtube.com"] {
    position: absolute;
    inset-inline-start: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border: none;
    pointer-events: auto;
    margin: auto !important;
}

@media(max-width: 546px) {
    .notion-embed__container__wrapper,
    .notion-embed__loader {
        width: 100vw;
        min-height: calc((100vw - 48px)/16*9);
        display: flex;
        padding: 0 !important;
        border-radius: var(--m423-radius);
        overflow: hidden;
    }
}


/* Header Covers */

.notion-header__cover.no-cover {
    max-height: 4em !important;
    height: 4em !important;
}

.notion-divider {
    margin: 4rem 0 !important;
    border: 0px !important;
}

.notion-image+.notion-divider {
    margin: 3rem 0 !important;
}

.notion-heading {
    font-family: "Dosis", var(--primary-font) !important;
    font-optical-sizing: auto;
    padding: 0 !important;
}

.notion-text.color-gray {
    color: transparent;
    text-align: center;
}

.notion-text.color-gray p {
    margin-bottom: 0 !important;
}

.notion-header__cover {
    margin: 1em 1em 4em 1em !important;
    max-width: var(--m423-width) !important;
    margin: auto !important;
    width: calc(100% - var(--column-spacing)) !important;
    border-radius: var(--m423-radius) !important;
}

.super-navbar__content {
    padding-left: 1em !important;
    padding-right: 1em !important;
}

.super-navbar__actions,
.super-navbar__logo {
    padding: 0 0.75em !important;
}

p {
    margin-bottom: 0 !important;
    max-width: var(--content-max-desktop) !important;
    -webkit-animation: fadeIn 1.25s !important;
    -moz-animation: fadeIn 1.25s !important;
    -ms-animation: fadeIn 1.25s !important;
    -o-animation: fadeIn 1.25s !important;
    animation: fadeIn 1.25s !important;
}

.notion-text__content {
    margin: 0 auto;
    padding-bottom: 1rem;
}

.notion-text:empty {
    min-height: var(--body-font-size);
}

.notion-text.color-pink p {
    margin-bottom: 0 !important;
}

.notion-callout.bg-gray-light.border+ul {
    margin-top: 4rem !important;
}

.notion-callout__content {
    display: flex;
    flex-direction: column;
    -webkit-margin-start: 0px;
    margin-inline-start: 0px;
    overflow: hidden;
    width: 100%;
    height: fit-content;
}

.notion-callout__content .notion-bulleted-list {
    width: 100%;
    max-width: 740px;
    margin: 0 !important;
    line-height: 1.5em;
}

.notion-code pre {
    border-radius: var(--m423-radius) !important;
    color: var(--color-text-default) !important;
    background-color: var(--color-bg-default) !important;
    border: 2px solid var(--color-border-default) !important;
}

.notion-code code {
    color: var(--color-text-default) !important;
}


/*--------- TEXT LINKS ----------*/

.notion-semantic-string .link {
    color: var(--link-text);
    line-height: 120%;
    height: 82px;
    -webkit-text-decoration-color: var(--color-text-default-light);
    text-decoration-color: var(--link-text);
    text-decoration-thickness: 1.42px;
    text-underline-offset: 8px;
    opacity: .8;
    transition: all .2s ease-in, opacity .1s ease-in;
}


/*  ------------- CALL TO ACTIONS ------------- */

.notion-button {
    margin-top: 4px;
    margin-bottom: 4px;
    width: var(--content-max-desktop);
    margin: 8px auto;
}

.notion-button__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--m423-radius) / 2);
    cursor: pointer;
    transition: background 20ms ease-in;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    white-space: nowrap;
    border-radius: calc(var(--m423-radius) / 2);
    padding: calc(var(--m423-radius) / 2);
    min-width: 50px;
    font-weight: 600;
    border: 0;
    color: var(--cta-text) !important;
    background-color: var(--cta-background);
}

.notion-button__content:hover {
    background: var(--cta-background);
}

.notion-button__icon .notion-icon {
    width: 24px;
    height: 24px;
    font-size: 1rem;
    line-height: 1rem;
    border-radius: 0 !important;
    filter: var(--cta-icon-color);
}

@media(max-width: 546px) {
    .notion-button {
        width: 100%;
    }
    .notion-button__content {
        width: 100%;
    }
}


/*  ----  */

.highlighted-background {
    transition: 0.3s ease-in-out !important;
    border-radius: 2px !important;
}

.highlighted-background:hover {
    opacity: 0.8 !important;
}

.highlighted-background a {
    display: inline-block !important;
    padding: 0.9em 1.5em !important;
    border: none !important;
    opacity: 1 !important;
    border-radius: var(--m423-radius) !important;
    color: var(--color-bg-default) !important;
}

.highlighted-background.bg-gray a {
    background-color: var(--color-text-default) !important;
}

.highlighted-background.bg-yellow a {
    background-color: var(--color-text-yellow) !important;
}

.highlighted-background.bg-purple a {
    background-color: var(--color-text-purple) !important;
}

.highlighted-background.bg-yellow a {
    background-color: var(--color-text-yellow) !important;
}

.highlighted-background.bg-green a {
    background-color: var(--color-text-green) !important;
}

.highlighted-background.bg-orange a {
    background-color: var(--color-text-orange) !important;
}

.highlighted-background.bg-blue a {
    background-color: var(--color-text-blue) !important;
}

.highlighted-background.bg-pink a {
    background-color: var(--color-text-pink) !important;
}

.highlighted-background.bg-red a {
    background-color: var(--color-text-red) !important;
}


/*--------- TOGGLES / EXPANDS ---------*/

.notion-toggle {
    display: block;
    margin: 0 auto 0.5rem auto !important;
    font-family: "Dosis", var(--primary-font) !important;
    font-optical-sizing: auto;
    padding-left: 24px;
    cursor: pointer;
}

.notion-toggle__summary {
    font-weight: 600 !important;
}

.notion-toggle__content {
    -webkit-padding-start: 0px !important;
    padding-inline-start: 0px !important;
}


/* standard toggle */

.notion-toggle.closed::before {
    content: "+";
    position: absolute;
    margin-top: -1px;
    margin-left: -23px;
    font-size: 2rem;
    color: var(--cta-background);
}

.notion-toggle.open::before {
    content: "-";
    position: absolute;
    margin-top: -1px;
    margin-left: -23px;
    font-size: 2rem;
    color: var(--cta-background);
}

.notion-toggle__trigger {
    display: none !important;
}


/* -- EXPANDS TOGGLE CASE SECTION (bg-blue) -- */

.notion-toggle.bg-blue {
    position: relative;
    max-width: 100%;
    min-height: 7rem;
    margin: 1rem 0 3rem 0 !important;
    padding: 0px;
    background-color: transparent;
}

.notion-toggle.bg-blue.closed::before {
    content: "" !important;
}

.notion-toggle.bg-blue.open::before {
    content: "" !important;
}

.notion-toggle.closed.bg-blue .notion-toggle__summary .notion-toggle__trigger::after {
    display: block;
    position: absolute;
    width: 100%;
    bottom: 0rem;
    padding-bottom: 1rem;
    color: var(--cta-background);
    content: '+ read more about how we tackle the challenge';
    border-bottom: 1px var(--cta-background) solid;
}

.notion-toggle.open.bg-blue .notion-toggle__summary .notion-toggle__trigger::after {
    display: block;
    position: absolute;
    width: 100%;
    bottom: 0rem;
    margin: 42px auto 0 auto;
    padding-bottom: 1rem;
    color: var(--cta-background);
    content: '- Close the insights';
    border-bottom: 1px var(--cta-background) solid;
    pointer-events: none;
}

.notion-toggle.bg-blue .notion-toggle__summary {
    display: block;
    height: auto;
    margin: auto;
    width: 100%;
    max-width: var(--content-max-desktop);
    font-weight: 230 !important;
    padding-bottom: 4rem;
}

.page__i-about .notion-toggle.bg-blue .notion-toggle__summary {
    padding-bottom: 0 !important;
}

.notion-toggle.bg-blue .notion-toggle__summary .notion-semantic-string strong {
    font-size: var(--heading3-size) !important;
    font-weight: 700 !important;
    line-height: 123%;
    
}

.notion-toggle.bg-blue .notion-toggle__content {
    cursor: default;
    padding-bottom: 6rem;
}


/* Funtional Setup */

.notion-toggle.bg-blue .notion-toggle__summary .notion-toggle__trigger {
    display: block !important;
    position: absolute;
    width: auto;
}

.notion-toggle.open.bg-blue .notion-toggle__summary .notion-toggle__trigger {
    height: 100%;
    width: var(--content-max-desktop);
    background: transparent;
}

.notion-toggle.closed.bg-blue .notion-toggle__summary .notion-toggle__trigger {
    width: var(--content-max-desktop);
    height: 100%;
    background: linear-gradient(180deg, transparent 10%, var(--color-bg-default) 80%);
}

.notion-toggle.open.bg-blue .notion-toggle__summary .notion-toggle__trigger {
    width: 100%;
    max-width: var(--content-max-desktop);
    height: 100%;
    margin: 0 !important;
}

.notion-toggle.bg-blue .notion-toggle__summary .notion-toggle__trigger .notion-toggle__trigger_icon {
    display: none;
}

.notion-toggle__summary>span.notion-semantic-string {
    margin: 0px;
}

@media(max-width:546px){

    .notion-toggle.closed.bg-blue .notion-toggle__summary .notion-toggle__trigger {
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, transparent 10%, var(--color-bg-default) 80%);
    }
    .notion-toggle.closed.bg-blue .notion-toggle__summary .notion-toggle__trigger::after {
        display: block;
        position: absolute;
        width: 100%;
        bottom: 0rem;
        padding-bottom: 1rem;
        color: var(--cta-background);
        content: '+ read more';
        border-bottom: 1px var(--cta-background) solid;
    }
}





/* -- Close super-embed -- */

.expandable__close {
    width: var(--content-max-desktop);
    margin: 42px auto;
    color: var(--cta-background);
    font-weight: 600;
}


/* -- Blocks & Sections -- */


/* Home Logos */

div#block-45841df76bdc46a9b1702a9ac03add65 .notion-image {
    width: 100%;
}


/*---------  TO_DO ---------*/

.notion-to-do__content {
    margin-bottom: 1em !important;
}

.notion-to-do__icon {
    margin-inline: 0px !important;
    margin-right: 16px !important;
}

.notion-checkbox {
    width: 1.5em !important;
    height: 1.5em !important;
    border-radius: var(--m423-radius) !important;
    background: var(--color-bg-default) !important;
    border: 1px solid var(--color-text-default) !important;
}

.notion-checkbox svg {
    display: none !important;
}

.notion-checkbox.checked {
    width: 1.5em !important;
    height: 1.5em !important;
    border-radius: var(--m423-radius) !important;
    background: var(--color-text-default) !important;
    border: 1px solid var(--color-text-default) !important;
}

.notion-checkbox.checked svg {
    display: inline !important;
}

.notion-checkbox.checked>svg {
    fill: var(--color-bg-default) !important;
}

.notion-to-do__title {
    opacity: 1 !important;
    text-align: left !important;
}

.notion-to-do__title.checked {
    opacity: 1 !important;
    text-align: left !important;
}

.notion-to-do__title.checked del {
    text-decoration: none !important;
    text-align: left !important;
}


/*-- notion page ? outdated --*/

.notion-page {
    border-radius: var(--m423-radius) !important;
}

.notion-page>div {
    border-radius: var(--m423-radius) !important;
    display: flex;
    transition: 300ms ease-in !important;
    padding: 0.5em !important;
    border: 1px solid var(--color-border-default) !important;
}

.notion-page__title .notion-semantic-string {
    border-bottom: none !important;
}


/* ------- Collection ---------*/

.notion-collection__header-wrapper {
    display: block !important;
}

.notion-collection__header {
    display: none !important;
}

.notion-collection.inline {
    width: 96%;
    margin: 4rem auto;
}

@media(max-width: 546px) {
    .notion-collection.inline {
        width: 100%;
    }
}


/* Galleries & Collection Cards */

/* Gallery Large -----------------------*/

/* HOME */

.page__index .notion-collection-gallery.large {
    grid-template-columns: auto auto !important;
}

.notion-collection-gallery {
    display: grid;
    grid-auto-rows: 1fr;
    gap: var(--column-spacing) !important;
    padding: 0em !important;
    border: none !important;
    margin-bottom: 1rem !important;
    border-radius: 0 !important;
}

@media (max-width: 880px) {
    .notion-collection-gallery.large,
    .page__index .notion-collection-gallery.large {
        grid-template-columns: auto !important;
        grid-auto-rows: auto;
    }
}

.notion-collection-card {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    padding: var(--collection-card-padding);
    background: var(--color-card-bg);
    box-shadow: none !important;
    border: none;
    border-radius: var(--m423-radius) !important;
    transition: .3s ease-in-out !important;
    cursor: pointer;
}

.notion-collection-card:hover {
    background: var(--color-card-bg-hover) !important;
    transform: scale(1.03) !important;
    border: none !important;
    box-shadow: 0px 24px 16px 0px rgba(0, 0, 0, 0.05) !important;
    -webkit-box-shadow: 1px 17px 23px 0px rgba(0, 0, 0, 0.05) !important;
    -moz-box-shadow: 1px 17px 23px 0px rgba(0, 0, 0, 0.05) !important;
}

.notion-collection-card__cover.large {
    height: 24rem !important;
    min-height: 348px !important;
}

@media(max-width: 880px) {
    .notion-collection-card__cover.large {
        height: calc(100vw - 48px) !important;
        min-height: unset !important;
    }
}

.notion-collection-card img {
    opacity: 1 !important;
    width: 100%;
    vertical-align: unset;
    transition: 0.3s ease-in-out !important;
    position: relative;
    object-fit: cover !important;
    object-position: center !important;
}

.notion-collection-card:hover img {
    transform: scale(1.12) !important;
    transform-origin: 50% 75%;
}

.notion-collection-card__content {
    padding: var(--collection-card-content-padding) !important;
}

.notion-collection-card__property-list {
    font-size: 1em !important;
    padding-top: 6px;
}

.notion-collection-card .notion-property__title {
    padding: 0 0 0.1rem 0 !important;
    font-size: var(--collection-card-title-size) !important;
    line-height: 130% !important;
}

.notion-collection-card .notion-property__text {
    text-overflow: ellipsis !important;
    overflow: hidden !important;
}

.notion-collection-card .notion-property__select.wrap {
    margin-top: .5rem;
    width: 100%;
    display: flex;
    overflow: hidden;
    text-overflow: ellipsis;
}

.notion-pill {
    --pill-height: 2.3rem;
    display: block;
    height: var(--pill-height) !important;
    max-width: calc(100%) !important;
    padding: 0 calc(var(--pill-height) / 2) !important;
    border-radius: calc(var(--pill-height) / 2) !important;
    font-size: 1rem;
    font-weight: 500;
    line-height: var(--pill-height);    
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}


/* Gallery smal ---------------------------------------*/

.notion-collection-gallery.small {
    grid-template-columns: auto auto auto auto auto !important;
    grid-auto-rows: max-content;
}

.notion-collection-card__cover.small {
    min-height:  230px !important;
    max-height:  240px !important;
}

.notion-collection-gallery.small .notion-collection-card .notion-property__title {
    padding: 0 0 0.1rem 0 !important;
    font-size: var( --body-font-size) !important;
    line-height: 130% !important;
}

@media(max-width: 546px){
    .notion-collection-gallery.small {
        grid-template-columns: auto auto !important;
        gap: 18px !important;

    }
    .notion-collection-card__cover.small {
        min-height: calc(100vw / 2 - 24px) !important;
        max-height: 240px !important;
    }
    .notion-collection-gallery.small .notion-pill {
        --pill-height: 2rem;
        display: block;
        height: var(--pill-height) !important;
        max-width: calc(100%) !important;
        padding: 0 calc(var(--pill-height) / 2) !important;
        border-radius: calc(var(--pill-height) / 2) !important;
        font-size: .9rem;
        font-weight: 500;
        line-height: var(--pill-height);
    }
}


/* other cover sizes */

.notion-collection-card__cover.medium {
    height: 16rem !important;
    max-height: 256px !important;
}

/* boards */

.notion-collection-board {
    gap: 1rem !important;
    border: none !important;
    overflow-x: scroll !important;
    margin-bottom: 1rem !important;
    padding: 1em !important;
    background: var(--color-border-default) !important;
    border-radius: var(--m423-radius) !important;
}

.notion-collection-board__item {
    margin-bottom: 1rem !important;
}

.notion-collection-board .notion-property__title {
    padding: 1rem !important;
}


/* RELATED PROJECTS */

.notion-collection-gallery.medium {
    grid-template-columns: 1fr 1fr;
    width: 824px;
    margin: auto;
}


/*---------  Quotes  ---------*/

.notion-quote,
.notion-quote.large {
    position: relative;
    font-size: var(--heading3-size);
    font-weight: 200;
    text-align: left !important;
    color: var(--link-text);
    width: 100% !important;
    margin: 2rem auto !important;
    padding: 0 0 0 1rem !important;
    border: none !important;
    display: flex !important;
    flex-direction: column !important;
    border-radius: 0 !important;
}

.notion-quote::before {
    content: "";
    display: block;
    position: absolute;
    left: 0px;
    top: 0px;
    width: 1.6px;
    height: 100%;
    background-color: var(--link-text);
    border-radius: 0.8px;
}

.notion-quote.large::before {
    content: "";
    display: block;
    position: absolute;
    left: 0px;
    top: 0px;
    width: 4px;
    height: 100%;
    background-color: var(--link-text);
    border-radius: 2px;
}

.notion-quote>.notion-semantic-string {
    line-height: 123%;
}

.notion-quote .notion-semantic-string em {
    font-size: var(--body-font-size) !important;
}

.notion-quote.bg-gray,
.notion-quote.bg-brown,
.notion-quote.bg-orange,
.notion-quote.bg-yellow,
.notion-quote.bg-green,
.notion-quote.bg-blue,
.notion-quote.bg-purple,
.notion-quote.bg-pink,
.notion-quote.bg-red {
    border: none !important;
}


/*---------  TABLE DATABASE ---------*/

.notion-collection-table {
    font-size: 1rem !important;
    border: 1px solid var(--color-border-default) !important;
    border-radius: var(--m423-radius) !important;
    overflow: hidden !important;
    padding: 1em !important;
}

.notion-collection-table__wrapper {
    background: var(--color-border-default) !important;
    padding: 0em !important;
    border-radius: var(--m423-radius) !important;
}

.notion-collection-table td,
.notion-collection-table th {
    padding: 1rem !important;
    border: 1px solid var(--color-border-default) !important;
    overflow: hidden !important;
    background: var(--color-bg-default) !important;
}

.notion-collection-table__head {
    background-color: var(--color-ui-hover-bg-light) !important;
}

.notion-collection-table__cell {
    padding: 1rem !important;
}

.notion-collection-table__cell .notion-pill {
    margin-bottom: 0.5rem !important;
}

.notion-collection-table__cell.title .notion-semantic-string {
    white-space: normal !important;
}

.notion-property__title__icon-wrapper {
    display: none !important
}


/*---------  Simple TABLE ---------*/

.notion-table__wrapper {
    overflow-x: hidden;
}
.notion-table {
    font-size: 1rem !important;
    margin: 1rem 0 !important;
    overflow: hidden !important;
    padding: 1em !important;
    width: 100%;
}
.notion-table td, .notion-table th {
    width: 50%;
    padding: 0 !important;
    overflow: hidden !important;
    vertical-align: top;
    border: none
}
.notion-table__cell {
    padding:  1rem 0;
}

@media (max-width: 546px){
    .notion-table{
        display:none !important;
    }
}


/*---------  TABLE OF CONTENTS  ---------*/

.notion-table-of-contents {
    padding: 1rem !important;
    font-size: var(--body-font-size) !important;
    margin: 1rem 0 !important;
    border-radius: var(--m423-radius) !important;
    z-index: 19 !important;
    border: 1px solid var(--color-border-default) !important;
    width: 800px;
    margin: 4rem auto !important;
}

.notion-table-of-contents__item {
    padding: 0.25em 0.5em !important;
    opacity: 1 !important;
    transition: .5s !important;
}

.notion-table-of-contents__item .notion-semantic-string {
    border-bottom: none !important;
}

.notion-table-of-contents.bg-yellow,
.notion-table-of-contents.bg-yellow,
.notion-table-of-contents.bg-orange,
.notion-table-of-contents.bg-gray,
.notion-table-of-contents.bg-brown,
.notion-table-of-contents.bg-green,
.notion-table-of-contents.bg-blue,
.notion-table-of-contents.bg-purple,
.notion-table-of-contents.bg-pink,
.notion-table-of-contents.bg-red {
    border: none !important;
}

.notion-table-of-contents__item:hover {
    background: none !important;
    opacity: 0.5 !important;
}


/*---------  COLLECTION LIST   ---------*/

.notion-collection-list {
    border: none !important;
    padding: 1rem !important;
    background-color: var(--color-border-default) !important;
    border-radius: var(--m423-radius) !important;
}

.notion-collection-list__item {
    background: var(--color-bg-default) !important;
    padding: 1rem !important;
    transition: 0.3s !important;
    margin-bottom: 0.5rem !important;
}

.notion-collection-list__item:hover {
    background: var(--color-bg-default) !important;
    box-shadow: 0px 24px 16px 0px rgba(0, 0, 0, 0.05) !important;
    -webkit-box-shadow: 1px 17px 23px 0px rgba(0, 0, 0, 0.05) !important;
    -moz-box-shadow: 1px 17px 23px 0px rgba(0, 0, 0, 0.05) !important;
    transform: scale(1.01) !important;
}

.notion-collection-list__item .notion-property__title .notion-semantic-string>span {
    border-bottom: none !important;
    white-space: normal !important;
}

.notion-collection-list__item-property {
    margin-left: 0.5rem !important;
    font-size: 0.75rem !important;
}

.notion-collection-list__item-property .notion-property__date,
.notion-collection-list__item-property .notion-property__select .notion-pill {
    font-size: 1em !important;
}

.notion-semantic-string .individual span {
    padding-left: 0.5em !important;
}

.notion-semantic-string .individual {
    display: flex !important;
    font-size: 1em !important;
}

.notion-collection-calendar {
    border: none !important;
    padding: 1rem !important;
    background-color: var(--color-border-default) !important;
    border-radius: var(--m423-radius) !important;
}

.notion-collection-calendar__week-days {
    box-shadow: none !important;
}

.notion-collection-calendar__row {
    box-shadow: none !important;
}

.notion-collection-calendar__date {
    background-color: var(--color-bg-default) !important;
    border-color: var(--color-border-default) !important;
}

.notion-collection-card.calendar .notion-collection-card__content {
    padding: 0px 6px 1px 6px !important;
}


/*---------  Collection Switch ---------*/


/* Dropdown to pills */

.notion-dropdown__option-list {
    display: flex !important;
    gap: 2rem;
    margin: 2rem 0;
}

.notion-dropdown__option p {
    font-size: var(--body-font-size) !important;
    font-weight: 500;
}

.notion-dropdown__option.active,
.notion-dropdown__option.active:hover {
    background-color: var(--cta-text);
    color: var(--cta-background);
}

.notion-dropdown__option,
.notion-dropdown__option:hover {
    padding: 0.42em 1em !important;
    border-radius: var(--m423-radius);
    background-color: var(--cta-background);
    color: var(--cta-text);
}

.notion-dropdown__menu.animate-out {
    animation: none !important;
}


/* resets */

.notion-dropdown {
    position: relative;
}

.notion-collection__header-wrapper {
    align-items: start !important;
}

.notion-dropdown__button {
    display: none !important;
}

.notion-dropdown__menu.initial-state {
    z-index: 1 !important;
    opacity: 1 !important;
    transform: none !important;
}

.notion-dropdown__menu {
    background: none !important;
    box-shadow: unset !important;
    left: auto !important;
    top: auto !important;
    position: relative !important;
    transform: none !important;
}

.notion-dropdown__menu-header {
    display: none !important;
}

.notion-dropdown__option-icon {
    display: none !important;
}


/* columnlists spalten  --------*/

.notion-column-list {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    max-width: 900px;
    margin: 4rem auto;
    justify-content: space-between;
}

.notion-column {
    /* margin-bottom: 1em !important; */
    padding: 0 !important;
}

.notion-text+.notion-column-list {
    margin-top: 4rem;
}


/* hacks ---------------------------------*/

.super-embed:has(.next-column-wide)+.notion-column-list {
    max-width: 1100px;
}


/* page specific -------------------------*/

.page__i-about .notion-column-list {
    column-gap: 2rem;
    flex-wrap: nowrap;
    max-width: 1200px;
}


/* Text Bild Splaten  Column LR/RL -------*/

.notion-text__children .notion-column-list {
    width: 900px;
    margin-right: 0px;
    margin-bottom: 4rem;
}


/* Oversize 3-column table ---------------*/

.notion-text.bg-gray {
    background-color: transparent;
}

.notion-text.bg-gray .notion-text__children .notion-column-list {
    margin-left: -50px;
}

.notion-column-list.full-width {
    max-width: 90%;
    margin-top: .5rem;
    margin-bottom: .5rem;
    align-self: center;
    line-height: 0px;
}


/*  list in list > image ----------------------*/

.notion-column .notion-column-list {
    margin: 1em 0px 1em 0px;
    width: 100%;
    max-width: 100%;
}


/* wozu gehört das? */

.notion-callout.bg-gray-light .notion-callout__content .notion-column-list .notion-column {
    margin: 0px !important;
}


/* ul / ol lists -----------------------------------*/

.notion-list-item {
    margin: 3px 1px;
    padding-top: 3px;
    padding-bottom: 3px;
}


/* numbered lists ----------------------------------*/

.notion-numbered-list {
    width: var(--content-max-desktop);
    -webkit-padding-start: calc(1.5em + 4px);
    padding-inline-start: calc(1.5em + 4px);
    margin: 0 auto;
}

.notion-numbered-list .notion-list-item {
    padding-left: 10px;
    margin-left: -10px;
}

@media(max-width: 546px) {
    .notion-numbered-list {
        width: 100%
    }
}


/* bullet lists ------------------------------------*/

.notion-bulleted-list {
    width: 100%;
    max-width: var(--content-max-desktop);
    margin: auto !important;
    -webkit-padding-start: 24px !important;
    padding-inline-start: 24px !important;
    line-height: 1.5em;
}

.notion-bulleted-list .notion-list-item {
    padding-left: 10px;
    margin-left: 0;
}


/* footers -------------------------------------*/

.super-embed:has(.next-footer)+.notion-column-list {
    width: 100%;
}

.super-embed:has(.next-footer)+.notion-column-list>.notion-column .notion-text__content {
    /* color:red; */
    text-align: left;
}


/* Dark Lighmode switch -------------------------*/

.theme-toggle {
    --size: 28px;
    background: none;
    border: none;
    padding: 0;
    inline-size: var(--size);
    block-size: var(--size);
    aspect-ratio: 1;
    border-radius: 50%;
    cursor: pointer;
    touch-action: manipulatin;
    -webkit-tab-highlight-color: tranparent;
    outline-offset: var(--size)/2;
}

svg.sun-and-moon {
    width: 100%;
    height: 100%;
}

.sun-and-moon> :is(.moon,
.sun,
.sun-beams) {
    transform-origin: center;
}

.sun-and-moon> :is(.moon,
.sun) {
    fill: var(--color-text-default);
}

.theme-toggle:is(:hover,
 :focus-visible)>.sun-and-moon> :is(.moon,
.sun) {
    fill: var(--color-text-default);
}

.sun-and-moon>.sun-beams {
    stroke: var(--color-text-default);
    stroke-width: 2px;
    stroke-linecap: round;
}

.theme-toggle:is(:hover,
 :focus-visible) .sun-and-moon>.sun-beams {
    stroke: var(--color-text-default);
}

[data-theme="dark"] .sun-and-moon>.sun {
    transform: scale(1.75);
}

[data-theme="dark"] .sun-and-moon>.sun-beams {
    opacity: 0;
}

[data-theme="dark"] .sun-and-moon>.moon>circle {
    transform: translateX(-7px);
}

@supports (cx: 1) {
    [data-theme="dark"] .sun-and-moon>.moon>circle {
        cx: 17;
        transform: translateX(0);
    }
}

@media (prefers-reduced-motion: no-preference) {
    .sun-and-moon>.sun {
        transition: transform .5s var(--ease-elastic-3);
    }
    .sun-and-moon>.sun-beams {
        transition: transform .5s var(--ease-elastic-4), opacity .5s var(--ease-3);
    }
    .sun-and-moon .moon>circle {
        transition: transform .25s var(--ease-out-5);
    }
    @supports (cx: 1) {
        .sun-and-moon .moon>circle {
            transition: cx .25s var(--ease-out-5);
        }
    }
    [data-theme="dark"] .sun-and-moon>.sun {
        transition-timing-function: var(--ease-3);
        transition-duration: .25s;
        transform: scale(1.75);
    }
    [data-theme="dark"] .sun-and-moon>.sun-beams {
        transition-duration: .15s;
        transform: rotateZ(-25deg);
    }
    [data-theme="dark"] .sun-and-moon>.moon>circle {
        transition-duration: .5s;
        transition-delay: .25s;
    }
}


/* ------  M O B I LE  R E S P O N S I V E  --------*/


/* --------- < 880px -------------- */

@media screen and (max-width: 880px) {
    .super-content {
        padding-top: 23vh !important;
        padding-bottom: 4em !important;
        padding-left: var(--padding-left-tablet) !important;
        padding-right: var(--padding-right-tablet) !important;
    }
    .notion-divider {
        margin: 2rem 0 !important;
    }
    /* custom navigation */
    .highlighted-background.bg-brown a {
        padding: 1em 0.5em !important;
    }
    .notion-callout.bg-brown-light.border {
        padding-left: 5em !important;
    }
    .notion-column {
        margin-bottom: 0 !important;
        padding: 0 !important;
    }
    .notion-collection-list__item-content {
        flex-direction: column !important;
        align-items: flex-start !important;
    }
    .notion-collection-list__item-property .notion-property__select {
        display: block !important;
    }
    .notion-collection-list__item-property .notion-property__select .notion-pill {
        margin-bottom: 0.5rem !important;
    }
    /* -- Navigation -- */
    .my-super-navbar {
        width: 100%;
        display: block;
        position: fixed;
        top: unset;
        bottom: 1rem;
        left: 0px;
        z-index: 423;
        margin: 1em auto 1em auto !important;
        padding-left: 64px !important;
        padding-right: 64px !important;
    }
    .my-super-navbar__content {
        width: 100%;
        margin: auto;
    }
    .super-navbar__item {
        width: 100%;
        padding: 0px 16px 0px 16px;
        text-align: left;
    }
    .my-super-navbar__item-list {
        justify-content: center;
    }
    .notion-collection-list__item-property {
        margin-left: 0rem !important;
        font-size: 0.75rem !important;
    }
     :root {
        --collection-card-cover-size-small: 100% !important;
        --collection-card-cover-size-medium: 100% !important;
        --collection-card-cover-size-large: 100% !important;
    }
}


/* --------- < 546px -------------- */

@media(max-width: 546px) {
    .notion-root.max-width {
        padding-left: 0px;
        padding-right: 0px;
    } 
    .super-content {
        width: 100vw !important;
        padding-top: 2rem !important;
        padding-bottom: 12vh;
        padding-left: 20px !important;
        padding-right: 20px !important;
    }
    /* -- page specific -- */
    .super-content.page__index {
        padding-top: 5vh !important;
        padding-bottom: 12vh;
    }
    .super-content.has-footer {
        padding-bottom: 4em;
        padding-top: 24px !important;
    }
    .my_background_portrait {
        background-image: var(--mode-potrait-m);
        background-repeat: no-repeat;
        background-size: cover;
    }
    div.notion-image:nth-child(5) {
        max-width: 100%;
        margin-top: 0rem;
        height: 42vh !important;
    }
    .notion-root h1.notion-heading {
        margin-bottom: 1rem !important;
    }
    p {
        line-height: 142% !important;
    }
    .notion-callout.color-default {
        position: relative;
        max-width: calc(100% + 24px);
        width: calc(100% + 24px);
        height: auto;
        left: -12px;
        margin: 2rem auto 8rem auto;
        padding: 1em !important;
        border: 1px solid var(--color-border-default) !important;
    }
    .notion-column-list {
        margin: 2em auto 0 auto;
        max-width: 100%;
    }
    .notion-collection-gallery.medium {
        width: 100%;
        grid-template-columns: repeat(auto-fill, minmax(var(--collection-card-cover-size-large), 1fr));
    }
    .my-video-content {
        width: 100%;
    }
   
    /* Column Bild Text Reihen wechsel */
    .notion-text__children .notion-column-list:nth-of-type(odd) {
        flex-direction: column-reverse;
    }
    .notion-text__children .notion-column-list {
        width: 100%;
        margin-left: 0px;
        margin-right: 0px;
    }
    .notion-column:has(p){
        margin: 1rem 0 0 0 !important
    }
    /* Column BildText auf spezifischer Seite */
    /* projects --------------------------------*/
    .notion-dropdown__menu.animate-out,
    .notion-dropdown__menu.initial-state {
        -webkit-user-select: auto;
        -moz-user-select: none;
        user-select: auto;
        pointer-events: inherit;
    }
    .page__i-about .notion-column-list {
        max-width: 100%;
        column-gap: 0;
        flex-wrap: wrap;
        flex-direction: column;
        row-gap: 1rem;
    }
    /* 2 columns alternating image and text -----------------------*/
    .page__i-about .notion-column-list:nth-of-type(even) {
        flex-direction: column-reverse;
    }
    .page__i-about .notion-column-list+.notion-column-list {
        margin-bottom: 2rem;
    }
    .page__i-about .notion-column-list .notion-column:nth-child(2) {
        width: 100% !important;
    }
    /* super embed hacks in case -----------------------------------------------------*/
    .super-embed:has(.imgText-columns)~.notion-column-list:has(~.notion-column-list):nth-child(odd) {
        flex-direction: column-reverse;
    }
    /* image super embed hacks images ---------------*/
    .super-embed:has(.next-xl-imgage)+.notion-image.align-start.page-width {
        position: relative;
        width: calc(100% + 24px) !important;
        max-width: 100%;
        left: -12px;
        margin: 0 auto 2rem auto !important;
    }
    .super-embed:has(.next-xl-imgage)+.notion-image.align-start.page-width>figcaption {
        position: relative;
        left: -12px;
    }
    .notion-text.bg-purple {
        font-size: 1rem;
        line-height: 92% !important;
    }
    .notion-text+.notion-image {
        margin: 1rem auto 1rem auto;
    }
    .notion-column .notion-text+.notion-image {
        margin-bottom: 6rem;
    }
    .notion-callout.bg-pink-light {
        min-width: 240px;
        width: 90%;
        max-width: 420px;
    }
    /* my super menu backdrop mobile ----------------*/
    .backdrop {
        position: fixed;
        z-index: 123;
        top: 0px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        backdrop-filter: blur(42px) !important;
        -webkit-backdrop-filter: blur(42px) !important;
        background-color: var(--color-backdrop-bg);
    }
    .backdrop:is([visible="true"]) {
        display: block;
    }
    .backdrop:is([visible="false"]) {
        display: none;
    }
    .my-super-navbar {
        width: 100%;
        display: block;
        position: fixed;
        top: unset;
        bottom: 1rem;
        left: 0px;
        z-index: 423;
        margin: 1em auto 1em auto !important;
        padding-left: 56px !important;
        padding-right: 56px !important;
    }
    .my-super-navbar__content {
        width: 100%;
        margin: auto;
    }
    .my-super-subnav {
        display: flex;
        background-color: transparent;
        height: 40px;
        flex-direction: row;
        justify-content: center;
    }
    .my-super-navbar__item-list {
        position: absolute;
        width: 100%;
        height: auto;
        bottom: 2em;
        left: 0px;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: space-around;
        align-items: center;
        gap: 0.7em;
        background-color: transparent;
        list-style: none;
        border-radius: var(--m423-radius);
        padding: 1em 0;
    }
    [aria-label="menu-closed"].my-super-navbar__item-list {
        display: none;
    }
    [aria-label="menu-open"].my-super-navbar__item-list {
        display: flex;
    }
    li.my-contacts {
        display: flex;
        font-size: .8rem;
        width: 100%;
        flex-direction: row;
        align-content: center;
        align-items: center;
        justify-content: space-evenly;
        padding-bottom: 1rem;
    }
    a.my-contact {
        color: var(--color-text-default);
    }
    a.notion-link.super-navbar__item {
        position: relative;
        padding: 1rem;
        font-size: 1.72rem;
        font-weight: 700;
        color: var(--color-text-default);
        opacity: 1 !important;
    }
    .my-menuburger {
        --burger-size: 80px;
        display: block;
        position: relative;
        top: -50%;
        background: none;
        border: none;
        padding: 0;
        inline-size: var(--burger-size);
        block-size: var(--burger-size);
        aspect-ratio: 1;
        border-radius: 50%;
        cursor: pointer;
        touch-action: manipulatin;
        -webkit-tab-highlight-color: tranparent;
        outline-offset: var(--burger-size) / 2;
    }
    .line--1,
    .line--3 {
        --total-length: 126.64183044433594;
    }
    .line--2 {
        --total-length: 70;
    }
    .line--1,
    .line--2,
    .line--3 {
        fill: none;
        stroke: var(--color-text-default);
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
        --length: 24;
        --offset: -38;
        stroke-dasharray: var(--length) var(--total-length);
        stroke-dashoffset: var(--offset);
        transition: all 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    [aria-expanded="true"] .line--1,
    [aria-expanded="true"] .line--3 {
        --offset: -93.5149185097;
    }
    [aria-expanded="true"] .line--2 {
        --offset: -50;
        --length: 0;
    }
    circle.burger-bg {
        fill: #fff3;
        opacity: 0;
    }
    button.my-menuburger:hover circle.burger-bg {
        opacity: 0;
    }
    .notion-callout.bg-orange-light {
        width: 100%;
        height: 64px;
    }
    #closeExpandeable {
        width: auto;
    }
    .super-content.page__blog423 .notion-collection.inline {
        width: 100%;
        margin: auto;
    }
}
