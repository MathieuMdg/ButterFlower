const db = require('./config/db');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

async function cleanDatabase() {
    console.log("\n🧹 Démarrage du nettoyage de la base de données (Version Safe)...\n");

    try {
        // ====================================================
        // ÉTAPE 1 : SUPPRIMER LES DOUBLONS DE CHANSONS
        // ====================================================
        console.log("🔍 Analyse des doublons de chansons...");
        // ATTENTION : Si des chansons ont des notes, il faut d'abord supprimer les notes
        // On supprime d'abord les notes liées aux doublons qu'on va supprimer
        // C'est complexe en une requête, donc on fait simple : on ignore cette étape si elle bloque, 
        // ou on supprime les notes orphelines après.
        
        const deleteDuplicatesSql = `
            DELETE c1 FROM chansons c1
            INNER JOIN chansons c2 
            WHERE 
                c1.id > c2.id AND 
                c1.titre = c2.titre AND 
                c1.album_id = c2.album_id
        `;
        
        try {
            const resDup = await query(deleteDuplicatesSql);
            console.log(`   -> 🗑️  ${resDup.affectedRows} chansons en double supprimées.`);
        } catch (e) {
            console.log("   -> ⚠️  Impossible de supprimer certains doublons (probablement liés à des notes/reviews).");
        }


        // ====================================================
        // ÉTAPE 2 : REPÉRER LES ALBUMS TROP PETITS (< 5 TITRES)
        // ====================================================
        console.log("\n🔍 Analyse des albums trop courts (< 5 titres)...");

        const albumsToDelete = await query(`
            SELECT a.id, a.title, COUNT(c.id) as track_count 
            FROM albums a
            LEFT JOIN chansons c ON a.id = c.album_id
            GROUP BY a.id
            HAVING track_count < 5
        `);

        if (albumsToDelete.length === 0) {
            console.log("   -> ✅ Aucun album trop court détecté.");
        } else {
            console.log(`   -> ⚠️  ${albumsToDelete.length} albums détectés avec moins de 5 titres :`);
            albumsToDelete.forEach(a => console.log(`      - [${a.track_count} titres] ${a.title} (ID: ${a.id})`));

            const answer = await new Promise(resolve => {
                rl.question('\n🔴 ATTENTION : Cela supprimera aussi les REVIEWS associées ! Continuer ? (oui/non) ', resolve);
            });

            if (answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'y') {
                const ids = albumsToDelete.map(a => a.id);
                
                // --- ORDRE DE SUPPRESSION IMPORTANT (Cascade manuelle) ---

                // 1. Supprimer les NOTES des chansons de ces albums (si table 'notes' existe)
                // (Adaptez le nom de la table si ce n'est pas 'notes_chansons' ou similaire)
                // await query(`DELETE FROM notes WHERE chanson_id IN (SELECT id FROM chansons WHERE album_id IN (?))`, [ids]);

                // 2. Supprimer les REVIEWS de ces albums
                const delReviews = await query(`DELETE FROM reviews WHERE album_id IN (?)`, [ids]);
                console.log(`   -> 🗑️  ${delReviews.affectedRows} reviews supprimées.`);

                // 3. Supprimer les CHANSONS de ces albums
                const delSongs = await query(`DELETE FROM chansons WHERE album_id IN (?)`, [ids]);
                console.log(`   -> 🗑️  ${delSongs.affectedRows} chansons supprimées.`);
                
                // 4. Supprimer les ALBUMS
                const delAlbums = await query(`DELETE FROM albums WHERE id IN (?)`, [ids]);
                console.log(`   -> 🗑️  ${delAlbums.affectedRows} albums supprimés.`);
                
            } else {
                console.log("   -> Opération annulée.");
            }
        }

        // ====================================================
        // ÉTAPE 3 : SUPPRIMER LES ALBUMS VIDES (ORPHELINS)
        // ====================================================
        console.log("\n🔍 Nettoyage des albums vides (orphelins)...");
        
        // Même logique : on doit d'abord nettoyer les reviews des albums vides
        const emptyAlbums = await query(`
            SELECT id FROM albums 
            WHERE id NOT IN (SELECT DISTINCT album_id FROM chansons)
        `);

        if (emptyAlbums.length > 0) {
            const emptyIds = emptyAlbums.map(a => a.id);
            await query(`DELETE FROM reviews WHERE album_id IN (?)`, [emptyIds]); // Nettoyage reviews
            const cleanOrphans = await query(`DELETE FROM albums WHERE id IN (?)`, [emptyIds]);
            console.log(`   -> 🗑️  ${cleanOrphans.affectedRows} albums vides supprimés.`);
        } else {
            console.log("   -> ✅ Aucun album vide.");
        }

        console.log("\n✨ Base de données nettoyée !");
        process.exit(0);

    } catch (error) {
        console.error("❌ Erreur SQL Critique :", error);
        process.exit(1);
    }
}

cleanDatabase();
