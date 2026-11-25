-- Demo accounts & statuses:
--   admin@archive.com     / Admin@123    | admin   | Active   | -
--   member@archive.com    / Member@123   | member  | Active   | -
--   raka@archive.com      / Member@123   | member  | Active   | -
--   nadia@archive.com     / Member@123   | member  | Active   | -
--   dimas@archive.com     / Member@123   | member  | Active   | -
--   sofia@archive.com     / Member@123   | member  | Inactive | -
--   kevin@archive.com     / Member@123   | member  | Active   | -
--   kurator@archive.com   / Curator@123  | curator | Active   | Approved
--   adrian@archive.com    / Curator@123  | curator | Active   | Approved
--   clara@archive.com     / Curator@123  | curator | Active   | Rejected
--   pending@archive.com   / Curator@123  | curator | Active   | Pending

INSERT INTO users (
    name,
    email,
    password,
    role,
    curator_status,
    is_active,
    profile_image,
    bio,
    external_link
)
VALUES
(
    'Admin ARCHIVE',
    'admin@archive.com',
    '$2b$12$aa6ltDalcwmxcoD.ZTYxiewEBRnq6DxCsE/NVJIUrhjc3Pfr8oaOi',
    'admin',
    NULL,
    TRUE,
    NULL,
    'Administrator of ARCHIVE creative architecture showcase platform.',
    'https://archive.com'
),
(
    'Kurator Arsitektura',
    'kurator@archive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'approved',
    TRUE,
    'https://i.pravatar.cc/300?img=60',
    'Kurator seni digital dengan pengalaman di bidang arsitektur kontemporer dan seni parametrik.',
    'https://archive.com/kurator'
),
(
    'Anggota Kreatif',
    'member@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    TRUE,
    NULL,
    'Seniman digital dan desainer grafis yang berfokus pada karya geometrik dan arsitektural.',
    'https://behance.net/'
),
(
    'Raka Pratama',
    'raka@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    TRUE,
    'https://i.pravatar.cc/300?img=12',
    'Architectural visualization artist interested in modern and minimalist architecture.',
    'https://behance.net/'
),
(
    'Nadia Putri',
    'nadia@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    TRUE,
    'https://i.pravatar.cc/300?img=47',
    'Digital artist exploring spatial compositions and contemporary architectural design.',
    'https://behance.net/'
),
(
    'Dimas Arya',
    'dimas@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    TRUE,
    'https://i.pravatar.cc/300?img=13',
    'Brutalist architecture enthusiast focusing on concrete textures and structural forms.',
    'https://behance.net/'
),
(
    'Sofia Anindya',
    'sofia@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    FALSE,
    'https://i.pravatar.cc/300?img=44',
    'Visual designer passionate about organic architecture and sustainable spaces.',
    'https://behance.net/'
),
(
    'Kevin Wijaya',
    'kevin@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    TRUE,
    'https://i.pravatar.cc/300?img=68',
    'Architectural photographer and digital creator interested in futuristic structures.',
    'https://behance.net/'
),
(
    'Adrian Mahendra',
    'adrian@archive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'approved',
    TRUE,
    'https://i.pravatar.cc/300?img=11',
    'Independent architecture curator specializing in contemporary visual arts.',
    'https://behance.net/'
),
(
    'Clara Wijaya',
    'clara@archive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'rejected',
    TRUE,
    'https://i.pravatar.cc/300?img=49',
    'Digital art curator interested in architectural experimentation and spatial design.',
    'https://behance.net/'
),
(
    'Bima Prakoso',
    'pending@archive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'pending',
    TRUE,
    'https://i.pravatar.cc/300?img=52',
    'Architectural historian and exhibition organizer applying to curate spatial design challenges.',
    'https://behance.net/'
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    curator_status = EXCLUDED.curator_status,
    is_active = EXCLUDED.is_active,
    profile_image = EXCLUDED.profile_image,
    bio = EXCLUDED.bio,
    external_link = EXCLUDED.external_link;


-- ================================================================
-- 1B. CURATOR APPLICATION HISTORY (Idempotent initial attempt records)
-- ================================================================

INSERT INTO curator_applications (
    user_id,
    attempt_number,
    portfolio_url,
    background,
    supporting_notes,
    status,
    rejection_reason,
    submitted_at,
    reviewed_at,
    reviewed_by
)
SELECT
    u.id,
    1,
    u.external_link,
    u.bio,
    v.supporting_notes,
    v.status,
    v.rejection_reason,
    NOW() - v.submitted_ago,
    CASE WHEN v.reviewed_ago IS NOT NULL THEN NOW() - v.reviewed_ago ELSE NULL END,
    CASE WHEN v.reviewed_ago IS NOT NULL THEN adm.id ELSE NULL END
FROM (
    VALUES
    (
        'kurator@archive.com',
        'approved',
        NULL,
        'Kurator pameran arsitektur kontemporer dan kompetisi desain spasial tingkat nasional.',
        INTERVAL '30 days',
        INTERVAL '28 days'
    ),
    (
        'adrian@archive.com',
        'approved',
        NULL,
        'Peneliti arsitektur modern dan kurator independen untuk ruang publik serta instalasi visual.',
        INTERVAL '21 days',
        INTERVAL '19 days'
    ),
    (
        'clara@archive.com',
        'rejected',
        'Portofolio belum menunjukkan pengalaman kuratorial yang relevan dengan bidang arsitektur serta informasi profil dan pengalaman masih kurang lengkap.',
        'Tertarik mengkurasi kompetisi eksperimen visual dan instalasi arsitektur digital.',
        INTERVAL '10 days',
        INTERVAL '8 days'
    ),
    (
        'pending@archive.com',
        'pending',
        NULL,
        'Sejarawan arsitektur dengan pengalaman pengorganisasian pameran desain spasial dan publikasi katalog.',
        INTERVAL '2 days',
        NULL
    )
) AS v(email, status, rejection_reason, supporting_notes, submitted_ago, reviewed_ago)
JOIN users u ON u.email = v.email AND u.role = 'curator'
LEFT JOIN users adm ON adm.email = 'admin@archive.com'
ON CONFLICT (user_id, attempt_number) DO UPDATE SET
    portfolio_url = EXCLUDED.portfolio_url,
    background = EXCLUDED.background,
    supporting_notes = EXCLUDED.supporting_notes,
    status = EXCLUDED.status,
    rejection_reason = EXCLUDED.rejection_reason,
    reviewed_at = EXCLUDED.reviewed_at,
    reviewed_by = EXCLUDED.reviewed_by;

-- Ensure inactive demo accounts have no lingering active sessions
DELETE FROM sessions
WHERE user_id IN (SELECT id FROM users WHERE is_active = FALSE);

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
    tags,
    status
)
SELECT
    u.id,
    c.id,
    v.title,
    v.description,
    v.image_url,
    v.tags,
    v.status
