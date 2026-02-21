'use client';

import {
  Box,
  Button,
  Chip,
  Container,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DownloadIcon from '@mui/icons-material/Download';
import AppleIcon from '@mui/icons-material/Apple';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import ComputerIcon from '@mui/icons-material/Computer';
import VerifiedIcon from '@mui/icons-material/Verified';
import UpdateIcon from '@mui/icons-material/Update';
import SpeedIcon from '@mui/icons-material/Speed';
import SearchIcon from '@mui/icons-material/Search';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { palette } from '@/theme/theme';
import ScreenshotCard from '@/components/ScreenshotCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const platforms = [
  {
    name: 'macOS',
    ext: 'DMG',
    icon: <AppleIcon />,
    description: 'Universal Binary (Intel & Apple Silicon)',
  },
  {
    name: 'Windows',
    ext: 'EXE',
    icon: <DesktopWindowsIcon />,
    description: 'Windows 10/11 (64-bit)',
  },
  {
    name: 'Linux',
    ext: 'AppImage',
    icon: <ComputerIcon />,
    description: 'AppImage (portable)',
  },
];

const features = [
  {
    icon: <SearchIcon sx={{ fontSize: 40, color: palette.accent }} />,
    title: 'Text Embedding',
    description:
      'Generate embeddings with Voyage AI models through an intuitive interface. Supports all embedding models with live dimension display.',
  },
  {
    icon: <CompareArrowsIcon sx={{ fontSize: 40, color: palette.blue }} />,
    title: 'Document Comparison',
    description:
      'Compare document similarity using vector search. Upload files, compare chunks, and visualize semantic relationships.',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 40, color: palette.purple }} />,
    title: 'Benchmarking',
    description:
      'Run performance benchmarks across models. Test throughput, latency, and cost efficiency with real-world workloads.',
  },
  {
    icon: <DashboardIcon sx={{ fontSize: 40, color: palette.accent }} />,
    title: 'Visual Exploration',
    description:
      'Explore embeddings with visual tools. View vector spaces, run similarity searches, and understand model behavior.',
  },
];

const screenshots = [
  {
    image: '/screenshots/SCR-20260220-hhyo.png',
    title: 'Embedding Interface',
    description: 'Generate embeddings with a clean, intuitive interface. Choose from multiple Voyage AI models and output formats.',
  },
  {
    image: '/screenshots/SCR-20260220-hiaa.png',
    title: 'Document Comparison',
    description: 'Compare text similarity side-by-side. Visualize semantic relationships and vector distances between documents.',
  },
  {
    image: '/screenshots/SCR-20260220-hibw.png',
    title: 'Rerank & Search',
    description: 'Reorder documents by relevance to a query. Leverage Voyage AI\'s reranking models for improved search results.',
  },
  {
    image: '/screenshots/SCR-20260220-hijr.png',
    title: 'Code Generation',
    description: 'Generate production-ready code snippets for your framework. Export client configurations for Node.js, Python, and more.',
  },
  {
    image: '/screenshots/SCR-20260220-hihg.png',
    title: 'Multimodal Embeddings',
    description: 'Embed images, video, and text in the same vector space. Compare different modalities with unified embeddings.',
  },
  {
    image: '/screenshots/SCR-20260220-hhrk.png',
    title: 'Model Information',
    description: 'Explore Voyage AI\'s complete model catalog. View specifications, pricing, and capabilities for each embedding model.',
  },
];

