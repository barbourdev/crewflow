export const platformBestPractices = [
  {
    name: 'Instagram Feed Post',
    category: 'platform' as const,
    platform: 'instagram',
    contentType: 'feed',
    description: 'Carousel and single image posts optimized for saves, shares, and feed engagement',
    constraints: JSON.stringify({
      caption_max_chars: 2200,
      caption_visible_chars: 125,
      max_hashtags: 30,
      recommended_hashtags: '5-15',
      carousel_max_slides: 20,
      recommended_slides: '8-10',
      min_words_per_slide: 40,
      max_words_per_slide: 80,
      image_ratio: '3:4 portrait',
      image_resolution: '1080x1440px',
    }),
    content: `## Platform Rules

- Engagement is weighted: Saves > Shares > Comments > Likes. Design content that is worth saving or sending to a friend.
- Carousels receive approximately 1.4x more reach than single images. The algorithm re-serves carousels to users who did not swipe the first time, giving them a second chance at impressions.
- Early engagement in the first 30-60 minutes strongly influences total distribution. Time your post for when your audience is most active.
- Best posting times: 9-11 AM or 7-9 PM in your audience's local time zone. Tuesday, Wednesday, and Thursday tend to perform strongest.
- Shares to DMs and Stories are the highest-value engagement signals for the algorithm.
- Consistent posting cadence (4-7x/week) signals an active account and maintains algorithmic favor.

## General Carousel Rules

- Each slide uses **40-80 words** (unless the user explicitly requests shorter) with a **two-layer text hierarchy**: a large bold headline (primary claim) and a smaller supporting text (data, context, or elaboration). The minimum of 40 words ensures the slide is informative and not superficial.
- Alternate background colors across slides (light, dark, accent) to create visual rhythm and prevent fatigue.
- Highlight **key phrases** in an accent color (e.g., orange or red) within the headline text.
- Place editorial-quality photos between text blocks -- they illustrate the point, not decorate.
- Maintain a consistent header bar across all slides (branding + handle + date).
- Use a consistent visual template across slides for brand recognition.
- The first slide is everything -- it must stop the scroll with high contrast, bold type, and a clear promise or curiosity gap.

## Carousel Formats

Choose the format that best fits the content goal. Each format has a specific slide structure and narrative arc.

### 1. Editorial / Tese (8-10 slides)

**Goal:** Argue a thesis with evidence. Builds authority, drives saves and shares.
**Best for:** Trends, market analysis, contrarian takes, data-backed arguments.

**Slide flow:**
1. **Cover** -- Photo + bold title overlay (provocative question or claim). Magazine-cover style with branding and date.
2. **Context** -- Headline states the core shift or trend. Photo. Supporting text introduces the tension or anchoring data.
3. **Explanation slides (5-7)** -- One argument, example, or data point per slide. Headline delivers the insight. Supporting text reinforces with evidence or real-world example.
4. **Synthesis** -- Headline ties everything into a concluding takeaway. Supporting text delivers the "so what."
5. **Credits/CTA** -- Photo + source attribution (article, study, or report) + CTA (comment keyword, save, share).

### 2. Listicle / Lista (8-10 slides)

**Goal:** Deliver scannable, numbered value. Drives saves (reference material).
**Best for:** Tips, tools, resources, recommendations, checklists.

**Slide flow:**
1. **Cover** -- "X [coisas/dicas/ferramentas] para [resultado]". Bold number + clear promise.
2. **Items (6-8 slides)** -- One item per slide. Headline is the item name or tip (numbered). Supporting text explains the why or how in 1-2 sentences.
3. **Recap/CTA** -- Optional summary of all items in a visual checklist. CTA: "Salve para consultar depois" or "Mande para alguem que precisa."

### 3. Tutorial / Passo-a-passo (8-12 slides)

**Goal:** Teach a process. Drives saves (people bookmark to follow later).
**Best for:** How-to guides, recipes, setup guides, workflows.

**Slide flow:**
1. **Cover** -- Show the finished result or outcome first. Bold title: "Como [resultado] em X passos."
2. **Steps (6-10 slides)** -- One step per slide. Headline: "Passo X: [acao]". Supporting text explains the detail. Use screenshots, diagrams, or process photos.
3. **Result** -- Show the final outcome again with a before/after or summary.
4. **CTA** -- "Salve esse tutorial" or "Comenta se deu certo."

### 4. Mito vs Realidade (6-10 slides)

**Goal:** Bust misconceptions. Positions the brand as authority. Drives comments (debate).
**Best for:** Industry myths, common mistakes, "what people think vs what actually works."

**Slide flow:**
1. **Cover** -- "X mitos sobre [tema] que voce ainda acredita." Bold, confrontational.
2. **Myth/Reality pairs (4-8 slides)** -- Each slide presents one myth (crossed out or in red) and the reality (in green or accent color). Headline is the myth. Supporting text is the correction with evidence.
3. **Synthesis** -- "O que realmente funciona e..." with a clear takeaway.
4. **CTA** -- "Qual mito te surpreendeu mais? Comenta abaixo."

### 5. Antes e Depois (6-8 slides)

**Goal:** Show transformation. Drives engagement through visual proof and emotional impact.
**Best for:** Results, case studies, redesigns, fitness, branding, portfolio.

**Slide flow:**
1. **Cover** -- Teaser of the transformation. "De [estado ruim] para [estado bom]" or dramatic before/after split.
2. **Before (1-2 slides)** -- Show the problem state. Headline describes what was wrong. Supporting text gives context.
3. **Process (2-3 slides)** -- What changed and why. One key decision or action per slide.
4. **After (1-2 slides)** -- Show the result. Headline highlights the key metric or outcome.
5. **CTA** -- "Quer esse resultado? Link na bio" or "Salve para referencia."

### 6. Storytelling / Narrativa (8-10 slides)

**Goal:** Build emotional connection. Drives shares and comments through relatability.
**Best for:** Personal stories, brand origin, customer journeys, lessons learned.

**Slide flow:**
1. **Cover** -- Hook that creates curiosity. "Como eu [resultado surpreendente]" or "A historia por tras de [X]."
2. **Setup (1-2 slides)** -- Set the scene. Who, where, when. Create empathy.
3. **Conflict (2-3 slides)** -- The challenge, mistake, or turning point. Build tension.
4. **Resolution (2-3 slides)** -- What happened, what was learned, how it changed everything.
5. **Takeaway** -- Universal lesson the audience can apply.
6. **CTA** -- "Voce ja passou por algo parecido?" or "Manda pra quem precisa ouvir isso."

### 7. Problema -> Solucao (6-10 slides)

**Goal:** Directly address a pain point and present the solution. Drives saves and DM shares.
**Best for:** Product positioning, service offers, common frustrations, "stop doing X, do Y instead."

**Slide flow:**
1. **Cover** -- State the problem boldly. "Voce ainda faz [erro comum]?" or "O problema que ninguem fala sobre [tema]."
2. **Problem (2-3 slides)** -- Describe the pain. One symptom or consequence per slide. Make the reader feel seen.
3. **Bridge (1 slide)** -- "Mas existe um jeito melhor" or "A solucao e mais simples do que parece."
4. **Solution (2-4 slides)** -- Present the answer. One actionable point per slide.
5. **Proof (optional)** -- Data, testimonial, or result that validates the solution.
6. **CTA** -- "Salve e aplica hoje" or "Comenta [keyword] que eu te mando o guia."

### Single Image Post

- Strong visual that communicates a single idea at a glance.
- Works best for quotes, announcements, bold statements, and high-quality photography.
- The caption carries the weight of the value delivery.

## Writing Guidelines

- **First 125 characters are critical.** They must compel the reader to tap "more." Front-load the value or curiosity gap.
- Use line breaks aggressively for readability. Add periods or dashes as spacing characters between paragraphs.
- Write the hook as a standalone statement that creates urgency, curiosity, or personal relevance.
- End every caption with a question or clear CTA to drive comments.
- Use 5-15 hashtags per post. Mix: 3-5 niche/specific + 3-5 mid-range (10K-500K posts) + 2-3 broad/popular.
- Place hashtags at the end of the caption or in the first comment.
- Rotate hashtag sets between posts. Never copy-paste the same block repeatedly.
- Avoid banned or flagged hashtags -- Instagram silently suppresses posts using them.

## Output Format

\`\`\`
=== FORMAT ===
[Name of the chosen carousel format: Editorial, Listicle, Tutorial, Mito vs Realidade, Antes e Depois, Storytelling, or Problema -> Solucao]

=== SLIDES ===
Slide 1 (Cover):
  Title: [Bold title overlay -- max 20 words]
  Photo: [Photo description/direction]
  Background: [cover photo / solid color]

Slide 2 ([Role]):
  Headline: [Bold, large text -- primary claim or point]
  Photo: [Photo description, if applicable]
  Supporting text: [Smaller text -- data, context, or elaboration]
  Accent keywords: [Words to highlight in accent color]
  Background: [light/dark/accent]

Slide 3 ([Role]):
  Headline: [...]
  Photo: [...]
  Supporting text: [...]
  Accent keywords: [...]
  Background: [light/dark/accent]

...continue until all slides are complete (min 40 words / max 80 words per slide, unless user requests shorter)...

Slide N (CTA):
  Photo: [Closing image]
  Source: [Article, study, or report that inspired the content -- if applicable]
  CTA: [Specific action -- comment keyword, save, share]

=== CAPTION ===
[Hook paragraph -- must open with first 125 characters that compel "more" tap. Set the tension.]

[Body paragraph -- expanded argument with key points. Use line breaks for readability.]

[Closing question -- provocative, open-ended question that drives comments and reflection.]

[AI disclosure if applicable.]

=== HASHTAGS ===
#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5
[5-15 hashtags, mix of niche, mid-range, and broad]
\`\`\`

## Quality Criteria

- [ ] Carousel format is explicitly chosen and follows the corresponding slide flow
- [ ] Cover slide has a bold, provocative title (max 20 words) that stops the scroll
- [ ] Each slide uses two-layer hierarchy: bold headline + smaller supporting text
- [ ] Each slide has **at least 40 words** total (headline + supporting text combined) -- unless the user explicitly requested shorter slides
- [ ] Each slide stays within 80 words total (headline + supporting text combined)
- [ ] Background colors alternate across slides (light, dark, accent) for visual rhythm
- [ ] Key phrases are highlighted in accent color within headlines
- [ ] Each slide advances the narrative -- no filler or repetition between slides
- [ ] Swipe-through rate is optimized: every slide ends with implicit or explicit reason to swipe
- [ ] Caption first 125 characters work as a standalone hook
- [ ] Caption ends with a provocative open-ended question or clear CTA
- [ ] Hashtags are between 5-15, with a mix of niche and broad tags
- [ ] No hashtag is banned or flagged by Instagram
- [ ] Final slide includes a specific, actionable CTA (not generic "follow me")
- [ ] Content is designed to be save-worthy or share-worthy, not just likeable

## Anti-Patterns

- **Links in captions** -- Instagram captions do not support clickable links. Including URLs wastes characters and looks amateurish. Use bio link or Stories link sticker instead.
- **Too little text per carousel slide** -- Slides with fewer than 40 words are superficial and fail to deliver value. The supporting text layer must add real context, data, or explanation -- not just restate the headline. Exception: user explicitly requests short/punchy slides.
- **Too much text per carousel slide** -- Exceeding 80 words per slide destroys readability. Use the two-layer hierarchy (headline + supporting text) to keep density manageable. Never put all text at the same size.
- **No CTA** -- Posts without a clear ask get saved and shared significantly less. Always tell the audience what to do next.
- **Generic stock aesthetics** -- Overly polished stock photos signal "advertisement" to users and reduce organic engagement.
- **Hashtag spam** -- Using all 30 hashtags or including irrelevant trending tags triggers algorithmic suppression.
- **Editing captions after posting** -- May reset the algorithmic distribution cycle, killing early momentum.
- **Posting and ghosting** -- Not responding to comments in the first hour signals low engagement to the algorithm and reduces reach.
- **Inconsistent posting** -- Gaps of 7+ days signal an inactive account to the algorithm, reducing baseline reach.`,
    version: '1.0.0',
  },
  {
    name: 'Instagram Reels',
    category: 'platform' as const,
    platform: 'instagram',
    contentType: 'reels',
    description: 'Short-form vertical video optimized for discovery, watch time, and non-follower reach',
    constraints: JSON.stringify({
      max_duration_seconds: 90,
      recommended_duration: '15-30s',
      aspect_ratio: '9:16 vertical',
      caption_max_chars: 2200,
      caption_visible_chars: 125,
      max_hashtags: 30,
    }),
    content: `## Platform Rules

- Reels are the primary discovery format on Instagram. They are shown to non-followers via the Explore page and the dedicated Reels tab, making them the strongest tool for audience growth.
- Watch time is the dominant metric: completion rate and replays directly boost distribution. A 15-second Reel watched twice outperforms a 60-second Reel watched halfway.
- Engagement weight for Reels: Shares > Saves > Comments > Likes. Shares to DMs and Stories carry the highest algorithmic value.
- Reels can be posted at any time -- algorithmic distribution is less time-dependent than feed posts, though early engagement still helps.
- Trending audio boosts Explore placement. Using a currently trending sound gives a measurable bump in impressions.
- Consistent Reels posting (3-5x/week) signals an active creator account and maintains algorithmic favor.

## Content Structure

### Reel Sequence

1. **Hook (0-2 seconds)** -- Text overlay or spoken hook that immediately creates curiosity or promises value. No slow intros, no logos, no "hey guys." The viewer decides to stay or swipe in this window.
2. **Setup (2-5 seconds)** -- Quick context establishing what the Reel is about and why the viewer should care. Keep it tight.
3. **Delivery (5-60 seconds)** -- The core value: tutorial steps, story beats, entertainment, or insight. Maintain visual variety with cuts, angles, or B-roll every 3-5 seconds.
4. **CTA (last 3-5 seconds)** -- Direct ask: follow for more, comment your answer, share with someone who needs this. Keep it short and specific.

### Loop Design

- Design the ending to visually or narratively connect back to the beginning. A seamless loop encourages replays, which are one of the strongest algorithmic signals.
- Common loop techniques: ending mid-sentence and starting with the same word, visual match cuts, circular storytelling.

## Writing Guidelines

- **Hook must be immediate.** The first 1-2 seconds determine whether the viewer stays. Use text overlays that pose a question, make a bold claim, or tease a reveal.
- Write spoken scripts at a conversational pace. Aim for 130-150 words per minute of content.
- Keep Reels between 15-30 seconds for maximum completion rate. Shorter Reels have higher replay potential.
- Add captions/subtitles to every Reel. 85% of Instagram users watch without sound. Burned-in subtitles are non-negotiable.
- Caption (below the Reel): front-load the value in the first 125 visible characters. Expand with context, then add hashtags.
- Use trending audio when it fits your content naturally. Forced trending audio with no connection to the content feels inauthentic.
- End with a specific CTA, not a generic "follow me." Ask a question, prompt a share, or direct to another piece of content.

## Output Format

\`\`\`
=== REEL SCRIPT ===

HOOK (0-2s):
[Visual]: [What appears on screen -- text overlay, action, scene]
[Audio]: [Spoken words, trending sound, or music cue]
[Text Overlay]: [On-screen text that hooks the viewer -- max 10 words]

SETUP (2-5s):
[Visual]: [Scene or transition establishing context]
[Script]: [Spoken setup -- 1-2 sentences max]

DELIVERY (5-60s):
[Visual]: [Shot-by-shot breakdown with cuts every 3-5 seconds]
[Script]: [Full spoken script for the delivery section]
[Text Overlays]: [Key points highlighted on screen]

CTA (last 3-5s):
[Visual]: [Final frame or gesture]
[Script]: [Spoken CTA -- one specific ask]
[Text Overlay]: [CTA text on screen]

=== CAPTION ===
[Hook line -- must fit in 125 characters]

[Expanded context or value -- 2-3 short lines]

[CTA -- question or action prompt]

=== HASHTAGS ===
#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5
[5-15 hashtags, relevant to the content topic]

=== AUDIO NOTE ===
[Trending sound suggestion or original audio direction]
\`\`\`

## Quality Criteria

- [ ] Hook delivers a clear curiosity gap or value promise within the first 2 seconds
- [ ] Total duration is between 15-30 seconds for optimal completion rate
- [ ] Script includes burned-in subtitles/captions for sound-off viewing
- [ ] Visual variety is present -- cuts or angle changes every 3-5 seconds
- [ ] Ending is designed for loop potential (visual or narrative connection to the start)
- [ ] CTA is specific and actionable, not generic
- [ ] Caption first 125 characters work as a standalone hook
- [ ] Audio direction is specified (trending sound or original audio)
- [ ] Aspect ratio is 9:16 vertical -- no horizontal or square content
- [ ] Content delivers on the hook's promise (no bait-and-switch)

## Anti-Patterns

- **Landscape video as Reels** -- Horizontal video cropped into 9:16 wastes screen real estate and looks unintentional. Always shoot natively vertical.
- **No subtitles on Reels** -- 85% of users watch without sound. A Reel without captions loses the majority of its potential audience.
- **Slow intros** -- Starting with a logo reveal, "hey guys," or any non-hook content causes immediate swipe-away. Hook first, always.
- **No CTA** -- Reels without a clear ask generate significantly fewer follows, saves, and shares. Always direct the viewer's next action.
- **Posting and ghosting** -- Not engaging with comments in the first hour reduces the Reel's algorithmic momentum.
- **Generic stock aesthetics** -- Overly polished, impersonal content signals "ad" and reduces organic reach.
- **Hashtag spam** -- Using 30 irrelevant hashtags triggers suppression. Stick to 5-15 relevant tags.
- **Forced trending audio** -- Using a trending sound that has no connection to the content feels inauthentic and does not boost performance the way contextually relevant audio does.`,
    version: '1.0.0',
  },
  {
    name: 'Instagram Stories',
    category: 'platform' as const,
    platform: 'instagram',
    contentType: 'stories',
    description: 'Ephemeral 24-hour vertical content with interactive elements for audience engagement and retention',
    constraints: JSON.stringify({
      max_duration_seconds: 60,
      aspect_ratio: '9:16 vertical',
      format: 'ephemeral (24h)',
      interactive_elements: 'polls, questions, links, stickers, quizzes',
    }),
    content: `## Platform Rules

- Stories are ephemeral and disappear after 24 hours. This creates urgency and encourages immediate viewing. High-performing Stories can be saved to Highlights for permanent access.
- Stories appear at the top of the feed in the Stories bar. Posting multiple times throughout the day keeps your profile at the front of the bar, maintaining visibility.
- Story engagement (replies, sticker interactions, poll votes) signals account relevance to the algorithm, which in turn boosts your feed post and Reel distribution.
- Stories are shown primarily to existing followers, not new audiences. They are a retention and deepening tool, not a discovery tool.
- Interactive elements (polls, questions, quizzes, sliders) dramatically increase engagement rate and time spent on your Stories.
- Link stickers are the only way to share clickable links on Instagram (outside of bio). Use them strategically to drive traffic.

## Content Structure

### Story Sequence Design

Stories work best as short sequences of 3-7 frames that follow a narrative arc. Each frame should be consumable in 3-5 seconds.

1. **Opener frame** -- Grab attention with a bold statement, question, or visually striking image. This determines whether viewers watch the rest of the sequence.
2. **Context frames (1-3)** -- Build the story, share the insight, or present the information. Keep text short and use visual hierarchy.
3. **Interactive frame** -- Deploy a poll, question box, quiz, or slider to transform passive viewers into active participants.
4. **Closer frame** -- Deliver the conclusion, payoff, or CTA. Link sticker if driving traffic. "DM me" or "Reply to this" for conversation.

### Frame Types

- **Text-on-background**: Bold text with a colored background. Best for announcements, questions, or quick thoughts.
- **Photo/video with overlay**: Visual content with text overlay and optional stickers. The primary Story format.
- **Interactive**: Frames built around a poll, quiz, question box, or emoji slider as the central element.
- **Link frame**: Frame with a link sticker driving to an external URL. Must include clear context for why the viewer should tap.

## Writing Guidelines

- **Keep text extremely short.** Stories are consumed in seconds. 2-3 lines of large text maximum per frame. If it takes more than 3 seconds to read, it is too long.
- Use a casual, conversational tone. Stories are the most informal format on Instagram. First person, contractions, and casual language are expected.
- Write text overlays in large, bold fonts. Small text is unreadable on mobile and gets ignored.
- Every interactive element needs a clear, specific prompt. "What do you think?" is weak. "Which would you choose: A or B?" is strong.
- Use polls and quizzes to segment your audience and gather feedback. The responses provide content ideas and audience insights.
- Questions boxes should ask something genuinely interesting that viewers want to answer. Generic prompts get ignored.
- When using link stickers, always add context text explaining what the link is and why they should tap. A bare link sticker with no context gets minimal taps.
- Stories do not use hashtags or formal caption structure. The tone is raw and immediate.

## Output Format

\`\`\`
=== STORY SEQUENCE ===

FRAME 1 (Opener):
[Visual]: [Photo/video description or background color]
[Text Overlay]: [Bold hook text -- max 2 lines, large font]
[Sticker/Element]: [None / Music / Location / Mention]

FRAME 2 (Context):
[Visual]: [Photo/video description]
[Text Overlay]: [Supporting context -- max 3 lines]
[Sticker/Element]: [Optional element]

FRAME 3 (Interactive):
[Visual]: [Background or supporting visual]
[Text Overlay]: [Prompt text leading into the interactive element]
[Interactive Element]: [Poll: "Option A" vs "Option B" / Quiz: "Question?" with answers / Question Box: "Ask me about..." / Emoji Slider: "How much do you [X]?"]

FRAME 4 (Closer/CTA):
[Visual]: [Final visual]
[Text Overlay]: [Conclusion, payoff, or CTA text -- max 2 lines]
[Sticker/Element]: [Link sticker with URL / "DM me" prompt / Countdown sticker]

=== SEQUENCE NOTES ===
Total frames: [3-7]
Estimated view time: [X seconds total]
Primary goal: [Engagement / Traffic / Feedback / Announcement]
\`\`\`

## Quality Criteria

- [ ] Sequence is 3-7 frames long (not too short to have impact, not too long to cause drop-off)
- [ ] Opener frame grabs attention within 2 seconds with a visual or textual hook
- [ ] Text overlays are 2-3 lines maximum per frame with large, readable font
- [ ] At least one frame includes an interactive element (poll, quiz, question, or slider)
- [ ] Interactive prompts are specific and binary/concrete, not vague or open-ended
- [ ] Tone is casual and conversational, matching the ephemeral nature of Stories
- [ ] Link stickers (if used) include context text explaining what the link is and why to tap
- [ ] Each frame is consumable in 3-5 seconds without pausing
- [ ] Sequence follows a narrative arc (opener, context, interaction, closer)
- [ ] Content is vertical-native (9:16), not adapted from horizontal content

## Anti-Patterns

- **Wall of text on a single frame** -- Stories are consumed in seconds. More than 3 lines of text causes viewers to skip forward or exit. Break long messages across multiple frames.
- **No interactive elements** -- Stories without polls, questions, or quizzes miss the primary engagement mechanism of the format. Passive-only Stories get lower completion rates.
- **Link sticker with no context** -- A bare link sticker without text explaining what it leads to and why the viewer should tap gets minimal click-through.
- **Posting one Story per day** -- A single frame does not stay at the top of the Stories bar. Post 3-7 frames per sequence to maintain visibility.
- **Repurposing feed posts as Stories** -- Screenshotting a carousel slide or resharing a feed post without adding new value feels lazy. Add commentary, behind-the-scenes context, or an interactive element.
- **Horizontal content in Stories** -- Landscape photos or videos with black bars above and below waste screen space and look unintentional.
- **Generic question prompts** -- "Any questions?" or "What do you think?" are too vague to generate responses. Be specific: "What is your biggest challenge with X?"
- **Ignoring Story replies** -- Story replies are high-intent DMs. Not responding kills future engagement and signals disinterest to your audience.`,
    version: '1.0.0',
  },
  {
    name: 'LinkedIn Post',
    category: 'platform' as const,
    platform: 'linkedin',
    contentType: 'post',
    description: 'Text posts and document carousels optimized for professional engagement, dwell time, and comment-driven reach',
    constraints: JSON.stringify({
      post_max_chars: 3000,
      post_visible_chars: 210,
      hashtags_max: 5,
      recommended_hashtags: '3-5',
      carousel_max_slides: 300,
      recommended_slides: '10-15',
      max_posts_per_day: 1,
    }),
    content: `## Platform Rules

- Posts with external links in the body receive approximately 3x less reach. The LinkedIn algorithm actively deprioritizes outbound traffic. Always use the "link in comments" approach.
- Comments are weighted far more heavily than reactions. Long, substantive comments signal valuable content to the algorithm. Questions drive 2x more comments than statements.
- The first 60 minutes are critical. Engagement velocity in this window determines whether the post expands beyond your initial 5-10% network reach.
- Dwell time is an algorithmic signal. Longer posts that keep people reading and scrolling get boosted in distribution.
- Document/carousel posts receive 2-3x more reach than text-only posts. The swipe interaction increases dwell time.
- The algorithm rewards creators who reply to every comment on their posts. Active comment sections signal quality.
- Avoid more than 1 post per day. Multiple daily posts compete against each other for your audience's attention and the algorithm may cannibalize your own reach.
- Best posting times: 7-9 AM or 12-1 PM on weekdays in your audience's time zone. Tuesday, Wednesday, and Thursday consistently outperform other days. Weekends see 50-70% engagement drops.
- Allow 18-24 hours between posts for maximum individual post distribution.

## Content Structure

### Text Post Structure

1. **Hook (first 2 lines / ~210 characters)** -- This is everything. The hook appears before the "see more" fold. Use a contrarian take, surprising stat, personal story opener, or bold claim that compels the tap.
2. **Story/Context (2-3 short paragraphs)** -- Personal experience, observation, or data that supports your point. Write in first person. Use short sentences and frequent line breaks (1-2 sentences per paragraph).
3. **Insights/Lessons (3-5 bullet points)** -- Actionable takeaways, numbered or bulleted. These are the save-worthy core of the post.
4. **Takeaway (1-2 sentences)** -- The one thing to remember.
5. **CTA question** -- A genuine question that invites conversation: "What's your experience with [topic]?" or "Agree or disagree?"
6. **Hashtags (last line)** -- 3-5 relevant hashtags, separated from the body text.

### Document/Carousel Structure

- Hook slide with a bold statement or question.
- 10-15 slides with one idea per slide, 20-30 words maximum.
- Clean, readable design with large text and minimal clutter.
- CTA on the final slide directing comments, shares, or follows.
- Upload as PDF format.

### Effective Post Formats

- **Storytelling**: "3 years ago, I [experience]. Here is what I learned..."
- **Thought leadership**: "Unpopular opinion: [contrarian take]. Here is why..."
- **Data-driven**: "[Surprising stat]. Here is what it means for [audience]..."
- **Lessons learned**: "I [did X] and discovered [Y]. The 5 biggest lessons:"
- **Before/After**: "Before: [old way]. After: [new insight]. The difference was [key lesson]."

## Writing Guidelines

- **First person is mandatory.** Personal stories outperform generic advice on LinkedIn. "I learned" beats "One should learn."
- Write in short paragraphs of 1-2 sentences. A wall of text kills readability and dwell time.
- Front-load the hook. The first 210 characters (~2 lines on desktop) must compel the "see more" tap. If the hook does not create curiosity, urgency, or personal relevance, rewrite it.
- Ask a genuine question at the end. Not rhetorical, not generic. A specific question your audience can answer from their own experience.
- Tag only 2-3 people who will actually engage. Spam tagging 10+ people looks desperate and may trigger filters.
- Never put links in the post body. Post the content first, then add the link as the first comment. Or say "Link in comments" and drop it in a reply.
- Use 3-5 hashtags on the last line. Mix 1-2 broad industry tags with 2-3 niche/specific tags. Avoid generic hashtags like #motivation or #success.
- Do not place hashtags in the middle of post text. It breaks readability and looks unprofessional.

## Output Format

\`\`\`
=== HOOK ===
[First 2 lines -- must work before the "see more" fold. Max ~210 characters. Contrarian take, surprising stat, or personal story opener.]

=== BODY ===
[Story or context -- 2-3 short paragraphs, first person, short sentences, frequent line breaks.]

[Transition to insights.]

=== INSIGHTS ===
1. [Actionable takeaway -- one sentence]
2. [Actionable takeaway -- one sentence]
3. [Actionable takeaway -- one sentence]
4. [Actionable takeaway -- one sentence]
5. [Actionable takeaway -- one sentence]

=== CTA ===
[One-line takeaway summary.]

[Genuine question to drive comments -- specific, not generic.]

=== HASHTAGS ===
#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5
[3-5 hashtags on a separate final line]
\`\`\`

## Quality Criteria

- [ ] Hook fits within ~210 characters and creates a compelling reason to tap "see more"
- [ ] Post is written in first person with a personal, authentic voice
- [ ] Paragraphs are 1-2 sentences long with line breaks between them
- [ ] Post contains 3-5 actionable, numbered or bulleted insights
- [ ] CTA is a genuine, specific question (not rhetorical or generic)
- [ ] No external links appear in the post body
- [ ] Hashtags are 3-5 total, placed on the last line, separated from the body
- [ ] No more than 2-3 people are tagged, and only those who will likely engage
- [ ] Total post length is under 3,000 characters
- [ ] Post delivers value worth commenting on, not just reacting to

## Anti-Patterns

- **Links in post body** -- Kills reach by approximately 3x. The algorithm deprioritizes posts that drive users off LinkedIn. Always use the "link in comments" approach.
- **Spam tagging** -- Tagging 10+ people who did not ask to be tagged looks desperate, may trigger spam filters, and damages professional credibility.
- **Editing after posting** -- Editing within the first 10 minutes can reset algorithmic distribution, destroying the critical early engagement window.
- **More than 1 post per day** -- Posts compete against each other for your own audience's attention. The algorithm may suppress the second post.
- **Corporate jargon** -- "Synergy," "leverage," "circle back," "at the end of the day" make content feel robotic and impersonal. Write like a human.
- **No line breaks** -- A wall of text kills readability and dwell time. Use 1-2 sentence paragraphs with whitespace between them.
- **Posting on weekends** -- Unless your audience is specifically active on weekends, reach drops 50-70% on Saturday and Sunday.
- **Generic motivational quotes** -- Saturated content type that signals low effort and does not generate meaningful engagement.
- **Engagement pods** -- LinkedIn actively detects and penalizes coordinated engagement groups. The short-term boost is not worth the long-term suppression risk.
- **Reposting without adding value** -- "So true!" reshares get minimal engagement. Always add your own perspective, experience, or analysis.`,
    version: '1.0.0',
  },
  {
    name: 'LinkedIn Article',
    category: 'platform' as const,
    platform: 'linkedin',
    contentType: 'article',
    description: 'Long-form blog-style content optimized for SEO, thought leadership, and evergreen professional value',
    constraints: JSON.stringify({
      optimal_word_count: '1500-2000',
      headline_max_chars: 220,
    }),
    content: `## Platform Rules

- LinkedIn Articles have lower immediate feed reach than posts but offer stronger long-term SEO value. Articles are indexed by search engines and remain discoverable indefinitely.
- Articles appear on your profile under the "Activity" section and can be featured in the "Featured" section for permanent visibility.
- The algorithm distributes articles primarily to your existing network. To maximize reach, share the article as a post with a compelling hook and "Link in comments" approach.
- Articles support rich formatting: headers, images, embedded media, block quotes, and numbered lists. Use these to increase dwell time and readability.
- Commenting and engagement on articles still matter. The first 60 minutes of engagement influence how broadly the article is distributed in the LinkedIn feed.
- Articles can be published as part of a LinkedIn Newsletter, which pushes notifications to subscribers and dramatically increases consistent readership.
- Best publishing days: Tuesday, Wednesday, Thursday during business hours (7-9 AM or 12-1 PM in your audience's time zone).

## Content Structure

### Article Architecture

1. **Headline** -- SEO-friendly, specific, and curiosity-driven. Front-load the primary keyword within the first 70 characters. Maximum 220 characters, but 60-100 characters is optimal for display.
2. **Cover image** -- High-quality, relevant visual. Avoid generic stock photos. Custom graphics or contextual images perform better.
3. **Introduction (150-250 words)** -- State the problem, establish relevance, and preview what the reader will learn. The first 2-3 sentences must hook the reader -- they appear as the article preview in the feed.
4. **Body sections (3-5 sections, 250-400 words each)** -- Each section addresses one sub-topic with a clear subheading. Use a mix of narrative, data, and practical advice.
5. **Actionable takeaways** -- Each body section should end with a concrete, implementable takeaway. Readers should be able to act on the advice immediately.
6. **Conclusion (100-200 words)** -- Synthesize the key message into a single memorable insight. Reinforce the transformation or shift in thinking.
7. **CTA** -- End with a question that invites comments, a prompt to share, or a direction to related content.

### Section Design

- Use H2 subheadings for major sections and H3 for sub-points. Clear hierarchy helps both readability and SEO.
- Include at least one data point, case study, or concrete example per section. Abstract advice without evidence is forgettable.
- Use bullet points and numbered lists for scannable content within sections.
- Keep paragraphs to 2-4 sentences maximum. Long paragraphs cause reader fatigue on screen.

## Writing Guidelines

- **Write in first person.** Personal experience and professional expertise are what give LinkedIn Articles authority. "In my experience" is more compelling than "It is generally recommended."
- **Headline must balance SEO and curiosity.** Include the primary keyword naturally. Good: "Why Most B2B Content Strategies Fail (And 5 Ways to Fix Yours)." Bad: "Thoughts on Marketing."
- Front-load value in the introduction. The first 2-3 sentences appear as the article preview in the LinkedIn feed. They must create a compelling reason to click through.
- Use subheadings that are informative, not clever. "How to Structure Your First 90 Days" is better than "The Beginning." Readers scan subheadings to decide whether to read the full article.
- Every section should answer the question "So what?" Give the reader a reason to care and something to do with the information.
- Include specific numbers, frameworks, or step-by-step processes. Vague advice ("be more strategic") is worthless. Specific advice ("allocate 30% of your budget to X, track Y metric weekly") is actionable.
- Close with a single, strong CTA. Do not scatter multiple calls to action throughout. One ask at the end: a question, a share prompt, or a link to related content.
- Keep total length between 1,500-2,000 words. Under 1,000 feels thin for an article format. Over 2,500 causes completion rate drop-off.

## Output Format

\`\`\`
=== HEADLINE ===
[SEO-optimized headline -- 60-100 characters optimal, max 220. Front-load primary keyword.]

=== COVER IMAGE ===
[Description of the cover image concept -- relevant, not generic stock]

=== INTRO ===
[Opening hook -- 2-3 sentences that create urgency or curiosity]

[Problem statement -- what challenge or gap this article addresses]

[Preview -- what the reader will learn or gain by reading]

=== SECTION 1: [Subheading] ===
[Narrative, data, or example -- 250-400 words]
[Concrete takeaway from this section]

=== SECTION 2: [Subheading] ===
[Narrative, data, or example -- 250-400 words]
[Concrete takeaway from this section]

=== SECTION 3: [Subheading] ===
[Narrative, data, or example -- 250-400 words]
[Concrete takeaway from this section]

=== SECTION 4: [Subheading] (optional) ===
[Narrative, data, or example -- 250-400 words]
[Concrete takeaway from this section]

=== CONCLUSION ===
[Synthesis -- the single most important insight from the article, 100-200 words]

=== CTA ===
[One clear call to action -- question for comments, share prompt, or link to related content]
\`\`\`

## Quality Criteria

- [ ] Headline is 60-100 characters, front-loads the primary keyword, and creates curiosity
- [ ] Introduction establishes the problem and previews the article's value within the first 3 sentences
- [ ] Article contains 3-5 body sections, each with a clear H2 subheading
- [ ] Each section includes at least one concrete example, data point, or case study
- [ ] Each section ends with an actionable takeaway the reader can implement
- [ ] Total word count is between 1,500-2,000 words
- [ ] Paragraphs are 2-4 sentences maximum
- [ ] Article is written in first person with professional authority
- [ ] Conclusion synthesizes one memorable insight, not just a summary of points
- [ ] CTA is a single, clear ask at the end of the article

## Anti-Patterns

- **Vague, keyword-stuffed headlines** -- "Thoughts on Innovation and Digital Transformation in 2024" says nothing specific and will be ignored. Headlines must promise a concrete benefit or insight.
- **No subheadings** -- Long-form content without visual hierarchy is a wall of text. Readers scan subheadings to decide whether to invest time reading.
- **Abstract advice without evidence** -- "Be more strategic" or "Focus on value" without specific examples, data, or frameworks is forgettable and unactionable.
- **Corporate jargon** -- "Leveraging synergies to drive holistic transformation" alienates readers. Write in plain, direct language.
- **Burying the value** -- If the most useful insight is in paragraph 12, most readers will never reach it. Front-load value and structure for scanning.
- **Multiple scattered CTAs** -- Asking readers to like, share, comment, subscribe, visit your website, and download a PDF dilutes every ask. Pick one primary CTA.
- **Generic stock cover images** -- A handshake photo or a lightbulb clipart signals low effort. Use a relevant, custom visual.
- **Under 1,000 words** -- An article that is too short feels like it should have been a post. The article format implies depth and substance.
- **No line breaks or formatting** -- Dense paragraphs of 6+ sentences cause reader fatigue. Use short paragraphs, bullets, and whitespace.`,
    version: '1.0.0',
  },
  {
    name: 'Twitter/X Post',
    category: 'platform' as const,
    platform: 'twitter',
    contentType: 'post',
    description: 'Single tweets and quote tweets optimized for engagement, bookmarks, and algorithmic reach',
    constraints: JSON.stringify({
      tweet_max_chars: 280,
      effective_chars: 260,
      hashtags_max: 3,
      recommended_hashtags: '2-3',
      images_per_tweet: 4,
    }),
    content: `## Platform Rules

- Engagement is weighted: Replies > Bookmarks > Retweets > Likes. Design tweets that provoke replies and are worth bookmarking.
- Tweets with images or video get significantly more impressions than text-only tweets. Always consider whether a visual element strengthens the tweet.
- The algorithm penalizes tweets with external links in the body. Links reduce distribution. Post the link in a reply instead or use the "link in bio" approach.
- Early engagement in the first 15-30 minutes is critical. The algorithm tests your tweet with a small audience first, then expands based on engagement velocity.
- Dwell time matters. Tweets that make people stop scrolling and read get algorithmic boosts. Multi-line tweets with line breaks create natural dwell time.
- Tweets from accounts that actively reply to others get higher baseline reach. Engagement is a two-way signal.
- Best posting times: 8-10 AM EST or 12-1 PM EST on weekdays. Tuesday through Thursday for professional and B2B content. Saturday morning works for casual content.
- Frequency: 1-3 tweets per day is a sustainable, high-performing cadence.

## Content Structure

### Single Tweet Formats

- **Hot take**: Contrarian opinion that sparks debate. "Most people think X. The truth is Y."
- **Question**: Simple, relatable question that invites replies. "What is the one thing you wish you knew about [topic]?"
- **Listicle**: "5 things I learned about X:" followed by a numbered list, one item per line.
- **Quote + take**: Share a quote and add your unique perspective in 1-2 sentences.
- **Data point**: One surprising stat with your interpretation. "[Stat]. Here is what most people miss:"
- **Before/After**: Contrast two states or perspectives. "Before: [old way]. Now: [new insight]."

### Quote Tweet Structure

1. Highlight the key point from the original tweet.
2. Add your unique angle, experience, or data.
3. Keep under 200 characters to leave room for the quoted content's context.

### Tweet Anatomy

- **Opening words** -- The first 5-8 words decide whether someone reads further. Front-load the value or tension.
- **Body** -- One idea only. Develop it clearly in 1-3 sentences maximum.
- **Closer** -- A question, bold statement, or implication that invites engagement.

## Writing Guidelines

- **One idea per tweet.** Clarity beats cleverness. If you need multiple points, write a thread instead.
- Front-load the value. The first few words of the tweet determine whether someone reads the rest. Start with the strongest word or phrase.
- Use line breaks strategically for readability. A tweet formatted as 2-3 short lines reads better than one dense paragraph.
- Leave approximately 20 characters of headroom for hashtags. Aim for ~260 effective characters of content.
- Use 2-3 hashtags maximum. Place them at the end of the tweet or weave them naturally into the text. More than 3 hashtags signals low-quality content.
- Focus on industry/topic-specific hashtags, not generic ones. #ContentStrategy beats #Success.
- When quote tweeting, add genuine insight. Not "This!" or "So true." Add your experience, a counter-point, or additional data.
- Write tweets that invite replies: questions, fill-in-the-blank prompts, "unpopular opinion" takes, and debate-starting claims.
- Reply to comments on your tweets within the first hour to boost algorithmic momentum.

## Output Format

\`\`\`
=== TWEET ===
[Tweet text -- max 280 characters. Front-load value. One clear idea. Use line breaks for readability.]

=== HASHTAGS ===
#hashtag1 #hashtag2
[2-3 hashtags, placed at the end of the tweet or noted separately]

=== IMAGE (optional) ===
[Image description -- what the visual shows, composition, text overlay if any]
[Alt text for accessibility -- max 1,000 characters]

=== QUOTE TWEET (if applicable) ===
[URL or reference to the original tweet being quoted]
[Your commentary -- max 200 characters to leave room for context]
\`\`\`

## Quality Criteria

- [ ] Tweet is 280 characters or fewer, with ~260 characters of content leaving room for hashtags
- [ ] First 5-8 words create enough interest to finish reading the tweet
- [ ] Tweet contains exactly one clear idea, not multiple crammed together
- [ ] Hashtags are 2-3 maximum and topic-specific, not generic
- [ ] No external links appear in the tweet body (links go in replies)
- [ ] Tweet is formatted with line breaks for readability where appropriate
- [ ] Content invites a reply, bookmark, or retweet through its framing
- [ ] Quote tweets (if used) add genuine insight, not just agreement
- [ ] Image alt text is included if an image is attached
- [ ] Tweet avoids filler words and gets to the point immediately

## Anti-Patterns

- **Links in tweet body** -- Dramatically reduces reach due to algorithmic suppression. Post the link as a reply or use "link in bio."
- **Excessive emojis** -- More than 2-3 emojis per tweet looks unprofessional and reduces credibility in professional niches.
- **Hashtag spam** -- More than 3 hashtags per tweet signals low-quality content and reduces engagement rather than increasing it.
- **Reposting the same content verbatim** -- The algorithm detects duplicate content and suppresses it. Rephrase or add new context when revisiting a topic.
- **Not engaging with replies** -- Failing to respond to comments signals to the algorithm that your content does not generate real conversation, reducing future distribution.
- **Using URL shorteners** -- Twitter/X already shortens links. Third-party shorteners look suspicious and may be flagged as spam.
- **Auto-cross-posting from other platforms** -- Truncated content and broken formatting from Instagram or LinkedIn cross-posts damage credibility and get no engagement.
- **Cramming multiple ideas into one tweet** -- A tweet trying to cover 3 topics communicates none of them effectively. If you have multiple points, use a thread.
- **Posting during major breaking news** -- Your content will be buried under breaking news engagement. Check current events before posting.`,
    version: '1.0.0',
  },
  {
    name: 'Twitter/X Thread',
    category: 'platform' as const,
    platform: 'twitter',
    contentType: 'thread',
    description: 'Multi-tweet threads optimized for long-form storytelling, education, and sustained engagement',
    constraints: JSON.stringify({
      tweet_max_chars: 280,
      optimal_thread_length: '5-15 tweets',
      hashtags: 'only on first tweet',
    }),
    content: `## Platform Rules

- Threads receive 2-3x more impressions than standalone tweets. The multi-tweet format increases dwell time and creates multiple engagement touchpoints.
- Engagement is weighted: Replies > Bookmarks > Retweets > Likes. Threads that are bookmark-worthy (educational, reference-quality) get sustained distribution.
- Early engagement on the first tweet (first 15-30 minutes) is critical. If the first tweet does not perform, the thread's remaining tweets receive limited distribution.
- Replying to your own tweet within 1 hour can boost the thread's visibility. Consider adding a summary or additional context as a self-reply.
- The algorithm penalizes tweets with external links. If including links, place them in the final tweet or as a reply below the thread.
- Threads from accounts that actively engage with others' content get higher baseline reach.
- Best posting times: 8-10 AM EST or 12-1 PM EST on weekdays, particularly Tuesday through Thursday. Threads need immediate engagement to gain traction, so timing matters more than for standalone tweets.
- Avoid posting threads during low-traffic hours or major breaking news cycles.

## Content Structure

### Thread Architecture

1. **Hook tweet (Tweet 1/N)** -- The most important tweet. It must stand completely alone as a compelling, self-contained statement. This is what appears in the feed and determines whether anyone reads further. Bold claim, surprising stat, or "Here is what I learned from..." format.
2. **Context tweet (Tweet 2/N)** -- Brief background establishing why this matters and who should keep reading. Sets the stage for the body.
3. **Body tweets (Tweets 3-N-2)** -- One insight, point, or story beat per tweet. Numbered for progress tracking. Each tweet should deliver standalone value while advancing the larger narrative.
4. **Summary tweet (Tweet N-1)** -- Recap the key takeaways in bullet points. This is the second most bookmarked tweet in a thread after the first.
5. **CTA tweet (Tweet N/N)** -- Ask for a follow, retweet of the first tweet for reach, or bookmark for reference. Include a link back to the first tweet for easy sharing.

### Tweet-Level Structure

- Each individual tweet in the thread should be a complete thought. Avoid splitting a sentence across two tweets.
- Use numbering format (1/10, 2/10... or 1., 2., 3...) so readers know the thread length and their progress.
- Start each tweet with the key point, then support it. Do not bury the insight at the end.

Thread length: 5-8 tweets for focused insights, 9-12 for comprehensive breakdowns, 13-15 maximum. Beyond 15, engagement drops sharply. Never pad to hit a target length.

## Writing Guidelines

- **The first tweet is everything.** It must be compelling as a standalone tweet. If someone only sees tweet 1 and never clicks the thread, it should still deliver value or create irresistible curiosity.
- Number every tweet so readers know the thread length. "1/10" or "(1)" format both work. Knowing the length helps readers decide to commit.
- One point per tweet. Do not cram multiple ideas into a single tweet. Each tweet should feel like a self-contained insight with a clear beginning and end.
- Use the last tweet for a summary and CTA. Recap the 3-5 key points in bullet format, then ask for a follow, retweet of the first tweet, or bookmark.
- Use hashtags only on the first tweet. Hashtags on every tweet in a thread look spammy and reduce readability. 2-3 relevant hashtags on tweet 1 is sufficient.
- Write conversationally. Threads are a storytelling format. Use "I" instead of "one," contractions instead of formal language, and short sentences instead of complex ones.
- Include a "retweet the first tweet" call to action in the final tweet. This is the primary sharing mechanism for threads and extends reach significantly.
- Keep each tweet under 280 characters but aim for substance. A tweet that is only 40 characters feels like padding.
- Reply to comments on the thread within the first hour. Engagement velocity in the early window determines total distribution.

## Output Format

\`\`\`
=== THREAD ===
TWEET 1/N (Hook):
[Standalone compelling statement -- bold claim, surprising stat, or curiosity gap. Must work even if no one reads the rest. Max 280 chars.]

#hashtag1 #hashtag2

TWEET 2/N (Context):
[Why this matters. Who should read this. Brief background. Max 280 chars.]

TWEET 3/N (Point 1):
[First key insight -- one clear point with support. Max 280 chars.]

TWEET 4/N (Point 2):
[Second key insight -- one clear point with support. Max 280 chars.]

TWEET 5/N (Point 3):
[Third key insight -- one clear point with support. Max 280 chars.]

...

TWEET (N-1)/N (Summary):
Key takeaways:
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

TWEET N/N (CTA):
[If this was valuable, retweet tweet 1 to share it with your audience.

Follow @[handle] for more on [topic].

Bookmark this thread for reference.]

=== THREAD NOTES ===
Total tweets: [N]
Primary topic: [Topic]
Target audience: [Who this is for]
\`\`\`

## Quality Criteria

- [ ] First tweet works as a compelling standalone statement, even without the rest of the thread
- [ ] Thread is 5-15 tweets long (not shorter, not longer)
- [ ] Every tweet contains exactly one clear point or insight
- [ ] Tweets are numbered (1/N format) so readers know the length
- [ ] Hashtags appear only on the first tweet (2-3 maximum)
- [ ] No tweet splits a sentence across tweet boundaries
- [ ] Summary tweet recaps key takeaways in bullet format
- [ ] Final tweet includes a CTA: retweet tweet 1, follow, or bookmark
- [ ] No external links in tweet bodies (links go in the final tweet or a reply)
- [ ] Each tweet delivers standalone value while advancing the thread's narrative

## Anti-Patterns

- **Thread with no hook** -- Starting with "Thread on [topic]:" without any compelling reason to read guarantees low engagement. The first tweet must create curiosity or deliver a striking insight.
- **Threads longer than 15 tweets** -- Engagement drops sharply after tweet 12-15. Readers lose interest and stop scrolling. If your content requires more, split into multiple threads.
- **Splitting sentences across tweets** -- "And the most important thing is... (2/10) ...that you always start early." This creates a disjointed reading experience and frustrates readers who see individual tweets out of context.
- **Hashtags on every tweet** -- Using hashtags on all tweets in a thread looks spammy and clutters the reading experience. Limit hashtags to tweet 1 only.
- **No numbering** -- Without numbering, readers do not know how long the thread is and cannot gauge their commitment. Always number tweets.
- **Links in tweet bodies** -- External links reduce distribution. Save links for the final tweet or post them as a reply below the thread.
- **Not engaging with replies** -- A thread that generates replies but gets no author responses signals to the algorithm that the conversation is one-directional.
- **Posting threads at low-traffic hours** -- Threads depend on immediate engagement velocity more than standalone tweets. Posting at 11 PM on a Sunday kills distribution.
- **Padding with filler tweets** -- Tweets like "Let me explain..." without actual content waste reader attention and feel artificially inflated.
- **Reposting the same thread verbatim** -- The algorithm detects duplicates. If revisiting a topic, rewrite with new framing or updated data.`,
    version: '1.0.0',
  },
  {
    name: 'YouTube Video Script',
    category: 'platform' as const,
    platform: 'youtube',
    contentType: 'script',
    description: 'Long-form video scripts optimized for retention, CTR, and watch time with thumbnail-first planning',
    constraints: JSON.stringify({
      title_max_chars: 100,
      title_optimal_chars: '50-70',
      description_max_chars: 5000,
      description_visible_lines: 2,
      thumbnail_size: '1280x720px',
      optimal_duration: '8-15 minutes',
      end_screen_duration: '5-20 seconds',
    }),
    content: `## Platform Rules

- **CTR + Watch Time** are the two most important metrics. A video needs both a compelling thumbnail/title (for clicks) AND strong retention (for algorithmic expansion).
- The first 30 seconds determine whether viewers stay or leave. This is the make-or-break window for average view duration (AVD). Getting 70%+ AVD signals quality to the algorithm.
- Thumbnail is 50% of a video's performance. A great video with a weak thumbnail will fail. Design the thumbnail before scripting.
- Suggested videos are the primary traffic source for most channels. Optimize titles and thumbnails for browse and suggested placement. The algorithm tests with a small audience first, then expands based on CTR and AVD.
- Session time is rewarded. Videos that lead viewers to watch more YouTube content get algorithmic favor.
- Best upload days: Thursday, Friday, Saturday at 2-4 PM in your audience's time zone. Upload consistency matters -- the algorithm rewards predictable schedules.
- 8-15 minute videos hit the optimal balance: 8+ minutes enables mid-roll ads, under 15 minutes maintains strong retention.

## Content Structure

### Video Architecture

1. **Hook (0-30 seconds)** -- State the premise, show a preview of the payoff, create a curiosity loop that needs closing. "By the end of this video, you will know exactly how to..." Avoid asking for likes or subs here -- the viewer has received no value yet.
2. **Intro/Context (30 seconds - 1 minute)** -- Brief background establishing why this topic matters. Keep it tight. No lengthy channel introductions or sponsor segments.
3. **Body (1 minute - X minutes)** -- Deliver the core content in 3-5 distinct sections. Use pattern interrupts every 30-60 seconds: B-roll, graphics, angle changes, story shifts, or on-screen text. Monotony causes retention drop-off.
4. **Climax/Key Insight** -- The most valuable moment, the "aha" realization. Place this at 60-70% through the video to reward viewers who stayed and pull the retention curve forward.
5. **Summary (last 1-2 minutes)** -- Recap the key points and reinforce the primary takeaway. This cements the value and primes the viewer for the CTA.
6. **CTA + End Screen (last 20 seconds)** -- One primary CTA (subscribe, watch the next video, or leave a comment). Use end screen elements: subscribe button and next video card. Do not stack 5 different asks.

Use pattern interrupts every 30-60 seconds to reset viewer attention: cut to B-roll, zoom in/out, on-screen keyword highlight, story shift, angle changes, or audience questions.

## Writing Guidelines

- **Thumbnail first.** Design the thumbnail concept before scripting. If you cannot make a compelling thumbnail, reconsider the topic.
- **Title formula**: [Curiosity gap] + [Specific benefit]. Example: "I Tried X for 30 Days -- Here is What Happened." Front-load keywords in the first 50 characters.
- **Hook must establish stakes in 30 seconds.** State the payoff, preview the value, create an open loop. No "hey guys, welcome back."
- Write for spoken delivery. Short sentences, conversational language, natural speech patterns. If it sounds stiff read aloud, rewrite it.
- Add timestamps/chapters in the description for navigation. First 2 lines of the description must contain the hook and primary keywords (only visible lines before "Show more").
- Use 5-10 tags and 2-3 in-video cards linking to related content. Mark pattern interrupt cues (B-roll, graphics, angle changes) directly in the script.

## Output Format

\`\`\`
=== TITLE ===
[Video title -- 50-70 characters optimal, max 100. Curiosity gap + specific benefit. Front-load keywords.]
=== THUMBNAIL CONCEPT ===
[Visual description: subject/face expression, text overlay (3-4 words max), color scheme, composition. Must be readable at mobile thumbnail size.]

=== HOOK (0-30s) ===
[Spoken script for the first 30 seconds. State the premise, preview the payoff, create the curiosity loop.]
[Visual cues]: [What appears on screen during the hook]

=== INTRO (30s-1min) ===
[Brief context -- why this matters, who this is for. Keep under 30 seconds.]
[Visual cues]: [Supporting visuals]

=== BODY ===
Section 1: [Subheading] (Timestamp: ~1:00-X:XX)
[Script -- spoken content] | [Pattern interrupts]: [B-roll, graphic cues] | [Key point]: [Takeaway]

Section 2: [Subheading] (Timestamp: ~X:XX-X:XX)
[Script -- spoken content] | [Pattern interrupts]: [B-roll, graphic cues] | [Key point]: [Takeaway]

Section 3: [Subheading] (Timestamp: ~X:XX-X:XX)
[Script -- spoken content] | [Pattern interrupts]: [B-roll, graphic cues] | [Key point]: [Takeaway]

=== CLIMAX (at ~60-70% through) ===
[The "aha" moment -- most valuable insight or reveal] | [Visual cues]: [How to emphasize visually]

=== SUMMARY (last 1-2 min) ===
[Recap of key points. Reinforce the primary takeaway.]

=== CTA + END SCREEN (last 20s) ===
[One primary CTA] | [End screen elements]: [Subscribe button, next video card]

=== DESCRIPTION ===
[First 2 lines: Hook + primary keywords (visible before "Show more")]
[Video summary -- 2-3 sentences]
TIMESTAMPS:
0:00 - [Hook/Intro] | X:XX - [Section 1] | X:XX - [Section 2] | X:XX - [Section 3] | X:XX - [Summary/CTA]
[Links: related videos, resources, social media]

=== TAGS ===
[5-10 relevant keyword tags, comma-separated]
\`\`\`

## Quality Criteria

- [ ] Thumbnail concept is defined before the script, with face/emotion, 3-4 word text overlay, and high contrast design
- [ ] Title is 50-70 characters, front-loads keywords, and combines curiosity gap with specific benefit
- [ ] Hook establishes stakes and creates an open loop within the first 30 seconds
- [ ] Hook does not ask for likes/subs before delivering value
- [ ] Script includes pattern interrupt cues every 30-60 seconds (B-roll, graphics, angle changes)
- [ ] Body contains 3-5 distinct sections with clear subheadings
- [ ] Climax/key insight is placed at 60-70% through the video
- [ ] Total estimated duration is 8-15 minutes
- [ ] Description includes timestamps for chapter navigation
- [ ] First 2 lines of the description contain the hook and primary keywords
- [ ] End screen uses the last 20 seconds with one primary CTA

## Anti-Patterns

- **Clickbait that does not deliver** -- Misleading thumbnails and titles cause early drop-off, destroying average view duration and algorithmic trust. The video must fulfill the thumbnail's promise.
- **Slow intros** -- "Hey guys, welcome back to my channel, so today we are going to..." loses viewers immediately. Hook first, personal introduction later (or never).
- **Asking for likes/subs in the first 30 seconds** -- The viewer has received no value yet. Earn the ask by delivering value first, then requesting engagement.
- **No timestamps** -- Long videos without chapters frustrate viewers who want to navigate to specific sections, hurting retention and rewatch potential.
- **Generic thumbnails** -- Text-only or auto-generated thumbnails get dramatically lower CTR. Always design a custom thumbnail with face, emotion, and minimal text.
- **No pattern interrupts** -- Static talking-head without visual variety causes retention drop-off after 60 seconds. The audience's attention must be actively maintained.
- **Too many CTAs** -- "Like, subscribe, hit the bell, follow me on Instagram, check out my course, buy my merch..." dilutes every ask. Pick one primary CTA per video.
- **Inconsistent upload schedule** -- The algorithm and your audience both expect predictability. Erratic publishing kills momentum.
- **Uploading without a custom thumbnail** -- Auto-generated thumbnails are never acceptable. Always upload a designed thumbnail.
- **Ignoring comments** -- Creator replies boost comment visibility and signal community health. Unanswered comment sections look abandoned.`,
    version: '1.0.0',
  },
  {
    name: 'YouTube Shorts',
    category: 'platform' as const,
    platform: 'youtube',
    contentType: 'shorts',
    description: 'Short-form vertical video optimized for the Shorts feed, loop replays, and rapid audience growth',
    constraints: JSON.stringify({
      max_duration_seconds: 60,
      aspect_ratio: '9:16 vertical',
      hashtags: '3-5 max, include #Shorts',
    }),
    content: `## Platform Rules

- YouTube Shorts have a separate algorithm from long-form videos. Shorts views do not directly boost long-form distribution, and vice versa. Treat them as distinct content strategies.
- The Shorts feed is swipe-based. Viewers decide to stay or swipe in the first 1-2 seconds. The hook window is even shorter than Reels or TikTok.
- Completion rate and replays are the primary algorithmic signals. A Short that loops seamlessly and gets rewatched will be distributed far more widely than a longer Short with low completion.
- Shorts can be posted any day of the week. The Shorts feed is less time-dependent than long-form uploads.
- Including "#Shorts" in the title or description ensures proper categorization in the Shorts feed. Without it, the video may not surface in the dedicated Shorts experience.
- Shorts work best for teasers, quick tips, behind-the-scenes content, and reaction/commentary clips. They serve as a top-of-funnel audience growth tool.
- Frequency: 2-3 Shorts per week as supplements to long-form content is a sustainable cadence.
- Hashtags are low-priority on YouTube compared to other platforms, but 3-5 relevant hashtags in the description help with initial categorization. The first 3 hashtags appear above the title.

## Content Structure

### Shorts Sequence

1. **Hook (0-2 seconds)** -- Text overlay or spoken hook that immediately creates curiosity. "Here is the trick nobody talks about..." or "Stop doing X, do this instead." The viewer is one swipe away from leaving. Make the first frame impossible to ignore.
2. **Delivery (2-50 seconds)** -- One point, one story, one tip. No fluff, no tangents, no filler. Get to the value immediately and deliver it concisely. Maintain visual variety with cuts, text overlays, and angle changes.
3. **Punchline/Loop (last 5-10 seconds)** -- The payoff that ideally loops back into the hook. Design the ending to visually or narratively connect to the beginning, creating a seamless loop that encourages replays.

### Loop Design Techniques

- End with a statement that leads directly into the opening hook. "And that is exactly why..." (cut to) "Here is the trick nobody talks about..."
- Use visual match cuts: the last frame of the Short matches the first frame.
- Pose a question at the end that the beginning of the Short answers.
- Circular storytelling: end the story at the same point it began, with new context.

## Writing Guidelines

- **Hook must be instant.** The first 2 seconds determine everything. Use bold text overlays, a provocative opening statement, or a visually striking action. No title cards, no logos, no "hey guys."
- Keep Shorts between 15-45 seconds for maximum completion rate. Shorter is generally better for the Shorts algorithm.
- Add text overlays throughout the Short. Many viewers watch without sound. Key points, labels, and captions burned into the video are essential.
- Write scripts at a fast, energetic pace. Shorts reward density. Cut all filler words: "um," "so," "basically," "you know."
- Shoot natively in vertical 9:16. Never crop a horizontal video into vertical. Cropped content looks lazy, wastes screen space, and performs poorly.
- One topic, one takeaway. A Short that tries to cover 3 points communicates none effectively. If you have multiple points, make multiple Shorts.
- Include "#Shorts" in the title or description. Add 2-3 additional topic-relevant hashtags.
- Title should be concise and curiosity-driven. It appears below the Short in browse and search.
- Description should include #Shorts, relevant hashtags, and a brief context line.

## Output Format

\`\`\`
=== SHORTS SCRIPT ===

HOOK (0-2s):
[Visual]: [What appears on screen -- action, scene, or text overlay]
[Audio]: [Spoken hook or music cue]
[Text Overlay]: [Bold on-screen text -- max 8 words, large font]

DELIVERY (2-50s):
[Visual]: [Shot-by-shot breakdown -- cuts every 3-5 seconds]
[Script]: [Full spoken script for delivery. Fast pace, no filler.]
[Text Overlays]: [Key points highlighted on screen at timestamps]

PUNCHLINE/LOOP (last 5-10s):
[Visual]: [Final shot -- designed to connect back to the hook]
[Script]: [Closing statement or reveal that loops into the opening]
[Text Overlay]: [Punchline text on screen]

=== TITLE ===
[Short, curiosity-driven title -- appears below the Short in browse]

=== DESCRIPTION ===
[Brief context line -- 1 sentence]

#Shorts #hashtag2 #hashtag3 #hashtag4
[3-5 hashtags including #Shorts]

=== LOOP NOTE ===
[How the ending connects to the beginning for seamless replay]

=== AUDIO NOTE ===
[Original audio direction or trending sound suggestion]
\`\`\`

## Quality Criteria

- [ ] Hook delivers a clear curiosity gap or visual hook within the first 2 seconds
- [ ] Total duration is 15-45 seconds for optimal completion rate
- [ ] Content is one topic, one takeaway -- no multi-point delivery
- [ ] Text overlays are present throughout for sound-off viewing
- [ ] Ending is designed for loop potential (visual or narrative connection to the start)
- [ ] Video is natively vertical 9:16, not cropped from horizontal footage
- [ ] "#Shorts" is included in the title or description
- [ ] Script is tight with no filler words or unnecessary pauses
- [ ] Title is concise and creates curiosity
- [ ] Description includes 3-5 relevant hashtags

## Anti-Patterns

- **Horizontal Shorts** -- Cropping a widescreen video into vertical 9:16 looks lazy and performs poorly. Always shoot natively vertical.
- **Slow intros** -- Any delay before the hook (logos, "welcome back," title cards) causes immediate swipe-away. The first frame must hook the viewer.
- **No text overlays** -- Many Shorts viewers watch without sound. A Short without burned-in text or captions loses a significant portion of its audience.
- **Trying to cover too much** -- A 60-second Short with 5 tips communicates none of them memorably. One point, delivered clearly, is always more effective.
- **Missing #Shorts tag** -- Without "#Shorts" in the title or description, the video may not surface in the dedicated Shorts feed, dramatically reducing its distribution.
- **Repurposed horizontal video** -- Simply re-uploading a clip from a long-form video without reframing for vertical is immediately obvious and signals low effort.
- **No loop design** -- Shorts that end abruptly without connecting back to the beginning miss the replay signal that drives algorithmic distribution.
- **Ignoring comments** -- Creator replies boost comment visibility and signal active community engagement. Unanswered Shorts comments reduce future distribution.
- **Clickbait that does not deliver** -- The payoff must match the hook's promise. Shorts viewers are ruthless with the swipe button when they feel misled.`,
    version: '1.0.0',
  },
  {
    name: 'Blog Post',
    category: 'platform' as const,
    platform: 'blog',
    contentType: 'post',
    description: 'Long-form blog posts optimized for readability, engagement, and clear value delivery with structured subheadings',
    constraints: JSON.stringify({
      optimal_word_count: '1500-2500',
      title_max_chars: 70,
      meta_description_chars: 160,
      subheading_frequency: 'every 200-300 words',
    }),
    content: `## Platform Rules

- Average time on page is the strongest engagement signal. Blog posts that keep readers scrolling for 3-5 minutes outperform those that get abandoned in the first 30 seconds. Structure and readability directly determine this metric.
- Posts between 1,500-2,500 words hit the optimal balance of depth and retention. Below 800 words, content is perceived as thin and struggles to rank. Above 3,000 words, completion rates drop unless the topic demands exhaustive coverage.
- Mobile readability is non-negotiable. Over 60% of blog traffic comes from mobile devices. Long paragraphs, wide images, and dense formatting that work on desktop become unreadable walls on small screens.
- Subheadings serve as a scannable table of contents. Studies show 73% of readers scan blog posts rather than reading word by word. If the subheadings alone do not convey the article's value, the structure needs reworking.
- Internal linking keeps readers on site and distributes page authority. Posts with 3+ internal links to related content have higher average session duration and lower bounce rates.
- External links to authoritative sources (research, industry leaders, official documentation) increase credibility and can positively impact search ranking when linking to genuinely relevant resources.
- Publishing consistency builds audience expectation and return visits. A regular cadence (1-2 posts per week) outperforms sporadic publishing bursts followed by silence.
- Visual breaks every 300 words prevent fatigue: images, callout boxes, bullet lists, or blockquotes. Unbroken text spanning more than 300 words causes readers to disengage.

## Content Structure

### Blog Post Architecture

1. **Title** -- Under 70 characters. Clearly communicates what the reader will learn or gain. Front-load the key topic. Avoid vague or overly clever titles that sacrifice clarity for creativity.
2. **Meta description** -- 150-160 characters. Summarizes the post's value proposition in one sentence. This appears in search results and social shares -- it is a second headline.
3. **Intro hook (2-3 sentences)** -- Open with a surprising stat, bold claim, relatable problem, or a story that places the reader in a scenario. Then state exactly what the post will deliver.
4. **Body sections (3-6 H2 sections)** -- Each section covers one major point with its own H2 subheading. Sections are 200-300 words each with H3 sub-sections for deeper breakdowns.
5. **Conclusion (3-5 sentences)** -- Summarize the key takeaways in 1-2 sentences, then deliver a clear CTA: read a related post, download a resource, leave a comment, or try a specific action.

### Section-Level Structure

- **H2 subheading** -- Descriptive, scannable, and self-contained. A reader should understand the section's value from the heading alone.
- **Opening sentence** -- State the section's key point immediately. Do not build up to the insight.
- **Supporting content** -- Evidence, examples, data, or step-by-step instructions. Use bullet points for lists of 3+ items.
- **Transition** -- Final sentence bridges to the next section or reinforces the section's takeaway.

### Effective Post Formats

- **How-to guide**: "How to [achieve X]: A Step-by-Step Guide"
- **Listicle**: "7 [Things] That [Outcome] (and How to Use Them)"
- **Problem/Solution**: "Why [Problem Exists] and What to Do About It"
- **Lessons learned**: "What I Learned From [Experience]: [N] Key Takeaways"
- **Comparison**: "[Option A] vs. [Option B]: Which Is Right for [Audience]?"

## Writing Guidelines

- **Hook the reader in the first 2-3 sentences or lose them.** Open with a stat, question, bold claim, or relatable scenario. Never start with a dictionary definition or generic background. "Content marketing is important" loses readers. "87% of blog posts get zero organic traffic" keeps them.
- Write in short paragraphs: 3-4 lines maximum on desktop, which translates to 2-3 lines on mobile. Single-sentence paragraphs are powerful for emphasis.
- Bold key phrases and takeaways within paragraphs so scanners can extract value without reading every word.
- Use bullet points and numbered lists for any sequence of 3+ items. Lists are easier to scan than inline comma-separated items.
- Subheadings every 200-300 words. Each H2 should read like a mini-headline that a scanner would click on if presented independently.
- Write in second person ("you") to create direct connection with the reader. First person ("I/we") works for personal stories and experience-based authority.
- Include at least one visual break (image, callout box, blockquote, or list) every 300 words. Continuous text blocks cause reader fatigue and increase bounce rate.
- End with a specific, actionable CTA. "What do you think?" is weak. "Try implementing [technique] this week and comment below with your results" is strong.
- Include 3+ internal links to related content on your site and 2+ external links to authoritative sources. Link naturally within context, not in a dumped list at the end.
- Write the title last, after you know what the post delivers. Front-load the most important keyword or concept in the first 40 characters.

## Output Format

\`\`\`
=== TITLE ===
[Under 70 characters -- clear, specific, keyword front-loaded]

=== META DESCRIPTION ===
[150-160 characters -- summarizes the post's value proposition in one sentence]

=== INTRO ===
[Hook -- surprising stat, bold claim, relatable problem, or opening story. 1-2 sentences.]

[Promise -- exactly what the reader will learn or gain from this post. 1 sentence.]

=== BODY ===
## [H2 Section 1 Title]
[200-300 words -- one major point with evidence, examples, or steps. Include bullet points or visuals where appropriate.]

## [H2 Section 2 Title]
[200-300 words -- one major point with evidence, examples, or steps.]

### [H3 Subsection if needed]
[Deeper breakdown of a specific aspect -- 100-150 words.]

## [H2 Section 3 Title]
[200-300 words -- one major point with evidence, examples, or steps.]

## [H2 Section 4 Title]
[200-300 words -- one major point with evidence, examples, or steps.]

[Continue for 3-6 H2 sections total]

=== CONCLUSION ===
[Key takeaway summary -- 1-2 sentences.]

[CTA -- specific, actionable ask. 1-2 sentences.]

=== POST NOTES ===
Target word count: [1500-2500]
Internal links needed: [3+ with suggested anchor text]
External links needed: [2+ to authoritative sources]
Visual breaks: [List of suggested image/callout placements]
\`\`\`

## Quality Criteria

- [ ] Title is under 70 characters and clearly communicates the post's value
- [ ] Meta description is 150-160 characters and serves as a compelling second headline
- [ ] Intro hooks the reader in the first 2-3 sentences with a stat, bold claim, or relatable scenario
- [ ] Post contains 3-6 H2 sections, each covering one major point
- [ ] Subheadings appear every 200-300 words and are scannable as a standalone outline
- [ ] Paragraphs are 3-4 lines maximum with key phrases bolded
- [ ] At least one visual break (image, callout, list, or blockquote) every 300 words
- [ ] 3+ internal links and 2+ external links are included with natural anchor text
- [ ] Total word count is between 1,500-2,500 words
- [ ] Conclusion ends with a specific, actionable CTA (not generic "What do you think?")

## Anti-Patterns

- **Walls of text** -- Paragraphs exceeding 5-6 lines on desktop become impenetrable on mobile. Readers bounce rather than parse dense blocks. Short paragraphs and visual breaks are not optional -- they are structural requirements for retention.
- **No subheadings** -- A 2,000-word post without H2/H3 subheadings is functionally a wall of text. Scanners (73% of readers) cannot extract value and leave. Subheadings serve as both navigation and content promises.
- **Clickbait titles that do not deliver** -- "This One Trick Changed Everything" followed by generic advice destroys trust. The reader feels deceived, bounces quickly, and never returns. High bounce rates also signal low quality to search engines.
- **Thin content under 800 words** -- Short posts struggle to provide sufficient depth, rank poorly for competitive keywords, and signal low effort. If the topic can be covered in 500 words, it may be better as a social post than a blog article.
- **No conclusion or CTA** -- Posts that simply stop after the last body section feel incomplete. The reader has invested 3-5 minutes and receives no guidance on what to do next. Every post needs a clear ending and next step.
- **Dictionary definition openings** -- Starting with "[Topic] is defined as..." is the most common sign of filler content. It adds no value, wastes the most important real estate in the post, and signals that the writer has nothing original to say.
- **Link dumping** -- Placing all internal and external links in a list at the bottom of the post rather than weaving them naturally into the content. Contextual links are clicked more and provide more value to the reader.
- **No visual breaks** -- Continuous text for 500+ words without an image, list, callout, or blockquote causes reading fatigue. Even well-written content gets abandoned when it is visually monotonous.
- **Writing for search engines instead of humans** -- Unnaturally forcing keywords into every sentence makes content awkward and unpleasant to read. Write for clarity first; optimize for search second.`,
    version: '1.0.0',
  },
  {
    name: 'Blog Post (SEO)',
    category: 'platform' as const,
    platform: 'blog',
    contentType: 'seo',
    description: 'SEO-optimized blog posts designed for organic search traffic, featured snippets, and topical authority',
    constraints: JSON.stringify({
      optimal_word_count: '2000-3000',
      title_max_chars: 60,
      meta_description_chars: 160,
      keyword_density: '1-2%',
      subheading_frequency: 'every 200-300 words',
      min_internal_links: 3,
      min_external_links: 2,
    }),
    content: `## Platform Rules

- Search intent is the single most important ranking factor. Google categorizes queries into four intent types: informational ("how to"), navigational ("brand + feature"), commercial ("best X for Y"), and transactional ("buy X"). Content that mismatches intent will not rank regardless of quality.
- Comprehensive content outranks shallow content. Posts that thoroughly cover a topic, address related questions, and satisfy the searcher's full information need earn longer dwell times and higher rankings.
- Keyword placement follows a hierarchy of impact: title tag (front-loaded) > H1 > first 100 words > H2 subheadings > body text > meta description > image alt text. Distribute the primary keyword naturally across these locations.
- Keyword density should stay between 1-2% of total word count. Below 1%, the content may not signal topical relevance clearly enough. Above 2-3%, it reads as stuffing and risks algorithmic penalties.
- Featured snippets (position zero) are triggered by content that directly answers a specific question in paragraph (40-60 words), list (5-8 items), or table format immediately after an H2 that contains the question.
- Internal linking distributes page authority and signals content relationships to search engines. Every SEO post should link to 3+ related pages on the same domain with descriptive anchor text (not "click here").
- External links to authoritative sources (research papers, official docs, industry leaders) signal content credibility. Posts with 2+ quality external links tend to rank higher than those with none.
- Core Web Vitals affect rankings. Heavy images without compression, excessive scripts, and layout shifts hurt performance. Optimize images (WebP format, compressed, with width/height attributes) and keep the page lightweight.
- AI Overviews are increasingly replacing traditional featured snippets for complex queries. Structured, well-cited content is more likely to be referenced as a source in AI-generated summaries.

## Content Structure

### SEO Blog Post Architecture

1. **Title tag** -- Under 60 characters. Primary keyword front-loaded within the first 40 characters. Clearly communicates the post's value. Must match search intent.
2. **Meta description** -- 150-160 characters. Includes the primary keyword naturally. Functions as ad copy for the search result -- must compel the click.
3. **H1 heading** -- Contains the primary keyword. Can be slightly longer than the title tag since it is not character-limited by search results.
4. **Intro (first 100 words)** -- Include the primary keyword within the first 100 words. Open with the searcher's problem or question, then promise a comprehensive answer.
5. **Body sections (5-8 H2 sections)** -- Each H2 targets a related subtopic or question. Include the primary keyword in 2-3 H2 subheadings naturally. Use H3 subheadings for deeper breakdowns within sections.
6. **FAQ section** -- 3-5 questions from "People Also Ask" for the target keyword. Answer each in 40-60 words to target featured snippets and AI Overviews.
7. **Conclusion** -- Summarize key takeaways. Include the primary keyword one final time. End with a CTA (related post, resource download, or action prompt).

### Featured Snippet Optimization

- **Paragraph snippets**: Place a concise 40-60 word answer immediately after an H2 that phrases the question. Follow with expanded detail.
- **List snippets**: Use ordered or unordered lists with 5-8 items. The H2 should frame the list ("X Ways to..." or "Steps to...").
- **Table snippets**: Use HTML tables for comparative data. Include clear column headers and 3-5 rows of structured data.

Cover the topic comprehensively enough that the reader does not need to return to search results. Address related questions from "People Also Ask" and include original data or analysis not found in competing articles.

## Writing Guidelines

- **Match search intent before writing a single word.** Search the target keyword, analyze the top 5 results, and understand what format (guide, list, comparison, tutorial) and depth Google is rewarding. Then match or exceed it.
- Front-load the primary keyword in the title tag, ideally within the first 40 characters. "Email Marketing Guide: 10 Strategies for 2026" outranks "The Ultimate Guide to Everything About Email Marketing."
- Include the primary keyword in the first 100 words naturally. Forced insertion ("In this article about [keyword], we will discuss [keyword]...") reads awkwardly and signals low-quality content.
- Use the primary keyword in 2-3 H2 subheadings, but not all of them. Vary with synonyms, related terms, and natural language variations. This captures long-tail queries and avoids over-optimization.
- Write for a Flesch-Kincaid readability score of 60+ (approximately 8th grade reading level). Short sentences, common words, and active voice. Technical topics can go slightly lower, but clarity is always the goal.
- Use descriptive anchor text for internal links. "Learn more about email subject line formulas" outperforms "click here" for both user experience and search engine context.
- Add alt text to every image that describes the image content and includes the keyword where relevant. Alt text like "email-marketing-guide.jpg" is useless. "Bar chart showing email open rates by industry in 2026" provides value.
- Include an FAQ section targeting "People Also Ask" queries. Answer each question concisely (40-60 words) in the paragraph immediately following the question heading. This is the primary format for featured snippet capture.
- Write 2,000-3,000 words for competitive keywords. Longer content correlates with higher rankings, but only when every section adds genuine value. Padding word count with filler actively harms rankings through reduced dwell time.
- Update published content quarterly. Refreshing data, adding new sections, and updating examples signals freshness to search engines and can recover declining rankings.

## Output Format

\`\`\`
=== TARGET KEYWORD ===
Primary: [Exact phrase to rank for] | Secondary: [2-3 long-tail variations]
Search intent: [Informational / Navigational / Commercial / Transactional]

=== TITLE TAG ===
[Under 60 characters -- primary keyword front-loaded in first 40 chars]

=== META DESCRIPTION ===
[150-160 characters -- includes primary keyword, compelling click copy]

=== INTRO ===
[First 100 words -- keyword included naturally. Opens with problem/question, promises comprehensive answer.]

=== BODY ===
## [H2 Section 1 -- contains primary or secondary keyword]
[200-300 words -- one subtopic with evidence, examples, or steps.]

## [H2 Section 2 -- natural language variation]
[200-300 words -- related subtopic or question. Continue for 5-8 H2 sections total.]

=== FAQ SECTION ===
### [Question from "People Also Ask" 1]
[40-60 word direct answer optimized for featured snippet capture.]

### [Question from "People Also Ask" 2]
[40-60 word direct answer.]

=== CONCLUSION ===
[Key takeaway with primary keyword. CTA to related post or resource. 2-3 sentences.]

=== SEO CHECKLIST ===
Internal links: [3+] | External links: [2+] | Word count: [2000-3000] | Keyword density: [1-2%]
\`\`\`

## Quality Criteria

- [ ] Title tag is under 60 characters with the primary keyword in the first 40 characters
- [ ] Meta description is 150-160 characters, includes the primary keyword, and compels the click
- [ ] Primary keyword appears in the first 100 words naturally
- [ ] Primary keyword is in 2-3 H2 subheadings without forcing it into all of them
- [ ] Keyword density is between 1-2% (not below, not above)
- [ ] 5-8 H2 sections with subheadings every 200-300 words
- [ ] FAQ section contains 3-5 questions with 40-60 word answers targeting featured snippets
- [ ] 3+ internal links with descriptive anchor text (not "click here")
- [ ] 2+ external links to authoritative, relevant sources
- [ ] Every image has descriptive alt text that includes the keyword where naturally appropriate
- [ ] Content satisfies the target search intent fully (reader does not need to return to search results)
- [ ] Total word count is between 2,000-3,000 words

## Anti-Patterns

- **Keyword stuffing (above 3% density)** -- Repeating the keyword in every sentence triggers Google's spam detection. Over-optimized content is actively penalized with ranking demotions.
- **Thin content under 1,500 words** -- For competitive keywords, thin content cannot outrank comprehensive competitors. Google associates depth with topical authority for informational queries.
- **Ignoring search intent** -- Writing a comparison when Google ranks how-to guides, or an informational piece when the SERP shows commercial pages. Mismatched intent means zero ranking potential regardless of quality.
- **Duplicate or near-duplicate content** -- Substantially similar content across multiple URLs cannibalizes your own rankings. Google suppresses duplicates, splitting your authority.
- **No meta description** -- Google auto-generates one from page content when left blank. The result is almost always less compelling, reducing click-through rates from search results.
- **Orphan pages with no internal links** -- Pages with no inbound internal links are hard for search engines to discover and receive no transferred authority, making ranking significantly harder.
- **"Click here" anchor text** -- Generic anchors provide no topical context to search engines. Descriptive anchors ("email subject line best practices") pass relevance and improve linked page rankings.
- **Forcing keywords into every heading** -- Every H2 containing the exact keyword reads as robotic and over-optimized. Use natural variations and related terms across headings.
- **Publishing and forgetting** -- Content not updated degrades in rankings as competitors publish fresher coverage. Quarterly reviews maintain positions.
- **Skipping the FAQ section** -- "People Also Ask" appears for 60%+ of queries. Missing the FAQ section forfeits a high-probability featured snippet opportunity.`,
    version: '1.0.0',
  },
  {
    name: 'Email Newsletter',
    category: 'platform' as const,
    platform: 'email',
    contentType: 'newsletter',
    description: 'Recurring email newsletters optimized for open rates, click-throughs, and subscriber retention',
    constraints: JSON.stringify({
      subject_line_max_chars: 60,
      subject_line_optimal: '30-50',
      preview_text_chars: 90,
      optimal_word_count: '200-500',
      cta_buttons_max: 2,
    }),
    content: `## Platform Rules

- Subject lines are the single largest driver of open rates. Emails with 30-50 character subject lines consistently outperform longer ones. On mobile (60%+ of opens), subject lines are truncated at approximately 35-40 characters.
- Preview text (preheader) is the second line of defense. If left blank, email clients auto-fill it with the first line of body text, which is often "View in browser" or navigation -- a wasted opportunity. Always write custom preview text that extends the subject line's promise.
- Above-the-fold content determines whether a reader scrolls or deletes. The key message, value proposition, or hook must be visible without scrolling on both desktop and mobile.
- Single-column layouts are mandatory for mobile readability. Multi-column designs break on most mobile clients and create a frustrating reading experience.
- Average email open rates range from 20-43% depending on industry. Click-through rates average 2-5%. Every element of the email should be optimized for these two metrics.
- Send time matters: emails sent between 9-11 AM or 3-7 PM in the recipient's time zone consistently outperform other windows. Tuesday, Wednesday, and Thursday are the strongest days.
- Consistent send cadence (weekly, biweekly) builds habit and expectation. Irregular sending degrades open rates over time as subscribers forget who you are.
- Deliverability depends on sender reputation. High bounce rates, spam complaints, and low engagement signal poor list hygiene and push emails to spam folders.

## Content Structure

### Newsletter Architecture

1. **Subject line** -- 30-50 characters. Must create curiosity, promise a benefit, or signal urgency. Personalization ({{name}} or segment reference) increases open rates by 10-20%.
2. **Preview text** -- 60-90 characters. Extends the subject line, never repeats it. Provides additional context or a secondary hook that complements the subject.
3. **Header** -- Brand logo, issue number or date. Brief and recognizable. Do not clutter with navigation links.
4. **Featured content** -- The primary story, tip, or insight. This is the above-the-fold value delivery. 100-150 words maximum with a clear visual (image or graphic).
5. **Body sections** -- 2-3 secondary content blocks. Each has a subheading, 50-100 words, and an optional link to full content. Separated by visual dividers.
6. **Primary CTA** -- One prominent button with action-oriented text ("Read the full guide", "Get your template", "Watch the interview"). Placed after the featured content.
7. **Footer** -- Unsubscribe link (legally required), preference center, social links, company address. Keep compact.

### Subject Line Formulas

- **Curiosity gap**: "The metric we stopped tracking (and why)"
- **Benefit-first**: "3 templates to cut your writing time in half"
- **Urgency**: "Last 48 hours: the resource we are retiring"
- **Personalization**: "{{name}}, your weekly content briefing"
- **Number-driven**: "5 lessons from 100 failed launches"

## Writing Guidelines

- **Write the subject line last.** After you know what the email delivers, craft a subject line that accurately promises it. Clickbait subjects that do not deliver destroy trust and increase unsubscribes.
- Preview text must complement the subject line, not repeat it. Subject: "3 mistakes killing your open rates" + Preview: "Plus: the free tool we use to fix them" -- together they create a stronger open incentive.
- Keep total word count between 200-500 words. Newsletters that exceed 500 words see declining click-through rates as readers skim and abandon.
- Use subheadings to break content into scannable sections. A reader should understand the email's value from subheadings alone without reading body text.
- One primary CTA button per email. A secondary text link is acceptable, but two competing buttons with equal visual weight create decision paralysis and reduce clicks on both.
- Write CTA button text as a verb phrase: "Download the checklist" not "Click here." Button text should tell the reader exactly what they get.
- Use short paragraphs (2-3 sentences maximum). Email is a scanning medium, not a reading medium.
- Include alt text on every image. Many email clients block images by default. Alt text ensures the message is comprehensible even without visuals loading.
- Personalize beyond the name: reference the subscriber's segment, past behavior, or interests when possible. "As a marketing subscriber..." outperforms generic content.

## Output Format

\`\`\`
=== SUBJECT LINE ===
[30-50 characters -- curiosity, benefit, urgency, or personalization hook]

=== PREVIEW TEXT ===
[60-90 characters -- extends the subject line, never repeats it]

=== HEADER ===
[Brand name / logo placeholder | Issue #X or Date]

=== FEATURED CONTENT ===
[Primary story, tip, or insight -- 100-150 words. Above-the-fold value delivery.]

[Optional: image or graphic description]

=== BODY ===
### [Section 1 Heading]
[50-100 words -- secondary content with optional link]

### [Section 2 Heading]
[50-100 words -- secondary content with optional link]

### [Section 3 Heading]
[50-100 words -- secondary content with optional link]

=== CTA ===
[Primary CTA button text -- action verb phrase, e.g., "Read the full guide"]
[CTA URL]

=== FOOTER ===
[Unsubscribe link | Preference center | Social links | Company address]
\`\`\`

## Quality Criteria

- [ ] Subject line is 30-50 characters and creates a clear reason to open
- [ ] Preview text is 60-90 characters and extends (not repeats) the subject line
- [ ] Key message is visible above the fold without scrolling on mobile
- [ ] Layout is single-column and mobile-responsive
- [ ] Total word count is between 200-500 words
- [ ] One primary CTA button with verb-phrase text (not "Click here")
- [ ] No more than 2 CTA elements total (1 button + 1 optional text link)
- [ ] Every image includes descriptive alt text
- [ ] Content is scannable via subheadings without reading body text
- [ ] Unsubscribe link is present and functional in the footer

## Anti-Patterns

- **Clickbait subject lines** -- Subject lines that promise something the email does not deliver cause unsubscribes and spam reports. Each false promise permanently damages sender reputation and deliverability.
- **Image-heavy emails with no alt text** -- Many email clients (especially Outlook and corporate environments) block images by default. An email that is mostly images with no alt text displays as a blank white box, wasting the send entirely.
- **Multiple competing CTAs** -- Three buttons with equal visual weight ("Read this," "Buy that," "Sign up here") create decision paralysis. Click-through rates drop on all CTAs when they compete for attention.
- **No plain-text fallback** -- Some email clients and accessibility tools render only plain text. Without a plain-text version, your email may display as raw HTML code or be completely unreadable.
- **Exceeding 500 words** -- Newsletter engagement drops sharply past 500 words. Readers scan emails in 8-10 seconds. If the content requires more depth, link to a full article and keep the email as a teaser.
- **Repeating subject line in preview text** -- The preview text is a second headline, not an echo. Repeating the subject line wastes the most valuable real estate for driving opens.
- **Inconsistent send schedule** -- Irregular sending (weekly, then nothing for a month, then three in a week) erodes subscriber trust and trains email clients to deprioritize your messages.
- **Generic "Dear subscriber" opening** -- Impersonal greetings signal mass email. Even basic {{name}} personalization measurably improves engagement and reduces the perception of spam.
- **Sending without list hygiene** -- Keeping inactive subscribers (no opens in 90+ days) on your list degrades sender reputation. Regularly prune or re-engage inactive contacts.`,
    version: '1.0.0',
  },
  {
    name: 'Sales Email',
    category: 'platform' as const,
    platform: 'email',
    contentType: 'sales',
    description: 'Direct response sales emails optimized for a single conversion action using persuasion frameworks',
    constraints: JSON.stringify({
      subject_line_max_chars: 60,
      optimal_word_count: '100-300',
      cta_count: 1,
    }),
    content: `## Platform Rules

- Sales emails live or die by the subject line. Open rates above 60% are achievable with well-crafted, personalized subject lines of 4-7 words. Generic subject lines land in spam or get ignored.
- Deliverability is the invisible prerequisite. HTML-heavy cold emails, attachments, and image-loaded templates trigger spam filters. Plain-text formatting with minimal links outperforms designed templates for cold outreach.
- Reply rate is the primary success metric, not open rate. A 3-5% positive reply rate is a strong baseline. Well-targeted campaigns with deep personalization can reach 15-30% reply rates.
- Cold emails must comply with CAN-SPAM, GDPR, and local regulations. Include a physical address and unsubscribe mechanism. Non-compliance risks fines and domain blacklisting.
- Send volume matters: limit cold outreach to 35-40 emails per day per sending address to protect domain reputation. Warming up new domains over 2-4 weeks is mandatory before scaling.
- Follow-up cadence drives results. 80% of conversions happen after the initial email. Follow up on days 3-4, 7-10, and 14. After 4-5 follow-ups with no response, stop.
- Warm emails (to existing leads or subscribers) tolerate slightly longer formats and HTML design. Cold emails must be short, plain-text, and hyper-personalized.
- Best send times for sales emails: 8-10 AM or 1-3 PM on Tuesday, Wednesday, or Thursday in the recipient's time zone. Monday mornings and Friday afternoons underperform.

## Content Structure

### Sales Email Architecture (PAS Framework)

1. **Subject line** -- 4-7 words. Specific to the recipient's situation. Creates just enough curiosity to earn the open without resorting to clickbait or deception.
2. **Opener (1-2 sentences)** -- Personalized reference to the recipient's company, role, recent activity, or shared connection. Must demonstrate that this is not a mass email.
3. **Problem/Pain (2-3 sentences)** -- Articulate a specific problem the recipient likely faces. Use their industry language, not yours. The reader should think "yes, that is exactly my situation."
4. **Solution (2-3 sentences)** -- Position your offer as the bridge from their pain to their desired outcome. Focus on the result, not the features. One specific proof point (metric, case study, or name-drop).
5. **Social proof (1-2 sentences)** -- A concrete result: "[Company similar to theirs] achieved [specific outcome] in [timeframe]." Numbers and named companies outperform vague claims.
6. **CTA (1 sentence)** -- One single, low-friction ask. Not "buy now" -- instead, "Would a 15-minute call this week make sense?" The ask must match the relationship stage.
7. **PS line** -- The second most-read line after the subject. Use it for urgency, a secondary proof point, or a personal note that reinforces the value proposition.

### Alternative Frameworks

- **AIDA**: Attention (subject + opener), Interest (pain point), Desire (solution + proof), Action (CTA).
- **Before/After/Bridge**: Before (current state), After (desired outcome), Bridge (your solution).
- **Star/Story/Solution**: Star (the prospect), Story (the challenge they face), Solution (your offer).

## Writing Guidelines

- **Personalize the first line or lose the reader.** "I noticed your team just launched X" or "Saw your post about Y" demonstrates genuine research. "Hope this finds you well" signals a template and gets deleted.
- Keep cold emails under 150 words. Every word beyond 150 reduces reply probability. Shorter emails look like personal messages, not sales blasts.
- One CTA per email, always. Multiple asks ("book a call, check our website, download this guide, follow us on LinkedIn") create decision paralysis and dilute the conversion path.
- Match your CTA to the relationship temperature. Cold: "Worth a quick chat?" Warm: "Ready to see how this works for your team?" Hot: "Should I send the proposal?"
- Write the PS line. It is the second most-read part of any email. Use it for urgency ("We are only taking 3 more clients this quarter"), a testimonial, or a personal touch.
- Use plain text for cold emails. HTML templates, embedded images, and fancy formatting signal "marketing email" and reduce deliverability and reply rates.
- Avoid attachments in cold emails. They trigger spam filters and create friction. Link to a hosted resource if you must share a document.
- Write in short sentences and short paragraphs (1-2 sentences each). Dense paragraphs look like effort to process and get skimmed or skipped.
- A/B test subject lines aggressively. Test curiosity vs. direct benefit, question vs. statement, and with vs. without the recipient's name. Small subject line changes can swing open rates by 20-30%.

## Output Format

\`\`\`
=== SUBJECT LINE ===
[4-7 words -- specific to recipient, creates curiosity. Max 60 characters.]

=== OPENER ===
[Personalized first line -- reference to recipient's company, role, recent activity, or shared connection. 1-2 sentences.]

=== PROBLEM / PAIN ===
[Specific pain point the recipient faces -- in their industry language. 2-3 sentences.]

=== SOLUTION ===
[Your offer as the bridge from pain to desired outcome -- result-focused, not feature-focused. One proof point. 2-3 sentences.]

=== PROOF ===
[Concrete social proof -- named company, specific metric, defined timeframe. 1-2 sentences.]

=== CTA ===
[Single, low-friction ask appropriate to the relationship stage. 1 sentence.]

=== PS ===
P.S. [Urgency element, secondary proof point, or personal note. 1-2 sentences.]

=== EMAIL NOTES ===
Target recipient: [Role / company type]
Relationship stage: [Cold / Warm / Hot]
Primary goal: [Reply / Book call / Purchase]
Follow-up cadence: [Day 3-4 / Day 7-10 / Day 14]
\`\`\`

## Quality Criteria

- [ ] Subject line is 4-7 words and specific to the recipient (not a generic template)
- [ ] Opener references something specific about the recipient (company, role, activity, or connection)
- [ ] Problem statement uses the recipient's industry language, not internal jargon
- [ ] Solution focuses on outcomes and results, not product features
- [ ] Social proof includes a named company or specific metric with a timeframe
- [ ] Exactly one CTA that matches the relationship stage (not "buy now" for cold outreach)
- [ ] PS line is present and adds urgency, proof, or a personal touch
- [ ] Total word count is under 300 words (under 150 for cold emails)
- [ ] Email is formatted as plain text with no HTML, images, or attachments (for cold outreach)
- [ ] Unsubscribe mechanism and physical address are included (CAN-SPAM / GDPR compliance)

## Anti-Patterns

- **Generic opener ("Hope this finds you well")** -- This phrase instantly signals a mass template. Recipients delete these emails reflexively. Always lead with a personalized, specific reference that proves human effort.
- **Multiple CTAs** -- "Book a call, visit our website, download the guide, and follow us on LinkedIn" dilutes every action. Each additional CTA reduces the conversion probability of the primary ask.
- **Feature dumping** -- Listing product features instead of articulating outcomes. "We have AI-powered analytics with real-time dashboards" means nothing. "We helped [Company] cut reporting time by 70%" means everything.
- **Long paragraphs in cold emails** -- Dense 4-5 sentence paragraphs look like work to read. On mobile (where most emails are first seen), a long paragraph fills the entire screen and triggers an immediate delete.
- **HTML-heavy cold emails** -- Designed templates with images, buttons, and formatting trigger spam filters, reduce deliverability, and signal "marketing blast." Plain text outperforms for cold outreach.
- **Attachments in cold emails** -- Files attached to cold emails trigger spam filters and create security concerns. Many corporate email systems strip or quarantine attachments from unknown senders.
- **No follow-up** -- Sending one email and giving up leaves 80% of potential conversions on the table. A structured follow-up sequence (days 3, 7, 14) is essential for results.
- **Selling in the first cold email** -- The goal of a cold email is to start a conversation, not close a deal. Asking for a purchase in the first contact feels aggressive and signals a lack of understanding of the sales process.
- **Ignoring send limits** -- Blasting 500+ cold emails per day from a single domain destroys sender reputation. Domain blacklisting takes weeks to recover from and affects all emails from that domain, including internal ones.`,
    version: '1.0.0',
  },
  {
    name: 'WhatsApp Broadcast',
    category: 'platform' as const,
    platform: 'whatsapp',
    contentType: 'broadcast',
    description: 'Broadcast messages optimized for open rates, replies, and conversational engagement without triggering spam flags',
    constraints: JSON.stringify({
      message_max_chars: 4096,
      status_duration: '24h',
      broadcast_list_max: 256,
      media_types: 'image, video, document, audio',
      optimal_message_length: '300-500 chars',
    }),
    content: `## Platform Rules

- WhatsApp broadcast messages are delivered as individual chats, not group messages. Recipients do not see each other. This creates a 1-to-1 conversational dynamic that must be respected in tone and structure.
- Recipients must have your number saved in their contacts to receive broadcast messages. Without this, the message is silently dropped. Always prompt new contacts to save your number during onboarding.
- WhatsApp Business API enforces messaging tiers based on sender reputation. New accounts start at 1,000 unique recipients per 24 hours. Maintaining high quality scores (low blocks/reports) unlocks higher tiers up to unlimited sending.
- Messages that receive high block or report rates will degrade your quality rating from Green to Yellow to Red, eventually resulting in account restrictions or bans.
- Open rates on WhatsApp average 90-98%, far exceeding email. This makes frequency discipline critical -- every message is seen, so every bad message damages trust.
- Send during business hours in the recipient's time zone (9 AM - 8 PM). Avoid weekends and holidays unless your content is specifically time-sensitive.
- Limit broadcast frequency to 2-4 messages per week maximum. More than one message per day triggers blocks and opt-outs at scale.
- WhatsApp Status (24-hour stories) can complement broadcasts for less urgent updates without cluttering the chat.

## Content Structure

### Broadcast Message Flow

1. **Greeting line** -- Personalized opening using {{name}} variable. Keep it warm and conversational, not corporate.
2. **Value hook** -- One sentence explaining what this message delivers. The recipient must immediately understand why they should keep reading.
3. **Body** -- 2-4 short paragraphs delivering the core value: tip, offer, update, or exclusive content. Use line breaks between paragraphs. One idea per paragraph.
4. **CTA** -- Single, clear action: reply with a keyword, tap a link, or forward to a friend. Make the action effortless.
5. **Signature** -- Brief sign-off with sender name or brand. Reinforces the personal, 1-to-1 feel.

### Message Types

- **Value broadcasts**: Tips, insights, exclusive content. Build trust and keep opt-in rates high. Aim for 60-70% of all broadcasts to be value-driven.
- **Promotional broadcasts**: Offers, launches, limited deals. Use sparingly (max 1-2 per week) and always lead with value before the pitch.
- **Transactional updates**: Order confirmations, shipping, appointment reminders. Keep factual and concise.
- **Engagement prompts**: Polls, quick questions, feedback requests. Drive replies to strengthen sender reputation.

### Media Best Practices

- Images should include a text caption explaining the visual. Never send an image without context.
- Videos should be under 60 seconds for highest completion rates. Include a one-line summary above the video.
- Documents (PDFs, catalogs) work best with a 2-3 sentence description of what the recipient will find inside and why it is worth opening.
- Voice notes feel highly personal but should be reserved for warm audiences. Keep under 90 seconds.

## Writing Guidelines

- **Write like you are texting a friend, not sending a press release.** WhatsApp is an intimate channel. Formal language feels invasive and out of place.
- Keep messages under 500 characters when possible. Shorter messages get higher reply rates and feel less like spam.
- Use 1-3 emojis per message to add warmth and visual breaks, but never more. Excessive emojis look unprofessional and spammy.
- One message, one purpose. Do not combine a tip, a promotion, and a survey in a single broadcast. Split them into separate messages on separate days.
- Use {{name}} personalization in the greeting. "Hi {{name}}!" converts significantly better than "Hi there!" or no greeting at all.
- Structure CTAs as low-friction actions: "Reply YES to get the guide" or "Tap the link below" -- not multi-step instructions.
- Bold key phrases using WhatsApp formatting (*bold*, _italic_, ~strikethrough~) to create visual hierarchy in plain text.
- Always include an opt-out option: "Reply STOP to unsubscribe." This is both a legal requirement in many jurisdictions and a trust signal.
- Front-load the value. The first two lines appear in the notification preview. If they do not communicate value, the message goes unread.

## Output Format

\`\`\`
=== GREETING ===
Hi {{name}}! [Warm, personalized opening -- 1 line]

=== BODY ===
[Value hook -- what this message delivers and why it matters. 1-2 sentences.]

[Core content -- tip, insight, offer, or update. 2-4 short paragraphs, one idea each. Use line breaks and *bold* for key phrases. Max 300-400 characters for this section.]

=== CTA ===
[Single clear action -- reply with keyword, tap link, or forward. Must be effortless. 1-2 sentences max.]

=== SIGNATURE ===
[Sign-off with sender name or brand. 1 line.]

[Opt-out line: "Reply STOP to unsubscribe."]
\`\`\`

## Quality Criteria

- [ ] Message opens with personalized greeting using {{name}} variable
- [ ] Total message length is under 500 characters (excluding signature)
- [ ] Value hook is clear within the first two lines (notification preview)
- [ ] Body contains one purpose only: value, promotion, or engagement -- never mixed
- [ ] CTA is a single, low-friction action (reply, tap, or forward)
- [ ] Emoji usage is 1-3 per message, adding warmth without clutter
- [ ] WhatsApp formatting (*bold*, _italic_) is used for visual hierarchy
- [ ] Opt-out instruction is included ("Reply STOP to unsubscribe")
- [ ] Tone is conversational and 1-to-1, not corporate or broadcast-style
- [ ] Message delivers standalone value even if the recipient ignores the CTA

## Anti-Patterns

- **Walls of text** -- Messages exceeding 600-700 characters feel overwhelming on a mobile chat screen. Recipients block senders who consistently send long messages because they clutter the chat list.
- **No opt-out option** -- Failing to include an unsubscribe mechanism violates regulations in many jurisdictions (GDPR, TCPA) and erodes trust. Trapped users report instead of replying STOP.
- **More than one message per day** -- WhatsApp is a personal space. Daily broadcasts feel invasive and drive block rates above 5%, which degrades your sender quality rating and can lead to account restrictions.
- **All-caps text** -- SHOUTING IN CAPS feels aggressive in a conversational channel and triggers spam perception. It also reduces readability on small screens.
- **Pure promotional without value** -- Broadcasts that only sell without educating, entertaining, or informing train recipients to ignore or block you. Lead with value, sell second.
- **Multiple CTAs in one message** -- Asking the recipient to reply, click a link, visit your store, AND share with friends creates decision paralysis. One message, one action.
- **No personalization** -- Generic messages ("Dear Customer") signal mass messaging and feel impersonal in a channel designed for intimate communication.
- **Sending without opt-in** -- Adding contacts to broadcast lists without their explicit consent violates WhatsApp Business Policy and results in high report rates that destroy sender reputation.
- **Attachments without context** -- Sending images, PDFs, or videos without a text explanation wastes the recipient's data and attention. Always introduce what the attachment is and why it matters.`,
    version: '1.0.0',
  },
]
