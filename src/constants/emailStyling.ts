import { html } from "common-tags";

export const generalStyling = html`
  <style>
    img {
      border: none;
      -ms-interpolation-mode: bicubic;
      max-width: 100%;
    }

    body {
      font-family: sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 14px;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }

    table {
      border-collapse: separate;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      min-width: 100%;
      width: 100%;
    }
    table td {
      font-family: sans-serif;
      font-size: 14px;
      vertical-align: top;
    }

    h1,
    h2,
    h3,
    h4 {
      color: #06090f;
      font-family: "Space Grotesk", Helvetica, Arial, sans-serif;
      font-weight: 400;
      line-height: 1.4;
      margin: 0;
      margin-bottom: 30px;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 900;
      text-align: center;
      text-transform: capitalize;
    }

    p,
    ul,
    ol {
      font-family: "Space Grotesk", Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: normal;
      margin: 0;
      margin-bottom: 15px;
    }
    p li,
    ul li,
    ol li {
      list-style-position: inside;
      margin-left: 5px;
    }

    a {
      text-decoration: none;
      font-weight: 700;
      color: black;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
`;

export const newsletterStyling = html`
  <style>
    img {
      border: none;
      -ms-interpolation-mode: bicubic;
      max-width: 100%;
    }

    body {
      font-family: "Space Grotesk", Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 14px;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }

    table {
      border-collapse: separate;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      min-width: 100%;
      width: 100%;
    }
    table td {
      font-family: "Space Grotesk", Helvetica, Arial, sans-serif;
      font-size: 14px;
      vertical-align: top;
    }

    /* -------------------------------------
        BODY & CONTAINER
    ------------------------------------- */

    .content {
      box-sizing: border-box;
      display: block;
      margin: 0 auto;
      max-width: 680px;
      padding: 10px;
    }

    @media only screen and (max-width: 420px) {
      .content {
        padding: 20px !important;
      }
    }

    /* -------------------------------------
        HEADER, FOOTER, MAIN
    ------------------------------------- */
    .main {
      background: #ffffff;
      border-radius: 3px;
      width: 100%;
    }

    .header {
      padding: 20px 0;
    }

    .wrapper {
      box-sizing: border-box;
      padding: 20px;
    }

    .content-block {
      padding-bottom: 10px;
      padding-top: 10px;
    }

    .footer {
      clear: both;
      margin-top: 10px;
      text-align: center;
      width: 100%;
    }
    .footer td,
    .footer p,
    .footer span,
    .footer a {
      color: #9a9ea6;
      font-size: 12px;
      text-align: center;
    }

    /* -------------------------------------
        TYPOGRAPHY
    ------------------------------------- */
    h1,
    h2,
    h3,
    h4 {
      color: #06090f;
      font-family: "Space Grotesk", Helvetica, Arial, sans-serif;
      font-weight: 400;
      line-height: 1.4;
      margin: 0;
      margin-bottom: 30px;
    }

    h1 {
      font-size: 35px;
      font-weight: 300;
      text-align: center;
      text-transform: capitalize;
    }

    p {
      text-align: left;
      line-height: 2;
    }

    p,
    ul,
    ol {
      font-family: "Space Grotesk", Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: normal;
      margin: 0;
      margin-bottom: 15px;
    }
    p li,
    ul li,
    ol li {
      list-style-position: inside;
      margin-left: 5px;
    }

    a {
      text-decoration: none;
      font-weight: 700;
      color: black;
    }
    a:hover {
      text-decoration: underline;
    }

    .heading {
      font-size: 1.2rem;
      text-align: start;
      margin: 30px 0;
    }

    /* -------------------------------------
        BUTTONS
    ------------------------------------- */
    .btn {
      box-sizing: border-box;
      width: 100%;
    }
    .btn > tbody > tr > td {
      padding-bottom: 15px;
    }
    .btn table {
      min-width: auto;
      width: auto;
    }
    .btn table td {
      background-color: #ffffff;
      border-radius: 5px;
      text-align: center;
    }
    .btn a {
      background-color: #ffffff;
      border: solid 1px #ec0867;
      border-radius: 5px;
      box-sizing: border-box;
      color: #ec0867;
      cursor: pointer;
      display: inline-block;
      font-size: 14px;
      font-weight: bold;
      margin: 0;
      padding: 12px 25px;
      text-decoration: none;
      text-transform: capitalize;
    }

    .btn-primary table td {
      background-color: #ec0867;
    }

    .btn-primary a {
      background-color: #ec0867;
      border-color: #ec0867;
      color: #ffffff;
    }

    /* -------------------------------------
        OTHER STYLES THAT MIGHT BE USEFUL
    ------------------------------------- */
    .last {
      margin-bottom: 0;
    }

    .first {
      margin-top: 0;
    }

    .align-center {
      text-align: center;
    }

    .align-right {
      text-align: right;
    }

    .align-left {
      text-align: left;
    }

    .clear {
      clear: both;
    }

    .mt0 {
      margin-top: 0;
    }

    .mb0 {
      margin-bottom: 0;
    }

    .preheader {
      color: transparent;
      display: none;
      height: 0;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      mso-hide: all;
      visibility: hidden;
      width: 0;
    }

    .powered-by a {
      text-decoration: none;
    }

    hr {
      border: none;
      border-top: 2px solid black;
      max-width: 80vw;
      margin: 20px auto;
      height: 0;
    }
  </style>
`;
