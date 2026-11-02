import { json, requireOwner } from "../_lib/server.js";

const SOURCES = [
  {
    id: "mozilla-0din",
    name: "Mozilla 0DIN",
    category: "ai-security",
    url: "https://0din.ai/policy",
    reward: "$500–$15,000",
    rewardType: "published-range",
    age: "Age of majority, or qualify through parent/guardian consent or another lawful route",
    country: "Algeria is not named in the published excluded-country list; payment eligibility still needs confirmation",
    payout: "Payment commitment within 30 days after contractual agreement; government ID and tax form required",
    automation: "AI security research is the program focus; each finding must be original, in-scope and responsibly tested",
    eligibility: "conditional",
    note: "Not an automatic payment. Mozilla evaluates severity, impact, originality and report quality."
  },
  {
    id: "mozilla-security",
    name: "Mozilla Security Bug Bounty",
    category: "security",
    url: "https://www.mozilla.org/en-US/security/bug-bounty/",
    reward: "Varies by vulnerability",
    rewardType: "program-defined",
    age: "Age of majority, or qualify through parent/guardian consent or another lawful route",
    country: "No Algeria-specific acceptance confirmation found; check program/payment requirements",
    payout: "Payment details depend on the program and accepted report",
    automation: "Automated discovery may assist research; reports must be valid, original and within scope",
    eligibility: "conditional",
    note: "Only vulnerabilities in Mozilla-owned/in-scope products qualify."
  },
  {
    id: "immunefi",
    name: "Immunefi",
    category: "web3-security",
    url: "https://immunefi.com/bug-bounty/",
    reward: "Program-specific; some programs publish substantial caps",
    rewardType: "program-defined",
    age: "18+ under Immunefi Terms of Use; not eligible for a 17-year-old, even if a program is live",
    country: "Algeria is not among the listed OFAC-prohibited jurisdictions in the reviewed terms; this is not a payment guarantee",
    payout: "Program-specific; commonly USDC/other tokens, with KYC and sometimes invoice or proof-of-address requirements",
    automation: "Immunefi rules prohibit AI-generated/automated scanner bug reports that lack researcher-provided impact analysis; no agent-only submission",
    eligibility: "age-blocked",
    note: "The platform terms require at least 18. Keep this source in the radar for future eligibility only."
  },
  {
    id: "algora",
    name: "Algora",
    category: "coding",
    url: "https://algora.io/terms",
    reward: "Issue-specific funded bounties",
    rewardType: "issue-specific",
    age: "18+; terms prohibit use by minors",
    country: "Algeria/payment rail not independently confirmed",
    payout: "Confirm payment method and payout availability before claiming",
    automation: "Agent-assisted code may be subject to maintainer and platform rules; do not misrepresent authorship",
    eligibility: "age-blocked",
    note: "Do not create or use an account before meeting the age requirement."
  },
  {
    id: "oneforma",
    name: "OneForma",
    category: "ai-work",
    url: "https://www.oneforma.com/",
    reward: "Project-specific rates shown before acceptance",
    rewardType: "project-specific",
    age: "Minimum age must be confirmed in current contributor terms",
    country: "Advertises projects in 100+ countries; Algeria must be confirmed in account/project availability",
    payout: "Advertises worldwide payouts; exact payment methods and thresholds vary",
    automation: "Many annotation/judging tasks require the contributor's own human judgement; agents cannot impersonate a human worker",
    eligibility: "verify",
    note: "Potential source of paid AI-data projects, but not an agent-only execution channel."
  },
  {
    id: "rws-trainai",
    name: "RWS TrainAI Community",
    category: "ai-work",
    url: "https://www.rws.com/artificial-intelligence/train-ai-data-services/trainai-community/",
    reward: "Per-task rates disclosed for each project",
    rewardType: "project-specific",
    age: "18+",
    country: "Algeria-specific onboarding/payment availability not confirmed",
    payout: "Project-specific payment details are communicated before work",
    automation: "Tasks may require human language judgement; agent-only completion is not assumed to be allowed",
    eligibility: "age-blocked",
    note: "Official FAQ states the minimum age is 18."
  },
  {
    id: "toloka",
    name: "Toloka",
    category: "ai-work",
    url: "https://toloka.ai/legal/eligibility-and-geographic-restrictions",
    reward: "Task/project-specific",
    rewardType: "task-specific",
    age: "18+",
    country: "Algeria is not named in the published restricted list; project and payment availability still need confirmation",
    payout: "Depends on available payout methods and project; verify before work",
    automation: "Terms explicitly allow project-level restrictions on automation and generative AI; agent-only task completion is not presumed allowed",
    eligibility: "age-blocked",
    note: "Do not use VPNs, proxies or false identity/location details to bypass restrictions."
  }
];

