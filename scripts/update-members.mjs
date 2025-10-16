import fs from 'fs/promises';
import path from 'path';

const rootDir = path.resolve(process.cwd(), '.');
const membersPath = path.join(rootDir, '.github', 'members.json');
const readmePath = path.join(rootDir, 'README.md');

const explainers = {
  'Triagers': `Members of this team have triager permissions for opentelemetry-js.git and opentelemetry-js-contrib.git.`,
  'Contrib Triagers': `Members of this team have triager permissions for opentelemetry-js-contrib.git.
Typically, members of this are [component owners](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/.github/component_owners.yml) of one or more packages in the contrib repo.`,
};

const moreInfos = {
  'Approvers': `For more information about the approver role, see the [community repository](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#approver).`,
  'Triagers': `For more information about the triager role, see the [community repository](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#triager).`,
  'Contrib Triagers': `For more information about the triager role, see the [community repository](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#triager).`,
  'Emeriti': `For more information about the emeritus role, see the [community repository](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#emeritus-maintainerapprovertriager).`
};

function memberToMarkdown(member) {
  let md = `- [${member.name}](https://github.com/${member.login})`;
  if (member.role) md += `, ${member.role}`;
  if (member.affiliation) md += `, ${member.affiliation}`;
  return md;
}

function replaceSection(readme, sectionTitle, members) {
  // Match from the heading to just before the next h3 or end of file, excluding the next heading
  const sectionRegex = new RegExp(
    `^### ${sectionTitle}\\n[\\s\\S]*?(?=^### |\\Z)`,
    'gm'
  );

  const explainer = explainers[sectionTitle];
  const moreInfo = moreInfos[sectionTitle];
  const memberLines = members.map(memberToMarkdown).join('\n');

  // Build the new section
  let section = `### ${sectionTitle}\n\n`;
  if (explainer) section += explainer + '\n\n';
  section += memberLines ? memberLines + '\n\n' : '- N/A\n\n';
  if (moreInfo) section += moreInfo + '\n\n';

  return readme.replace(sectionRegex, section);
}

function sortMembersByName(members) {
  return [...members].sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const [membersRaw, readmeRaw] = await Promise.all([
    fs.readFile(membersPath, 'utf8'),
    fs.readFile(readmePath, 'utf8'),
  ]);
  const members = JSON.parse(membersRaw);

  let readme = readmeRaw;

  readme = replaceSection(readme, 'Maintainers', sortMembersByName(members.maintainers));
  readme = replaceSection(readme, 'Approvers', sortMembersByName(members.approvers));
  readme = replaceSection(readme, 'Triagers', sortMembersByName(members.triagers));
  readme = replaceSection(readme, 'Contrib Triagers', sortMembersByName(members['contrib-triagers']));
  readme = replaceSection(readme, 'Emeriti', sortMembersByName(members.emeriti));

  await fs.writeFile(readmePath, readme);
}

await main();
