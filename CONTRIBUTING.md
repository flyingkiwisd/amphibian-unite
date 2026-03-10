# Contributing to Amphibian Unite

## Workflow

We use a branch-based workflow. **Never push directly to `main`.**

### How to contribute:

1. **Create a feature branch** from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b your-name/feature-description
   ```

2. **Make your changes**, commit with clear messages:
   ```bash
   git add .
   git commit -m "Add journal persistence for daily entries"
   ```

3. **Push your branch** and open a Pull Request:
   ```bash
   git push -u origin your-name/feature-description
   gh pr create --title "Add journal persistence" --body "Description of changes"
   ```

4. **Get a review** — tag at least one other team member
5. **Merge** after approval

### Branch naming:
- `timon/feature-name`
- `ross/bugfix-name`
- `todd/data-update`

### Filing feedback:
Use **GitHub Issues** with labels:
- `bug` — something broken
- `feedback` — UX or content suggestions
- `feature-request` — new capability ideas
- `data-fix` — incorrect team data (360, roles, etc.)

### Running locally:
```bash
git clone https://github.com/flyingkiwisd/amphibian-unite.git
cd amphibian-unite
npm install
npm run dev
# Open http://localhost:3000
```

### Tech stack:
- Next.js 16 + TypeScript + Tailwind CSS v4
- Dark theme, teal accent (#14b8a6)
- Named exports only (`export function X()`, never `export default`)
