const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());

app.use(express.static(path.join(__dirname, 'dist')));

const oneDay = 86400000; 
app.use((req, res, next) => {
    if (req.url.match(/\.(js|css|woff|woff2|html|png|jpg|jpeg|gif|svg)$/)) {
        res.setHeader('Cache-Control', `public, max-age=${oneDay}`);
        
        res.setHeader('ETag', generateETagForResource(req.url));

        res.setHeader('X-Content-Type-Options', 'nosniff'); 
        
    }
    next();
});

function generateETagForResource(resourceUrl) {
    return generateUniqueETag(resourceUrl);
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