FROM (
    VALUES
    -- Original 14 Artworks (preserved verbatim)
    (
        'member@archive.com',
        'Sydney Opera House',
        'Modern Architecture',
        'Pusat seni pertunjukan ikonik di Sydney, Australia, dirancang oleh Jørn Utzon. Bangunan ini dikenal melalui struktur atap berbentuk cangkang menyerupai layar kapal yang menjadi simbol arsitektur modern ekspresionis.',
        'https://images.pexels.com/photos/26840173/pexels-photo-26840173.jpeg',
        'modern,expressionist,shell structure,performing arts,Australia',
        'active'
    ),
    (
        'raka@archive.com',
        'Villa Savoye',
        'Modern Architecture',
        'Vila modern yang dirancang oleh Le Corbusier dan Pierre Jeanneret di Poissy, Prancis. Bangunan ini merepresentasikan Five Points of Architecture melalui pilotis, taman atap, denah bebas, fasad bebas, dan jendela horizontal.',
        'https://images.pexels.com/photos/27085003/pexels-photo-27085003.jpeg',
        'modernism,international style,residential,Le Corbusier,France',
        'active'
    ),
    (
        'nadia@archive.com',
        'Guggenheim Museum Bilbao',
        'Deconstructivist Architecture',
        'Museum seni kontemporer di Bilbao, Spanyol, karya Frank Gehry. Bangunan ini memperlihatkan bentuk geometris dinamis, permukaan lengkung, dan penggunaan titanium, kaca, serta batu kapur.',
        'https://images.pexels.com/photos/37894897/pexels-photo-37894897.jpeg',
        'deconstructivism,museum,titanium,curved facade,Spain',
        'active'
    ),
    (
        'sofia@archive.com',
        'Fallingwater',
        'Organic Architecture',
        'Rumah tinggal karya Frank Lloyd Wright di Pennsylvania, Amerika Serikat. Bangunan dibangun di atas aliran air terjun dengan teras beton bertingkat yang menyatu dengan lingkungan alam sekitarnya.',
        'https://images.pexels.com/photos/33951577/pexels-photo-33951577.jpeg',
        'organic,residential,nature,cantilever,Frank Lloyd Wright',
        'active'
    ),
    (
        'dimas@archive.com',
        'Barbican Estate',
        'Brutalist Architecture',
        'Kompleks hunian dan kebudayaan di London yang menjadi salah satu contoh penting arsitektur brutalist. Karakter bangunannya ditandai dengan beton ekspos, komposisi geometris masif, serta hubungan antara ruang publik dan hunian.',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85',
        'brutalism,concrete,geometric,urban,housing,London',
        'active'
    ),
    (
        'kevin@archive.com',
        'Habitat 67',
        'Brutalist Architecture',
        'Kompleks hunian eksperimental di Montreal, Kanada, dirancang oleh Moshe Safdie. Bangunan ini menggunakan modul beton prefabrikasi yang disusun menjadi komposisi bertingkat dengan teras privat.',
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85',
        'brutalism,prefabrication,modular,concrete,residential,Canada',
        'active'
    ),
    (
        'raka@archive.com',
        'The Shard',
        'Contemporary Architecture',
        'Gedung pencakar langit di London karya Renzo Piano. Bentuknya menyerupai pecahan kaca vertikal dengan fasad transparan yang memberikan identitas visual berbeda pada kawasan perkotaan.',
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85',
        'contemporary,skyscraper,glass facade,urban,Renzo Piano',
        'active'
    ),
    (
        'nadia@archive.com',
        'Marina Bay Sands',
        'Contemporary Architecture',
        'Kompleks terpadu di Singapura yang dirancang oleh Moshe Safdie. Bangunan ini dikenal dengan tiga menara yang dihubungkan oleh SkyPark di bagian atas, menciptakan siluet arsitektur yang ikonik.',
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=85',
        'contemporary,integrated-resort,skypark,urban,Singapore',
        'active'
    ),
    (
        'sofia@archive.com',
        'Bosco Verticale',
        'Sustainable Architecture',
        'Kompleks hunian vertikal di Milan, Italia, karya Stefano Boeri. Fasad bangunan dilengkapi vegetasi dan pepohonan untuk mendukung biodiversitas serta menciptakan hubungan antara lingkungan perkotaan dan alam.',
        'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=85',
        'sustainable,green architecture,vertical forest,urban ecology,Milan',
        'active'
    ),
    (
        'member@archive.com',
        'Menara Phinisi UNM',
        'Contemporary Architecture',
        'Gedung Pusat Pelayanan Akademik Universitas Negeri Makassar yang dirancang oleh Yu Sing. Desainnya terinspirasi dari kapal Phinisi sebagai identitas budaya Sulawesi Selatan dengan pendekatan arsitektur kontemporer dan bentuk fasad yang dinamis.',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85',
        'contemporary,Phinisi,local identity,facade,Makassar,Indonesia',
        'active'
    ),
    (
        'raka@archive.com',
        'Masjid 99 Kubah',
        'Modern Islamic Architecture',
        'Masjid ikonik di kawasan Center Point of Indonesia, Makassar, dengan komposisi kubah berwarna yang terinspirasi dari Asmaul Husna. Desainnya memadukan pendekatan kontemporer dengan identitas arsitektur Islam.',
        'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1400&q=85',
        'modern islamic,mosque,contemporary,geometric,Makassar',
        'active'
    ),
    (
        'nadia@archive.com',
        'Fort Rotterdam',
        'Colonial Architecture',
        'Benteng bersejarah di Makassar yang berasal dari Kerajaan Gowa dan kemudian dikuasai VOC. Kompleks ini memperlihatkan karakter arsitektur pertahanan kolonial dengan tata ruang dan elemen bangunan bersejarah.',
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85',
        'colonial,fortress,heritage,historical,Makassar',
        'active'
    ),
    (
        'sofia@archive.com',
        'Monumen Mandala',
        'Monumental Architecture',
        'Monumen bersejarah di Makassar yang dibangun untuk mengenang perjuangan pembebasan Irian Barat. Bentuk menara dan elemen geometrisnya menjadi bagian dari identitas kawasan perkotaan.',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85',
        'monument,geometric,historical,landmark,Makassar',
        'active'
    ),
    (
        'kevin@archive.com',
        'Masjid Al-Markaz Al-Islami',
        'Modern Islamic Architecture',
        'Kompleks masjid besar di Makassar dengan pendekatan arsitektur Islam modern. Bangunan ini memiliki ruang ibadah luas, bentuk geometris, dan elemen desain yang menggabungkan identitas keislaman dengan arsitektur modern.',
        'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1400&q=85',
        'modern,islamic,mosque,religious,Makassar',
        'active'
    ),

    -- Expanded Architectural Demo Artworks (including a moderated taken_down example)
    (
        'dimas@archive.com',
        'Heydar Aliyev Center',
        'Parametric Architecture',
        'Pusat kebudayaan di Baku karya Zaha Hadid Architects yang menonjolkan geometri fluida tanpa sudut tajam, menyatukan alun-alun publik dan selubung bangunan dalam satu tarikan garis berkelanjutan.',
        'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1400&q=85',
        'parametric,fluid form,cultural center,Zaha Hadid,Baku',
        'active'
    ),
    (
        'kevin@archive.com',
        'Church of the Light',
        'Minimalist Architecture',
        'Kapel beton ekspos di Ibaraki, Jepang, rancangan Tadao Ando. Ruang minimalis ini memanfaatkan bukaan salib presisi pada dinding beton untuk menghadirkan kontras cahaya alami dan keheningan ruang.',
        'https://images.unsplash.com/photo-1470723710355-95304d8aece4?auto=format&fit=crop&w=1400&q=85',
        'minimalist,concrete,light and shadow,Tadao Ando,Japan',
        'active'
    ),
    (
        'member@archive.com',
        'Westminster Vault Study',
        'Gothic Revival Architecture',
        'Studi visual lengkung runcing, penopang terbang, dan ritme vertikal batu pahat pada arsitektur Gothic Revival yang dikaji ulang melalui perspektif monokrom editorial.',
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=85',
        'gothic revival,vaulting,stonework,heritage,verticality',
        'active'
    ),
    (
        'dimas@archive.com',
        'Unattributed Concrete Elevation Draft',
        'Brutalist Architecture',
        'Draf studi elevasi fasad beton ekspos yang diturunkan setelah proses moderasi karena kurangnya atribusi sumber referensi asli.',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85',
        'brutalism,draft,elevation,moderation-demo',
        'taken_down'
    )
) AS v(
    owner_email,
    title,
    category,
    description,
    image_url,
    tags,
    status
)
JOIN users u ON u.email = v.owner_email
JOIN categories c ON c.name = v.category
WHERE NOT EXISTS (
    SELECT 1
    FROM artworks existing
    WHERE existing.user_id = u.id
      AND existing.title = v.title
);

