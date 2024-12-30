const express = require('express');
const cors = require('cors');
const port = 3000;

const app = express();

app.get('/',(req,res) => {
    res.send('halloo').status(200);
})

app.listen(port,() => {
    console.log("Listetning on 3000");
})