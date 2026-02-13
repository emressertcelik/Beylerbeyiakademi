-- 015_create_group_opponents.sql
-- Her sezon, yaş grubu ve grup numarası için rakipleri tanımlayan tablo

CREATE TABLE group_opponents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season VARCHAR(32) NOT NULL REFERENCES lookup_seasons(value),
    age_group VARCHAR(16) NOT NULL REFERENCES lookup_age_groups(value),
    group_number INTEGER NOT NULL,
    opponent VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- İlgili alanlarda index
CREATE INDEX idx_group_opponents_season_age_group ON group_opponents(season, age_group);
CREATE INDEX idx_group_opponents_group_number ON group_opponents(group_number);