-- Reassign previously seeded 'SPACES OF TOMORROW' to an approved curator if Clara is rejected
UPDATE challenges
SET curator_id = (SELECT id FROM users WHERE email = 'adrian@archive.com')
WHERE title = 'SPACES OF TOMORROW'
  AND curator_id = (SELECT id FROM users WHERE email = 'clara@archive.com');

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
    -- Active Challenges (NOW() BETWEEN start_date AND end_date)
    (
        'kurator@archive.com',
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
        'adrian@archive.com',
        'BRUTALIST EXPRESSIONS',
        'Eksplorasi karakter brutalist architecture melalui komposisi geometris, tekstur beton, bentuk masif, dan ekspresi struktural.',
        '1. Karya harus orisinal milik peserta.' || chr(10) ||
        '2. Satu submisi per peserta.' || chr(10) ||
        '3. Karya harus mengangkat karakter arsitektur brutalist.',
        'Rp 3.000.000',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85',
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '35 days'
    ),

    -- Upcoming Challenges (NOW() < start_date)
    (
        'kurator@archive.com',
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
        'adrian@archive.com',
        'SPACES OF TOMORROW',
        'Tantangan desain untuk menciptakan representasi ruang masa depan yang menggabungkan inovasi, keberlanjutan, dan estetika arsitektur.',
        '1. Karya harus orisinal milik peserta.' || chr(10) ||
        '2. Satu submisi per peserta.' || chr(10) ||
        '3. Konsep harus mempertimbangkan aspek keberlanjutan.',
        'Rp 4.000.000',
        'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85',
        NOW() + INTERVAL '10 days',
        NOW() + INTERVAL '50 days'
    ),

    -- Completed / Ended Challenges (NOW() > end_date)
    (
        'kurator@archive.com',
        'TROPICAL MODERNISM ARCHIVE',
        'Program kuratorial yang mendokumentasikan interpretasi modernisme tropis di Asia Tenggara melalui komposisi cahaya, ventilasi pasif, dan material lokal.',
        '1. Karya harus berfokus pada arsitektur tropis atau kontemporer Nusantara.' || chr(10) ||
        '2. Satu submisi per peserta.' || chr(10) ||
        '3. Sertakan deskripsi singkat konteks ruang.',
        'Rp 4.500.000 + Publikasi Katalog',
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=85',
        NOW() - INTERVAL '45 days',
        NOW() - INTERVAL '10 days'
    ),
    (
        'adrian@archive.com',
        'MONOLITH & MATERIALITY',
        'Eksplorasi kejujuran material beton, batu, dan kaca dalam arsitektur modern dan minimalis sebagai medium ekspresi ruang yang tenang.',
        '1. Karya harus orisinal milik peserta.' || chr(10) ||
        '2. Satu submisi per peserta.' || chr(10) ||
        '3. Tonjolkan karakter material dan proporsi struktural.',
        'Rp 3.500.000',
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=85',
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '20 days'
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
JOIN users u ON u.email = v.curator_email AND u.role = 'curator' AND u.curator_status = 'approved'
WHERE NOT EXISTS (
    SELECT 1
    FROM challenges existing
    WHERE LOWER(BTRIM(existing.title)) = LOWER(BTRIM(v.title))
);

INSERT INTO submissions (
    challenge_id,
    artwork_id,
    member_id,
    winner_rank,
    winner_note
)
SELECT
    ch.id,
    a.id,
    u.id,
    v.winner_rank,
    v.winner_note
FROM (
    VALUES
    -- Active Challenge: ARCHITECTURAL SPECULATIONS (awaiting curator review)
    ('ARCHITECTURAL SPECULATIONS', 'member@archive.com', 'Menara Phinisi UNM', NULL::INT, NULL::TEXT),
    ('ARCHITECTURAL SPECULATIONS', 'raka@archive.com',   'The Shard',          NULL::INT, NULL::TEXT),
    ('ARCHITECTURAL SPECULATIONS', 'nadia@archive.com',  'Marina Bay Sands',   NULL::INT, NULL::TEXT),

    -- Active Challenge: BRUTALIST EXPRESSIONS (awaiting curator review)
    ('BRUTALIST EXPRESSIONS', 'dimas@archive.com', 'Barbican Estate', NULL::INT, NULL::TEXT),
    ('BRUTALIST EXPRESSIONS', 'kevin@archive.com', 'Habitat 67',      NULL::INT, NULL::TEXT),

    -- Completed Challenge: TROPICAL MODERNISM ARCHIVE (judged with winners + 1 non-winner)
    (
        'TROPICAL MODERNISM ARCHIVE',
        'raka@archive.com',
        'Masjid 99 Kubah',
        1,
        'Komposisi ritmis 99 kubah dan respons pencahayaan tropis menampilkan interpretasi monumental yang kontekstual terhadap iklim pesisir.'
    ),
    (
        'TROPICAL MODERNISM ARCHIVE',
        'nadia@archive.com',
        'Fort Rotterdam',
        2,
        'Dokumentasi proporsi batu karang dan pelestarian ruang halaman tropis memperlihatkan kontinuitas arsitektur historis secara jernih.'
    ),
    (
        'TROPICAL MODERNISM ARCHIVE',
        'kevin@archive.com',
        'Masjid Al-Markaz Al-Islami',
        3,
        'Harmoni atap berundak dan ventilasi silang alami menghadirkan keterbukaan ruang publik yang tenang dan berkarakter.'
    ),
    ('TROPICAL MODERNISM ARCHIVE', 'member@archive.com', 'Sydney Opera House', NULL::INT, NULL::TEXT),

    -- Completed Challenge: MONOLITH & MATERIALITY (judged winners)
    (
        'MONOLITH & MATERIALITY',
        'kevin@archive.com',
        'Church of the Light',
        1,
        'Kejujuran beton ekspos dan presisi bukaan cahaya salib menghasilkan pengalaman ruang kontemplatif yang sangat kuat.'
    ),
    (
        'MONOLITH & MATERIALITY',
        'raka@archive.com',
        'Villa Savoye',
        2,
        'Kejernihan grid struktur, bidang putih minimalis, dan transisi interior-eksterior menjadi studi modernisme yang presisi.'
    ),
    (
        'MONOLITH & MATERIALITY',
        'dimas@archive.com',
        'Heydar Aliyev Center',
        3,
        'Eksplorasi kontinuitas permukaan monolitik tanpa sudut tajam menampilkan penguasaan bentuk dan material yang halus.'
    )
) AS v(
    challenge_title,
    member_email,
    artwork_title,
    winner_rank,
    winner_note
)
JOIN challenges ch ON ch.title = v.challenge_title
JOIN users u ON u.email = v.member_email AND u.role = 'member'
JOIN artworks a ON a.user_id = u.id AND a.title = v.artwork_title AND a.status = 'active'
WHERE NOT EXISTS (
    SELECT 1
    FROM submissions existing
    WHERE existing.challenge_id = ch.id
      AND (
          existing.member_id = u.id
          OR existing.artwork_id = a.id
          OR (v.winner_rank IS NOT NULL AND existing.winner_rank = v.winner_rank)
      )
)
ON CONFLICT DO NOTHING;

-- Backfill winner notes idempotently on existing seeded winners when empty
UPDATE submissions s
SET winner_note = v.winner_note
FROM (
    VALUES
    ('TROPICAL MODERNISM ARCHIVE', 'Masjid 99 Kubah',           'Komposisi ritmis 99 kubah dan respons pencahayaan tropis menampilkan interpretasi monumental yang kontekstual terhadap iklim pesisir.'),
    ('TROPICAL MODERNISM ARCHIVE', 'Fort Rotterdam',            'Dokumentasi proporsi batu karang dan pelestarian ruang halaman tropis memperlihatkan kontinuitas arsitektur historis secara jernih.'),
    ('TROPICAL MODERNISM ARCHIVE', 'Masjid Al-Markaz Al-Islami', 'Harmoni atap berundak dan ventilasi silang alami menghadirkan keterbukaan ruang publik yang tenang dan berkarakter.'),
    ('MONOLITH & MATERIALITY',     'Church of the Light',       'Kejujuran beton ekspos dan presisi bukaan cahaya salib menghasilkan pengalaman ruang kontemplatif yang sangat kuat.'),
    ('MONOLITH & MATERIALITY',     'Villa Savoye',              'Kejernihan grid struktur, bidang putih minimalis, dan transisi interior-eksterior menjadi studi modernisme yang presisi.'),
    ('MONOLITH & MATERIALITY',     'Heydar Aliyev Center',      'Eksplorasi kontinuitas permukaan monolitik tanpa sudut tajam menampilkan penguasaan bentuk dan material yang halus.')
) AS v(challenge_title, artwork_title, winner_note)
JOIN challenges ch ON ch.title = v.challenge_title
JOIN artworks a ON a.title = v.artwork_title
WHERE s.challenge_id = ch.id
  AND s.artwork_id = a.id
  AND s.winner_rank IS NOT NULL
  AND (s.winner_note IS NULL OR BTRIM(s.winner_note) = '');

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
      AND u.is_active = TRUE
      AND u.id <> a.user_id
    ORDER BY MD5(u.email || ':' || a.id::text)
    LIMIT (
        2 + MOD(ABS(HASHTEXT(a.id::text)::BIGINT), 3)
    )
) AS likers
WHERE a.status = 'active'
ON CONFLICT (user_id, artwork_id) DO NOTHING;

