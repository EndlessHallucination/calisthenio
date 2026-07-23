# Calisthenio

A personal calisthenics coaching app powered by a local AI. Set your goal skill, get a personalized training routine, log your workouts, and progress through milestones automatically.

No subscriptions. No cloud. Runs entirely on your machine.

---

## What it does

- **Pick a skill** — Front Lever, Handstand, Muscle-Up, Planche, Back Lever, L-Sit, and more
- **AI generates your routine** — powered by Ollama (local LLM), using your profile, equipment, milestone progress, and recent workout history
- **Log workouts** — track actual sets, reps, and hold times with a built-in rest timer
- **Complete milestones** — when you hit a standard (e.g. 10s Tuck Front Lever), the app auto-generates a new routine for the next progression
- **Train multiple skills** — the AI is aware of all your active skills and avoids overloading the same muscle groups
- **Equipment-aware** — only prescribes exercises you can actually do with your available equipment

---

## Stack

| Layer    | Tech                        |
| -------- | --------------------------- |
| Backend  | Node.js + Express           |
| Database | PostgreSQL                  |
| Frontend | React + Vite + Tailwind CSS |
| AI       | Ollama (local LLM)          |
| State    | React Query                 |

---

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL
- [Ollama](https://ollama.ai) with `mistral` pulled

```bash
ollama pull mistral
```

### 1. Clone the repo

```bash
git clone https://github.com/EndlessHallucination/calisthenio.git
cd calisthenio
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calisthenics
DB_USER=your_user
DB_PASSWORD=your_password
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

Run migrations:

```bash
node src/migrations/migrate.js
```

Seed skill data:

```bash
node src/seeds/runner.js
```

Start the server:

```bash
node src/server.js
```

### 3. Set up the frontend

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`

---

## How it works

### Skill progression

Each skill has a milestone chain based on calisthenics progressions:
Front Lever:

Tuck FL (10s) → Advanced Tuck FL (10s) → One Leg FL (8s) → Straddle FL (5s) → Full FL (5s)

When you complete a milestone, the app:

1. Records the completion with a timestamp
2. Derives your new current milestone automatically (no stored state)
3. Generates a new AI routine targeting the next progression

### AI context

Every routine generation sends the following to the local LLM:

- Your profile (experience, session duration, training days)
- Current skill and milestone
- Completed milestone history
- Last 3 workouts with actual performance
- Available equipment
- Other active skills (to avoid muscle group conflicts)
- Exercise database filtered by skill and equipment

### Architecture

server/
├── src/
│ ├── config/ # DB and Ollama config
│ ├── migrations/ # SQL migration files
│ ├── seeds/ # Skill and exercise seed data
│ ├── services/ # Business logic
│ │ ├── contextService.js # Assembles AI prompt context
│ │ ├── routineService.js # Routine generation and storage
│ │ ├── promptBuilder.js # Builds the LLM prompt
│ │ └── ollamaService.js # Ollama API client
│ ├── routes/ # Express route handlers
│ └── app.js
client/
├── src/
│ ├── api/ # Axios API calls
│ ├── components/ # Reusable UI components
│ ├── pages/ # Page components
│ └── App.jsx

---

## Current skills

| Skill             | Category  | Difficulty   |
| ----------------- | --------- | ------------ |
| Front Lever       | Pulling   | Intermediate |
| Back Lever        | Pulling   | Intermediate |
| Muscle-Up         | Pulling   | Intermediate |
| One Arm Pull-up   | Pulling   | Elite        |
| Handstand         | Handstand | Intermediate |
| Handstand Push-up | Pushing   | Advanced     |
| Planche           | Pushing   | Advanced     |
| L-Sit             | Misc      | Intermediate |

---

## Roadmap

- [ ] Weekly training plan model (Session A/B splits)
- [ ] Auto-progression based on logged performance
- [ ] Exercise video guides
- [ ] Progress charts and analytics
- [ ] Streak tracking
- [ ] Seeding more skills
 
## Philosophy

Most fitness apps are either too generic or locked behind subscriptions. Calisthenio runs locally, respects your privacy, and gives you a coach that actually knows your progression history — not just a random workout generator.

The AI doesn't invent exercises. It picks from a curated database of progressions and uses your real training history to adapt. The goal is structured, intelligent progression — not noise.

---

## Contributing

This is an early-stage personal project. Issues and PRs welcome.

If you find it useful, a star goes a long way.

---

## License

MIT
