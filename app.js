const express = require('express');
const cors = require('cors');
const path = require('path');
const ApiRoute = require('./routes/ApiRoute');
const PageRoute = require('./routes/PageRoute');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    req.domain = req.headers.host;
    next();
  });
  
app.use('/api', ApiRoute);
app.use('/', PageRoute);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
