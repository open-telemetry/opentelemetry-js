import fs from 'fs/promises';
import path from 'path';

const ORG = 'open-telemetry';
const TEAM_MAP = {
  maintainers: 'javascript-maintainers',
  approvers: 'javascript-approvers',
  triagers: 'javascript-triagers',
  'contrib-triagers': 'javascript-contrib-triagers'
};
const MEMBERS_JSON_PATH = path.resolve(process.cwd(), '.github/members.json');
const OUTPUT_PATH = path.resolve(process.cwd(), '.tmp/membership-report.md');

// Requires: GITHUB_TOKEN in env
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchTeamMembers(teamSlug) {
  const url = `https://api.github.com/orgs/${ORG}/teams/${teamSlug}/members?per_page=100`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'membership-checker' }
  });
  if (!res.ok) throw new Error(`Failed to fetch team ${teamSlug}: ${res.statusText}`);
  const data = await res.json();
  return new Set(data.map(user => user.login.toLowerCase()));
}

async function main() {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN env variable required');
    process.exit(1);
  }

  const members = JSON.parse(await fs.readFile(MEMBERS_JSON_PATH, 'utf8'));
  const errors = []
  for (const [group, teamSlug] of Object.entries(TEAM_MAP)) {
    const groupMembers = members[group] || [];
    if (groupMembers.length === 0) {
      continue;
    }
    const teamSet = await fetchTeamMembers(teamSlug);
    for (const m of groupMembers) {
      if (!teamSet.has(m.login.toLowerCase())) {
        const membershipError = `- ${m.login} is missing from GitHub team @${ORG}/${teamSlug}`;
        console.info(membershipError);
        errors.push(membershipError);
      }
    }
  }

  if (errors.length === 0) {
    return;
  }

  // Create report and write to file.
  const report = "Membership discrepancies found:\n" + errors.join('\n') + '\n' + "@open-telemetry/javascript-maintainers, please verify and fix the membership issues.\n";
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, report);
}

await main();
