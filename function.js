require('dotenv').config();
var Spotify = require('node-spotify-api')
var axios = require('axios');
var moment = require('moment');
var keys = require('./keys.js');
var spotify = new Spotify(keys.spotify);

// Bands-in-town
var bands = function(input) { 
    axios({
        method: 'get',
        url: 'https://rest.bandsintown.com/artists/' + input + '/events?app_id=codingbootcamp',
    }).then(function (response) {
       // Capitalize first letter of each word for input formatting
        function capitalize() { 
            str = input.split(" ");

            for (var i = 0; i < str.length; i++) {
                str[i] = str[i][0].toUpperCase() + str[i].substr(1);
            }

            return str.join(" ");
        } 

        if (response.data.length > 0) {
            console.log('\n\nUpcoming ' + capitalize(input) + ' Shows \n--------------');
            for (var i = 0; i < response.data.length; i++) {
                console.log('Venue: ' + response.data[i].venue.name + '\nCity: ' + response.data[i].venue.city + ', ' + response.data[i].venue.region + '\nDate: ' + moment(response.data[i].datetime).format('YYYY-MM-DD HH:mm'));
                console.log('--------------');
            }
        } else { 
            console.log('There are no upcoming concerts for ' + capitalize(input) + '. Try another artist.');
        }
    }).catch(function (error) {
        console.log(error);
    });
}

// Spotify
var song = function(input) { 
    spotify.search({ 
        type: 'track', 
        query: input 
    }).then(function(response) {
        for (var i = 0; i < response.tracks.items.length; i++) {
            console.log('--------------')
            console.log('Artist: ' + response.tracks.items[i].album.artists[0].name); // artist name
            console.log('Album: ' + response.tracks.items[i].album.name); // album
            console.log('Song: ' + response.tracks.items[i].name); // track name
            console.log('Preview: ' + response.tracks.items[i].preview_url); // preview
        }
    }).catch(function(err) {
        console.log(err);
    }) 
}

// OMDB
var omdb = function(input) { 
    axios({
        method: 'get',
        url: 'http://www.omdbapi.com/?apikey=trilogy&t=' + input,
    }).then(function (response) {
        console.log('--------------')
        console.log('Title: ' + response.data.Title); // title
        console.log('Year: ' + response.data.Released); // year
        console.log('IMDB: ' + response.data.Ratings[0].Value); // imdb
        console.log('Rotten Tomatoes: ' + response.data.Ratings[1].Value); // rotten tomatoes
        console.log('Country: ' + response.data.Country); // country
        console.log('Language: ' + response.data.Language); // language
        console.log('Plot: ' + response.data.Plot); // plot
        console.log('Actors: ' + response.data.Actors); // actors      
    }).catch(function (error) {
        // handle error
        console.log(error);
    });
}

module.exports = { 
    bands: bands,
    spotify: song,
    omdb: omdb
}