-- Synchronize cached like_count column with actual artwork_likes rows
UPDATE artworks a
SET like_count = COALESCE((
    SELECT COUNT(*)::int
    FROM artwork_likes al
    WHERE al.artwork_id = a.id
), 0);

INSERT INTO favorites (
    user_id,
    artwork_id
)
SELECT
    u.id,
    a.id
FROM (
    VALUES
    ('member@archive.com', 'Fallingwater'),
    ('member@archive.com', 'Villa Savoye'),
    ('member@archive.com', 'Church of the Light'),
    ('raka@archive.com',   'Bosco Verticale'),
    ('raka@archive.com',   'Sydney Opera House'),
    ('nadia@archive.com',  'Heydar Aliyev Center'),
    ('dimas@archive.com',  'Habitat 67'),
    ('kevin@archive.com',  'Guggenheim Museum Bilbao')
) AS v(member_email, artwork_title)
JOIN users u ON u.email = v.member_email AND u.role = 'member' AND u.is_active = TRUE
JOIN artworks a ON a.title = v.artwork_title AND a.status = 'active'
ON CONFLICT (user_id, artwork_id) DO NOTHING;

INSERT INTO comments (
    user_id,
    artwork_id,
    content
)
SELECT
    u.id,
    a.id,
    v.content
