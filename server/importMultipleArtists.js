const db = require('./config/db');
const axios = require('axios');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const normalizeTitle = (title) => {
    return title.toLowerCase()
        .replace(/\(.*\)/g, '')
        .replace(/\[.*\]/g, '')
        .replace(/feat\..*/g, '')
        .trim();
};

async function importArtistClean(artistName) {
    console.log(`\n🛡️  Mode Importation STRICT pour : "${artistName}"...`);

    try {
        const searchRes = await axios.get(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`);
        if (!searchRes.data.data || searchRes.data.data.length === 0) {
            console.log("❌ Artiste introuvable.");
            return;
        }
        const artist = searchRes.data.data[0];
        console.log(`✅ Artiste : ${artist.name}`);

        const albumsListRes = await axios.get(`https://api.deezer.com/artist/${artist.id}/albums?limit=100`);
        const albumsSimple = albumsListRes.data.data;

        const processedAlbums = new Set();
        const processedTracks = new Set();
        
        console.log("🔍 Vérification des chansons existantes...");
        const existingTracks = await query(
            `SELECT titre FROM chansons c JOIN albums a ON c.album_id = a.id WHERE a.artist = ?`, 
            [artist.name]
        );
        existingTracks.forEach(t => processedTracks.add(normalizeTitle(t.titre)));
        console.log(`   -> ${processedTracks.size} chansons déjà connues pour cet artiste.`);

        for (const albSimple of albumsSimple) {
            let fullAlbum;
            try {
                const detailsRes = await axios.get(`https://api.deezer.com/album/${albSimple.id}`);
                fullAlbum = detailsRes.data;
            } catch (e) { continue; }

            const tracks = fullAlbum.tracks.data;

            if (!tracks || tracks.length < 5) {
                console.log(`🗑️  Ignoré (Trop court) : ${fullAlbum.title}`);
                continue;
            }

            const normAlbumTitle = normalizeTitle(fullAlbum.title);
            if (processedAlbums.has(normAlbumTitle)) {
                console.log(`♻️  Ignoré (Album doublon) : ${fullAlbum.title}`);
                continue;
            }
            processedAlbums.add(normAlbumTitle);

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

            let addedCount = 0;
            let skippedCount = 0;

            for (const track of tracks) {
                const normTrackTitle = normalizeTitle(track.title);

                if (processedTracks.has(normTrackTitle)) {
                    skippedCount++;
                    continue; 
                }

                const durationStr = `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`;

                await query(`
                    INSERT INTO chansons (titre, album_id, duree, deezer_id, deezer_preview_url)
                    VALUES (?, ?, ?, ?, ?)
                `, [track.title, albumId, durationStr, track.id, track.preview]);

                processedTracks.add(normTrackTitle);
                addedCount++;
            }
            
            console.log(`   -> ✅ +${addedCount} pistes | ♻️  ${skippedCount} doublons ignorés.`);
            
            await wait(500); 
        }

        console.log(`\n✅ Terminé pour ${artistName}!`);

    } catch (error) {
        console.error(`❌ Erreur pour ${artistName}:`, error.message);
    }
}

async function importMultipleArtists() {
    // 🎯 LISTE DES ARTISTES À IMPORTER
    const artistsList = [
    ];

    console.log(`🚀 Début de l'importation de ${artistsList.length} artistes...\n`);

    for (const artistName of artistsList) {
        await importArtistClean(artistName);
        await wait(1000); // Pause entre chaque artiste pour éviter le rate-limiting
    }

    console.log("\n🎉 Tous les artistes ont été traités !");
    process.exit(0);
}

// Lancement
await importMultipleArtists();