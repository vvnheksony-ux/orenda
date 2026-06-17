// Tracks whether the logged-in user's profile is "complete" (has name + phone).
// null = not checked yet. Shared between ProfileGate (enforces) and the
// complete-profile page (flips it to true after saving).
let complete: boolean | null = null

export function getProfileComplete() {
  return complete
}

export function setProfileComplete(value: boolean | null) {
  complete = value
}