FROM (
    VALUES
    ('raka@archive.com',   'Sydney Opera House',        'Komposisi cangkang atap dan pencahayaan tepi airnya terasa sangat dramatis sekaligus presisi.'),
    ('nadia@archive.com',  'Villa Savoye',              'Proporsi pilotis dan jendela pita horizontalnya memperlihatkan kejernihan modernisme awal.'),
    ('member@archive.com', 'Fallingwater',              'Integrasi teras kantilever dengan aliran air terjun tetap menjadi referensi utama arsitektur organik.'),
    ('kevin@archive.com',  'Bosco Verticale',           'Keseimbangan vegetasi vertikal dan struktur hunian modernnya sangat inspiratif untuk kota padat.'),
    ('dimas@archive.com',  'Menara Phinisi UNM',        'Interpretasi bentuk layar Phinisi pada fasad kampus ini kuat secara identitas lokal maupun kontemporer.'),
    ('member@archive.com', 'Heydar Aliyev Center',      'Alur kurva selubung bangunannya menghadirkan transisi yang mulus antara ruang luar dan interior.'),
    ('raka@archive.com',   'Church of the Light',       'Permainan cahaya alami pada bidang beton ekspos menciptakan atmosfer ruang yang tenang dan fokus.')
) AS v(member_email, artwork_title, content)
JOIN users u ON u.email = v.member_email AND u.role = 'member' AND u.is_active = TRUE
JOIN artworks a ON a.title = v.artwork_title AND a.status = 'active'
WHERE NOT EXISTS (
    SELECT 1
    FROM comments existing
    WHERE existing.user_id = u.id
      AND existing.artwork_id = a.id
      AND existing.content = v.content
);

