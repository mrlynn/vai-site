// JS port of vai-dashboard chunker utilities.

const DEFAULTS = {
  size: 512,
  overlap: 50,
  minSize: 20,
};

function chunkFixed(text, opts) {
  const { size, overlap, minSize } = opts;
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = start + size;
    const chunk = text.slice(start, end).trim();
    if (chunk.length >= minSize) {
      chunks.push(chunk);
    }
    if (end >= text.length) break;
    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}

function groupUnits(units, maxSize, overlapChars, minSize) {
  const chunks = [];
  let current = [];
  let currentLen = 0;

  for (const unit of units) {
    const addLen = current.length > 0 ? unit.length + 1 : unit.length;

    if (currentLen + addLen > maxSize && current.length > 0) {
      const joined = current.join('\n\n').trim();
      if (joined.length >= minSize) {
        chunks.push(joined);
      }

      if (overlapChars > 0) {
        const overlapUnits = [];
        let overlapLen = 0;
        for (let i = current.length - 1; i >= 0; i -= 1) {
          if (overlapLen + current[i].length + 1 > overlapChars) break;
          overlapUnits.unshift(current[i]);
          overlapLen += current[i].length + 1;
        }
        current = overlapUnits;
        currentLen = overlapLen;
      } else {
        current = [];
        currentLen = 0;
      }
    }

    current.push(unit);
    currentLen += addLen;
  }

  if (current.length > 0) {
    const text = current.join('\n\n').trim();
    if (text.length >= minSize) chunks.push(text);
  }

  return chunks;
}

function recursiveSplit(text, separators, maxSize, minSize) {
  if (text.length <= maxSize) {
    return text.trim().length >= minSize ? [text.trim()] : [];
  }

  let sep = null;
  for (const s of separators) {
    if (text.includes(s)) {
      sep = s;
      break;
    }
  }

  if (sep === null) {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxSize) {
      const chunk = text.slice(i, i + maxSize).trim();
      if (chunk.length >= minSize) chunks.push(chunk);
    }
    return chunks;
  }

  const parts = text.split(sep);
  const chunks = [];
  let current = '';

  for (const part of parts) {
    const candidate = current ? current + sep + part : part;

    if (candidate.length <= maxSize) {
      current = candidate;
    } else {
      if (current.trim().length >= minSize) {
        chunks.push(current.trim());
      }
      if (part.length > maxSize) {
        const remainingSeps = separators.slice(separators.indexOf(sep) + 1);
        chunks.push(...recursiveSplit(part, remainingSeps, maxSize, minSize));
        current = '';
      } else {
        current = part;
      }
    }
  }

  if (current.trim().length >= minSize) {
    chunks.push(current.trim());
  }

  return chunks;
}

function chunkParagraph(text, opts) {
  const { size, overlap, minSize } = opts;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return groupUnits(paragraphs, size, overlap, minSize);
}

function chunkMarkdown(text, opts) {
  const { size, minSize } = opts;
  const headingPattern = /^(#{1,6}\s.+)$/gm;
  const sections = [];
  let lastIndex = 0;
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = headingPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const content = text.slice(lastIndex, match.index).trim();
      if (content) {
        if (sections.length > 0) {
          sections[sections.length - 1].content += '\n\n' + content;
        } else {
          sections.push({ heading: '', content });
        }
      }
    }
    sections.push({ heading: match[1], content: '' });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const content = text.slice(lastIndex).trim();
    if (content) {
      if (sections.length > 0) {
        sections[sections.length - 1].content += '\n\n' + content;
      } else {
        sections.push({ heading: '', content });
      }
    }
  }

  if (sections.length === 0) {
    return chunkParagraph(text, opts);
  }

  const chunks = [];
  for (const section of sections) {
    const full = section.heading
      ? section.heading + '\n\n' + section.content.trim()
      : section.content.trim();

    if (!full || full.length < minSize) continue;

    if (full.length <= size) {
      chunks.push(full);
    } else {
      const separators = ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' '];
      const subChunks = recursiveSplit(section.content.trim(), separators, size, minSize);
      for (let i = 0; i < subChunks.length; i += 1) {
        if (i === 0 && section.heading) {
          chunks.push(section.heading + '\n\n' + subChunks[i]);
        } else {
          chunks.push(subChunks[i]);
        }
      }
    }
  }

  return chunks;
}

export function chunkText(text, strategy, opts) {
  const resolvedOpts = {
    size: opts?.size ?? DEFAULTS.size,
    overlap: opts?.overlap ?? DEFAULTS.overlap,
    minSize: opts?.minSize ?? DEFAULTS.minSize,
  };

  if (!text || text.trim().length === 0) return [];

  switch (strategy) {
    case 'fixed':
      return chunkFixed(text, resolvedOpts);
    case 'paragraph':
      return chunkParagraph(text, resolvedOpts);
    case 'markdown':
      return chunkMarkdown(text, resolvedOpts);
    default:
      throw new Error(`Unknown chunking strategy: ${strategy}`);
  }
}