function safeText(value, max = 1200) {
  return String(value || "").replace(/[\u0000-\u001f]/g, " ").slice(0, max);
}

async function searchGitHub(query) {
  const url = "https://api.github.com/search/issues?q=" + encodeURIComponent(query) + "&per_page=20&sort=updated&order=desc";
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "UTILORA-Bounty-Hunter"
    },
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw new Error("GitHub issue search unavailable (" + response.status + ").");
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function onRequest(context) {
  const access = await requireOwner(context);
  if (access.response) return access.response;
  if (context.request.method !== "GET") {
    return json({ error: "Method not allowed." }, 405, { Allow: "GET" });
  }

  const sources = SOURCES.map((source) => ({ ...source }));
  let opportunities = [];
  let discovery = { status: "unavailable", message: "Live GitHub discovery has not completed." };

  try {
    const queries = [
      'is:issue is:open label:bounty',
      'is:issue is:open bounty "$"'
    ];
    const resultSets = await Promise.all(queries.map(searchGitHub));
    const seen = new Set();
    opportunities = resultSets.flat().filter((issue) => {
      if (!issue?.html_url || seen.has(issue.html_url)) return false;
      seen.add(issue.html_url);
      return true;
    }).slice(0, 30).map((issue) => {
      const labels = Array.isArray(issue.labels) ? issue.labels.map((label) => safeText(label.name, 60)) : [];
      const body = safeText(issue.body, 900);
      const amountMatch = (safeText(issue.title, 300) + " " + body).match(/(?:\$|USD\s?)(\d[\d,]*(?:\.\d{1,2})?)/i);
      return {
        id: issue.id,
        title: safeText(issue.title, 220),
        url: issue.html_url,
        repository: safeText(issue.repository_url?.split("/").slice(-2).join("/"), 120),
        labels,
        updatedAt: issue.updated_at || null,
        createdAt: issue.created_at || null,
        rewardMention: amountMatch ? "$" + amountMatch[1] : null,
        body,
        verification: "unverified",
        warning: "GitHub issue search is a lead only. It does not prove funds are escrowed, the bounty is still claimable, or that AI-agent submissions are allowed."
      };
    });
    discovery = {
      status: "ok",
      message: "Found " + opportunities.length + " public issue leads. Every lead requires source and funding verification."
    };
  } catch (error) {
    discovery = {
      status: "error",
      message: safeText(error?.message || "Could not search GitHub.", 240)
    };
  }

  const activePrograms = [
    { id: "immunefi-0x", name: "0x Protocol", category: "Web3 security", url: "https://immunefi.com/bug-bounty/0x/information/", reward: "Program-defined; published high/critical reward ranges", updated: "Recently updated", status: "Live program", payout: "USDC on Ethereum; KYC applies", note: "18+ platform restriction. AI-generated scanner reports without researcher impact analysis are prohibited." },
    { id: "immunefi-polygon", name: "Polygon", category: "Web3 security", url: "https://immunefi.com/bug-bounty/polygon/information/", reward: "Program-defined; paid in USDC or POL", updated: "Program page available", status: "Live program", payout: "USDC or POL at project discretion; invoice and KYC required", note: "18+ platform restriction. Algeria is not named in the reviewed OFAC/UNSC exclusion clause, but KYC/payment approval is not guaranteed." },
    { id: "immunefi-lido", name: "Lido", category: "Web3 security", url: "https://immunefi.com/bug-bounty/lido/information/", reward: "Up to $2,000,000 for qualifying critical smart-contract impact; lower tiers also published", updated: "Updated within the last few days", status: "Live program", payout: "USDC, USDS, DAI or USDT depending on program terms", note: "18+ platform restriction. Proof of concept and strict scope rules apply." },
    { id: "immunefi-cosmos", name: "Cosmos", category: "Web3 security", url: "https://immunefi.com/bug-bounty/cosmos/information/", reward: "Up to $50,000; published severity tiers", updated: "Updated 20 October 2026", status: "Live program", payout: "Program-specific; KYC and proof of concept requirements apply", note: "18+ platform restriction. Program terms and scope must be followed." }
  ];

  return json({
    generatedAt: new Date().toISOString(),
    region: "DZ",
    sources,
    activePrograms,
    opportunities,
    discovery,
    policy: {
      agentOnly: true,
      externalSubmissionRequiresOwnerApproval: true,
      neverBypassAgeCountryKycOrAutomationRules: true,
      noTaskIsMarkedFundedWithoutEvidence: true
    }
  }, 200, { "Cache-Control": "private, no-store, max-age=0" });
}