INSERT INTO reports (
    user_id,
    artwork_id,
    reason,
    details,
    status,
    admin_note
)
SELECT
    u.id,
    a.id,
    v.reason,
    v.details,
    v.status,
    v.admin_note
FROM (
    VALUES
    (
        'kevin@archive.com',
        'The Shard',
        'Plagiarism',
        'Komposisi framing menyerupai render publikasi komersial tanpa kredit fotografer asli; mohon verifikasi.',
        'pending',
        NULL
    ),
    (
        'dimas@archive.com',
        'Marina Bay Sands',
        'Other',
        'Metadata tag dan kategori perlu ditinjau ulang agar konsisten dengan arsip pameran.',
        'pending',
        NULL
    ),
    (
        'raka@archive.com',
        'Heydar Aliyev Center',
        'Inappropriate Content',
        'Dilaporkan untuk pemeriksaan kesesuaian atribusi referensi studi arsitektur.',
        'dismissed',
        'Ditinjau oleh Admin ARCHIVE: atribusi dan deskripsi studi arsitektur sesuai pedoman platform.'
    ),
    (
        'nadia@archive.com',
        'Unattributed Concrete Elevation Draft',
        'Plagiarism',
        'Draf elevasi menggunakan gambar pihak ketiga tanpa izin maupun keterangan sumber.',
        'taken_down',
        'Karya diturunkan oleh Admin ARCHIVE karena pelanggaran atribusi hak cipta terverifikasi.'
    )
) AS v(
    reporter_email,
    artwork_title,
    reason,
    details,
    status,
    admin_note
)
JOIN users u ON u.email = v.reporter_email AND u.role = 'member' AND u.is_active = TRUE
JOIN artworks a ON a.title = v.artwork_title
ON CONFLICT (user_id, artwork_id) DO NOTHING;

