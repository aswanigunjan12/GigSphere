// ============================================================
// GigSphere – AI Cover Letter Generator (Mock)
// Generates personalised cover letters using student profile
// + gig data. No backend required.
// ============================================================

// ── Template fragments ──────────────────────────────────────

const OPENERS = [
  `I'm excited to apply for the {title} role. As a {availability} student based in {location}, I'm eager to bring my skills to this opportunity.`,
  `I noticed your listing for {title} and knew it was a perfect match for my background. I'm available {availability} and ready to contribute from day one.`,
  `I'd love to contribute to {businessName} as a {title}. My skill set and {availability} availability make me an ideal fit for this role.`,
  `The {title} position at {businessName} caught my attention immediately — it aligns perfectly with my experience and career goals.`,
];

const SKILL_BRIDGES = [
  `Through my experience with {skills}, I've developed a strong foundation that directly applies to the responsibilities outlined in this role.`,
  `My proficiency in {skills} has prepared me well for challenges like the ones described in your listing.`,
  `I bring hands-on experience in {skills}, which I believe will enable me to make an immediate impact on this project.`,
  `Having worked extensively with {skills}, I'm confident in my ability to deliver quality results for your team.`,
];

const DESCRIPTION_HOOKS = [
  `What excites me most about this role is the opportunity to {descHook}. I thrive in environments where I can apply my skills to real-world challenges.`,
  `The chance to {descHook} resonates with my passion for learning and growing professionally while delivering tangible results.`,
  `I'm particularly drawn to the aspect of {descHook}, which aligns with the kind of work I'm most passionate about.`,
];

const CLOSERS = [
  `I'm committed to delivering high-quality work and would welcome the chance to discuss how I can contribute to your team. I look forward to hearing from you.`,
  `I'm excited about the possibility of joining {businessName} and am confident that my skills and enthusiasm will be a great asset to this project.`,
  `Thank you for considering my application. I'm eager to bring my energy and expertise to {businessName} and make this collaboration a success.`,
  `I'd love to connect and discuss how my background can help achieve your goals. Thank you for this opportunity.`,
];

// ── Helpers ──────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractDescHook(description) {
  if (!description) return 'contribute meaningfully to this project';
  // Pull the first meaningful sentence fragment
  const sentences = description.split(/[.!]/).map(s => s.trim()).filter(s => s.length > 20);
  if (sentences.length === 0) return 'contribute meaningfully to this project';
  const sentence = sentences[0].toLowerCase();
  // Convert to action phrase
  if (sentence.startsWith('build')) return sentence;
  if (sentence.startsWith('create')) return sentence;
  if (sentence.startsWith('help')) return sentence;
  if (sentence.startsWith('assist')) return sentence;
  return sentence.length > 80 ? sentence.slice(0, 80) + '…' : sentence;
}

function findMatchedSkills(studentSkills, gigSkills) {
  const sLower = (studentSkills || []).map(s => s.toLowerCase());
  const gLower = (gigSkills || []).map(s => s.toLowerCase());
  return (studentSkills || []).filter(s =>
    gLower.some(gs => gs.includes(s.toLowerCase()) || s.toLowerCase().includes(gs))
  );
}

function interpolate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || '');
}

// ── Main Generator ──────────────────────────────────────────

/**
 * generateCoverLetter(student, gig)
 * @param {object} student – user from AuthContext
 * @param {object} gig – gig object
 * @returns {object} { letter, matchedSkills, matchStrength }
 */
export function generateCoverLetter(student, gig) {
  const studentSkills = student.skills || [];
  const gigSkills = gig.skills || [];
  const matched = findMatchedSkills(studentSkills, gigSkills);

  const vars = {
    title: gig.title || 'this role',
    businessName: gig.businessName || 'your company',
    location: student.location || 'my area',
    availability: (student.availability || 'flexible').toLowerCase(),
    skills: studentSkills.length > 0
      ? studentSkills.slice(0, 4).join(', ')
      : 'various technical and creative areas',
    descHook: extractDescHook(gig.description),
  };

  // Build the letter from template fragments
  const opener = interpolate(pick(OPENERS), vars);
  const skillBridge = interpolate(pick(SKILL_BRIDGES), vars);
  const descHook = interpolate(pick(DESCRIPTION_HOOKS), vars);
  const closer = interpolate(pick(CLOSERS), vars);

  const letter = `${opener}\n\n${skillBridge}\n\n${descHook}\n\n${closer}`;

  // Calculate match strength
  const skillMatch = gigSkills.length > 0
    ? Math.round((matched.length / gigSkills.length) * 100)
    : 50;
  const matchStrength = Math.min(100, skillMatch + (student.location === gig.location ? 10 : 0) + 15); // base 15 for applying

  return { letter, matchedSkills: matched, matchStrength };
}

/**
 * improveCoverLetter(currentLetter, student, gig)
 * Takes an existing draft and enhances it with more detail
 */
export function improveCoverLetter(currentLetter, student, gig) {
  const matched = findMatchedSkills(student.skills || [], gig.skills || []);
  const improvements = [];

  // Add quantitative language
  if (!currentLetter.includes('experience')) {
    improvements.push(`\n\nWith hands-on experience in ${(student.skills || ['my field']).slice(0, 3).join(', ')}, I'm ready to tackle this challenge head-on.`);
  }

  // Add availability emphasis
  if (!currentLetter.toLowerCase().includes('deadline') && !currentLetter.toLowerCase().includes('timeline')) {
    improvements.push(` I can start immediately and am flexible with deadlines to ensure project success.`);
  }

  // Add education if available
  if (student.education && !currentLetter.includes(student.education)) {
    improvements.push(`\n\nCurrently pursuing ${student.education}, I bring both academic knowledge and practical skills to every project.`);
  }

  // Add matched skills emphasis
  if (matched.length > 0 && !currentLetter.includes('directly relevant')) {
    improvements.push(` My ${matched.join(' and ')} skills are directly relevant to what you're looking for.`);
  }

  const improved = currentLetter + improvements.join('');

  return {
    letter: improved,
    matchedSkills: matched,
    matchStrength: Math.min(100, 85 + matched.length * 5),
  };
}
