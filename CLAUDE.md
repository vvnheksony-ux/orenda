# Claude Rules

> These rules apply to EVERY task, NO exceptions.

---

## 🚨 Deployment & Git (MOST IMPORTANT)

- NEVER deploy to production without my explicit permission
- NEVER run: `vercel`, `netlify deploy`, `railway up`, `fly deploy`,
  `docker push`, `npm publish`, or any similar deploy command
- NEVER run `git push`, `git merge`, or `git rebase` without asking me first
- NEVER modify `.env.production` or any production config files
- NEVER merge branches without my approval
- You CAN run: `git add`, `git status`, `git diff`, `git log` freely
- Always tell me what branch we are on before any git action
- Before any deployment, stop and ask me: "Are you sure you want to deploy to production?"
- Wait for me to say YES explicitly — silence does not mean yes

---

## 🔒 Scope of Changes

- ONLY change what I specifically ask you to change
- Make the SMALLEST possible change that solves the problem
- If you need to touch other files to complete the task, ASK me first — do not just do it
- Do not refactor, clean up, or "improve" anything I did not mention
- Never delete or rewrite working code
- Never create new files unless I ask for them

---

## 📋 Before Making Changes

- Read the relevant file first
- Identify which files you plan to modify
- Tell me the list of files you will change BEFORE you change them
- If unsure about anything, ask a short question instead of guessing
- Wrong assumptions cause broken code — always clarify first

---

## ✅ After Making Changes

- Only verify the files you actually changed
- Do not run the whole project to "double check" unless I ask
- Tell me exactly what you changed and why
- Do not run extra tests or builds unless I ask

---

## 🧠 General Coding Rules

- One task at a time — do not combine multiple fixes in one go
- Match the existing code style in whatever file you are editing
- Use async/await, not .then()
- Always handle errors properly (try/catch in JS/TS, try/except in Python)
- Never hardcode API keys, secrets, or credentials
- Add comments only for complex logic — do not over-comment

---

## ❓ When You Are Unsure

- Stop and ask me a short, clear question
- Do not guess and proceed — guessing causes the "fix left, break right" problem
- One question at a time is fine