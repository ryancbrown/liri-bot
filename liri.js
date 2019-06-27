require('dotenv').config();
var Spotify = require('node-spotify-api')

var keys = require('./keys.js');
var spotify = new Spotify(keys.spotify);

var input = process.argv[2] 

if (input === 'concert-this') { 
    console.log('concert-this success')
}

if (input === 'spotify-this-song') { 
    console.log('spotify-this-song success')
}

if (input === 'movie-this') { 
    console.log('movie-this success')
}

if (input === 'do-what-it-says') { 
    console.log('do-what-it-says success')
}




