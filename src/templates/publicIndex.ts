export default (markup: string) =>
  `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Opt Out Advertising | Login</title>
    <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.ico">
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&amp;subset=latin-ext" rel="stylesheet">
    <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <link rel="stylesheet" href="/css/main-optout.css">
  </head>
  <body class="login-page">
    <div class="container-fluid">
      <div id="root">${markup}</div>
    </div>
    <script src="/build/rtb-public.bundle.js"></script>
  </body>
</html>
`