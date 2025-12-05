const db = require('./config/db');
const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// Nettoyer le titre pour comparaison
const normalizeTitle = (title) => {
    return title.toLowerCase()
        .replace(/\(.*\)/g, '') // Enlever les parenthèses (Deluxe)
        .replace(/\[.*\]/g, '') // Enlever les crochets [Remaster]
        .replace(/feat\..*/g, '') // Enlever les featurings
        .trim();
};

async function importArtistClean(artistName) {
    console.log(`\n🛡️  Mode Importation STRICT pour : "${artistName}"...`);

    try {
        // 1. Trouver l'artiste
        const searchRes = await axios.get(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`);
        if (!searchRes.data.data || searchRes.data.data.length === 0) {
            console.log("❌ Artiste introuvable.");
            process.exit(0);
        }
        const artist = searchRes.data.data[0];
        console.log(`✅ Artiste : ${artist.name}`);

        // 2. Récupérer les albums
        const albumsListRes = await axios.get(`https://api.deezer.com/artist/${artist.id}/albums?limit=100`);
        const albumsSimple = albumsListRes.data.data;

        // Sets pour éviter les doublons
        const processedAlbums = new Set();
        // NOUVEAU : On garde en mémoire les chansons déjà vues pour cet artiste
        // On va les pré-remplir avec ce qui est déjà en base pour cet artiste
        const processedTracks = new Set();
        
        // Pré-chargement des titres existants pour cet artiste (pour éviter les doublons inter-albums)
        console.log("🔍 Vérification des chansons existantes...");
        const existingTracks = await query(
            `SELECT titre FROM chansons c JOIN albums a ON c.album_id = a.id WHERE a.artist = ?`, 
            [artist.name]
        );
        existingTracks.forEach(t => processedTracks.add(normalizeTitle(t.titre)));
        console.log(`   -> ${processedTracks.size} chansons déjà connues pour cet artiste.`);


        for (const albSimple of albumsSimple) {
            
            // --- FILTRE ALBUM ---
            
            // Récupérer les détails
            let fullAlbum;
            try {
                const detailsRes = await axios.get(`https://api.deezer.com/album/${albSimple.id}`);
                fullAlbum = detailsRes.data;
            } catch (e) { continue; }

            const tracks = fullAlbum.tracks.data;

            // Règle 1 : Moins de 5 chansons
            if (!tracks || tracks.length < 5) {
                console.log(`🗑️  Ignoré (Trop court) : ${fullAlbum.title}`);
                continue;
            }

            // Règle 2 : Doublon d'album
            const normAlbumTitle = normalizeTitle(fullAlbum.title);
            if (processedAlbums.has(normAlbumTitle)) {
                console.log(`♻️  Ignoré (Album doublon) : ${fullAlbum.title}`);
                continue;
            }
            processedAlbums.add(normAlbumTitle);


            // --- IMPORTATION ALBUM ---

            let genre = "Unknown";
            if (fullAlbum.genres && fullAlbum.genres.data.length > 0) genre = fullAlbum.genres.data[0].name;

            console.log(`💿 Traitement : [${genre}] ${fullAlbum.title}`);

            let albumId;
            const existingRows = await query('SELECT id FROM albums WHERE title = ? AND artist = ?', [fullAlbum.title, artist.name]);
            
            if (existingRows.length > 0) {
                albumId = existingRows[0].id;
            } else {
                const result = await query(
                    'INSERT INTO albums (title, artist, release_year, cover_url, genre) VALUES (?, ?, ?, ?, ?)',
                    [fullAlbum.title, artist.name, new Date(fullAlbum.release_date).getFullYear(), fullAlbum.cover_xl, genre]
                );
                albumId = result.insertId;
            }


            // --- IMPORTATION CHANSONS (STRICT) ---
            
            let addedCount = 0;
            let skippedCount = 0;

            for (const track of tracks) {
                const normTrackTitle = normalizeTitle(track.title);

                // Règle 3 : Doublon de chanson INTER-ALBUM
                // Si on a déjà vu ce titre pour cet artiste (même sur un autre album), on saute !
                if (processedTracks.has(normTrackTitle)) {
                    skippedCount++;
                    continue; 
                }

                const durationStr = `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`;

                // Insertion
                await query(`
                    INSERT INTO chansons (titre, album_id, duree, deezer_id, deezer_preview_url)
                    VALUES (?, ?, ?, ?, ?)
                `, [track.title, albumId, durationStr, track.id, track.preview]);

                // On l'ajoute à la liste des connus
                processedTracks.add(normTrackTitle);
                addedCount++;
            }
            
            console.log(`   -> ✅ +${addedCount} pistes | ♻️  ${skippedCount} doublons ignorés.`);
            
            // Si on a ajouté 0 pistes parce qu'elles existent toutes ailleurs (Best Of),
            // on pourrait même supprimer l'album vide ici, mais gardons-le pour l'instant.
            
            await wait(500); 
        }

        console.log("\n🎉 Terminé !");
        process.exit(0);

    } catch (error) {
        console.error("Erreur:", error);
        process.exit(1);
    }
}

rl.question('Artiste à importer (version STRICTE) ? ', (answer) => {
    importArtistClean(answer);
    rl.close();
});
