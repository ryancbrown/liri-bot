var request = process.argv[2];
var input = process.argv.slice(3).join(' ');
var f = require('./function.js');

// Search for upcoming concertss
if (request === 'concert-this') { 
    f.bands(input);
}

// Search for a song on Spotify
if (request === 'spotify-this-song' && input !== '') { 
    f.spotify(input);
} else if (request === 'spotify-this-song' && input === '') { 
    f.spotify('Ace of Base The Sign');
}

// Search for a movie
if (request === 'movie-this' && input !== '') { 
    f.omdb(input);
} else if (request === 'movie-this' && input === '') { 
    console.log('--------------');
    console.log('If you haven\'t watched \'Mr. Nobody,\' then you should: http://www.imdb.com/title/tt0485947/');
    console.log('It\'s on Netflix!');
}

// Get random song that you had saved to listen to
if (request === 'do-what-it-says') { 
    f.random()
}