const db = require('./config/db');
const axios = require('axios');

// Fonction pause pour ne pas se faire bannir par l'API Deezer
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function importAlbums() {
    console.log("🚀 Démarrage de l'import des chansons...");

    try {
        // 1. Récupérer tous les albums de la BDD
        // On utilise une Promise car votre db.js utilise peut-être des callbacks
        const albums = await new Promise((resolve, reject) => {
            db.query('SELECT id, title, artist FROM albums', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log(`📦 ${albums.length} albums trouvés en base.`);

        for (const album of albums) {
            console.log(`\n💿 Traitement de : ${album.title} (${album.artist})`);

            // 2. Chercher l'album sur Deezer
            try {
                const searchRes = await axios.get('https://api.deezer.com/search/album', {
                    params: { q: `artist:"${album.artist}" album:"${album.title}"` }
                });

                if (!searchRes.data.data || searchRes.data.data.length === 0) {
                    console.log(`❌ Album introuvable sur Deezer : ${album.title}`);
                    continue;
                }

                // On prend le premier résultat (le plus pertinent)
                const deezerAlbumId = searchRes.data.data[0].id;

                // 3. Récupérer la tracklist de cet album
                const tracksRes = await axios.get(`https://api.deezer.com/album/${deezerAlbumId}/tracks`);
                const tracks = tracksRes.data.data;

                if (!tracks || tracks.length === 0) {
                    console.log(`⚠️ Aucune piste trouvée pour cet album.`);
                    continue;
                }

                console.log(`   ✅ ${tracks.length} pistes trouvées. Insertion en cours...`);

                // 4. Insérer chaque piste en BDD
                for (const track of tracks) {
                    // Conversion durée secondes -> mm:ss (ex: 203 -> 3:23)
                    const minutes = Math.floor(track.duration / 60);
                    const seconds = track.duration % 60;
                    const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                    // Requête d'insertion (ou mise à jour si existe déjà)
                    // On vérifie si la chanson existe déjà pour cet album (par titre) pour éviter les doublons
                    await new Promise((resolve, reject) => {
                        const sql = `
                            INSERT INTO chansons (titre, album_id, duree, deezer_id, deezer_preview_url)
                            SELECT ?, ?, ?, ?, ?
                            WHERE NOT EXISTS (
                                SELECT 1 FROM chansons WHERE titre = ? AND album_id = ?
                            )
                        `;
                        
                        db.query(sql, [
                            track.title,
                            album.id,
                            durationStr,
                            track.id,
                            track.preview,
                            track.title, // Pour le WHERE NOT EXISTS
                            album.id     // Pour le WHERE NOT EXISTS
                        ], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }
                console.log(`   ✨ Tracks importées pour ${album.title}`);

            } catch (err) {
                console.error(`   ❌ Erreur API pour ${album.title}:`, err.message);
            }

            // Pause de 0.5s entre chaque album
            await wait(500);
        }

        console.log("\n🎉 Importation terminée avec succès !");
        process.exit();

    } catch (error) {
        console.error("Erreur critique du script :", error);
        process.exit(1);
    }
}

importAlbums();
