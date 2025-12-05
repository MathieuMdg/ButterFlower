// server/syncDeezer.js
const db = require('./config/db');
const axios = require('axios');

// Fonction pour attendre un peu (promisify setTimeout)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function syncDeezer() {
  console.log("🚀 Démarrage de la synchronisation Deezer...");

  // 1. Récupérer toutes les chansons qui n'ont pas encore de lien Deezer
  // Note: J'utilise db.query avec une callback wrapper en promesse car votre db.js semble utiliser des callbacks classiques
  const getChansons = () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT id, titre, album_id FROM chansons WHERE deezer_preview_url IS NULL', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  const updateChanson = (id, preview, deezerId) => {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE chansons SET deezer_preview_url = ?, deezer_id = ? WHERE id = ?',
        [preview, deezerId, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  };

  // Récupérer le nom de l'artiste via l'album (jointure)
  const getArtistName = (albumId) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT artist FROM albums WHERE id = ?', [albumId], (err, rows) => {
        if (err) resolve("Tyler, The Creator"); // Fallback par défaut
        else if (rows.length > 0) resolve(rows[0].artist);
        else resolve("Tyler, The Creator");
      });
    });
  };

  try {
    const chansons = await getChansons();
    console.log(`Found ${chansons.length} chansons to update.`);

    for (const chanson of chansons) {
      const artist = await getArtistName(chanson.album_id);
      
      // Nettoyage du titre (ex: enlever "feat. XXX" pour la recherche)
      const cleanTitle = chanson.titre.split('(')[0].trim(); 
      
      console.log(`🔍 Recherche: ${artist} - ${cleanTitle}...`);
      
      try {
        const response = await axios.get('https://api.deezer.com/search', {
          params: { q: `artist:"${artist}" track:"${cleanTitle}"` }
        });

        if (response.data.data && response.data.data.length > 0) {
          const track = response.data.data[0];
          await updateChanson(chanson.id, track.preview, track.id);
          console.log(`✅ Mis à jour: ${chanson.titre}`);
        } else {
          console.log(`❌ Non trouvé: ${chanson.titre}`);
        }
      } catch (err) {
        console.error(`Erreur API pour ${chanson.titre}:`, err.message);
      }

      // Pause de 300ms pour ne pas se faire bannir par Deezer
      await wait(300);
    }
    
    console.log("✨ Synchronisation terminée !");
    process.exit();

  } catch (error) {
    console.error("Erreur script:", error);
    process.exit(1);
  }
}

syncDeezer();
