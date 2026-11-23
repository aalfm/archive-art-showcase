
-- ================================================================
-- ARTHIVE DATABASE SEED v2.0
-- PostgreSQL
--
-- Run AFTER schema.sql
--
-- Demo accounts:
-- admin@arthive.com       / Admin@123
-- kurator@arthive.com     / Curator@123
-- member@arthive.com      / Member@123
--
-- Additional members:
-- raka@arthive.com        / Member@123
-- nadia@arthive.com       / Member@123
-- dimas@arthive.com       / Member@123
-- sofia@arthive.com       / Member@123
-- kevin@arthive.com       / Member@123
--
-- Additional curators:
-- adrian@arthive.com      / Curator@123
-- clara@arthive.com       / Curator@123
--
-- Safe to rerun:
-- 1. Users are updated by email.
-- 2. Categories are inserted only once.
-- 3. Artworks are checked by owner + title.
-- 4. Challenges are checked by title.
-- 5. Likes are protected by unique constraints.
--
-- ================================================================


-- ================================================================
-- 1. USERS
-- ================================================================

INSERT INTO users (
    name,
    email,
    password,
    role,
    curator_status,
    profile_image,
    bio,
    external_link
)
VALUES

(
    'Admin ARTHIVE',
    'admin@arthive.com',
    '$2b$12$aa6ltDalcwmxcoD.ZTYxiewEBRnq6DxCsE/NVJIUrhjc3Pfr8oaOi',
    'admin',
    NULL,
    NULL,
    'Administrator of ARTHIVE creative architecture showcase platform.',
    'https://arthive.com'
),

(
    'Kurator Arsitektura',
    'kurator@arthive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'approved',
    'https://i.pravatar.cc/300?img=60',
    'Kurator seni digital dengan pengalaman di bidang arsitektur kontemporer dan seni parametrik.',
    'https://arthive.com/kurator'
),

(
    'Anggota Kreatif',
    'member@arthive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    NULL,
    'Seniman digital dan desainer grafis yang berfokus pada karya geometrik dan arsitektural.',
    'https://behance.net/'
),

(
    'Raka Pratama',
    'raka@arthive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    'https://i.pravatar.cc/300?img=12',
    'Architectural visualization artist interested in modern and minimalist architecture.',
    'https://behance.net/'
),
(
    'Nadia Putri',
    'nadia@arthive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    'https://i.pravatar.cc/300?img=47',
    'Digital artist exploring spatial compositions and contemporary architectural design.',
    'https://behance.net/'
),
(
    'Dimas Arya',
    'dimas@arthive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    'https://i.pravatar.cc/300?img=13',
    'Brutalist architecture enthusiast focusing on concrete textures and structural forms.',
    'https://behance.net/'
),
(
    'Sofia Anindya',
    'sofia@arthive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    'https://i.pravatar.cc/300?img=44',
    'Visual designer passionate about organic architecture and sustainable spaces.',
    'https://behance.net/'
),
(
    'Kevin Wijaya',
    'kevin@arthive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    'https://i.pravatar.cc/300?img=68',
    'Architectural photographer and digital creator interested in futuristic structures.',
    'https://behance.net/'
),

(
    'Adrian Mahendra',
    'adrian@arthive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'approved',
    'https://i.pravatar.cc/300?img=11',
    'Independent architecture curator specializing in contemporary visual arts.',
    'https://behance.net/'
),
(
    'Clara Wijaya',
    'clara@arthive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'approved',
    'https://i.pravatar.cc/300?img=49',
    'Digital art curator interested in architectural experimentation and spatial design.',
    'https://behance.net/'
)

ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    curator_status = EXCLUDED.curator_status,
    profile_image = EXCLUDED.profile_image,
    bio = EXCLUDED.bio,
    external_link = EXCLUDED.external_link;