-- Users by role
SELECT
    role,
    COUNT(*) AS total_users
FROM users
GROUP BY role
ORDER BY role;

-- Users by account status
SELECT
    CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END AS account_status,
    COUNT(*) AS total_users
FROM users
GROUP BY is_active
ORDER BY is_active DESC;

-- Curators by curator_status
SELECT
    curator_status,
    COUNT(*) AS total_curators
FROM users
WHERE role = 'curator'
GROUP BY curator_status
ORDER BY curator_status;

-- Artworks by owner (with account status) & artwork status
SELECT
    u.name AS owner_name,
    u.email AS owner_email,
    CASE WHEN u.is_active THEN 'Active' ELSE 'Inactive' END AS owner_status,
    a.status AS artwork_status,
    COUNT(a.id) AS total_artworks
FROM artworks a
JOIN users u ON u.id = a.user_id
GROUP BY u.name, u.email, u.is_active, a.status
ORDER BY u.name, a.status;

-- Artworks by category
SELECT
    c.name AS category,
    COUNT(a.id) AS total_artworks
FROM categories c
LEFT JOIN artworks a ON a.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Challenges by computed status
SELECT
    CASE
        WHEN NOW() < start_date THEN 'upcoming'
        WHEN NOW() BETWEEN start_date AND end_date THEN 'active'
        ELSE 'ended'
    END AS challenge_status,
    COUNT(*) AS total_challenges
