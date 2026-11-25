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
    'Daniel Hartono',
    'admin@archive.com',
    '$2b$12$aa6ltDalcwmxcoD.ZTYxiewEBRnq6DxCsE/NVJIUrhjc3Pfr8oaOi',
    'admin',
    NULL,
    TRUE,
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Platform administrator overseeing curatorial governance, community moderation, and editorial standards at ARCHIVE.',
    'https://archive.com'
),
(
    'Henrik Lindstrom',
    'kurator@archive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'approved',
    TRUE,
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Senior architectural curator and educator with 18 years of experience directing international exhibitions in modernism, sustainable timber design, and civic architecture.',
    'https://behance.net/henriklindstrom'
),
(
    'Alya Ramadhani',
    'member@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    TRUE,
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Architectural designer and spatial visualizer based in Jakarta, specializing in tropical courtyards, lush landscape thresholds, and warm minimalist interiors.',
    'https://behance.net/alyaramadhani'
),
(
    'Raka Pratama',
    'raka@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    TRUE,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Modernist architect and architectural visualization specialist exploring clean structural geometry, coastal residences, and iconic civic landmarks.',
    'https://behance.net/rakapratama'
),
(
    'Nadia Putri',
    'nadia@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    TRUE,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Parametric architect and digital spatial designer studying fluid building envelopes, sculptural museums, and daylight-driven interior compositions.',
    'https://behance.net/nadiaputri'
),
(
    'Dimas Arya',
    'dimas@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    TRUE,
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Structural designer and residential architect focused on timber-and-glass tectonics, Nordic minimalism, and contemporary geometric forms.',
    'https://behance.net/dimasarya'
),
(
    'Sofia Anindya',
    'sofia@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    FALSE,
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Landscape and environmental architect dedicated to regenerative buildings, biophilic conservatories, and ecological hillside retreats.',
    'https://behance.net/sofiaanindya'
),
(
    'Kevin Wijaya',
    'kevin@archive.com',
    '$2b$12$YMrzvUHUJOhmYbeTfO/um.CchZRhayQqHUkkeRAU85pB7yiAkQap2',
    'member',
    NULL,
    TRUE,
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Architectural photographer and urban design researcher documenting waterfront masterplans, high-density river corridors, and equatorial residences.',
    'https://behance.net/kevinwijaya'
),
(
    'Adrian Mahendra',
    'adrian@archive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'approved',
    TRUE,
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Independent architecture curator and spatial researcher specializing in computational facades, interior atmosphere, and architectural materiality.',
    'https://behance.net/adrianmahendra'
),
(
    'Clara Wijaya',
    'clara@archive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'rejected',
    TRUE,
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Interior stylist and exhibition coordinator exploring tactile surfaces, natural daylighting, and residential spatial curation.',
    'https://behance.net/clarawijaya'
),
(
    'Lucas Vermeer',
    'pending@archive.com',
    '$2b$12$veK5yRY1T60PwASCj9s33.9DZvm235kmGj9v66WwKn89X.TYagIp6',
    'curator',
    'pending',
    TRUE,
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=400&h=400&q=85',
    'Architectural historian and urban design writer organizing regional architecture biennales, monograph archives, and civic space dialogues.',
    'https://behance.net/lucasvermeer'
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

INSERT INTO curator_applications (
    user_id,
    attempt_number,
    portfolio_url,
    cv_file_path,
    cv_file_name,
    cv_url,
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
    v.cv_file_path,
    v.cv_file_name,
    v.cv_url,
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
        'seed-cv-kurator.pdf',
        'CV-Henrik-Lindstrom.pdf',
        'https://archive.com/cv/henrik-lindstrom.pdf',
        'approved',
        NULL,
        'Lead curator for Nordic and Southeast Asian architectural biennales, specializing in tropical modernism, mass timber innovation, and sustainable urbanism.',
        INTERVAL '30 days',
        INTERVAL '28 days'
    ),
    (
        'adrian@archive.com',
        'seed-cv-adrian.pdf',
        'CV-Adrian-Mahendra.pdf',
        'https://archive.com/cv/adrian-mahendra.pdf',
        'approved',
        NULL,
        'Architectural researcher and competition jury member focused on parametric building skins, interior spatial daylighting, and tectonic honesty.',
        INTERVAL '21 days',
        INTERVAL '19 days'
    ),
    (
        'clara@archive.com',
        'seed-cv-clara.pdf',
        'CV-Clara-Wijaya.pdf',
        'https://archive.com/cv/clara-wijaya.pdf',
        'rejected',
        'Portfolio currently emphasizes residential decor styling rather than architectural curatorial direction; please include architectural jury or exhibition leadership records before reapplying.',
        'Interested in curating residential interior and contemporary spatial material competitions on ARCHIVE.',
        INTERVAL '10 days',
        INTERVAL '8 days'
    ),
    (
        'pending@archive.com',
        'seed-cv-pending.pdf',
        'CV-Lucas-Vermeer.pdf',
        'https://archive.com/cv/lucas-vermeer.pdf',
        'pending',
        NULL,
        'Urban design researcher and former assistant curator for metropolitan architecture exhibitions and academic design publications.',
        INTERVAL '2 days',
        NULL
    )
) AS v(email, cv_file_path, cv_file_name, cv_url, status, rejection_reason, supporting_notes, submitted_ago, reviewed_ago)
JOIN users u ON u.email = v.email AND u.role = 'curator'
LEFT JOIN users adm ON adm.email = 'admin@archive.com'
ON CONFLICT (user_id, attempt_number) DO UPDATE SET
    portfolio_url = EXCLUDED.portfolio_url,
    cv_file_path = EXCLUDED.cv_file_path,
    cv_file_name = EXCLUDED.cv_file_name,
    cv_url = EXCLUDED.cv_url,
    background = EXCLUDED.background,
    supporting_notes = EXCLUDED.supporting_notes,
    status = EXCLUDED.status,
    rejection_reason = EXCLUDED.rejection_reason,
    reviewed_at = EXCLUDED.reviewed_at,
    reviewed_by = EXCLUDED.reviewed_by;