INSERT INTO categories (name)
VALUES
    ('Modern Architecture'),
    ('Contemporary Architecture'),
    ('Brutalist Architecture'),
    ('Organic Architecture'),
    ('Sustainable Architecture'),
    ('Deconstructivist Architecture'),
    ('Monumental Architecture'),
    ('Modern Islamic Architecture'),
    ('Colonial Architecture'),
    ('Gothic Revival Architecture'),
    ('Parametric Architecture'),
    ('Minimalist Architecture')
ON CONFLICT (name) DO NOTHING;

INSERT INTO artworks (
    user_id,
    category_id,
    title,
    description,
    image_url,
    tags
)
SELECT
    u.id,
    c.id,
    v.title,
    v.description,
    v.image_url,
    v.tags
FROM (
    VALUES

    (
        'member@arthive.com',
        'Sydney Opera House',
        'Modern Architecture',
        'Pusat seni pertunjukan ikonik di Sydney, Australia, dirancang oleh Jørn Utzon. Bangunan ini dikenal melalui struktur atap berbentuk cangkang menyerupai layar kapal yang menjadi simbol arsitektur modern ekspresionis.',
        'https://images.pexels.com/photos/26840173/pexels-photo-26840173.jpeg',
        'modern,expressionist,shell structure,performing arts,Australia'
    ),
    (
        'raka@arthive.com',
        'Villa Savoye',
        'Modern Architecture',
        'Vila modern yang dirancang oleh Le Corbusier dan Pierre Jeanneret di Poissy, Prancis. Bangunan ini merepresentasikan Five Points of Architecture melalui pilotis, taman atap, denah bebas, fasad bebas, dan jendela horizontal.',
        'https://images.pexels.com/photos/27085003/pexels-photo-27085003.jpeg',
        'modernism,international style,residential,Le Corbusier,France'
    ),

    (
        'nadia@arthive.com',
        'Guggenheim Museum Bilbao',
        'Deconstructivist Architecture',
        'Museum seni kontemporer di Bilbao, Spanyol, karya Frank Gehry. Bangunan ini memperlihatkan bentuk geometris dinamis, permukaan lengkung, dan penggunaan titanium, kaca, serta batu kapur.',
        'https://images.pexels.com/photos/37894897/pexels-photo-37894897.jpeg',
        'deconstructivism,museum,titanium,curved facade,Spain'
    ),

    (
        'sofia@arthive.com',
        'Fallingwater',
        'Organic Architecture',
        'Rumah tinggal karya Frank Lloyd Wright di Pennsylvania, Amerika Serikat. Bangunan dibangun di atas aliran air terjun dengan teras beton bertingkat yang menyatu dengan lingkungan alam sekitarnya.',
        'https://images.pexels.com/photos/33951577/pexels-photo-33951577.jpeg',
        'organic,residential,nature,cantilever,Frank Lloyd Wright'
    ),

    (
        'dimas@arthive.com',
        'Barbican Estate',
        'Brutalist Architecture',
        'Kompleks hunian dan kebudayaan di London yang menjadi salah satu contoh penting arsitektur brutalist. Karakter bangunannya ditandai dengan beton ekspos, komposisi geometris masif, serta hubungan antara ruang publik dan hunian.',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85',
        'brutalism,concrete,geometric,urban,housing,London'
    ),
    (
        'kevin@arthive.com',
        'Habitat 67',
        'Brutalist Architecture',
        'Kompleks hunian eksperimental di Montreal, Kanada, dirancang oleh Moshe Safdie. Bangunan ini menggunakan modul beton prefabrikasi yang disusun menjadi komposisi bertingkat dengan teras privat.',
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85',
        'brutalism,prefabrication,modular,concrete,residential,Canada'
    ),

    (
        'raka@arthive.com',
        'The Shard',
        'Contemporary Architecture',
        'Gedung pencakar langit di London karya Renzo Piano. Bentuknya menyerupai pecahan kaca vertikal dengan fasad transparan yang memberikan identitas visual berbeda pada kawasan perkotaan.',
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85',
        'contemporary,skyscraper,glass facade,urban,Renzo Piano'
    ),
    (
        'nadia@arthive.com',
        'Marina Bay Sands',
        'Contemporary Architecture',
        'Kompleks terpadu di Singapura yang dirancang oleh Moshe Safdie. Bangunan ini dikenal dengan tiga menara yang dihubungkan oleh SkyPark di bagian atas, menciptakan siluet arsitektur yang ikonik.',
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=85',
        'contemporary,integrated-resort,skypark,urban,Singapore'
    ),


    (
        'sofia@arthive.com',
        'Bosco Verticale',
        'Sustainable Architecture',
        'Kompleks hunian vertikal di Milan, Italia, karya Stefano Boeri. Fasad bangunan dilengkapi vegetasi dan pepohonan untuk mendukung biodiversitas serta menciptakan hubungan antara lingkungan perkotaan dan alam.',
        'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=85',
        'sustainable,green architecture,vertical forest,urban ecology,Milan'
    ),


    (
        'member@arthive.com',
        'Menara Phinisi UNM',
        'Contemporary Architecture',
        'Gedung Pusat Pelayanan Akademik Universitas Negeri Makassar yang dirancang oleh Yu Sing. Desainnya terinspirasi dari kapal Phinisi sebagai identitas budaya Sulawesi Selatan dengan pendekatan arsitektur kontemporer dan bentuk fasad yang dinamis.',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85',
        'contemporary,Phinisi,local identity,facade,Makassar,Indonesia'
    ),
    (
        'raka@arthive.com',
        'Masjid 99 Kubah',
        'Modern Islamic Architecture',
        'Masjid ikonik di kawasan Center Point of Indonesia, Makassar, dengan komposisi kubah berwarna yang terinspirasi dari Asmaul Husna. Desainnya memadukan pendekatan kontemporer dengan identitas arsitektur Islam.',
        'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1400&q=85',
        'modern islamic,mosque,contemporary,geometric,Makassar'
    ),
    (
        'nadia@arthive.com',
        'Fort Rotterdam',
        'Colonial Architecture',
        'Benteng bersejarah di Makassar yang berasal dari Kerajaan Gowa dan kemudian dikuasai VOC. Kompleks ini memperlihatkan karakter arsitektur pertahanan kolonial dengan tata ruang dan elemen bangunan bersejarah.',
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85',
        'colonial,fortress,heritage,historical,Makassar'
    ),
    (
        'sofia@arthive.com',
        'Monumen Mandala',
        'Monumental Architecture',
        'Monumen bersejarah di Makassar yang dibangun untuk mengenang perjuangan pembebasan Irian Barat. Bentuk menara dan elemen geometrisnya menjadi bagian dari identitas kawasan perkotaan.',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85',
        'monument,geometric,historical,landmark,Makassar'
    ),
    (
        'kevin@arthive.com',
        'Masjid Al-Markaz Al-Islami',
        'Modern Islamic Architecture',
        'Kompleks masjid besar di Makassar dengan pendekatan arsitektur Islam modern. Bangunan ini memiliki ruang ibadah luas, bentuk geometris, dan elemen desain yang menggabungkan identitas keislaman dengan arsitektur modern.',
        'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1400&q=85',
        'modern,islamic,mosque,religious,Makassar'
    )

) AS v(
    owner_email,
    title,
    category,
    description,
    image_url,
    tags
)
JOIN users u ON u.email = v.owner_email
JOIN categories c ON c.name = v.category
WHERE NOT EXISTS (
    SELECT 1
    FROM artworks existing
    WHERE existing.user_id = u.id
      AND existing.title = v.title
);


