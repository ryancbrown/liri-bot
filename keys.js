console.log('this is loaded');

SPOTIFY_ID = '255221e3beb54644b406a6cced455932'
SPOTIFY_SECRET = 'c771149e911942aeb62a75607468fd0b'

exports.spotify = {
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
};
