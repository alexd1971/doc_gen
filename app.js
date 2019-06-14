const bodyParser = require('body-parser');
const config = require('./config.json');
const express = require('express');
const htmlPdf = require('html-pdf-chrome');
const pug = require('pug');

const app = express();
app.use(bodyParser.json());

const supportedFormats = ['html', 'pdf'];

const chrome = {
  host: config.chrome.host,
  port: config.chrome.port,
};

app.post('/', (req, res) => {

  if(!req.body.template) {
    return res.status(400).send('Template not set');
  }
  
  if(!supportedFormats.includes(req.body.outputFormat)) {
    return res.status(400).send('Unsupported output format: ' + req.body.outputFormat);
  }

  var html;
  try {
    html = pug.renderFile('templates/' + req.body.template + '/index.pug', req.body.vars);
  } catch (e) {
    if (e.code == 'ENOENT') {
      return res.status(500).send('Template not found: ' + e.path);
    }
    return res.status(500).send('Could not render template: ' + e);
  }
  if (req.body.outputFormat == 'html') {
    res.contentType('text/html');
    res.end(html);
  } else {
    var options = Object.assign({}, chrome);
    if (req.body.printOptions) {
      options.printOptions = req.body.printOptions;
    }
    htmlPdf.create(html, options).then((pdf) => {
      res.contentType('application/pdf');
      res.end(pdf.toBuffer(), 'binary');
    }).catch((e) => {
      res.status(500).send('Could not create pdf: ' + e);
    });
  }
});

app.listen(7777, () => {
  console.log('Listening on port 7777');
});