DELETE FROM sessions
WHERE user_id IN (SELECT id FROM users WHERE is_active = FALSE);

INSERT INTO categories (name)
VALUES
    ('Modern Architecture'),
    ('Sustainable Architecture'),
    ('Tropical Architecture'),
    ('Residential Architecture'),
    ('Interior Architecture'),
    ('Urban Design'),
    ('Landscape Architecture'),
    ('Parametric Architecture'),
    ('Contemporary Architecture'),
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
    -- Alya Ramadhani (member@archive.com)
    (
        'member@archive.com',
        'Uluwatu Cliffside Pavilion',
        'Tropical Architecture',
        'An open-air coastal retreat perched above the Indian Ocean, pairing shaded timber canopies and native palm groves with a sweeping curved infinity pool that cools prevailing sea breezes.',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=85',
        'tropical,coastal,pavilion,infinity pool,passive cooling,Bali',
        'active'
    ),
    (
        'member@archive.com',
        'Veranda Courtyard Sanctuary',
        'Landscape Architecture',
        'A sheltered masonry courtyard framed by arched colonnades, climbing botanical vines, and a central tropical palm anchoring an intimate microclimate garden.',
        'https://images.unsplash.com/photo-1723933741709-c9eae568b271?auto=format&fit=crop&w=1400&q=85',
        'landscape,courtyard,colonnade,botanical,microclimate,garden',
        'active'
    ),
    (
        'member@archive.com',
        'Warm Oak Daylight Living',
        'Interior Architecture',
        'A serene open-plan residential living space balancing pale oak furniture, warm saddle-leather tones, indoor foliage, and full-height daylight apertures.',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',
        'interior,minimalist,daylight,oak,living space,residential',
        'active'
    ),

    -- Raka Pratama (raka@archive.com)
    (
        'raka@archive.com',
        'Sydney Opera House Shell Study',
        'Modern Architecture',
        'An aerial architectural documentation of Jorn Utzon''s interlocking precast concrete sail shells rising over Sydney Harbour, examining structural rhythm and waterfront civic presence.',
        'https://images.pexels.com/photos/26840173/pexels-photo-26840173.jpeg?auto=compress&cs=tinysrgb&w=1400',
        'modern,expressionist,shell structure,waterfront,performing arts,Sydney',
        'active'
    ),
    (
        'raka@archive.com',
        'Villa Savoye Modernist Study',
        'Modern Architecture',
        'A photographic and spatial study of Le Corbusier and Pierre Jeanneret''s Poissy residence, highlighting slender pilotis, continuous horizontal ribbon windows, and a lifted white prism facade.',
        'https://images.pexels.com/photos/27085003/pexels-photo-27085003.jpeg?auto=compress&cs=tinysrgb&w=1400',
        'modernism,pilotis,ribbon window,international style,Le Corbusier,Poissy',
        'active'
    ),
    (
        'raka@archive.com',
        'Azure Horizon Coastal Villa',
        'Residential Architecture',
        'A crisp white cantilevered seaside residence composed of stacked rectilinear volumes, deep shaded loggias, and an expansive lap pool reflecting the coastal sky.',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85',
        'residential,coastal villa,cantilever,modern house,pool,glazing',
        'active'
    ),

    -- Nadia Putri (nadia@archive.com)
    (
        'nadia@archive.com',
        'Heydar Aliyev Fluid Envelope',
        'Parametric Architecture',
        'A study of continuous doubly curved panel geometry and seamless white cladding at Zaha Hadid Architects'' cultural center in Baku, dissolving conventional boundaries between roof, wall, and plaza.',
        'https://images.unsplash.com/photo-1692613101294-715a6820d319?auto=format&fit=crop&w=1400&q=85',
        'parametric,fluid geometry,shell facade,cultural center,Zaha Hadid,Baku',
        'active'
    ),
    (
        'nadia@archive.com',
        'Guggenheim Bilbao Titanium Study',
        'Parametric Architecture',
        'Reflections of sunlight and water across undulating titanium cladding along the Nervion River, studying computational surface curvature and sculptural waterfront museum form.',
        'https://images.pexels.com/photos/37894897/pexels-photo-37894897.jpeg?auto=compress&cs=tinysrgb&w=1400',
        'parametric,titanium,museum,curved facade,Frank Gehry,Bilbao',
        'active'
    ),
    (
        'nadia@archive.com',
        'Clerestory Timber Lounge',
        'Interior Architecture',
        'A quiet architectural living room anchored by an elongated horizontal clerestory window, raw solid-wood joinery, and muted stone textiles bathed in warm indirect daylight.',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85',
        'interior,clerestory,timber,warm minimalism,daylighting,furniture',
        'active'
    ),

    -- Dimas Arya (dimas@archive.com)
    (
        'dimas@archive.com',
        'Canopy Timber & Glass House',
        'Residential Architecture',
        'A two-story dark-timber and steel-framed home tucked beneath a mature broadleaf canopy, extending its transparent dining pavilion directly onto a manicured twilight lawn.',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
        'residential,timber,steel frame,glass pavilion,canopy tree,modern home',
        'active'
    ),
    (
        'dimas@archive.com',
        'Nordic Twilight Glass Residence',
        'Minimalist Architecture',
        'A restrained rectilinear winter home where floor-to-ceiling low-iron glazing illuminates warm oak interiors against snow-covered grounds at blue hour.',
        'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1400&q=85',
        'minimalist,nordic,twilight,glass facade,winter house,residential',
        'active'
    ),
    (
        'dimas@archive.com',
        'Angular Prism Cultural Annex',
        'Contemporary Architecture',
        'A bold cantilevered white metal volume intersecting a sloped structural glass atrium, exploring sharp diagonal tension and lightweight geometric contrast against an overcast sky.',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85',
        'contemporary,cantilever,glass prism,geometric,cultural building,facade',
        'active'
    ),
    (
        'dimas@archive.com',
        'Uncredited Structural Frame Draft',
        'Contemporary Architecture',
        'Work-in-progress concrete column and timber shoring elevation taken down after moderation review due to missing third-party photography attribution.',
        'https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?auto=format&fit=crop&w=1400&q=85',
        'concrete,structure,elevation,draft,moderation',
        'taken_down'
    ),

    -- Sofia Anindya (sofia@archive.com — Inactive account)
    (
        'sofia@archive.com',
        'Fallingwater Woodland Cascade',
        'Sustainable Architecture',
        'Frank Lloyd Wright''s iconic hillside dwelling anchored into native bedrock directly above Bear Run waterfall, harmonizing cantilevered horizontal terraces with the surrounding forest ecology.',
        'https://images.pexels.com/photos/33951577/pexels-photo-33951577.jpeg?auto=compress&cs=tinysrgb&w=1400',
        'sustainable,organic,waterfall,cantilever,forest,Frank Lloyd Wright',
        'active'
    ),
    (
        'sofia@archive.com',
        'Jewel Biophilic Rain Conservatory',
        'Sustainable Architecture',
        'A toroidal steel-and-glass diagrid conservatory enveloping terraced indoor forest walkways, showcasing climate-controlled biophilic public architecture at transit scale.',
        'https://images.unsplash.com/photo-1787059518735-0d1d3227a4b6?auto=format&fit=crop&w=1400&q=85',
        'sustainable,biophilic,diagrid dome,indoor forest,conservatory,Singapore',
        'active'
    ),
    (
        'sofia@archive.com',
        'Botanical Pavilion Garden Walk',
        'Landscape Architecture',
        'A linear terracotta garden promenade framed by clipped boxwood borders and flowering rose canopies, drawing movement toward a shaded timber rest pavilion.',
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1400&q=85',
        'landscape,botanical garden,axis,pavilion,planting design,promenade',
        'active'
    ),

    -- Kevin Wijaya (kevin@archive.com)
    (
        'kevin@archive.com',
        'Marina Bay Waterfront District',
        'Urban Design',
        'An elevated view of Singapore''s integrated waterfront masterplan, tracing pedestrian promenades linking Moshe Safdie''s triple-tower SkyPark and lotus-inspired museum pavilion.',
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=85',
        'urban design,waterfront,masterplan,skypark,mixed-use,Singapore',
        'active'
    ),
    (
        'kevin@archive.com',
        'Riverfront High-Rise Corridor',
        'Urban Design',
        'A twilight perspective along a dense metropolitan riverfront where cylindrical mixed-use towers, illuminated bascule bridges, and stepped riverwalks weave vertical living with civic transit.',
        'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=1400&q=85',
        'urban design,riverfront,high-rise,bridges,cityscape,metropolitan',
        'active'
    ),
    (
        'kevin@archive.com',
        'Teak Soffit Courtyard Villa',
        'Tropical Architecture',
        'A double-height tropical modern residence pairing crisp white masonry frames with warm teak wood ceiling soffits, deep overhanging terraces, and a tranquil poolside courtyard.',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=85',
        'tropical,teak soffit,modern villa,overhang,poolside,courtyard',
        'active'
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
        'BIOPHILIC URBAN HORIZONS',
        'Reimagine high-density metropolitan corridors and waterfront districts where civic infrastructure, generous public plazas, and living greenery coexist harmoniously.',
        '1. Submissions must be original architectural designs, visualizations, or curated architectural photography.' || chr(10) ||
        '2. One artwork entry per member.' || chr(10) ||
        '3. Highlight urban spatial connectivity, daylight access, or ecological integration.' || chr(10) ||
        '4. Include concise architectural context in your artwork description.',
        'Rp 5.000.000 + ARCHIVE Annual Feature',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '30 days'
    ),
    (
        'adrian@archive.com',
        'PARAMETRIC FACADE FUTURES',
        'Explore expressive building envelopes, computational curvature, and sculptural structural skins that push contemporary architectural form beyond orthogonal grids.',
        '1. Submissions must focus on parametric, curved, or geometrically expressive architecture.' || chr(10) ||
        '2. One artwork entry per member.' || chr(10) ||
        '3. Clearly articulate the facade material logic or structural concept.',
        'Rp 3.500.000 + Digital Monograph Feature',
        'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85',
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '35 days'
    ),

    -- Upcoming Challenges (NOW() < start_date)
    (
        'kurator@archive.com',
        'MASS TIMBER & LOW-CARBON LIVING',
        'Investigate regenerative construction through engineered timber structures, biophilic housing, and passive environmental envelopes designed for a lower-carbon future.',
        '1. Works must emphasize timber tectonics, sustainable material systems, or passive design.' || chr(10) ||
        '2. One artwork entry per member.' || chr(10) ||
        '3. Open to residential, pavilion, and cultural building typologies.',
        'Rp 4.000.000 + Exhibition Spotlight',
        'https://images.unsplash.com/photo-1515713519566-6f9bf3b4a07a?auto=format&fit=crop&w=1200&q=85',
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '45 days'
    ),
    (
        'adrian@archive.com',
        'LIGHT, SHADOW & INTERIOR SILENCE',
        'Examine how calibrated daylight apertures, honest timber and stone palettes, and calm spatial proportions craft restorative modern architectural interiors.',
        '1. Focus on interior architecture, daylight choreography, and material atmosphere.' || chr(10) ||
        '2. One artwork entry per member.' || chr(10) ||
        '3. Both residential and cultural/studio interiors are eligible.',
        'Rp 3.000.000',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85',
        NOW() + INTERVAL '10 days',
        NOW() + INTERVAL '50 days'
    ),

    -- Completed Challenges (NOW() > end_date)
    (
        'kurator@archive.com',
        'TROPICAL COURTYARD MODERNISM',
        'A curatorial archive celebrating contemporary tropical and coastal architecture defined by shaded overhangs, cross-ventilation, water courts, and lush planting.',
        '1. Entries must explore tropical, coastal, or climate-responsive courtyard design.' || chr(10) ||
        '2. One artwork entry per member.' || chr(10) ||
        '3. Include spatial notes on shading, material palette, or landscape integration.',
        'Rp 4.500.000 + Print Catalog Publication',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85',
        NOW() - INTERVAL '45 days',
        NOW() - INTERVAL '10 days'
    ),
    (
        'adrian@archive.com',
        'TECTONICS OF LIGHT & FORM',
        'Honoring architectural clarity through expressive cantilevers, structural precision, and luminous facades across residences and landmark cultural architecture.',
        '1. Entries must highlight structural form, spatial proportion, and light.' || chr(10) ||
        '2. One artwork entry per member.' || chr(10) ||
        '3. Original architectural projects and curated architectural studies accepted.',
        'Rp 4.000.000',
        'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=85',
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
    -- Active Challenge: BIOPHILIC URBAN HORIZONS (awaiting curator review)
    ('BIOPHILIC URBAN HORIZONS', 'kevin@archive.com',  'Marina Bay Waterfront District', NULL::INT, NULL::TEXT),
    ('BIOPHILIC URBAN HORIZONS', 'member@archive.com', 'Veranda Courtyard Sanctuary',    NULL::INT, NULL::TEXT),
    ('BIOPHILIC URBAN HORIZONS', 'raka@archive.com',   'Sydney Opera House Shell Study', NULL::INT, NULL::TEXT),

    -- Active Challenge: PARAMETRIC FACADE FUTURES (awaiting curator review)
    ('PARAMETRIC FACADE FUTURES', 'nadia@archive.com', 'Guggenheim Bilbao Titanium Study', NULL::INT, NULL::TEXT),
    ('PARAMETRIC FACADE FUTURES', 'dimas@archive.com', 'Angular Prism Cultural Annex',     NULL::INT, NULL::TEXT),
    ('PARAMETRIC FACADE FUTURES', 'kevin@archive.com', 'Riverfront High-Rise Corridor',    NULL::INT, NULL::TEXT),

    -- Completed Challenge: TROPICAL COURTYARD MODERNISM (judged with 3 winners + 1 participant)
    (
        'TROPICAL COURTYARD MODERNISM',
        'member@archive.com',
        'Uluwatu Cliffside Pavilion',
        1,
        'Masterful integration of coastal topography, deep tropical overhangs, and a cooling water terrace framing the ocean horizon.'
    ),
    (
        'TROPICAL COURTYARD MODERNISM',
        'kevin@archive.com',
        'Teak Soffit Courtyard Villa',
        2,
        'Refined interplay between crisp white structural planes and warm teak ceiling soffits creates an inviting, well-shaded equatorial home.'
    ),
    (
        'TROPICAL COURTYARD MODERNISM',
        'raka@archive.com',
        'Azure Horizon Coastal Villa',
        3,
        'Clean cantilevered massing and generous poolside loggias demonstrate disciplined coastal modernism with effortless indoor-outdoor flow.'
    ),
    ('TROPICAL COURTYARD MODERNISM', 'nadia@archive.com', 'Clerestory Timber Lounge', NULL::INT, NULL::TEXT),

    -- Completed Challenge: TECTONICS OF LIGHT & FORM (judged with 3 winners)
    (
        'TECTONICS OF LIGHT & FORM',
        'raka@archive.com',
        'Villa Savoye Modernist Study',
        1,
        'Exceptional visual clarity capturing modernist pilotis, horizontal glazing, and pure geometric proportion in balanced daylight.'
    ),
    (
        'TECTONICS OF LIGHT & FORM',
        'dimas@archive.com',
        'Canopy Timber & Glass House',
        2,
        'Thoughtful tectonic contrast between dark timber framing, luminous glass dining space, and the sheltering natural tree canopy.'
    ),
    (
        'TECTONICS OF LIGHT & FORM',
        'nadia@archive.com',
        'Heydar Aliyev Fluid Envelope',
        3,
        'Striking architectural composition showcasing continuous surface curvature and shadow gradations across the monumental white shell.'
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

UPDATE submissions s
SET winner_note = v.winner_note
FROM (
    VALUES
    ('TROPICAL COURTYARD MODERNISM', 'Uluwatu Cliffside Pavilion',   'Masterful integration of coastal topography, deep tropical overhangs, and a cooling water terrace framing the ocean horizon.'),
    ('TROPICAL COURTYARD MODERNISM', 'Teak Soffit Courtyard Villa',  'Refined interplay between crisp white structural planes and warm teak ceiling soffits creates an inviting, well-shaded equatorial home.'),
    ('TROPICAL COURTYARD MODERNISM', 'Azure Horizon Coastal Villa',  'Clean cantilevered massing and generous poolside loggias demonstrate disciplined coastal modernism with effortless indoor-outdoor flow.'),
    ('TECTONICS OF LIGHT & FORM',    'Villa Savoye Modernist Study', 'Exceptional visual clarity capturing modernist pilotis, horizontal glazing, and pure geometric proportion in balanced daylight.'),
    ('TECTONICS OF LIGHT & FORM',    'Canopy Timber & Glass House',  'Thoughtful tectonic contrast between dark timber framing, luminous glass dining space, and the sheltering natural tree canopy.'),
    ('TECTONICS OF LIGHT & FORM',    'Heydar Aliyev Fluid Envelope', 'Striking architectural composition showcasing continuous surface curvature and shadow gradations across the monumental white shell.')
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
    ('member@archive.com', 'Fallingwater Woodland Cascade'),
    ('member@archive.com', 'Villa Savoye Modernist Study'),
    ('member@archive.com', 'Heydar Aliyev Fluid Envelope'),
    ('raka@archive.com',   'Jewel Biophilic Rain Conservatory'),
    ('raka@archive.com',   'Uluwatu Cliffside Pavilion'),
    ('nadia@archive.com',  'Canopy Timber & Glass House'),
    ('dimas@archive.com',  'Guggenheim Bilbao Titanium Study'),
    ('kevin@archive.com',  'Veranda Courtyard Sanctuary')
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
    ('raka@archive.com',   'Uluwatu Cliffside Pavilion',       'The transition between the palm canopy, shaded timber edge, and curved oceanfront pool feels remarkably calm and climate-responsive.'),
    ('nadia@archive.com',  'Villa Savoye Modernist Study',     'The crisp elevation highlights the pilotis rhythm and horizontal ribbon glazing with textbook modernist clarity.'),
    ('member@archive.com', 'Fallingwater Woodland Cascade',    'Seeing the stone and concrete cantilevers suspended directly above the forest waterfall remains a timeless lesson in organic architecture.'),
    ('kevin@archive.com',  'Jewel Biophilic Rain Conservatory','The glass diagrid shell filtering daylight into multi-story tropical greenery sets an inspiring benchmark for civic biophilic spaces.'),
    ('dimas@archive.com',  'Warm Oak Daylight Living',         'Warm oak proportions paired with generous natural window light give the living room a grounded, architectural stillness.'),
    ('member@archive.com', 'Heydar Aliyev Fluid Envelope',     'The uninterrupted white cladding sweep creates subtle shadow transitions that make the whole shell read as one sculpted gesture.'),
    ('raka@archive.com',   'Teak Soffit Courtyard Villa',      'Using warm teak wood along the deep overhangs softens the bright white facade while providing effective equatorial sun protection.'),
    ('nadia@archive.com',  'Marina Bay Waterfront District',   'The aerial framing clearly shows how the waterfront promenade ties the towers and cultural museum into one cohesive urban edge.')
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
        'Angular Prism Cultural Annex',
        'Plagiarism',
        'Framing closely resembles an uncredited architectural press photograph; please verify photographer attribution.',
        'pending',
        NULL
    ),
    (
        'dimas@archive.com',
        'Marina Bay Waterfront District',
        'Other',
        'Suggested category metadata check to confirm alignment with the Urban Design exhibition archive.',
        'pending',
        NULL
    ),
    (
        'raka@archive.com',
        'Heydar Aliyev Fluid Envelope',
        'Inappropriate Content',
        'Submitted for attribution review regarding architectural study description and architect credit.',
        'dismissed',
        'Reviewed by ARCHIVE Admin: architect attribution and architectural study description meet platform guidelines.'
    ),
    (
        'nadia@archive.com',
        'Uncredited Structural Frame Draft',
        'Plagiarism',
        'Draft structural elevation uploaded without permission or source credit for third-party construction photography.',
        'taken_down',
        'Removed by ARCHIVE Admin due to verified missing source attribution.'
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

-- Summary verification queries
SELECT
    role,
    COUNT(*) AS total_users
FROM users
GROUP BY role
ORDER BY role;

SELECT
    CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END AS account_status,
    COUNT(*) AS total_users
FROM users
GROUP BY is_active
ORDER BY is_active DESC;

SELECT
    curator_status,
    COUNT(*) AS total_curators
FROM users
WHERE role = 'curator'
GROUP BY curator_status
ORDER BY curator_status;

SELECT
    c.name AS category,
    COUNT(a.id) AS total_artworks
FROM categories c
LEFT JOIN artworks a ON a.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

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
