require('dotenv').config();
var axios = require('axios');
var moment = require('moment');
var inquirer = require('inquirer');
var fs = require('fs');
var Spotify = require('node-spotify-api');
var keys = require('./keys.js');
var spotify = new Spotify(keys.spotify);

var songs = [];
var count = 0;
var on = true;

// Bands-in-town
var bands = function(input) { 
    axios({
        method: 'get',
        url: 'https://rest.bandsintown.com/artists/' + input + '/events?app_id=codingbootcamp',
    }).then(function (response) {
       // Capitalize first letter of each word for input formatting
        function capitalize() { 
            str = input.split(' ');

            for (var i = 0; i < str.length; i++) {
                str[i] = str[i][0].toUpperCase() + str[i].substr(1);
            }

            return str.join(' ');
        } 

        if (response.data.length > 0) {
            console.log(response.data)
            console.log('\n\nUpcoming ' + capitalize(input) + ' Shows \n--------------');
            for (var i = 0; i < response.data.length; i++) {
                var city;

                // If non-US city then show country instead of state
                if (response.data[i].venue.region !== '') { 
                    city = response.data[i].venue.city + ', ' + response.data[i].venue.region
                } else { 
                    city = response.data[i].venue.city + ', ' + response.data[i].venue.country
                } 

                console.log('Venue: ' + response.data[i].venue.name + '\nCity: ' + city + response.data[i].venue.region + '\nDate: ' + moment(response.data[i].datetime).format('YYYY-MM-DD HH:mm'));
                console.log('--------------');
            }
            console.log('\n\n')
        } else { 
            console.log('There are no upcoming concerts for ' + capitalize(input) + '. Try another artist.');
        }
    }).catch(function (error) {
        console.log('Error: Artist not found. Try another search.\n\n');
    });
}

// Spotify
var song = function(input) { 
    spotify.search({ 
        type: 'track', 
        query: input 
    }).then(function(response) {
        // Store all songs returned from api call so future api calls do not need to be made
        // Prevent duplication
        if (songs.length === 0) {
            for (var i = 0; i < response.tracks.items.length; i++) {
                songs.push({'artist':response.tracks.items[i].album.artists[0].name, 'album':response.tracks.items[i].album.name,'song':response.tracks.items[i].name,'preview':response.tracks.items[i].preview_url})
            }
        } 
        // Prompt the user to confirmn whether or not their song was found
        if (on) { 
            console.log('\n\nSong ' + (count + 1) + '/' + songs.length + '\nArtist: ' + songs[0].artist + '\nAlbum: ' + songs[0].album + '\nSong: ' + songs[0].song + '\nPreview: ' + songs[0].preview + '\n\n')
            prompt()
            on = true
        } else { 
            console.log('\n\nArtist: ' + songs[0].artist + '\nAlbum: ' + songs[0].album + '\nSong: ' + songs[0].song + '\nPreview: ' + songs[0].preview + '\n\n')
        }
    }).catch(function(err) {
        console.log(err.error);
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
        console.log(error);
    });
}

var random = function() { 
    fs.readFile('random.txt', "utf8", function(error, data){
        var randomObj = Math.round(Math.random() * ((data.split(',').length) - 1))

        // If spotify-this-song grab the next item in array as it will always be a song
        if (data.split(',')[randomObj] === 'spotify-this-song') {
            console.log('\n\nSearching for ' + data.split(',')[randomObj + 1])
            on = false
            song(data.split(',')[randomObj + 1])
        } else { 
            console.log('\n\nSearching for ' + data.split(',')[randomObj])
            // Flip the save song option off if choosing random song as it has already been saved
            on = false
            song(data.split(',')[randomObj])
        }
    });

}

// Run through list of songs returned and confirm if this is the song the user wants
function prompt() {
    inquirer.prompt([
        { 
            name: 'correctSong',
            message: 'Is this the song you\'re looking for? (Y/N)',
            validate: function(input) { 
                // Return next result ONLY if capital Y or N is provided
                if (input === 'Y' || input === 'N') { 
                    return true
                }
                // Return error message if Y or N is not provided
                return 'Please enter Y or N'
            }
        }
    ]).then(function(response) { 
        if (response.correctSong === 'Y') { 
            // Store correct songs to log.txt
            fs.appendFile('random.txt', 'spotify-this-song,' + songs[count].artist + ' - ' + songs[count].song + ',', function(err) {
                if (err) { 
                    console.log('Error saving song.')
                } else {
                    console.log('Song saved.\n');
                }
              });
        } else { 
            if (count + 1 < songs.length) {
                // Grab next song from songs array and print
                count++
                console.log('\n\nSong ' + (count + 1) + '/' + songs.length + '\nArtist: ' + songs[count].artist + '\nAlbum: ' + songs[count].album + '\nSong: ' + songs[count].song + '\nPreview: ' + songs[count].preview + '\n\n')
                // Check if this is the correct song
                prompt()
            } else { 
                console.log('No more songs found. Try another `spotify-this-song` search')
            }
        }
    })
}

module.exports = { 
    bands: bands,
    spotify: song,
    omdb: omdb, 
    random: random
}