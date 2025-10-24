const { readFile, writeFile, mkdir } = require('fs/promises');

const repoOwner = 'open-telemetry';
const token = process.env.GITHUB_TOKEN;

async function getMembersFromSection(sectionRegex) {
  const readme = await readFile('README.md', 'utf8');
  const roleSection = readme.match(sectionRegex);
  if (!roleSection) return [];

  const matches = [...roleSection[0].matchAll(/\[.*?\]\(https:\/\/github\.com\/([a-zA-Z0-9-_]+)\)/g)];
  const handles = matches.map(m => m[1]);
  return [...new Set(handles)];
}

async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res;
    } catch (error) {
      console.warn(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error(`All ${retries} attempts failed.`);
      }
    }
  }
}

async function fetchPaginatedJSON(url, filterData) {
  let results = [];
  let nextUrl = url;

  while (nextUrl) {
    const res = await fetchWithRetry(nextUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'review-check-script',
        Accept: 'application/vnd.github+json'
      }
    });

    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

    const data = filterData(await res.json());

    if (data.length === 0) {
      // don't continue if everything has been filtered.
      return results;
    }

    results = results.concat(data);

    const linkHeader = res.headers.get('link');
    const nextMatch = linkHeader && linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    nextUrl = nextMatch ? nextMatch[1] : null;
  }

  return results;
}

function getPullRequestsUntilCutoffDate(repoOwner, repoName, cutoffDate) {
  const pullsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls?state=all&per_page=100&sort=updated&direction=desc`;
  return fetchPaginatedJSON(pullsUrl, pulls => {
    // only allow PRs that have been updated after the cutoff date
    return pulls.filter(pr => {
      // PRs may be updated after they merged (branches deleted after merge update the PR), so we use the merge or close date before
      // using updated_at.
      if (pr.merged_at) {
        return new Date(pr.merged_at) > cutoffDate;
      }

      if (pr.closed_at) {
        return new Date(pr.closed_at) > cutoffDate;
      }

      return new Date(pr.updated_at) > cutoffDate;
    });
  });
}

async function getPullRequestReviewersUntilCutoffDate(repoOwner, repoName, pr, cutoffDate) {
  const reviewsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${pr.number}/reviews?per_page=100`;
  const reviews = await fetchPaginatedJSON(
    reviewsUrl,
    data => data // no-op filter
  );
  return reviews
    .filter(r => new Date(r.submitted_at) > cutoffDate)
    .map(r => r.user.login);
}

async function removeActiveMembersFromList(presumedInactiveUsers, repoName, repoOwner, cutoffDate) {
  const pulls = await getPullRequestsUntilCutoffDate(repoOwner, repoName, cutoffDate);

  for (const pr of pulls) {
    const activeReviewers = await getPullRequestReviewersUntilCutoffDate(
      repoOwner,
      repoName,
      pr,
      cutoffDate
    );

    console.debug(repoName, pr.number, activeReviewers);

    for (const reviewer of activeReviewers) {
      const index = presumedInactiveUsers.indexOf(reviewer);
      if (index > -1) {
        presumedInactiveUsers.splice(index, 1);
      }

      if (presumedInactiveUsers.length === 0) {
        return;
      }
    }
  }
}

async function moveMembersToEmeritus(inactiveUsers, sectionRegex, role) {
  let readme = await readFile('README.md', 'utf8');

  // Match Member and Emeriti sections
  const membersSectionMatch = readme.match(sectionRegex);
  const emeritiSectionMatch = readme.match(/(###\s+Emeriti[\s\S]*?)(?=\nFor more information)/i);

  if (!membersSectionMatch || !emeritiSectionMatch) return;

  let membersSection = membersSectionMatch[0];
  let emeritiSection = emeritiSectionMatch[0];

  const membersToMove = [];

   // Remove members from their section
  membersSection = membersSection
    .split('\n')
    .filter(line => {
      const match = line.match(/\[.*?\]\(https:\/\/github\.com\/([a-zA-Z0-9-_]+)\)/);
      if (match) {
        const username = match[1];
        if (inactiveUsers.includes(username)) {
          // remove affiliation and keep member lines for later
          const splitLine = line.trim().split(',');
          membersToMove.push(splitLine.slice(0, splitLine.length - 1).join(',') + ', ' + role);
          return false; // remove this line
        }
      }
      return true; // keep this line
    })
    .join('\n');

  if (membersToMove.length === 0) {
    return;
  }

  // Append new Emeriti lines
  emeritiSection = emeritiSection.trim() + '\n' + membersToMove.join('\n') + '\n';

  // Finally, replace sections in README with the updated section
  readme = readme.replace(membersSectionMatch[0], membersSection);
  readme = readme.replace(emeritiSectionMatch[0], emeritiSection);

  await writeFile('README.md', readme, 'utf8');
}

async function writePrSummary(inactiveUsers, cutoffDate) {
  await mkdir('.tmp');
  await writeFile('.tmp/emeritus-pr-body.md', `Moving the following members to Emeritus as no reviews were posted since ${cutoffDate.toString()}:\n - ${inactiveUsers.map(user => '@' + user).join('\n - ')}`, 'utf-8');
}

(async () => {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 4);

  const approverSectionRegex = /(###\s+Approvers[\s\S]*?)(?=\n###|\n##|\n#|$)/i;
  const maintainerSectionRegex = /(###\s+Maintainers[\s\S]*?)(?=\n###|\n##|\n#|$)/i;

  const possiblyInactiveApprovers = await getMembersFromSection(approverSectionRegex);
  const possiblyInactiveMaintainers = await getMembersFromSection(maintainerSectionRegex);

  const possiblyInactiveMembers = [...possiblyInactiveApprovers, ...possiblyInactiveMaintainers];
  await removeActiveMembersFromList(possiblyInactiveMembers, 'opentelemetry-js', repoOwner, cutoffDate);
  await removeActiveMembersFromList(possiblyInactiveMembers, 'opentelemetry-js-contrib', repoOwner, cutoffDate);

  console.info(`Inactive members (no reviews since ${cutoffDate.toISOString()}):`, possiblyInactiveMembers);

  await moveMembersToEmeritus(possiblyInactiveMembers, approverSectionRegex, 'Approver');
  await moveMembersToEmeritus(possiblyInactiveMembers, maintainerSectionRegex, 'Maintainer');

  await writePrSummary(possiblyInactiveMembers, cutoffDate);
})();