export default function DesktopAppPage() {
  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: palette.bg, minHeight: '100vh', pt: 8 }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            label="Desktop App"
            size="small"
            sx={{
              mb: 2,
              bgcolor: `${palette.blue}20`,
              color: palette.blue,
              border: `1px solid ${palette.blue}33`,
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 800,
              color: palette.text,
              mb: 3,
              lineHeight: 1.2,
            }}
          >
            The Complete RAG Toolkit
            <br />
            <Box component="span" sx={{ color: palette.accent }}>
              On Your Desktop
            </Box>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: palette.textMuted,
              mb: 4,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            A beautiful Electron interface wrapping the full power of VAI CLI.
            Embed text, compare documents, run benchmarks, and explore vector
            search — all with a visual interface.
          </Typography>

          {/* Trust Badges */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              mb: 5,
              flexWrap: 'wrap',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: palette.textDim,
              }}
            >
              <VerifiedIcon sx={{ fontSize: 20, color: palette.accent }} />
              <Typography variant="body2">Signed &amp; notarized</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: palette.textDim,
              }}
            >
              <UpdateIcon sx={{ fontSize: 20, color: palette.accent }} />
              <Typography variant="body2">Auto-updates</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: palette.textDim,
              }}
            >
              <DownloadIcon sx={{ fontSize: 20, color: palette.accent }} />
              <Typography variant="body2">Free &amp; open source</Typography>
            </Box>
          </Box>

          {/* Download Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {platforms.map((p) => (
              <Button
                key={p.name}
                variant="outlined"
                size="large"
                startIcon={p.icon}
                href="https://github.com/mrlynn/voyageai-cli/releases"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderColor: palette.border,
                  color: palette.text,
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    borderColor: palette.accent,
                    bgcolor: 'rgba(0, 212, 170, 0.05)',
                  },
                }}
              >
                {p.name}
                <Box
                  component="span"
                  sx={{ ml: 0.8, color: palette.textMuted, fontSize: '0.85rem' }}
                >
                  .{p.ext}
                </Box>
              </Button>
            ))}
          </Box>
          <Typography
            variant="body2"
            sx={{ color: palette.textDim, mt: 2, fontSize: '0.9rem' }}
          >
            Also available via npm, Homebrew, and Docker
          </Typography>
        </Box>
      </Container>

      {/* Screenshot Gallery */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontWeight: 700,
              color: palette.text,
              mb: 2,
            }}
          >
            See it in action
          </Typography>
          <Typography
            sx={{
              color: palette.textMuted,
              fontSize: '1.1rem',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Explore the desktop app&apos;s intuitive interface and powerful
            features
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {screenshots.map((screenshot, index) => (
            <Grid key={index} size={{ xs: 12, md: 6 }}>
              <ScreenshotCard
                image={screenshot.image}
                title={screenshot.title}
                description={screenshot.description}
                showWindowChrome={false}
                aspectRatio={1.9}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontWeight: 700,
              color: palette.text,
              mb: 2,
            }}
          >
            Everything you need
          </Typography>
          <Typography
            sx={{
              color: palette.textMuted,
              fontSize: '1.1rem',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            All the power of the CLI with the convenience of a visual interface
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  p: 4,
                  bgcolor: palette.bgCard,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 3,
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: palette.accent,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography
                  variant="h6"
                  sx={{ color: palette.text, mb: 1.5, fontWeight: 600 }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  sx={{ color: palette.textMuted, fontSize: '0.95rem', lineHeight: 1.6 }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Getting Started Section */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            p: { xs: 4, md: 6 },
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: palette.text, mb: 2, fontWeight: 700 }}
          >
            Ready to get started?
          </Typography>
          <Typography
            sx={{ color: palette.textMuted, mb: 4, fontSize: '1.05rem' }}
          >
            Download the desktop app for your platform, or install via your
            preferred package manager
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              size="large"
              href="https://github.com/mrlynn/voyageai-cli/releases"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadIcon />}
              sx={{
                bgcolor: palette.accent,
                color: palette.bg,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                '&:hover': { bgcolor: palette.accentDim },
              }}
            >
              Download Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="https://docs.vaicli.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderColor: palette.border,
                color: palette.text,
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: palette.accent,
                  bgcolor: 'rgba(0, 212, 170, 0.05)',
                },
              }}
            >
              View Documentation
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Platform Details */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography
          variant="h5"
          sx={{
            color: palette.text,
            mb: 4,
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          Platform Requirements
        </Typography>
        <Grid container spacing={3}>
          {platforms.map((platform) => (
            <Grid key={platform.name} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 3,
                  bgcolor: palette.bgSurface,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ color: palette.accent, mb: 1.5 }}>{platform.icon}</Box>
                <Typography
                  variant="h6"
                  sx={{ color: palette.text, mb: 1, fontWeight: 600 }}
                >
                  {platform.name}
                </Typography>
                <Typography sx={{ color: palette.textMuted, fontSize: '0.9rem' }}>
                  {platform.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
    <Footer />
    </>
  );
}
