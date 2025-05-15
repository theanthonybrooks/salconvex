export function getExternalRedirectHtml(redirectUrl: string) {
  return `
    <html>
      <head>
        <title>Redirecting...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: sans-serif;
            background-color: #f4f4f4;
            color: #333;
            text-align: center;
          }

          .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #333;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }

          h1 {
            font-size: 1.2em;
          }

          p {
            font-size: 1em;
          }

          @media (max-width: 768px) {
            .loader {
              border-width: 10px;
              width: 50px;
              height: 50px;
            }

            h1 {
              font-size: 1.5em;
              text-wrap: balance;
              line-height: 1.5;
            }

            p {
              font-size: 1.2em;
            }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div>
          <div class="loader"></div>
          <h1>Redirecting you to the application site…</h1>
          <p>If you're not redirected, <a href="${redirectUrl}" target="_self">click here</a>.</p>
        </div>
      </body>
    </html>
  `;
}

export function getExternalErrorHtml(fallbackUrl: string) {
  return `
    <html>
      <head>
        <title>Redirect Failed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            font-family: sans-serif;
            background-color: #fff3f3;
            color: #990000;
            padding: 40px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>Something went wrong.</h1>
        <p>Please try again later or visit <a href="${fallbackUrl}">${fallbackUrl}</a> directly.</p>
      </body>
    </html>
  `;
}
