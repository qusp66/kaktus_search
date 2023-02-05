const express = require('express');
const app = express();
const pug = require('pug');
var bodyParser = require('body-parser')
const scrape = require('./scrape.js')

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.set('view engine', 'pug');

const json2csv = async (jsonArray) => {
    var csv = '';

    // Get the headers from the first object in the array
    var headers = Object.keys(jsonArray[0]);
    csv += headers.join(',') + '\n';

    // Loop through the array and add the data for each object
    jsonArray.forEach(function (jsonObject) {
        var values = headers.map(function (header) {
            return jsonObject[header];
        });
        csv += values.join(',') + '\n';
    });

    return csv;
}

app.get('/', (req, res) => {
    res.render('index', { title: 'Kaktus App' });
});

app.post('/submit', async (req, res) => {
    let contacts = await scrape.search(req.body.search);
    let csv = await json2csv(contacts);
    console.log(csv);
    res.set({ 'content-type': 'text/csv; charset=utf-8' });
    res.send(csv);
});

app.listen(3030, () => {
    console.log('Text input app listening on port 3030!');
});
