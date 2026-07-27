CREATE TABLE week_plans (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    coach_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE week_plan_skills (
    week_plan_id INTEGER NOT NULL,
    skill_progress_id INTEGER NOT NULL,
    PRIMARY KEY (week_plan_id, skill_progress_id),
    FOREIGN KEY (week_plan_id) REFERENCES week_plans(id),
    FOREIGN KEY (skill_progress_id) REFERENCES skill_progress(id)
);

CREATE TABLE week_sessions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    week_plan_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    skill_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (week_plan_id) REFERENCES week_plans(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

CREATE TABLE week_session_exercises (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    week_session_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    sets INTEGER,
    reps TEXT,
    hold_time_seconds INTEGER,
    rest_seconds INTEGER,
    notes TEXT,
    section TEXT,
    FOREIGN KEY (week_session_id) REFERENCES week_sessions(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);