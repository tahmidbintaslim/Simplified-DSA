-- Simplified DSA database (Neon Postgres). Apply with: pnpm db:migrate
-- Lesson text lives in the repo; the database holds the resource library
-- and each learner's progress, keyed by Clerk user id (never email).

-- Curated outside resources. Notes are our own one-line summaries, never copied text.
create table if not exists resources (
  id         serial primary key,
  url        text not null unique,
  title      text not null,
  author     text not null,
  lang       text not null check (lang in ('en', 'bn')),
  kind       text not null check (kind in ('article', 'visualizer', 'video', 'course', 'practice', 'book', 'reference')),
  track      text not null check (track in ('basics', 'interview', 'cp')),
  free       boolean not null default true,
  topics     text[] not null default '{}',  -- lesson ids, or 'general' for the whole course
  note_en    text not null,
  note_bn    text not null,
  created_at timestamptz not null default now()
);
create index if not exists resources_topics_idx on resources using gin (topics);

create table if not exists progress (
  user_id      text not null,
  lesson       text not null,  -- "<section>/<lesson>"
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson)
);

create table if not exists quiz_attempts (
  id         bigserial primary key,
  user_id    text not null,
  lesson     text not null,
  quiz       int not null,     -- position of the quiz in the lesson, from 0
  correct    boolean not null,
  attempt    int not null,
  lang       text not null check (lang in ('en', 'bn')),
  created_at timestamptz not null default now()
);
create index if not exists quiz_attempts_lesson_idx on quiz_attempts (lesson, quiz);

-- Simulator missions: how many times each mission's goal was met (capped at
-- the mission's `times`), per learner.
create table if not exists mission_progress (
  user_id    text not null,
  demo       text not null,
  mission    text not null,
  count      int not null check (count >= 0 and count <= 20),
  updated_at timestamptz not null default now(),
  primary key (user_id, demo, mission)
);