INSERT INTO artwork_likes (
    user_id,
    artwork_id
)
SELECT
    likers.id,
    a.id
FROM artworks a
CROSS JOIN LATERAL (
    SELECT u.id
    FROM users u
    WHERE u.role = 'member'
      AND u.id <> a.user_id
    ORDER BY MD5(u.email || ':' || a.id::text)
    LIMIT (
        2 + MOD(ABS(HASHTEXT(a.id::text)::BIGINT), 4)
    )
) AS likers
ON CONFLICT (user_id, artwork_id) DO NOTHING;

INSERT INTO challenges (
    curator_id,
    title,
    description,
    rules,
    prize,
    banner_url,
    start_date,
    end_date
)
SELECT
    u.id,
    v.title,
    v.description,
    v.rules,
    v.prize,
    v.banner_url,
    v.start_date,
    v.end_date
FROM (
    VALUES

    (
        'kurator@arthive.com',
        'ARCHITECTURAL SPECULATIONS',
        'Tantangan untuk membayangkan ulang ruang kota masa depan melalui karya seni digital. Peserta diajak mengeksplorasi hubungan antara arsitektur, teknologi, dan kehidupan urban.',
        '1. Karya harus orisinal milik peserta.' || chr(10) ||
        '2. Satu submisi per peserta.' || chr(10) ||
        '3. Tidak mengandung unsur SARA.' || chr(10) ||
        '4. Karya harus memiliki konsep arsitektural yang jelas.',
        'Rp 5.000.000 + Pameran Online',
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85',
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '30 days'
    ),

    (
        'kurator@arthive.com',
        'LIGHT & SHADOW',
        'Eksplorasi permainan cahaya dan bayangan dalam fotografi maupun ilustrasi digital. Tantangan ini berfokus pada bagaimana cahaya membentuk persepsi terhadap ruang dan struktur.',
        '1. Karya harus orisinal milik peserta.' || chr(10) ||
        '2. Satu submisi per peserta.' || chr(10) ||
        '3. Tema utama adalah cahaya dan bayangan.',
        'Rp 2.500.000',
        'https://images.unsplash.com/photo-1470723710355-95304d8aece4?auto=format&fit=crop&w=1200&q=85',
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '45 days'
    ),

    (
        'adrian@arthive.com',
        'BRUTALIST EXPRESSIONS',
        'Eksplorasi karakter brutalist architecture melalui komposisi geometris, tekstur beton, bentuk masif, dan ekspresi struktural.',
        '1. Karya harus orisinal milik peserta.' || chr(10) ||
        '2. Satu submisi per peserta.' || chr(10) ||
        '3. Karya harus mengangkat karakter arsitektur brutalist.',
        'Rp 3.000.000',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '35 days'
    ),

    (
        'clara@arthive.com',
        'SPACES OF TOMORROW',
        'Tantangan desain untuk menciptakan representasi ruang masa depan yang menggabungkan inovasi, keberlanjutan, dan estetika arsitektur.',
        '1. Karya harus orisinal milik peserta.' || chr(10) ||
        '2. Satu submisi per peserta.' || chr(10) ||
        '3. Konsep harus mempertimbangkan aspek keberlanjutan.',
        'Rp 4.000.000',
        'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85',
        NOW() + INTERVAL '10 days',
        NOW() + INTERVAL '50 days'
    )

) AS v(
    curator_email,
    title,
    description,
    rules,
    prize,
    banner_url,
    start_date,
    end_date
)
JOIN users u ON u.email = v.curator_email
WHERE NOT EXISTS (
    SELECT 1
    FROM challenges existing
    WHERE existing.title = v.title
);

SELECT
    role,
    COUNT(*) AS total_users
FROM users
GROUP BY role
ORDER BY role;

SELECT
    c.name AS category,
    COUNT(a.id) AS total_artworks
FROM categories c
LEFT JOIN artworks a ON a.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

SELECT
    a.id,
    a.title,
    u.name AS artist,
    c.name AS category,
    COUNT(al.id) AS total_likes
FROM artworks a
JOIN users u ON u.id = a.user_id
JOIN categories c ON c.id = a.category_id
LEFT JOIN artwork_likes al ON al.artwork_id = a.id
GROUP BY a.id, a.title, u.name, c.name
ORDER BY total_likes DESC, a.title;

SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM categories) AS total_categories,
    (SELECT COUNT(*) FROM artworks) AS total_artworks,
    (SELECT COUNT(*) FROM artwork_likes) AS total_likes,
    (SELECT COUNT(*) FROM challenges) AS total_challenges;

