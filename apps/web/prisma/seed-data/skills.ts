export const skills = [
  // ============================================================
  // EXISTING OPENSQUAD SKILLS (from SKILL.md files)
  // ============================================================
  {
    name: 'apify',
    type: 'mcp' as const,
    description:
      'Web scraping and automation platform. Extract data from any website, run pre-built scrapers (Actors), and automate web workflows using thousands of ready-made tools from the Apify Store.',
    icon: '🕷️',
    config: JSON.stringify({
      server_name: 'apify',
      command: 'npx',
      args: ['-y', '@apify/actors-mcp-server@latest'],
    }),
    env: JSON.stringify(['APIFY_TOKEN']),
    categories: JSON.stringify(['scraping', 'data', 'automation']),
    implementation: `# Apify Web Scraper

## When to use

Use Apify when you need to extract data from websites, scrape social media profiles, run search engine queries, or automate web data collection workflows. Apify provides thousands of pre-built scrapers (called Actors) that handle common scraping tasks out of the box.

## Instructions

You have access to Apify tools for web scraping and data extraction.

### Key capabilities

- Use Apify Actors (pre-built scrapers) to extract data from websites
- Popular Actors: web-scraper, instagram-scraper, google-search-scraper, youtube-scraper, twitter-scraper, tiktok-scraper
- Each Actor has its own input schema -- check documentation before running

### Best practices

- Start with the simplest Actor that meets the need
- Use \\\`maxItems\\\` to limit results and avoid excessive costs
- Check Actor pricing before running (some have per-result costs)
- Parse results and extract only the fields you need

## Available operations

- **Run Actor** -- Execute any Apify Actor with custom input parameters
- **Web Scraping** -- Extract structured data from any website
- **Social Media Scraping** -- Scrape profiles, posts, and engagement data from Instagram, YouTube, Twitter/X, TikTok
- **Search Scraping** -- Run Google, Bing, or other search engine queries and collect results
- **Data Export** -- Retrieve scraped datasets in JSON format`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'blotato',
    type: 'mcp' as const,
    description:
      'Social media publishing and scheduling platform. Publish and schedule posts across Instagram, LinkedIn, Twitter/X, TikTok, YouTube, and more. Upload media and monitor post status.',
    icon: '📱',
    config: JSON.stringify({
      server_name: 'blotato',
      transport: 'http',
      url: 'https://mcp.blotato.com/mcp',
      headers: {
        'blotato-api-key': 'BLOTATO_API_KEY',
      },
    }),
    env: JSON.stringify(['BLOTATO_API_KEY']),
    categories: JSON.stringify([
      'social-media',
      'automation',
      'publishing',
      'scheduling',
    ]),
    implementation: `# Blotato Publisher

## When to use

Use Blotato when you need to publish or schedule social media posts across multiple platforms from a single interface. Blotato supports Instagram, LinkedIn, Twitter/X, TikTok, YouTube, and more. It handles media uploads, post scheduling, and status monitoring.

## Instructions

You have access to Blotato for social media publishing.

### Key workflow

1. Use \\\`blotato_list_accounts\\\` to get account IDs and platforms
2. If post includes images or videos, upload them with \\\`blotato_upload_media\\\` first and use the returned media IDs in \\\`blotato_create_post\\\`
3. Use \\\`blotato_create_post\\\` to publish or schedule
4. Use \\\`blotato_get_post_status\\\` to confirm success

### Best practices

- Always call \\\`blotato_list_accounts\\\` first to get valid account IDs
- For scheduled posts, use ISO 8601 format for datetime
- After posting, poll \\\`blotato_get_post_status\\\` until status is "published" or "scheduled"
- If status is "failed", report the error details to the user

### Requirements

- Blotato account required (blotato.com)
- API key must be configured (Blotato Settings > API section)

## Available operations

- **List Accounts** -- Retrieve connected social media accounts and their platform types
- **Upload Media** -- Upload images and videos for use in posts
- **Create Post** -- Publish or schedule a post to one or more platforms
- **Get Post Status** -- Monitor publishing status (published, scheduled, failed)
- **Multi-platform Publishing** -- Post the same content across Instagram, LinkedIn, Twitter/X, TikTok, YouTube simultaneously`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'canva',
    type: 'mcp' as const,
    description:
      'Create, search, autofill, and export designs from Canva. Enables agents to generate visual content, fill templates with brand assets, and export in various formats.',
    icon: '🎨',
    config: JSON.stringify({
      server_name: 'canva',
      transport: 'http',
      url: 'https://mcp.canva.com/mcp',
    }),
    env: JSON.stringify([]),
    categories: JSON.stringify(['design', 'ui', 'assets', 'automation']),
    implementation: `# Canva Connect

## When to use

Use Canva when you need to create, search, or export visual designs. This skill connects to the user's Canva account via OAuth and enables agents to generate presentations, social media posts, logos, and other visual content. It also supports autofilling templates with brand assets and exporting designs in various formats.

## Instructions

You have access to Canva through the Canva Connect MCP server.

### Key capabilities

- Create new designs (presentations, social posts, logos, etc.)
- Autofill templates with content (text, images, brand elements)
- Search existing designs in the user's Canva account
- Export designs as PDF or image files

### Best practices

- Use templates when possible -- faster and more on-brand
- When autofilling, match content to template placeholder names
- Export in the format most useful for the pipeline (PNG for social, PDF for documents)
- Respect the user's Canva plan limitations (some features require paid plans)

### Requirements

- User needs a Canva account (free or paid)
- OAuth authorization is required on first use (browser popup)
- Autofill templates require a Canva paid plan

## Available operations

- **Create Design** -- Generate new designs from scratch or templates
- **Search Designs** -- Find existing designs in the user's Canva account
- **Autofill Template** -- Fill template placeholders with text, images, and brand elements
- **Export Design** -- Export designs as PDF, PNG, JPG, or other formats
- **Browse Templates** -- Search Canva's template library for the right starting point`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'image_creator',
    type: 'mcp' as const,
    description:
      'Renders HTML/CSS into production-ready images via Playwright. Accepts complete HTML content, opens it in a headless browser at the specified viewport, and captures a pixel-perfect screenshot. Generic engine -- any visual format is defined by the HTML template.',
    icon: '🖼️',
    config: JSON.stringify({
      server_name: 'playwright',
    }),
    env: JSON.stringify([]),
    categories: JSON.stringify(['design', 'automation', 'images']),
    implementation: `# Image Creator

## When to use

Use the Visual Renderer when you need to generate production-ready images from HTML/CSS. This skill uses Playwright to render complete, self-contained HTML files in a headless browser and capture pixel-perfect screenshots. It is the primary engine for creating social media graphics, carousel slides, infographics, and any other visual content defined by HTML templates.

## Instructions

### Core Workflow

1. **Generate HTML** -- Write a complete, self-contained HTML file with inline CSS. The HTML IS the design -- all styling, layout, fonts, colors, and content must be embedded.

2. **Save HTML** -- Write the HTML file to the squad's output folder (e.g., \\\`output/slides/slide-01.html\\\`)

3. **Start HTTP server** -- Before rendering, start a local HTTP server in the squad's output folder:
   \\\`\\\`\\\`bash
   python -m http.server 8765 --directory "OUTPUT_DIR" &
   for i in $(seq 1 30); do curl -s http://localhost:8765 > /dev/null 2>&1 && break || sleep 0.1; done
   \\\`\\\`\\\`
   Replace OUTPUT_DIR with the actual absolute path to the output folder (quote paths that contain spaces).

4. **Render** -- Use Playwright to:
   - \\\`browser_navigate\\\` to \\\`http://localhost:8765/slide-01.html\\\` (filename only, not full path)
   - \\\`browser_resize\\\` to target viewport dimensions
   - \\\`browser_take_screenshot\\\` to save as PNG

5. **Verify** -- Read the screenshot to confirm quality. Re-render if needed.

6. **Stop server** -- After all slides are rendered, stop the HTTP server:
   \\\`\\\`\\\`bash
   pkill -f "http.server 8765" 2>/dev/null || true
   \\\`\\\`\\\`

### Viewport Presets (width x height)

Use these standard dimensions:
- Instagram Post: 1080 x 1080
- Instagram Carousel: 1080 x 1440
- Instagram Story/Reel: 1080 x 1920
- Facebook Post: 1200 x 630
- Twitter/X Post: 1200 x 675
- LinkedIn Post: 1200 x 627
- YouTube Thumbnail: 1280 x 720
- Custom: as specified by the squad

### HTML Template Guidelines

The HTML you generate MUST:
- Be self-contained (inline CSS, no external dependencies)
- Use web-safe fonts OR Google Fonts via \\\`@import\\\`
- Embed images as absolute paths or base64 data URIs
- Set exact body dimensions matching the viewport
- Use \\\`margin: 0; padding: 0; overflow: hidden\\\` on body
- Account for device pixel ratio if high-res needed

Example minimal structure:
\\\`\\\`\\\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1440px; overflow: hidden; }
    /* ... your design ... */
  </style>
</head>
<body>
  <!-- Your content -->
</body>
</html>
\\\`\\\`\\\`

### Batch Rendering (Carousels/Multi-slide)

For multi-image outputs like carousels:
1. Generate one HTML file per slide
2. Start the HTTP server **once** before the batch (step 3 of Core Workflow)
3. Render each slide sequentially (step 4 repeated per slide)
4. Stop the HTTP server **once** after all slides are done (step 6 of Core Workflow)
5. Name output files with zero-padded numbers: slide-01.png, slide-02.png, slide-03.png
6. Keep all slides at the same viewport dimensions

### Best Practices

- Always verify the first rendered image before batch rendering
- Use CSS Grid/Flexbox for layout -- most reliable across renderers
- Avoid animations/transitions (static screenshot only)
- For rounded corners on images, use CSS \\\`border-radius\\\` + \\\`overflow\\\`
- For emoji rendering, rely on system fonts (Windows: Segoe UI Emoji)
- Test text overflow -- ensure no content is clipped unexpectedly
- Keep HTML files alongside output PNGs for easy re-rendering

### Typography & Readability Rules

Text must be legible in the target platform's smallest viewing context (mobile feed for social platforms). Text inside linked or embedded image files (JPG, PNG, base64 assets) is decorative and exempt. All HTML text nodes and inline SVG text are subject to these rules.

These are HARD minimums -- never go below them for readable text.

#### Minimum Font Sizes by Platform

| Text Role        | Instagram Post/Carousel | Instagram Story/Reel | LinkedIn/Facebook | YouTube Thumb |
|------------------|------------------------|----------------------|-------------------|---------------|
| Hero / Display   | 58px                   | 56px                 | 40px              | 60px          |
| Heading          | 43px                   | 42px                 | 32px              | 36px          |
| Body / Bullets   | 34px                   | 32px                 | 24px              | 36px          |
| Caption / Footer | 24px                   | 20px                 | 20px              | 32px          |

**Universal rule**: No text element meant to be read may use a font size smaller than 20px, on any platform.

#### Font Weight

- Body text and above: use font-weight 500+ (medium/semibold/bold)
- Caption text: font-weight 500+ strongly recommended; 400 only with explicit high-contrast background (4.5:1 ratio minimum)
- Avoid thin/light weights (100-300) for any readable text

#### Verification Checklist

Before calling \\\`browser_take_screenshot\\\`, scan your HTML and confirm:
- All text elements use explicit px sizes (not em/rem that could resolve smaller)
- No heading is below the Heading minimum for the target platform
- No body/bullet text is below the Body minimum
- No footer or metadata text is below the Caption minimum
- No readable text uses font-weight below 500 (caption at 400 only with 4.5:1 contrast background)

## Available operations

- **Render HTML to PNG** -- Convert self-contained HTML/CSS into a pixel-perfect screenshot
- **Batch Render** -- Render multiple slides/pages sequentially for carousels and multi-image content
- **Viewport Resize** -- Set precise viewport dimensions for any target platform
- **Quality Verification** -- Visually inspect rendered output and re-render if needed`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'image_fetcher',
    type: 'hybrid' as const,
    description:
      'Acquires visual assets from multiple sources: web image search, live website screenshots via Playwright, and user-provided files. Organizes assets in the squad\'s reference folder.',
    icon: '🔍',
    config: JSON.stringify({
      server_name: 'playwright',
    }),
    env: JSON.stringify([]),
    categories: JSON.stringify(['assets', 'scraping', 'automation', 'images']),
    implementation: `# Asset Fetcher

## When to use

Use the Asset Fetcher when you need to acquire visual assets for content creation. It supports three acquisition modes: web image search, live website screenshots via Playwright, and organizing user-provided files. All assets are saved to the squad's reference or output folder with descriptive filenames and metadata.

## Instructions

### Capabilities

1. **Web Image Search** -- Use the native web_search tool to find images by keyword. Evaluate results and download the best match.

2. **Live Screenshot** -- Use Playwright MCP to navigate to a URL, set viewport dimensions, and capture a screenshot.

3. **Asset Organization** -- Save all acquired assets with descriptive filenames in the squad's reference/ or output/ folder.

### Screenshot Modes

- **viewport** -- Capture only the visible viewport area (default)
- **full_page** -- Capture the entire scrollable page
- **selector** -- Capture a specific CSS selector element

### Screenshot Workflow

When taking a screenshot:
1. Navigate to the URL with \\\`browser_navigate\\\`
2. Set viewport: \\\`browser_resize\\\` with width/height for target format
   - Instagram post: 1080x1080
   - Instagram carousel: 1080x1440
   - Story/Reel: 1080x1920
   - Generic: 1280x720
3. Wait for page load (\\\`browser_wait_for\\\` if needed)
4. Capture: \\\`browser_take_screenshot\\\`
5. Save to reference folder with descriptive filename

### Asset Metadata

After acquiring each asset, document in your output:
- \\\`path\\\`: local file path
- \\\`width/height\\\`: image dimensions
- \\\`source_type\\\`: "web_search" | "screenshot" | "user_provided"
- \\\`original_url\\\`: source URL (if applicable)

### Cache Policy

Before fetching an asset:
- Check if the reference folder already has a matching file
- Use deterministic filenames based on source (e.g., URL slug + viewport)
- Reuse existing assets to avoid redundant fetches

### Safety

- Timeout: max 30s per screenshot, skip and warn if exceeded
- Maximum screenshot dimensions: 1920x1920px
- Block \\\`file://\\\` protocol URLs
- Block localhost and private IP ranges (127.0.0.1, 10.x, 192.168.x)

### Best Practices

- Prefer screenshots over web search for product/tool pages (images are often outdated)
- Save with descriptive names: \\\`gemini-benchmark-chart.png\\\` not \\\`image1.png\\\`
- Normalize URLs before caching (strip tracking params)
- Document all acquired assets with metadata for downstream tools

## Available operations

- **Web Image Search** -- Find and download images by keyword from the web
- **Live Screenshot** -- Capture viewport, full-page, or element screenshots of any URL
- **Asset Organization** -- Save and catalog assets with descriptive filenames and metadata
- **Cache Check** -- Detect and reuse previously fetched assets to avoid redundant downloads`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'instagram_publisher',
    type: 'script' as const,
    description:
      'Publishes Instagram carousel posts from local images. Uploads images to imgbb for temporary public hosting, creates Instagram media containers via the Graph API, and publishes the carousel. Supports 2-10 images per post and retrieves the real post permalink.',
    icon: '📸',
    config: JSON.stringify({
      path: 'scripts/publish.js',
      runtime: 'node',
      invoke:
        'node --env-file=.env {skill_path}/scripts/publish.js --images "{images}" --caption "{caption}"',
    }),
    env: JSON.stringify([
      'INSTAGRAM_ACCESS_TOKEN',
      'INSTAGRAM_USER_ID',
      'IMGBB_API_KEY',
    ]),
    categories: JSON.stringify(['social-media', 'publishing', 'instagram']),
    implementation: `# Instagram Publisher

## When to use

Use the Instagram Publisher when you need to publish carousel posts directly to an Instagram Business account. This skill handles the full workflow: uploading images to a temporary public host (imgbb), creating Instagram media containers via the Graph API, and publishing the carousel. It supports 2-10 JPEG images per post.

## Instructions

### Workflow

1. List JPEG files in \\\`squads/{squad}/output/images/\\\` sorted by name.
   If no files found: stop and ask the user to add images before continuing.
2. Present the image list to the user with AskUserQuestion to confirm order.
3. Extract the caption from the content draft:
   - Use the hook slide text + CTA slide text
   - Max 2200 characters (Instagram limit)
4. Run the publish script:
   \\\`\\\`\\\`
   node --env-file=.env squads/{squad}/tools/publish.js \\\\
     --images "<comma-separated-ordered-paths>" \\\\
     --caption "<caption>"
   \\\`\\\`\\\`
   Add \\\`--dry-run\\\` to test the full flow without actually publishing.
5. On success: save the post URL and post ID to the step output file.
6. On failure: display the error and ask the user how to proceed.

### Constraints

- Images: JPEG only, 2-10 per carousel
- Caption: max 2200 characters
- Requires Instagram Business account (not Personal or Creator)
- Rate limit: 25 API-published posts per 24 hours

### Setup (first-time)

Copy \\\`.env.example\\\` to \\\`.env\\\` and fill in the three required variables:

\\\`\\\`\\\`
IMGBB_API_KEY=
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
\\\`\\\`\\\`

#### IMGBB_API_KEY

1. Go to [https://api.imgbb.com/](https://api.imgbb.com/)
2. Click **"Get API Key"** and create a free account (no credit card)
3. After login, your key appears on the home page
4. Copy and paste into \\\`.env\\\`

#### INSTAGRAM_ACCESS_TOKEN

Prerequisite: Instagram Business account connected to a Facebook Page, and an app created at [developers.facebook.com](https://developers.facebook.com/) (type: **Business**).

**To obtain a long-lived token (valid 60 days):**

1. Go to your app > **Graph API Explorer**
2. In the top dropdown, select your app
3. Click **"Generate Access Token"**
4. Enable the permissions:
   - \\\`instagram_content_publish\\\`
   - \\\`instagram_basic\\\`
   - \\\`pages_read_engagement\\\`
5. Click **"Generate Access Token"** and authorize -- you will receive a short-lived token (1h)
6. Convert to long-lived (60 days) with this GET:
   \\\`\\\`\\\`
   https://graph.facebook.com/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id={APP_ID}
     &client_secret={APP_SECRET}
     &fb_exchange_token={SHORT_TOKEN}
   \\\`\\\`\\\`
   _(APP_ID and APP_SECRET: your app > Settings > Basic)_
7. Copy the \\\`access_token\\\` from the response and paste into \\\`.env\\\`

> The token expires in 60 days. Repeat the process to renew.

#### INSTAGRAM_USER_ID

1. In Graph API Explorer (with the token above), make a GET to:
   \\\`\\\`\\\`
   /me/accounts
   \\\`\\\`\\\`
2. Find your **Facebook Page** in the response and note the \\\`id\\\`
3. Make a GET to:
   \\\`\\\`\\\`
   /{page-id}?fields=instagram_business_account
   \\\`\\\`\\\`
4. Copy the \\\`id\\\` inside \\\`instagram_business_account\\\` -- that is your User ID

## Available operations

- **Publish Carousel** -- Upload images and publish a carousel post to Instagram
- **Dry Run** -- Test the full publishing flow without actually posting (use \\\`--dry-run\\\` flag)
- **Image Upload** -- Upload local JPEG images to imgbb for temporary public hosting
- **Status Check** -- Monitor media container processing status before publishing`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'agent_creator',
    type: 'prompt' as const,
    description:
      'Guides creation and maintenance of best-practice files for the best-practices library. Handles format validation, cross-references, versioning, and catalog consistency.',
    icon: '🤖',
    config: JSON.stringify({}),
    env: JSON.stringify([]),
    categories: JSON.stringify(['agents', 'creation', 'management']),
    implementation: `# Best-Practice Creator -- Workflow

Use this workflow when creating a new best-practice file for the best-practices library.

## Pre-flight Checks

1. **Scan existing best-practice files**: Read the best-practices catalog. Extract \\\`id\\\`, \\\`name\\\`, \\\`whenToUse\\\`, \\\`file\\\` from each entry.
2. **Check for overlap**: Verify the new best-practice file doesn't duplicate an existing entry's \\\`whenToUse\\\` scope. If there's overlap, clarify the differentiation before proceeding.
3. **List available skills**: Read all skill files. Extract \\\`name\\\`, \\\`description\\\`, \\\`type\\\` from each -- these may inform the best-practice file's content.

## Creation Checklist

For each new best-practice file, ensure ALL of the following:

### Frontmatter (YAML)

- [ ] \\\`id\\\`: lowercase kebab-case (e.g., \\\`copywriting\\\`)
- [ ] \\\`name\\\`: Display name for catalog listing (e.g., \\\`"Copywriting & Persuasive Writing"\\\`)
- [ ] \\\`whenToUse\\\`: Multi-line with positive scope AND "NOT for: ..." negative scope referencing other best-practice IDs
- [ ] \\\`version\\\`: \\\`"1.0.0"\\\` for new best-practice files

### Body (Markdown) -- All sections mandatory

- [ ] **Core Principles**: 6+ numbered domain-specific decision rules, each with a bold title and detailed explanation
- [ ] **Techniques & Frameworks**: Concrete methods, models, or processes practitioners use in this discipline (e.g., diagnostic steps, framework selections, structural patterns)
- [ ] **Quality Criteria**: 4+ checkable criteria as \\\`- [ ]\\\` list that can be used to evaluate output
- [ ] **Output Examples**: 2+ complete examples, 15+ lines each, realistic NOT template-like
- [ ] **Anti-Patterns**: Never Do (4+) + Always Do (3+), each with explanation
- [ ] **Vocabulary Guidance**: Terms/phrases to Always Use (5+), Terms/phrases to Never Use (3+), Tone Rules (2+)

### Quality Minimums

| Section | Minimum |
|---------|---------|
| Total file lines | 200+ |
| Core Principles | 6+ numbered rules |
| Techniques & Frameworks | 3+ concrete techniques |
| Vocabulary Always Use | 5+ terms |
| Vocabulary Never Use | 3+ terms |
| Output Examples | 2 complete, 15+ lines each |
| Anti-Patterns (Never Do) | 4+ |
| Anti-Patterns (Always Do) | 3+ |
| Quality Criteria | 4+ checkable items |

## Post-Creation Steps

### 1. Update existing best-practice files' whenToUse

For each existing best-practice file whose scope overlaps with the new one:
- Add a "NOT for: {overlapping-scope} -> See {new-best-practice-id}" line to their \\\`whenToUse\\\`
- Bump their version (patch increment)

### 2. Update catalog

Add a new entry to the catalog with:
- \\\`id\\\`: matching the frontmatter \\\`id\\\`
- \\\`name\\\`: matching the frontmatter \\\`name\\\`
- \\\`whenToUse\\\`: single-line summary of the scope (positive only, no "NOT for")
- \\\`file\\\`: \\\`{id}.md\\\`

Place it under the appropriate section comment (Discipline or Platform best practices).

### 3. File placement

Save to the best-practices directory as \\\`{id}.md\\\`.

### 4. Validation

Re-read the created file and verify:
- [ ] All checklist items above are present
- [ ] YAML frontmatter parses correctly (no syntax errors)
- [ ] \\\`whenToUse\\\` references only existing best-practice IDs
- [ ] Output examples are realistic, not template placeholders
- [ ] File exceeds 200 lines
- [ ] Corresponding entry exists in catalog

---

# Best-Practice Updater -- Workflow

Use this workflow when updating best-practice files in the library.

## Versioning Rules (Semver)

| Change Type | Version Bump | Examples |
|-------------|-------------|----------|
| **Patch** (x.x.X) | Fix typos, adjust wording, minor refinements | Fix anti-pattern phrasing, correct a vocabulary term |
| **Minor** (x.X.0) | Add new content, extend capabilities | Add new principle, new output example, new technique |
| **Major** (X.0.0) | Rewrite or restructure significantly | Rewrite core principles, fundamentally change scope |

Always update the \\\`version\\\` field in the YAML frontmatter after any change.

## Update Scenarios

### When a best-practice file is removed from the library

1. Get the removed best-practice file's \\\`id\\\`
2. Remove its entry from the catalog
3. Scan ALL remaining best-practice files
4. For each file, check if the removed ID is referenced in \\\`whenToUse\\\`
   - Look for patterns: "NOT for: ... -> See {removed-id}"
5. If found, remove that "NOT for" line
6. Bump the affected files' version (patch: x.x.X)

### When a new best-practice file is added to the library

1. Read the new best-practice file's \\\`whenToUse\\\` -- identify its scope
2. Scan existing best-practice files for overlapping scope
3. Add "NOT for: {new-scope} -> See {new-id}" where appropriate
4. Bump affected files' version (patch)
5. Ensure the new entry exists in the catalog

### When updating a best-practice file's content

1. Make the content changes
2. Verify ALL mandatory sections still exist:
   - [ ] Core Principles (6+ rules)
   - [ ] Techniques & Frameworks (3+ techniques)
   - [ ] Quality Criteria (4+ checkable items)
   - [ ] Output Examples (2+ complete examples)
   - [ ] Anti-Patterns (Never Do + Always Do)
   - [ ] Vocabulary Guidance (Always Use, Never Use, Tone Rules)
3. Bump version according to semver rules above
4. If the \\\`whenToUse\\\` scope changed, update cross-references in other best-practice files and in the catalog

### When updating a best-practice file's whenToUse scope

This is the most impactful change -- it affects how the Architect selects best practices during squad creation.

1. Document the old scope and new scope
2. Update the best-practice file's \\\`whenToUse\\\` field
3. Scan ALL other best-practice files' \\\`whenToUse\\\` for references to this ID
4. Update cross-references to reflect the new scope
5. Update the \\\`whenToUse\\\` summary in the catalog
6. Bump version (minor if scope expanded, patch if scope narrowed)

## Validation Checklist

After ANY update, verify:

- [ ] Version was bumped correctly (patch/minor/major per rules above)
- [ ] All mandatory sections still present and non-empty
- [ ] \\\`whenToUse\\\` cross-references are consistent across ALL best-practice files
- [ ] No broken cross-references to removed best-practice IDs
- [ ] Output examples are still realistic and complete
- [ ] File still exceeds 200 lines minimum
- [ ] Catalog entry is in sync with frontmatter (\\\`id\\\`, \\\`name\\\`, \\\`whenToUse\\\`)`,
    isBuiltin: true,
    version: '2.0.0',
  },

  {
    name: 'skill_creator',
    type: 'prompt' as const,
    description:
      'Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill for their squads, update or optimize an existing skill, run evals to test a skill, or benchmark skill performance. Supports all skill types: MCP integrations, custom scripts, hybrid, and behavioral prompts.',
    icon: '🛠️',
    config: JSON.stringify({}),
    env: JSON.stringify([]),
    categories: JSON.stringify(['skills', 'creation', 'testing', 'development']),
    implementation: `# Skill Creator

A skill for creating new skills and iteratively improving them.

At a high level, the process of creating a skill goes like this:

- Decide what you want the skill to do and roughly how it should do it
- Write a draft of the skill
- Create a few test prompts and run an agent with the skill injected into its context
- Help the user evaluate the results both qualitatively and quantitatively
  - While the runs happen in the background, draft some quantitative evals if there aren't any (if there are some, you can either use as is or modify if you feel something needs to change about them). Then explain them to the user (or if they already existed, explain the ones that already exist)
  - Use the eval viewer to show the user the results for them to look at, and also let them look at the quantitative metrics
- Rewrite the skill based on feedback from the user's evaluation of the results (and also if there are any glaring flaws that become apparent from the quantitative benchmarks)
- Repeat until you're satisfied
- Expand the test set and try again at larger scale

Your job when using this skill is to figure out where the user is in this process and then jump in and help them progress through these stages. So for instance, maybe they're like "I want to make a skill for X". You can help narrow down what they mean, write a draft, write the test cases, figure out how they want to evaluate, run all the prompts, and repeat.

On the other hand, maybe they already have a draft of the skill. In this case you can go straight to the eval/iterate part of the loop.

Of course, you should always be flexible and if the user is like "I don't need to run a bunch of evaluations, just vibe with me", you can do that instead.

## Communicating with the user

The skill creator is liable to be used by people across a wide range of familiarity with coding jargon. Pay attention to context cues to understand how to phrase your communication! In the default case:

- "evaluation" and "benchmark" are borderline, but OK
- for "JSON" and "assertion" you want to see serious cues from the user that they know what those things are before using them without explaining them

It's OK to briefly explain terms if you're in doubt, and feel free to clarify terms with a short definition if you're unsure if the user will get it.

---

## Creating a skill

### Capture Intent

Start by understanding the user's intent. The current conversation might already contain a workflow the user wants to capture (e.g., they say "turn this into a skill"). If so, extract answers from the conversation history first -- the tools used, the sequence of steps, corrections the user made, input/output formats observed. The user may need to fill the gaps, and should confirm before proceeding to the next step.

1. What should this skill enable agents to do?
2. When should this skill be used? (what user phrases/contexts/squad scenarios)
3. What's the expected output format?
4. Should we set up test cases to verify the skill works? Skills with objectively verifiable outputs (file transforms, data extraction, code generation, fixed workflow steps) benefit from test cases. Skills with subjective outputs (writing style, art) often don't need them. Suggest the appropriate default based on the skill type, but let the user decide.

5. What type of skill is this?
   - **MCP** -- Connects to an external API via MCP server (e.g., Canva, Apify)
   - **Script** -- Runs a custom script (Node.js, Python, Bash)
   - **Hybrid** -- Both MCP and script components
   - **Prompt** -- Pure behavioral instructions for agents (no external integration)

For MCP skills, also ask:
- What MCP server command? (e.g., \\\`npx -y @package/name\\\`)
- What transport? (stdio or http)
- If http: what URL?
- What environment variables are needed?
- Any authentication headers?

For Script skills, also ask:
- What runtime? (Node.js, Python, Bash)
- What dependencies?
- What's the invocation command?

For Hybrid: ask both sets of questions.
For Prompt: skip -- proceed directly to writing the skill body.

### Interview and Research

Proactively ask questions about edge cases, input/output formats, example files, success criteria, and dependencies. Wait to write test prompts until you've got this part ironed out.

Check available MCPs - if useful for research (searching docs, finding similar skills, looking up best practices), research in parallel via subagents if available, otherwise inline. Come prepared with context to reduce burden on the user.

### Write the SKILL.md

After the interview, generate the SKILL.md with:
- YAML frontmatter following the schema for the chosen type
- Markdown body with instructions for agents

### Skill Writing Guide

#### Anatomy of a Skill

\\\`\\\`\\\`
skill-name/
-- SKILL.md (required)
|  -- YAML frontmatter (name, description, type, version required)
|  -- Markdown instructions
-- Bundled Resources (optional)
    -- scripts/    - Executable code for deterministic/repetitive tasks
    -- references/ - Docs loaded into context as needed
    -- assets/     - Files used in output (templates, icons, fonts)
\\\`\\\`\\\`

#### Progressive Disclosure

Skills use a three-level loading system:
1. **Metadata** (name + description) - Always in context (~100 words)
2. **SKILL.md body** - In context whenever skill is active (<500 lines ideal)
3. **Bundled resources** - As needed (unlimited, scripts can execute without loading)

These word counts are approximate and you can feel free to go longer if needed.

**Key patterns:**
- Keep SKILL.md under 500 lines; if you're approaching this limit, add an additional layer of hierarchy along with clear pointers about where the model using the skill should go next to follow up.
- Reference files clearly from SKILL.md with guidance on when to read them
- For large reference files (>300 lines), include a table of contents

#### Writing Patterns

Prefer using the imperative form in instructions.

**Defining output formats** - You can do it like this:
\\\`\\\`\\\`markdown
## Report structure
ALWAYS use this exact template:
# [Title]
## Executive summary
## Key findings
## Recommendations
\\\`\\\`\\\`

**Examples pattern** - It's useful to include examples:
\\\`\\\`\\\`markdown
## Commit message format
**Example 1:**
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
\\\`\\\`\\\`

### Writing Style

Try to explain to the model why things are important in lieu of heavy-handed musty MUSTs. Use theory of mind and try to make the skill general and not super-narrow to specific examples. Start by writing a draft and then look at it with fresh eyes and improve it.

### Test Cases

After writing the skill draft, come up with 2-3 realistic test prompts -- the kind of thing a real user would actually say. Share them with the user. Then run them.

Save test cases to \\\`evals/evals.json\\\`. Don't write assertions yet -- just the prompts. You'll draft assertions in the next step while the runs are in progress.

## Running and evaluating test cases

This section is one continuous sequence -- don't stop partway through.

### Step 1: Spawn all runs (with-skill AND baseline) in the same turn

For each test case, spawn two subagents in the same turn -- one with the skill, one without. Launch everything at once so it all finishes around the same time.

**With-skill run:**
The with-skill run simulates how an agent operates with this skill injected into its context. The skill's SKILL.md body gets appended to the agent's instructions, just like the pipeline runner does during actual squad execution.

### Step 2: While runs are in progress, draft assertions

Don't just wait for the runs to finish -- you can use this time productively. Draft quantitative assertions for each test case and explain them to the user.

Good assertions are objectively verifiable and have descriptive names -- they should read clearly in the benchmark viewer so someone glancing at the results immediately understands what each one checks.

### Step 3: As runs complete, capture timing data

When each subagent task completes, you receive a notification containing \\\`total_tokens\\\` and \\\`duration_ms\\\`. Save this data immediately.

### Step 4: Grade, aggregate, and launch the viewer

Once all runs are done:
1. **Grade each run** -- evaluate each assertion against the outputs
2. **Aggregate into benchmark** -- produce pass_rate, time, and tokens for each configuration
3. **Do an analyst pass** -- surface patterns the aggregate stats might hide
4. **Launch the viewer** with both qualitative outputs and quantitative data

### Step 5: Read the feedback

When the user tells you they're done, read the feedback. Empty feedback means the user thought it was fine. Focus your improvements on the test cases where the user had specific complaints.

---

## Improving the skill

This is the heart of the loop. You've run the test cases, the user has reviewed the results, and now you need to make the skill better based on their feedback.

### How to think about improvements

1. **Generalize from the feedback.** We're trying to create skills that can be used many times across many different prompts. Rather than put in fiddly overfitty changes, or oppressively constrictive MUSTs, if there's some stubborn issue, you might try branching out and using different metaphors, or recommending different patterns of working.

2. **Keep the prompt lean.** Remove things that aren't pulling their weight. Read the transcripts, not just the final outputs -- if the skill is making the model waste time doing unproductive things, try removing those parts.

3. **Explain the why.** Try hard to explain the **why** behind everything you're asking the model to do. Today's LLMs are smart. They have good theory of mind and when given a good harness can go beyond rote instructions. If you find yourself writing ALWAYS or NEVER in all caps, reframe and explain the reasoning.

4. **Look for repeated work across test cases.** Read the transcripts from the test runs and notice if the subagents all independently wrote similar helper scripts or took the same multi-step approach. That's a strong signal the skill should bundle that script.

### The iteration loop

After improving the skill:
1. Apply your improvements to the skill
2. Rerun all test cases into a new iteration directory, including baseline runs
3. Launch the reviewer with previous workspace reference
4. Wait for the user to review
5. Read the new feedback, improve again, repeat

Keep going until:
- The user says they're happy
- The feedback is all empty (everything looks good)
- You're not making meaningful progress`,
    isBuiltin: true,
    version: '1.0.0',
  },

  // ============================================================
  // NEW DEVELOPMENT SKILLS
  // ============================================================

  {
    name: 'github',
    type: 'mcp' as const,
    description:
      'GitHub integration via MCP. Create issues, pull requests, reviews, branches, and manage repositories directly from agent workflows.',
    icon: '🐙',
    config: JSON.stringify({
      server_name: 'github',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
    }),
    env: JSON.stringify(['GITHUB_PERSONAL_ACCESS_TOKEN']),
    categories: JSON.stringify(['development', 'git', 'collaboration']),
    implementation: `# GitHub Integration

## When to use

Use the GitHub skill when you need to interact with GitHub repositories programmatically: creating issues, opening pull requests, managing branches, performing code reviews, or querying repository metadata. This skill connects to GitHub's API through the MCP server and provides full access to repository operations.

## Instructions

You have access to GitHub tools for repository management and collaboration.

### Key capabilities

- Create, update, and close issues with labels and assignees
- Open pull requests with title, body, base/head branches, and reviewers
- Create and delete branches from any ref
- List and search repositories, issues, and pull requests
- Read and comment on pull requests and issues
- Merge pull requests with configurable merge strategies
- Manage repository settings, labels, and milestones
- Access file contents and commit history

### Workflow: Creating a Pull Request

1. Ensure all changes are committed to a feature branch
2. Use \\\`create_pull_request\\\` with:
   - \\\`title\\\`: concise description (under 72 chars)
   - \\\`body\\\`: detailed explanation with context, changes summary, and test plan
   - \\\`base\\\`: target branch (usually \\\`main\\\`)
   - \\\`head\\\`: feature branch name
3. Add reviewers and labels as appropriate
4. Monitor PR status for CI checks and review comments

### Workflow: Issue Management

1. Use \\\`create_issue\\\` to file bugs or feature requests
2. Include reproducible steps for bugs, acceptance criteria for features
3. Apply appropriate labels: \\\`bug\\\`, \\\`feature\\\`, \\\`enhancement\\\`, \\\`documentation\\\`
4. Assign to team members or leave unassigned for triage

### Best practices

- Write descriptive PR titles that explain the "what" and "why"
- Keep PRs focused -- one logical change per PR
- Reference related issues in PR body using \\\`Closes #123\\\` syntax
- Use draft PRs for work-in-progress that needs early feedback
- Check CI status before requesting reviews
- Respond to review comments before merging
- Use conventional commit messages in PR titles when the repo follows that convention

### Authentication

- Requires a GitHub Personal Access Token (PAT) with appropriate scopes
- For public repos: \\\`public_repo\\\` scope
- For private repos: \\\`repo\\\` scope
- For org management: \\\`admin:org\\\` scope

## Available operations

- **Create Issue** -- File a new issue with title, body, labels, and assignees
- **Create Pull Request** -- Open a PR between branches with description and reviewers
- **Create Branch** -- Create a new branch from any commit or ref
- **Search** -- Search issues, PRs, and repositories with GitHub's query syntax
- **Review PR** -- Add comments, approve, or request changes on pull requests
- **Merge PR** -- Merge a pull request with squash, merge, or rebase strategy
- **List Repos** -- List repositories for a user or organization
- **Get File Contents** -- Read file contents from any branch or commit`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'code_executor',
    type: 'script' as const,
    description:
      'Execute code snippets in a sandboxed environment. Supports Node.js and Python runtimes with configurable timeouts and resource limits.',
    icon: '▶️',
    config: JSON.stringify({
      runtime: 'node',
      sandbox: true,
      timeout_ms: 30000,
    }),
    env: JSON.stringify([]),
    categories: JSON.stringify(['development', 'execution', 'sandbox']),
    implementation: `# Code Executor

## When to use

Use the Code Executor when you need to run code snippets to verify logic, transform data, perform calculations, or prototype solutions. This skill provides a sandboxed execution environment that supports Node.js and Python, with configurable timeouts and resource limits to prevent runaway processes.

## Instructions

You have access to a sandboxed code execution environment.

### Key capabilities

- Execute JavaScript/TypeScript code in Node.js runtime
- Execute Python scripts with standard library access
- Capture stdout, stderr, and exit codes
- Set execution timeouts (default: 30 seconds)
- Pass environment variables to the execution context
- Read and write files within the sandbox directory

### Execution workflow

1. **Prepare the code** -- Write the script content as a string or file
2. **Choose the runtime** -- Select \\\`node\\\` or \\\`python\\\` based on the task
3. **Set constraints** -- Configure timeout and memory limits
4. **Execute** -- Run the script and capture output
5. **Analyze results** -- Parse stdout for expected output, check stderr for errors

### Supported runtimes

| Runtime | Command | Version | Package Manager |
|---------|---------|---------|-----------------|
| Node.js | \\\`node\\\` | 18+ | npm (pre-installed packages) |
| Python  | \\\`python3\\\` | 3.10+ | pip (standard library only) |

### Safety constraints

- Maximum execution time: 30 seconds (configurable up to 120s)
- No network access from sandbox by default
- File system access limited to sandbox directory
- No system-level operations (mount, chroot, etc.)
- Process spawning limited to child processes of the main script

### Best practices

- Always set a timeout appropriate for the task (shorter is better)
- Validate input before execution to prevent injection
- Use structured output (JSON) for parsing results programmatically
- Handle errors gracefully -- check exit codes and stderr
- Clean up temporary files after execution
- Prefer Python for data processing, Node.js for web/API tasks
- Log intermediate results for debugging complex scripts
- Test scripts with small inputs before running on full datasets

### Error handling

Common error scenarios and how to handle them:
- **Timeout**: Script exceeded time limit -- optimize or break into smaller tasks
- **Memory**: Out of memory -- reduce dataset size or use streaming
- **Syntax**: Parse errors -- validate code before execution
- **Runtime**: Unhandled exceptions -- wrap in try/catch and report details

## Available operations

- **Execute Script** -- Run a code snippet in the specified runtime
- **Execute File** -- Run a script file from the sandbox directory
- **Check Status** -- Get execution status (running, completed, failed, timed out)
- **Get Output** -- Retrieve stdout, stderr, and exit code from a completed execution
- **List Files** -- List files created by the script in the sandbox directory`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'file_system',
    type: 'script' as const,
    description:
      'Read, write, and manage project files. Supports creating directories, moving files, searching by pattern, and reading file metadata.',
    icon: '📁',
    config: JSON.stringify({
      runtime: 'node',
      sandbox: true,
    }),
    env: JSON.stringify([]),
    categories: JSON.stringify(['development', 'files', 'utilities']),
    implementation: `# File System

## When to use

Use the File System skill when you need to read, write, create, move, or manage files and directories within a project. This skill provides controlled file system access with path validation and safety checks to prevent accidental modification of files outside the project scope.

## Instructions

You have access to file system operations within the project directory.

### Key capabilities

- Read file contents (text and binary)
- Write and create new files with specified content
- Create directory structures recursively
- Move, copy, and rename files
- Delete files and directories (with confirmation)
- Search for files by name pattern or glob
- Read file metadata (size, modified date, permissions)
- Watch files for changes

### File operations

#### Reading files
- Read entire file or specific line ranges
- Support for UTF-8, ASCII, and binary formats
- Detect file encoding automatically
- Read multiple files in parallel for efficiency

#### Writing files
- Create new files with content
- Append to existing files
- Atomic writes (write to temp then rename) for data safety
- Create parent directories automatically if they don't exist

#### Searching
- Glob patterns: \\\`**/*.ts\\\`, \\\`src/**/*.test.js\\\`
- Regex filename matching
- Content search within files (grep-like)
- Filter by file type, size, or modification date

### Safety constraints

- Operations restricted to the project root directory
- Cannot access files outside the project scope
- Symbolic links are followed but validated against project root
- Binary files are handled safely (no accidental text encoding)
- Delete operations require explicit confirmation
- Hidden files (.env, .git) are accessible but flagged with warnings

### Best practices

- Use absolute paths derived from project root to avoid ambiguity
- Check if a file exists before attempting to read or modify it
- Use glob patterns for batch operations instead of manual iteration
- Preserve file permissions when copying or moving files
- Back up files before destructive modifications
- Use atomic writes for critical files (configs, data files)
- Handle encoding explicitly for non-UTF-8 files
- Create .gitignore entries for generated files

### Path conventions

- Project root: the base directory of the current project
- Source: \\\`src/\\\` or \\\`lib/\\\` for source code
- Tests: \\\`tests/\\\` or \\\`__tests__/\\\` for test files
- Output: \\\`output/\\\` or \\\`dist/\\\` for generated content
- Config: root-level dotfiles and \\\`config/\\\` directory

## Available operations

- **Read File** -- Read contents of a file as text or binary
- **Write File** -- Create or overwrite a file with specified content
- **Append File** -- Append content to an existing file
- **Create Directory** -- Create a directory and any missing parent directories
- **Move/Rename** -- Move or rename a file or directory
- **Copy** -- Copy a file or directory recursively
- **Delete** -- Remove a file or directory (with confirmation)
- **Search** -- Find files matching a glob pattern or regex
- **Metadata** -- Get file size, modification date, and permissions`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'terminal',
    type: 'script' as const,
    description:
      'Execute shell commands in a controlled environment. Run build tools, package managers, git operations, and system utilities with output capture and timeout management.',
    icon: '💻',
    config: JSON.stringify({
      runtime: 'bash',
      sandbox: true,
      timeout_ms: 60000,
    }),
    env: JSON.stringify([]),
    categories: JSON.stringify(['development', 'shell', 'utilities']),
    implementation: `# Terminal

## When to use

Use the Terminal skill when you need to execute shell commands as part of a development workflow. This includes running build tools, package managers, git commands, system utilities, and any CLI operation. The terminal provides a controlled environment with output capture, timeout management, and safety constraints.

## Instructions

You have access to a controlled shell environment for executing commands.

### Key capabilities

- Execute any shell command with full stdout/stderr capture
- Run commands with configurable timeouts (default: 60 seconds)
- Chain commands with && for sequential execution
- Pipe output between commands
- Set environment variables for command execution
- Run commands in specific working directories
- Background execution for long-running processes

### Common workflows

#### Package management
\\\`\\\`\\\`bash
npm install           # Install dependencies
npm run build         # Run build script
pip install -r requirements.txt  # Python dependencies
\\\`\\\`\\\`

#### Git operations
\\\`\\\`\\\`bash
git status            # Check working tree status
git diff              # See unstaged changes
git log --oneline -10 # Recent commit history
git branch -a         # List all branches
\\\`\\\`\\\`

#### Build and test
\\\`\\\`\\\`bash
npm run build && npm test    # Build then test
make clean && make all       # Clean build
cargo build --release        # Rust release build
\\\`\\\`\\\`

#### System info
\\\`\\\`\\\`bash
node --version        # Check Node.js version
python3 --version     # Check Python version
which <tool>          # Find tool location
df -h                 # Disk usage
\\\`\\\`\\\`

### Safety constraints

- Maximum execution time: 60 seconds (configurable up to 300s)
- No destructive system operations (rm -rf /, format, etc.)
- Working directory constrained to project scope
- Interactive commands (vim, nano, less) are not supported
- Commands requiring TTY input will fail -- use non-interactive alternatives
- Network access is permitted but monitored

### Best practices

- Always quote file paths that contain spaces
- Use \\\`&&\\\` to chain dependent commands (fail-fast)
- Use \\\`;\\\` only when later commands should run regardless of earlier failures
- Prefer non-interactive flags: \\\`-y\\\`, \\\`--yes\\\`, \\\`--non-interactive\\\`
- Redirect verbose output to /dev/null when only the exit code matters
- Set explicit timeouts for potentially long-running commands
- Check command existence with \\\`which\\\` or \\\`command -v\\\` before running
- Use absolute paths to avoid working directory confusion
- Capture output to variables for parsing: \\\`result=$(command)\\\`

### Error handling

- Non-zero exit codes indicate failure -- check and handle appropriately
- Parse stderr for error details when a command fails
- For flaky commands, implement retry logic with backoff
- Log full command output for debugging

## Available operations

- **Execute Command** -- Run a shell command and capture output
- **Execute Script** -- Run a shell script file
- **Background Execute** -- Start a long-running command in the background
- **Check Process** -- Check status of a background process
- **Kill Process** -- Terminate a background process
- **Set Working Directory** -- Change the working directory for subsequent commands`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'code_analyzer',
    type: 'prompt' as const,
    description:
      'Static code analysis: detect complexity issues, anti-patterns, code smells, and architectural concerns. Provides actionable improvement suggestions with severity ratings.',
    icon: '🔬',
    config: JSON.stringify({}),
    env: JSON.stringify([]),
    categories: JSON.stringify([
      'development',
      'analysis',
      'quality',
      'code-review',
    ]),
    implementation: `# Code Analyzer

## When to use

Use the Code Analyzer when you need to review code for quality, maintainability, and potential issues. This skill performs static analysis to detect complexity problems, anti-patterns, code smells, security vulnerabilities, and architectural concerns. It provides actionable suggestions with severity ratings and explanations of why each issue matters.

## Instructions

You are a senior code reviewer performing thorough static analysis. Analyze code with attention to correctness, maintainability, performance, and security.

### Analysis dimensions

1. **Complexity Analysis**
   - Cyclomatic complexity per function (flag if > 10)
   - Cognitive complexity (nested conditions, callback chains)
   - Function length (flag if > 50 lines)
   - File length (flag if > 300 lines)
   - Parameter count (flag if > 4)

2. **Code Smells**
   - Duplicated code blocks (DRY violations)
   - Long parameter lists
   - Feature envy (function uses another module's data excessively)
   - God objects/functions (doing too much)
   - Dead code (unreachable or unused)
   - Magic numbers and strings
   - Inconsistent naming conventions

3. **Anti-Patterns**
   - Callback hell / deeply nested promises
   - Mutable shared state
   - Tight coupling between modules
   - Missing error handling (unhandled promises, empty catch blocks)
   - Hardcoded configuration values
   - Circular dependencies
   - Over-engineering (unnecessary abstractions)

4. **Security Concerns**
   - SQL injection vectors
   - XSS vulnerabilities
   - Unsanitized user input
   - Hardcoded secrets or credentials
   - Insecure randomness
   - Path traversal risks
   - Missing input validation

5. **Performance Issues**
   - N+1 query patterns
   - Unnecessary re-renders (React)
   - Memory leaks (event listeners, timers not cleaned up)
   - Synchronous file I/O in async contexts
   - Missing pagination for large datasets
   - Unbounded loops or recursion

### Output format

For each issue found, report:

\\\`\\\`\\\`
### [SEVERITY] Issue Title
**File**: path/to/file.ts:lineNumber
**Category**: complexity | smell | anti-pattern | security | performance
**Description**: What the issue is and why it matters
**Suggestion**: How to fix it, with a brief code example if helpful
\\\`\\\`\\\`

Severity levels:
- **CRITICAL**: Security vulnerabilities, data loss risks, crashes
- **HIGH**: Bugs, significant maintainability issues, performance bottlenecks
- **MEDIUM**: Code smells, moderate complexity, missing best practices
- **LOW**: Style issues, minor improvements, suggestions

### Best practices

- Prioritize issues by severity -- report critical issues first
- Provide context for why an issue matters, not just what it is
- Include concrete fix suggestions, not vague recommendations
- Consider the project's conventions before flagging style issues
- Don't flag intentional patterns documented with comments
- Group related issues together (e.g., all issues in one function)
- Acknowledge good patterns you observe alongside the issues
- Limit output to the most impactful issues (top 10-15) unless asked for exhaustive review

### Summary format

End every analysis with:

\\\`\\\`\\\`
## Summary
- **Files analyzed**: N
- **Issues found**: N (X critical, Y high, Z medium, W low)
- **Top concern**: Brief description of the most impactful issue
- **Overall assessment**: Brief qualitative assessment of code health
\\\`\\\`\\\`

## Available operations

- **Analyze File** -- Perform full static analysis on a single file
- **Analyze Directory** -- Analyze all source files in a directory recursively
- **Complexity Report** -- Generate a complexity report for functions and classes
- **Security Audit** -- Focus specifically on security vulnerabilities
- **Dependency Analysis** -- Map module dependencies and detect circular references`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'test_runner',
    type: 'script' as const,
    description:
      'Run test suites and report results. Supports Jest, Vitest, Pytest, and other test frameworks with structured output, coverage reporting, and failure analysis.',
    icon: '🧪',
    config: JSON.stringify({
      runtime: 'node',
      sandbox: true,
      timeout_ms: 120000,
    }),
    env: JSON.stringify([]),
    categories: JSON.stringify(['development', 'testing', 'quality']),
    implementation: `# Test Runner

## When to use

Use the Test Runner when you need to execute test suites, verify code changes haven't introduced regressions, check test coverage, or analyze test failures. This skill integrates with popular test frameworks and provides structured results with failure analysis and coverage metrics.

## Instructions

You have access to test execution capabilities for multiple frameworks.

### Key capabilities

- Run full test suites or individual test files
- Filter tests by name, pattern, or tag
- Generate coverage reports (line, branch, function, statement)
- Parse and present test results in structured format
- Analyze test failures with context and suggestions
- Watch mode for continuous testing during development
- Parallel test execution for faster feedback

### Supported frameworks

| Framework | Language | Command | Config File |
|-----------|----------|---------|-------------|
| Jest      | JS/TS    | \\\`npx jest\\\` | jest.config.js |
| Vitest    | JS/TS    | \\\`npx vitest\\\` | vitest.config.ts |
| Pytest    | Python   | \\\`python -m pytest\\\` | pytest.ini / pyproject.toml |
| Mocha     | JS/TS    | \\\`npx mocha\\\` | .mocharc.yml |
| Go test   | Go       | \\\`go test\\\` | -- |
| Cargo test| Rust     | \\\`cargo test\\\` | -- |

### Test execution workflow

1. **Detect framework** -- Check config files to identify the test framework
2. **Select scope** -- Determine which tests to run:
   - All tests: \\\`npm test\\\` or equivalent
   - Single file: \\\`npx jest path/to/test.ts\\\`
   - Pattern match: \\\`npx jest --testPathPattern="auth"\\\`
   - Changed files only: \\\`npx jest --changedSince=main\\\`
3. **Execute** -- Run tests with JSON reporter for structured output
4. **Parse results** -- Extract pass/fail counts, durations, and failure details
5. **Report** -- Present results in readable format with failure analysis

### Coverage reporting

Run with coverage enabled:
\\\`\\\`\\\`bash
npx jest --coverage --coverageReporters=json-summary
npx vitest --coverage
python -m pytest --cov=src --cov-report=json
\\\`\\\`\\\`

Coverage thresholds (recommended):
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

### Failure analysis

When tests fail, provide:
1. **Test name and file** -- Which test failed and where
2. **Expected vs actual** -- What was expected and what was received
3. **Stack trace** -- Relevant portion of the error stack
4. **Likely cause** -- Analysis of why the test might be failing
5. **Suggested fix** -- What to check or change to fix the failure

### Best practices

- Run tests before and after code changes to catch regressions
- Use \\\`--bail\\\` or \\\`--fail-fast\\\` during development (stop on first failure)
- Run full suite before committing or opening a PR
- Keep test execution under 2 minutes for fast feedback
- Use coverage to identify untested code paths
- Don't chase 100% coverage -- focus on critical paths and edge cases
- Run tests in CI with the same configuration as local development

## Available operations

- **Run All Tests** -- Execute the full test suite with results summary
- **Run File** -- Run tests in a specific file
- **Run Pattern** -- Run tests matching a name or path pattern
- **Run Changed** -- Run tests affected by recent changes
- **Coverage Report** -- Generate and display code coverage metrics
- **Failure Analysis** -- Analyze failing tests with suggestions for fixes`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'linter',
    type: 'script' as const,
    description:
      'Run linting and formatting tools: ESLint, Prettier, TypeScript type checking. Auto-fix common issues and report remaining problems with severity and location.',
    icon: '✨',
    config: JSON.stringify({
      runtime: 'node',
      sandbox: true,
      timeout_ms: 60000,
    }),
    env: JSON.stringify([]),
    categories: JSON.stringify(['development', 'quality', 'formatting']),
    implementation: `# Linter

## When to use

Use the Linter skill when you need to check code for style violations, formatting inconsistencies, and type errors. This skill integrates ESLint, Prettier, and TypeScript's type checker to provide comprehensive code quality feedback. It can auto-fix many common issues and reports remaining problems with file location and severity.

## Instructions

You have access to linting, formatting, and type checking tools.

### Key capabilities

- ESLint: JavaScript/TypeScript style and error checking
- Prettier: Code formatting for JS, TS, CSS, HTML, JSON, Markdown
- TypeScript: Static type checking with full diagnostic output
- Auto-fix mode for automatically correctable issues
- File-level or project-wide analysis
- Custom rule configuration support

### Linting workflow

1. **Detect configuration** -- Check for existing config files:
   - ESLint: \\\`.eslintrc.*\\\`, \\\`eslint.config.*\\\`
   - Prettier: \\\`.prettierrc.*\\\`, \\\`prettier.config.*\\\`
   - TypeScript: \\\`tsconfig.json\\\`
2. **Run checks** -- Execute the appropriate tools
3. **Report issues** -- Present problems grouped by file with severity
4. **Auto-fix** -- Apply automatic fixes when requested
5. **Verify** -- Re-run checks to confirm fixes resolved the issues

### ESLint

\\\`\\\`\\\`bash
# Check specific files
npx eslint src/path/to/file.ts

# Check entire project
npx eslint src/

# Auto-fix
npx eslint src/ --fix

# JSON output for parsing
npx eslint src/ --format json
\\\`\\\`\\\`

Common issue categories:
- **Errors**: Must fix -- potential bugs, undefined variables, unreachable code
- **Warnings**: Should fix -- unused variables, missing return types, complexity

### Prettier

\\\`\\\`\\\`bash
# Check formatting
npx prettier --check src/

# Fix formatting
npx prettier --write src/

# Check specific file
npx prettier --check src/path/to/file.ts
\\\`\\\`\\\`

### TypeScript type checking

\\\`\\\`\\\`bash
# Full type check
npx tsc --noEmit

# Type check with project reference
npx tsc --noEmit -p tsconfig.json

# Show all errors (don't stop early)
npx tsc --noEmit --pretty
\\\`\\\`\\\`

Common type errors:
- **TS2322**: Type assignment errors
- **TS2339**: Property does not exist
- **TS2345**: Argument type mismatch
- **TS7006**: Parameter implicitly has 'any' type

### Output format

Report issues in this format:

\\\`\\\`\\\`
## Lint Results

### path/to/file.ts
- **Line 15**: [error] Unexpected 'any' type (@typescript-eslint/no-explicit-any)
- **Line 23**: [warning] 'result' is assigned but never used (no-unused-vars)
- **Line 45**: [error] Missing return type on function (explicit-function-return-type)

### Summary
- Files checked: N
- Errors: X (Y auto-fixable)
- Warnings: Z
\\\`\\\`\\\`

### Best practices

- Run linters before committing to catch issues early
- Use auto-fix for formatting issues -- don't fix whitespace manually
- Address errors before warnings
- Don't disable linter rules without documenting why
- Keep linter configs consistent across the project
- Use \\\`// eslint-disable-next-line\\\` sparingly and with a comment explaining why
- Run type checking as part of the build process
- Fix type errors before runtime testing -- they often indicate real bugs

## Available operations

- **Lint Files** -- Run ESLint on specified files or directories
- **Format Check** -- Check if files conform to Prettier formatting
- **Format Fix** -- Auto-format files with Prettier
- **Type Check** -- Run TypeScript compiler in check-only mode
- **Auto-fix All** -- Run ESLint --fix and Prettier --write together
- **Lint Report** -- Generate a full lint report for the project`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'docker',
    type: 'script' as const,
    description:
      'Build, run, and manage Docker containers. Create Dockerfiles, manage images and containers, handle docker-compose services, and inspect container logs.',
    icon: '🐳',
    config: JSON.stringify({
      runtime: 'bash',
      sandbox: false,
      timeout_ms: 300000,
    }),
    env: JSON.stringify(['DOCKER_HOST']),
    categories: JSON.stringify([
      'development',
      'devops',
      'containers',
      'deployment',
    ]),
    implementation: `# Docker

## When to use

Use the Docker skill when you need to build container images, run containers, manage docker-compose services, or inspect container state. This skill provides controlled access to Docker CLI operations for development and testing workflows, including building from Dockerfiles, managing container lifecycle, and debugging with logs and exec.

## Instructions

You have access to Docker CLI for container management.

### Key capabilities

- Build Docker images from Dockerfiles
- Run containers with port mapping, volume mounts, and environment variables
- Manage container lifecycle (start, stop, restart, remove)
- Docker Compose for multi-container applications
- Inspect container logs, processes, and resource usage
- Manage Docker networks and volumes
- Push and pull images from registries

### Building images

\\\`\\\`\\\`bash
# Build from Dockerfile in current directory
docker build -t myapp:latest .

# Build with build args
docker build -t myapp:latest --build-arg NODE_ENV=production .

# Build with specific Dockerfile
docker build -t myapp:latest -f Dockerfile.prod .

# Multi-stage build (already defined in Dockerfile)
docker build -t myapp:latest --target production .
\\\`\\\`\\\`

### Running containers

\\\`\\\`\\\`bash
# Basic run
docker run -d --name myapp myapp:latest

# With port mapping and env vars
docker run -d --name myapp -p 3000:3000 -e NODE_ENV=production myapp:latest

# With volume mount
docker run -d --name myapp -v $(pwd)/data:/app/data myapp:latest

# Interactive shell
docker run -it --rm myapp:latest /bin/sh
\\\`\\\`\\\`

### Docker Compose

\\\`\\\`\\\`bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d api

# View logs
docker compose logs -f api

# Stop all services
docker compose down

# Rebuild and restart
docker compose up -d --build
\\\`\\\`\\\`

### Container inspection

\\\`\\\`\\\`bash
# View running containers
docker ps

# View logs
docker logs --tail 100 -f myapp

# Execute command in running container
docker exec -it myapp /bin/sh

# Inspect container details
docker inspect myapp

# Resource usage
docker stats --no-stream
\\\`\\\`\\\`

### Best practices

- Use multi-stage builds to minimize image size
- Pin base image versions (e.g., \\\`node:20-alpine\\\` not \\\`node:latest\\\`)
- Add \\\`.dockerignore\\\` to exclude node_modules, .git, and build artifacts
- Use COPY instead of ADD unless you need URL fetching or tar extraction
- Set a non-root USER in production images
- Use health checks for service containers
- Clean up unused images and containers regularly: \\\`docker system prune\\\`
- Use named volumes for persistent data (not bind mounts in production)
- Keep containers stateless -- persist data in volumes or external services
- Log to stdout/stderr for container log collection

### Safety constraints

- Container operations require Docker daemon access
- Build operations may take several minutes for large images
- Port mappings must not conflict with host services
- Volume mounts expose host filesystem -- use with caution
- Resource limits (--memory, --cpus) recommended for long-running containers

## Available operations

- **Build Image** -- Build a Docker image from a Dockerfile
- **Run Container** -- Start a new container from an image
- **Stop/Start/Restart** -- Manage container lifecycle
- **Compose Up** -- Start docker-compose services
- **Compose Down** -- Stop and remove docker-compose services
- **View Logs** -- Stream or tail container logs
- **Exec** -- Execute a command inside a running container
- **List** -- List running containers, images, volumes, or networks`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'database_query',
    type: 'script' as const,
    description:
      'Execute SQL and NoSQL database queries. Supports PostgreSQL, MySQL, SQLite, and MongoDB with connection management, query formatting, and result presentation.',
    icon: '🗄️',
    config: JSON.stringify({
      runtime: 'node',
      sandbox: true,
      timeout_ms: 30000,
    }),
    env: JSON.stringify(['DATABASE_URL']),
    categories: JSON.stringify(['development', 'database', 'data']),
    implementation: `# Database Query

## When to use

Use the Database Query skill when you need to execute database queries for development, debugging, data inspection, or migration tasks. This skill supports SQL databases (PostgreSQL, MySQL, SQLite) and NoSQL databases (MongoDB) with safe connection management, query formatting, and structured result presentation.

## Instructions

You have access to database query execution capabilities.

### Key capabilities

- Execute SELECT, INSERT, UPDATE, DELETE queries
- Run schema queries (CREATE, ALTER, DROP with confirmation)
- Transaction support (BEGIN, COMMIT, ROLLBACK)
- Query result formatting (table, JSON, CSV)
- Connection pooling and timeout management
- Query execution plan analysis (EXPLAIN)
- Database schema introspection

### Supported databases

| Database   | Connection String Format | Driver |
|------------|------------------------|--------|
| PostgreSQL | \\\`postgresql://user:pass@host:5432/db\\\` | pg |
| MySQL      | \\\`mysql://user:pass@host:3306/db\\\` | mysql2 |
| SQLite     | \\\`sqlite:///path/to/db.sqlite\\\` | better-sqlite3 |
| MongoDB    | \\\`mongodb://user:pass@host:27017/db\\\` | mongodb |

### Query workflow

1. **Connect** -- Establish connection using DATABASE_URL or provided connection string
2. **Validate** -- Parse and validate the query before execution
3. **Execute** -- Run the query with parameterized values (never string interpolation)
4. **Format** -- Present results in the requested format
5. **Close** -- Release the connection back to the pool

### SQL query examples

\\\`\\\`\\\`sql
-- Inspect schema
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Query with parameters (use $1, $2 for PostgreSQL)
SELECT * FROM users WHERE email = $1 AND active = $2;

-- Aggregation
SELECT status, COUNT(*) as count, AVG(amount) as avg_amount
FROM orders
GROUP BY status
ORDER BY count DESC;

-- Execution plan
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
\\\`\\\`\\\`

### MongoDB query examples

\\\`\\\`\\\`javascript
// Find documents
db.users.find({ active: true }).limit(10)

// Aggregation pipeline
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$userId", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }
])
\\\`\\\`\\\`

### Safety constraints

- **Read-only by default** -- Write operations require explicit confirmation
- **Schema changes** (DROP, ALTER, TRUNCATE) require double confirmation
- **Query timeout**: 30 seconds maximum (configurable)
- **Result limit**: 1000 rows maximum per query (use LIMIT)
- **No connection string logging** -- credentials are never printed
- **Parameterized queries only** -- no string interpolation to prevent SQL injection
- **Transaction safety** -- uncommitted transactions are rolled back on timeout

### Best practices

- Always use parameterized queries to prevent SQL injection
- Add LIMIT to SELECT queries to avoid fetching entire tables
- Use EXPLAIN before running complex queries to check the execution plan
- Start with SELECT to understand data before running UPDATE/DELETE
- Use transactions for multi-statement modifications
- Back up data before running destructive operations
- Test queries on a development database before production
- Use schema introspection to understand table structure before querying
- Close connections properly to avoid pool exhaustion

### Result formatting

Results are presented as:
- **Table**: ASCII table for terminal display (default for < 20 columns)
- **JSON**: Structured output for programmatic processing
- **CSV**: Comma-separated for data export
- **Count only**: Row count for large result sets

## Available operations

- **Execute Query** -- Run a SQL or MongoDB query and return results
- **Explain Query** -- Show the execution plan for a query
- **Schema Info** -- List tables, columns, indexes, and constraints
- **Table Preview** -- Show first N rows of a table with column types
- **Transaction** -- Execute multiple queries in a transaction
- **Export Results** -- Save query results to a file (JSON, CSV)`,
    isBuiltin: true,
    version: '1.0.0',
  },

  {
    name: 'api_tester',
    type: 'script' as const,
    description:
      'Test REST and GraphQL API endpoints automatically. Send requests with custom headers, bodies, and authentication. Validate responses against expected status codes, schemas, and values.',
    icon: '🌐',
    config: JSON.stringify({
      runtime: 'node',
      sandbox: true,
      timeout_ms: 30000,
    }),
    env: JSON.stringify([]),
    categories: JSON.stringify(['development', 'testing', 'api', 'quality']),
    implementation: `# API Tester

## When to use

Use the API Tester when you need to test REST or GraphQL endpoints, validate API responses, check authentication flows, or perform integration testing. This skill sends HTTP requests with full control over method, headers, body, and authentication, then validates responses against expected status codes, response schemas, and specific values.

## Instructions

You have access to HTTP request capabilities for API testing.

### Key capabilities

- Send HTTP requests (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD)
- GraphQL queries and mutations
- Custom headers, query parameters, and request bodies
- Authentication: Bearer tokens, API keys, Basic auth, OAuth
- Response validation against JSON schemas
- Response time measurement
- Cookie and session management
- File upload (multipart/form-data)
- Request chaining (use response values in subsequent requests)

### REST API testing

#### Basic request
\\\`\\\`\\\`bash
# GET request
curl -s -w "\\n%{http_code}" https://api.example.com/users

# POST with JSON body
curl -s -X POST https://api.example.com/users \\\\
  -H "Content-Type: application/json" \\\\
  -H "Authorization: Bearer $TOKEN" \\\\
  -d '{"name": "Test User", "email": "test@example.com"}'

# PUT update
curl -s -X PUT https://api.example.com/users/123 \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"name": "Updated Name"}'

# DELETE
curl -s -X DELETE https://api.example.com/users/123 \\\\
  -H "Authorization: Bearer $TOKEN"
\\\`\\\`\\\`

### GraphQL testing

\\\`\\\`\\\`bash
curl -s -X POST https://api.example.com/graphql \\\\
  -H "Content-Type: application/json" \\\\
  -d '{
    "query": "query { users(limit: 10) { id name email } }",
    "variables": {}
  }'
\\\`\\\`\\\`

### Response validation

For each API test, validate:

1. **Status Code** -- Expected HTTP status (200, 201, 400, 404, etc.)
2. **Response Body** -- JSON structure matches expected schema
3. **Required Fields** -- All expected fields are present
4. **Data Types** -- Fields have correct types (string, number, array, etc.)
5. **Values** -- Specific fields have expected values
6. **Headers** -- Response headers contain expected values (Content-Type, etc.)
7. **Timing** -- Response time is within acceptable range

### Test report format

\\\`\\\`\\\`
## API Test Results

### GET /api/users
- **Status**: 200 OK (expected: 200) PASS
- **Response Time**: 145ms (threshold: 500ms) PASS
- **Content-Type**: application/json PASS
- **Body Schema**: Valid PASS
- **Array Length**: 10 items (expected: <= 10) PASS

### POST /api/users (invalid email)
- **Status**: 400 Bad Request (expected: 400) PASS
- **Error Message**: "Invalid email format" PASS

### Summary
- Total tests: N
- Passed: X
- Failed: Y
- Average response time: Zms
\\\`\\\`\\\`

### Test scenarios to cover

For each endpoint, test:
- **Happy path** -- Valid input, expected success response
- **Validation** -- Invalid input, expected error response with helpful message
- **Authentication** -- Missing/invalid/expired tokens
- **Authorization** -- Access to resources the user doesn't own
- **Edge cases** -- Empty arrays, null values, maximum lengths, special characters
- **Idempotency** -- Repeated requests produce consistent results
- **Pagination** -- First page, last page, out of range

### Best practices

- Test against a development or staging environment, never production
- Use environment variables for base URLs and tokens
- Chain requests logically: create -> read -> update -> delete
- Clean up test data after test runs
- Validate both success and error responses
- Check response times to catch performance regressions
- Use descriptive test names that explain the scenario
- Document expected behavior alongside each test
- Keep authentication tokens out of test files -- use environment variables
- Test rate limiting behavior if the API enforces it

### Request chaining

For workflows that depend on previous responses:
1. Create a resource and capture its ID from the response
2. Use the captured ID in subsequent requests (read, update, delete)
3. Verify the resource state after each operation
4. Clean up by deleting the test resource at the end

## Available operations

- **Send Request** -- Execute an HTTP request with full configuration
- **GraphQL Query** -- Send a GraphQL query or mutation
- **Validate Response** -- Check response against expected status, schema, and values
- **Run Test Suite** -- Execute a sequence of API tests with a report
- **Chain Requests** -- Execute dependent requests using values from previous responses
- **Performance Check** -- Measure and report response times across endpoints`,
    isBuiltin: true,
    version: '1.0.0',
  },
]
