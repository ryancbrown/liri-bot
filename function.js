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
        // Log search
        if (on) {
            // Add to log.txt
            fs.appendFile('log.txt','concert-this ' + input + '\n', function(err) { 
                console.log(err)
            }) 

            // Add to random.txt
            fs.appendFile('random.txt', 'concert-this,' + input + ',', function(err) {
                if (err) { 
                    console.log('Error saving upcoming concerts.')
                } 
            });
        } else {
            fs.appendFile('log.txt','do-what-it-says\n', function(err) { 
                    console.log(err)
            }) 
            on = true
        }

       // Capitalize first letter of each word for input formatting
        function capitalize() { 
            str = input.split(' ');

            for (var i = 0; i < str.length; i++) {
                str[i] = str[i][0].toUpperCase() + str[i].substr(1);
            }

            return str.join(' ');
        } 

        if (response.data.length > 0) {
            var city;

            // If non-US city then show country instead of state

            console.log('\n\nUpcoming ' + capitalize(input) + ' Shows \n--------------');

            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].venue.region !== '') { 
                    city = response.data[i].venue.city + ', '
                } else { 
                    city = response.data[i].venue.city + ', ' + response.data[i].venue.country
                } 
    
                console.log('Venue: ' + response.data[i].venue.name + '\nCity: ' + city + response.data[i].venue.region + '\nDate: ' + moment(response.data[i].datetime).format('YYYY-MM-DD HH:mm'));
                console.log('--------------');
            }
            console.log('\n')
        } else { 
            console.log('\nThere are no upcoming concerts for ' + capitalize(input) + '. Try another artist.\n');
        }
    }).catch(function (error) {
        console.log('\nError: Artist not found. Try another search.\n')
    });
}

// Spotify
var song = function(input) { 
    spotify.search({ 
        type: 'track', 
        query: input 
    }).then(function(response) {
        if(on) {
            // Log search
            fs.appendFile('log.txt','spotify-this-song ' + input + '\n', function(err) { 
                console.log(err)
            }) 
        } else { 
            // Log search
            fs.appendFile('log.txt','do-what-it-says\n', function(err) { 
                console.log(err)
            }) 
        }
        // Store all songs returned from api call so future api calls do not need to be made
        // Prevent duplication
        if (songs.length === 0) {
            for (var i = 0; i < response.tracks.items.length; i++) {
                songs.push({'artist':response.tracks.items[i].album.artists[0].name, 'album':response.tracks.items[i].album.name,'song':response.tracks.items[i].name,'preview':response.tracks.items[i].preview_url})
            }
        } 
        // Prompt the user to confirm whether or not their song was found
        if (on) { 
            console.log('\n\nSong ' + (count + 1) + '/' + songs.length + '\nArtist: ' + songs[0].artist + '\nAlbum: ' + songs[0].album + '\nSong: ' + songs[0].song + '\nPreview: ' + songs[0].preview + '\n\n')
            prompt()
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
        if (on) { 
            // Log search
            fs.appendFile('log.txt','movie-this ' + input + '\n', function(err) { 
                if (err) { 
                }
            }) 

            // Add to random.txt
            fs.appendFile('random.txt', 'movie-this,' + input + ',', function(err) {
                if (err) { 
                    console.log('\nError saving movie.\n')
                }  
            });
        }  else {
            fs.appendFile('log.txt','do-what-it-says\n', function(err) { 
                    console.log(err)
            }) 
            on = true
        }

        console.log('\n\nTitle: ' + response.data.Title + '\nYear: ' + response.data.Released + '\nIMDB: ' + response.data.Ratings[0].Value + '\nRotten Tomatoes: ' + response.data.Ratings[1].Value + '\nCountry: ' + response.data.Country  + '\nLanguage: ' + response.data.Language + '\nPlot: ' + response.data.Plot + '\nActors: ' + response.data.Actors + '\n\n');   
    }).catch(function (error) {
        if (error) { 
            console.log('\nMovie not found. Please search again\n');
        } 
    });
}

var random = function() { 
    // Read random.txt
    fs.readFile('random.txt', "utf8", function(error, data){
        var randomObj = Math.round(Math.random() * ((data.split(',').length) - 1))
        var obj = data.split(',')[randomObj]
        var request;
        var search;
        
        // Assuming that the band, movie, and song passed in by the user live in even numbered positions on the array
        // Determine if the random number chosen is even or odd and set request equal to the user request—e.g. `movie-this`
        if (randomObj % 2 !== 0 || randomObj === 1) {
            request = data.split(',')[randomObj - 1]
            search = data.split(',')[randomObj]
        } else { 
            request = data.split(',')[randomObj]
            search = data.split(',')[randomObj + 1] 
        }        

        // Set up the logic to decide on how to log data
        if (request === 'spotify-this-song') {
            console.log('\n\nSearching for a song...')
            on = false
            song(search)
        } else if (request === 'movie-this') { 
            console.log('\n\nSearching for a movie...')
            on = false
            omdb(search)
        } else if (request === 'concert-this') { 
            console.log('\n\nSearching for a movie...')
            on = false
            bands(search)
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