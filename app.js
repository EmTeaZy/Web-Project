const express = require('express');
const layouts = require('express-ejs-layouts');

const app = express()

// Setting the view engine
app.use(layouts);
app.set('view engine', 'ejs');

app.use('/', require('./routes/index'))

const PORT = 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));