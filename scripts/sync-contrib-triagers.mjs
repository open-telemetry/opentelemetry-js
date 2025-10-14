import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

const COMPONENT_OWNERS_URL = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js-contrib/refs/heads/main/.github/component_owners.yml';
const MEMBERS_JSON_PATH = path.resolve(process.cwd(), '.github/members.json');

function getLoginsByRole(members, role) {
  if (members[role] == null) {
    return [];
  }
  return members[role].map(m => m.login.toLowerCase());
}

async function main() {
  // Fetch and parse component_owners.yml
  const res = await fetch(COMPONENT_OWNERS_URL);
  if (!res.ok) throw new Error(`Failed to fetch component_owners.yml: ${res.statusText}`);
  const ymlText = await res.text();
  const ymlData = yaml.parse(ymlText);

  // Collect all unique owners
  const contribTriagers = new Set();
  for (const component of Object.keys(ymlData.components)) {
    const componentOwners = ymlData.components[component];
    if (componentOwners && Array.isArray(componentOwners)) {
      componentOwners.forEach(owner => contribTriagers.add(owner.toLowerCase()));
    }
  }

  // Read and parse members.json
  const members = JSON.parse(await fs.readFile(MEMBERS_JSON_PATH, 'utf8'));

  // Collect existing logins - if any of these roles already have the owner, we do not need to add them.
  const existingLogins = new Set([
    ...getLoginsByRole(members, 'contrib-triagers'),
    ...getLoginsByRole(members, 'maintainers'),
    ...getLoginsByRole(members, 'approvers')
  ]);

  // Add missing owners
  let added = false;
  for (const login of contribTriagers) {
    if (!existingLogins.has(login)) {
      console.info(`Adding ${login} to contrib-triagers`);
      members['contrib-triagers'].push({
        login: login,
        name: login  // we may not know their name, so just use login as a placeholder until it's updated manually
      });
      added = true;
    }
  }

  // Write back if changes were made
  if (added) {
    await fs.writeFile(MEMBERS_JSON_PATH, JSON.stringify(members, null, 2) + '\n');
    console.log('Updated contrib-triagers with new owners.');
  } else {
    console.log('No new owners to add.');
  }
}

await main();

