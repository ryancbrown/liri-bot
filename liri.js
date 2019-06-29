require('dotenv').config();
var Spotify = require('node-spotify-api')
var axios = require('axios');
var moment = require('moment');
var keys = require('./keys.js');
var spotify = new Spotify(keys.spotify);

var request = process.argv[2] 
var input = process.argv[3] 

if (request === 'concert-this') { 
    axios({
        method: 'get',
        url: 'https://rest.bandsintown.com/artists/' + input + '/events?app_id=codingbootcamp',
    }).then(function (response) {
        if (response.data.length > 0) {
            console.log('\n\nUpcoming ' + capitalize(input) + ' Shows \n--------------')
            for (var i = 0; i < response.data.length; i++) {
                console.log('Venue: ' + response.data[i].venue.name + '\nCity: ' + response.data[i].venue.city + ', ' + response.data[i].venue.region + '\nDate: ' + moment(response.data[i].datetime).format('YYYY-MM-DD HH:mm') )
                console.log('--------------')
            }
        } else { 
            console.log('There are no upcoming concerts for ' + capitalize(input) + '. Try another artist.')
        }
    });
}

if (request === 'spotify-this-song') { 
    spotify.search({ 
        type: 'track', 
        query: input 
    }).then(function(response) {
        for (var i = 0; i < response.tracks.items.length; i++) {
            console.log('--------------')
            console.log('\nArtist: ' + response.tracks.items[i].album.artists[0].name); // artist name
            console.log('Album: ' + response.tracks.items[i].album.name) // album
            console.log('Song: ' + response.tracks.items[i].name); // track name
            console.log('Preview: ' + response.tracks.items[i].preview_url + '\n'); // preview
        }
    }).catch(function(err) {
        console.log(err);
    });
}

if (request === 'movie-this') { 
    console.log('movie-this success')
}

if (request === 'do-what-it-says') { 
    console.log('do-what-it-says success')
}

// Capitalize first letter of each word for input formatting
function capitalize() { 
    str = input.split(" ");

    for (var i = 0; i < str.length; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }

    return str.join(" ");
}