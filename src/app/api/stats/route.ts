import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
}

interface NpmDownloads {
  downloads: number;
}

export async function GET() {
  try {
    const [githubRes, npmRes] = await Promise.all([
      fetch('https://api.github.com/repos/mrlynn/voyageai-cli', {
        headers: { Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 3600 },
      }),
      fetch('https://api.npmjs.org/downloads/point/last-month/voyageai-cli', {
        next: { revalidate: 3600 },
      }),
    ]);

    const github: GitHubRepo = await githubRes.json();
    const npm: NpmDownloads = await npmRes.json();

    return NextResponse.json({
      stars: github.stargazers_count || 0,
      forks: github.forks_count || 0,
      downloads: npm.downloads || 0,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({
      stars: 0,
      forks: 0,
      downloads: 0,
    });
  }
}