FROM challenges
GROUP BY 1
ORDER BY 1;

-- Submissions summary by challenge
SELECT
    ch.title AS challenge_title,
    COUNT(s.id) AS total_submissions,
    COUNT(s.winner_rank) AS ranked_winners,
    COUNT(s.id) - COUNT(s.winner_rank) AS pending_review
FROM challenges ch
LEFT JOIN submissions s ON s.challenge_id = ch.id
GROUP BY ch.id, ch.title
ORDER BY ch.title;

-- Reports by moderation status
SELECT
    status AS report_status,
    COUNT(*) AS total_reports
FROM reports
GROUP BY status
ORDER BY status;

-- Overall summary counts
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM categories) AS total_categories,
    (SELECT COUNT(*) FROM artworks) AS total_artworks,
    (SELECT COUNT(*) FROM artworks WHERE status = 'active') AS active_artworks,
    (SELECT COUNT(*) FROM artworks WHERE status = 'taken_down') AS taken_down_artworks,
    (SELECT COUNT(*) FROM artwork_likes) AS total_likes,
    (SELECT COUNT(*) FROM favorites) AS total_favorites,
    (SELECT COUNT(*) FROM comments) AS total_comments,
    (SELECT COUNT(*) FROM reports) AS total_reports,
    (SELECT COUNT(*) FROM challenges) AS total_challenges,
    (SELECT COUNT(*) FROM submissions) AS total_submissions,
    (SELECT COUNT(*) FROM curator_applications) AS total_curator_applications;
