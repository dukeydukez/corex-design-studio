'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChatContext = 'dashboard' | 'templates' | 'brand-kit' | 'editor';

interface AIChatBotProps {
  context?: ChatContext;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

// ---------------------------------------------------------------------------
// Contextual response data
// ---------------------------------------------------------------------------

const GREETINGS: Record<ChatContext | 'default', string> = {
  dashboard:
    'Hey! Welcome to your COREX dashboard. I can help you manage projects, review analytics, or get started with a new design. What would you like to do?',
  templates:
    'Looking for the perfect template? I can help you browse by category, recommend options based on your brand, or walk you through customisation. What are you working on?',
  'brand-kit':
    'Let\'s keep your brand tight. I can help you manage logos, colours, fonts, and make sure everything stays consistent across your designs. What do you need?',
  editor:
    'You\'re in the editor, let\'s build something. I can help with layout tips, AI-powered generation, image editing, or exporting your work. What are you trying to create?',
  default:
    'Hey! I\'m your COREX AI Assistant. I can help with design, branding, templates, and more. What can I do for you today?',
};

// ---------------------------------------------------------------------------
// Intent-based response system
// ---------------------------------------------------------------------------

interface IntentPattern {
  keywords: string[];
  response: string | ((ctx: ChatContext | 'default', userMsg: string) => string);
}

const INTENT_PATTERNS: IntentPattern[] = [
  // Greetings
  {
    keywords: ['hello', 'hey', 'hi', 'sup', 'what\'s up', 'good morning', 'good afternoon', 'good evening', 'yo'],
    response: (ctx) => GREETINGS[ctx] ?? GREETINGS.default,
  },
  // Help / general
  {
    keywords: ['help', 'what can you do', 'how does this work', 'guide me', 'show me around', 'tutorial'],
    response: (ctx) => {
      const contextHelp: Record<string, string> = {
        editor: 'Here\'s what I can help you with in the editor:\n\n1. **Add elements** — Tell me to add a rectangle, text, image, or any shape to your canvas.\n2. **Change properties** — Ask me to change colours, opacity, font size, position, or any element property.\n3. **Layout tips** — I can suggest layout improvements based on design best practices.\n4. **Generate designs** — Describe what you want and I\'ll help you build it step by step.\n5. **Resize for platforms** — I can help you resize your design for Instagram, LinkedIn, YouTube, etc.\n6. **Export** — I\'ll walk you through exporting in PNG, JPG, PDF, or SVG.',
        dashboard: 'Here\'s what I can help you with on the dashboard:\n\n1. **Create a project** — Tell me what you\'re working on and I\'ll help set it up.\n2. **Find a project** — Describe what you\'re looking for and I\'ll help locate it.\n3. **Project strategy** — I can suggest how to organise your projects and designs.\n4. **Use AI agents** — Ask me to run any of the 12 AI agents on your work.\n5. **Quick actions** — "Create an Instagram post", "Start a YouTube thumbnail project", etc.',
        templates: 'Here\'s what I can help you with for templates:\n\n1. **Browse by platform** — "Show me Instagram templates", "YouTube thumbnails", etc.\n2. **Browse by style** — "Minimalist templates", "Bold and vibrant", "Corporate", etc.\n3. **Recommend templates** — Tell me your project and I\'ll suggest the best matches.\n4. **Customise** — I can help apply your brand kit to any template.\n5. **Create from scratch** — If no template fits, I\'ll help you design from a blank canvas.',
        'brand-kit': 'Here\'s what I can help you with for your Brand Kit:\n\n1. **Add colours** — Give me hex codes and I\'ll add them to your palette.\n2. **Add fonts** — Tell me font names and I\'ll configure your typography.\n3. **Upload logos** — I\'ll guide you through uploading and organising your logos.\n4. **Brand audit** — I can review your designs for brand consistency.\n5. **Style guide** — I can help generate a brand style guide from your kit.',
      };
      return contextHelp[ctx] ?? 'I\'m your COREX AI Assistant. I can help with:\n\n1. **Design** — Create graphics, layouts, and visual content\n2. **Branding** — Manage colours, fonts, logos, and consistency\n3. **Templates** — Find and customise design templates\n4. **AI Agents** — Run specialized agents for copywriting, SEO, analytics, and more\n5. **Strategy** — Get creative direction and brand positioning advice\n\nJust tell me what you need and I\'ll take it from there.';
    },
  },
  // Creating / adding elements (editor)
  {
    keywords: ['add', 'create', 'make', 'insert', 'put', 'place', 'draw', 'generate'],
    response: (_ctx, msg) => {
      const lower = msg.toLowerCase();
      if (/text|heading|title|caption|subtitle|paragraph|copy|words|writing/.test(lower)) {
        return 'To add text to your canvas:\n\n1. Select the **Text tool (T)** from the left toolbar\n2. Click anywhere on the canvas to place your text\n3. Type your content, then use the properties panel on the right to adjust font, size, colour, weight, and spacing.\n\nOr tell me exactly what text you want and where, and I\'ll guide you through it.';
      }
      if (/rectangle|square|box|rect/.test(lower)) {
        return 'To add a rectangle:\n\n1. Select the **Rectangle tool** from the left toolbar\n2. Click and drag on the canvas to draw your shape\n3. Use the properties panel to adjust fill colour, border radius, opacity, and shadow.\n\nYou can also hold Shift while dragging to make a perfect square.';
      }
      if (/circle|ellipse|oval|round/.test(lower)) {
        return 'To add a circle or ellipse:\n\n1. Select the **Ellipse tool** from the left toolbar\n2. Click and drag on the canvas to draw your shape\n3. Hold Shift while dragging for a perfect circle.\n\nAdjust fill, stroke, and effects in the properties panel on the right.';
      }
      if (/image|photo|picture|img|upload/.test(lower)) {
        return 'To add an image:\n\n1. Select the **Image tool** from the left toolbar\n2. Click on the canvas to place an image placeholder\n3. Upload your image file or paste a URL.\n\nYou can then resize, reposition, and apply effects like opacity, blur, and blend modes from the properties panel.';
      }
      if (/line|arrow|divider/.test(lower)) {
        return 'To add a line:\n\n1. Select the **Line tool** from the left toolbar\n2. Click and drag to draw your line on the canvas\n3. Adjust thickness, colour, and style in the properties panel.';
      }
      if (/star|polygon|shape/.test(lower)) {
        return 'To add shapes:\n\n1. Select the **Star** or **Polygon tool** from the left toolbar\n2. Click and drag on the canvas to draw\n3. Customise the fill, stroke, and dimensions in the properties panel.\n\nFor custom shapes, try the **Pen tool** for freeform paths.';
      }
      if (/background|bg|backdrop/.test(lower)) {
        return 'To change your background:\n\n1. Click on an empty area of the canvas (deselect any elements)\n2. The properties panel will show canvas settings\n3. Change the background colour from there.\n\nYou can also add a rectangle the full size of your canvas and send it to the back layer for a custom background.';
      }
      if (/logo|brand|watermark/.test(lower)) {
        return 'To add your logo:\n\n1. Go to **Brand Kit** to make sure your logo is uploaded\n2. In the editor, use the **Image tool** to place it\n3. Resize and position it where you need it.\n\nPro tip: Lock the logo layer to prevent accidental moves.';
      }
      // Generic "create" / "generate" a design
      if (/design|graphic|post|story|banner|flyer|poster|thumbnail|carousel/.test(lower)) {
        return 'Tell me more about what you\'re creating:\n\n- **What platform?** Instagram, YouTube, LinkedIn, TikTok, etc.\n- **What\'s the content?** Product launch, announcement, testimonial, quote, etc.\n- **What\'s the style?** Minimalist, bold, cinematic, corporate, playful, etc.\n\nThe more detail you give me, the better I can help you build it.';
      }
      return 'I can help you add that. Could you be more specific about what you\'d like to create? For example:\n\n- "Add a bold heading that says Welcome"\n- "Create a blue rectangle for the background"\n- "Insert my logo in the top left"\n- "Generate an Instagram story for a product launch"';
    },
  },
  // Changing / editing properties
  {
    keywords: ['change', 'edit', 'modify', 'update', 'adjust', 'set', 'make it', 'turn it', 'switch'],
    response: (_ctx, msg) => {
      const lower = msg.toLowerCase();
      if (/colou?r|fill|hue|shade|tint/.test(lower)) {
        return 'To change an element\'s colour:\n\n1. Select the element on the canvas\n2. In the properties panel on the right, find the **Fill** section\n3. Click the colour swatch to open the colour picker\n4. Choose your colour or enter a hex code directly.\n\nYou can also adjust opacity with the slider below.';
      }
      if (/font|text|size|typography|bold|italic/.test(lower)) {
        return 'To change text properties:\n\n1. Select the text element on the canvas\n2. In the properties panel, you\'ll find:\n   - **Font size** slider\n   - **Font weight** (light, regular, bold, etc.)\n   - **Letter spacing** and **line height** sliders\n   - **Text colour** picker\n\nAdjust any of these to get the look you want.';
      }
      if (/size|dimension|width|height|resize|bigger|smaller|scale/.test(lower)) {
        return 'To resize an element:\n\n1. Select the element on the canvas\n2. Drag any of the **8 resize handles** (corners and edges) to resize\n3. Or use the **Width** and **Height** fields in the properties panel for exact values.\n\nYou can also use the Position fields (X, Y) to place elements precisely.';
      }
      if (/opaci|transparen|fade|see.?through/.test(lower)) {
        return 'To change opacity:\n\n1. Select the element\n2. In the properties panel, use the **Opacity** slider (0% = invisible, 100% = fully visible)\n\nThis works on any element type: text, shapes, images, and groups.';
      }
      if (/rotat|angle|tilt|spin|turn/.test(lower)) {
        return 'To rotate an element:\n\n1. Select the element\n2. In the properties panel, use the **Rotation** slider or enter a degree value\n3. 0° is the default, and you can go up to 360°.\n\nFor precise rotations, type the exact angle in the input field.';
      }
      if (/shadow|drop.?shadow|glow|elevation/.test(lower)) {
        return 'To add or adjust a shadow:\n\n1. Select the element\n2. In the properties panel, scroll to the **Shadow** section\n3. Adjust **Shadow X** (horizontal offset), **Shadow Y** (vertical offset), and **Shadow Blur**\n4. Click the shadow colour swatch to change the shadow colour.\n\nSet all values to 0 to remove the shadow.';
      }
      if (/blur|sharpen|focus/.test(lower)) {
        return 'To add blur:\n\n1. Select the element\n2. In the properties panel, use the **Blur** slider\n3. Increase the value for more blur, set to 0 for sharp.\n\nThis is great for creating depth effects or frosted glass backgrounds.';
      }
      if (/border|radius|corner|round/.test(lower)) {
        return 'To adjust border radius (rounded corners):\n\n1. Select the element\n2. In the properties panel, use the **Border Radius** slider\n3. 0 = sharp corners, higher values = more rounded.\n\nThis works on rectangles, images, and other block elements.';
      }
      return 'To change element properties:\n\n1. Select the element on the canvas\n2. Use the **Properties Panel** on the right to adjust position, size, colour, opacity, rotation, shadows, blur, and more.\n\nWhat specifically would you like to change? Give me details and I\'ll guide you through it.';
    },
  },
  // Resize / platform adaptation
  {
    keywords: ['resize', 'adapt', 'reformat', 'convert', 'repurpose', 'different size', 'instagram size', 'youtube size', 'tiktok size', 'linkedin size'],
    response: 'To resize your design for a different platform:\n\n1. Go back to your project page\n2. Click **Create Design** and select the new platform size\n3. Recreate or duplicate your elements in the new canvas.\n\nAvailable sizes include:\n- **Instagram**: Post (1080x1080), Story (1080x1920), Carousel (1080x1350)\n- **TikTok**: Video (1080x1920)\n- **YouTube**: Thumbnail (1280x720), Banner (2560x1440)\n- **LinkedIn**: Post (1200x1200), Banner (1584x396)\n- **Facebook**: Post (1200x630), Cover (820x312)\n- **Pinterest**: Pin (1000x1500)\n- And many more!',
  },
  // Export
  {
    keywords: ['export', 'download', 'save', 'png', 'jpg', 'pdf', 'svg', 'file'],
    response: 'Export functionality is coming soon. When it\'s ready, you\'ll be able to:\n\n- **PNG** — High-quality raster image with transparency support\n- **JPG** — Compressed image for web use\n- **PDF** — Print-ready vector format\n- **SVG** — Scalable vector for web and design tools\n\nFor now, you can use your browser\'s screenshot tool as a quick workaround. The full export engine with quality controls and batch processing is in active development.',
  },
  // Layers
  {
    keywords: ['layer', 'arrange', 'order', 'front', 'back', 'above', 'below', 'stack', 'z-index', 'reorder'],
    response: 'To manage layers:\n\n1. Open the **Layers panel** on the left side of the editor\n2. Layers are listed top-to-bottom (top = frontmost)\n3. Click a layer to select it on canvas\n4. Use the **eye icon** to toggle visibility\n5. Use the **lock icon** to prevent accidental edits.\n\nTo reorder, drag layers up or down in the panel. Elements higher in the list appear in front of elements below them.',
  },
  // Templates
  {
    keywords: ['template', 'starter', 'premade', 'pre-made', 'preset', 'start from', 'ready-made'],
    response: (ctx) => {
      if (ctx === 'editor') {
        return 'To use a starter template:\n\n1. Click the **Templates** tab in the left panel\n2. Browse the available templates (Social Media Post, Minimal Quote, Product Showcase, Event Promotion, Testimonial Card, or Blank Canvas)\n3. Click **Use Template** to load it onto your canvas.\n\nThe template elements will replace your current canvas content. You can then customise every element to match your needs.';
      }
      return 'We have templates available in the design editor. To use them:\n\n1. Create or open a design\n2. In the editor, click the **Templates** tab on the left panel\n3. Choose from starter templates and customise them.\n\nWhat kind of template are you looking for? I can point you to the right one.';
    },
  },
  // Brand kit
  {
    keywords: ['brand', 'brand kit', 'logo', 'colour palette', 'color palette', 'font', 'typography', 'brand guide', 'style guide'],
    response: (ctx) => {
      if (ctx === 'brand-kit') {
        return 'You\'re in the Brand Kit. Here you can manage:\n\n- **Logos** — Upload primary, secondary, and icon versions\n- **Colour Palette** — Add hex codes for your brand colours\n- **Typography** — Set primary and secondary fonts\n- **Brand Voice** — Define your tone and messaging guidelines\n\nWhat would you like to update?';
      }
      return 'Your Brand Kit is where you store and manage your visual identity. You can access it from the top navigation bar.\n\nThe Brand Kit includes:\n- **Logos** — Multiple versions for different contexts\n- **Colours** — Your brand colour palette with hex codes\n- **Fonts** — Primary and secondary typefaces\n\nWant me to help you set up or update your brand kit?';
    },
  },
  // AI Agents
  {
    keywords: ['agent', 'ai agent', 'creative director', 'copy writer', 'copywriter', 'seo', 'analytics', 'a/b test', 'accessibility', 'layout optimizer', 'design refiner', 'video adapter', 'blog adapter', 'social adapter'],
    response: (_ctx, msg) => {
      const lower = msg.toLowerCase();
      if (/creative director|strategy|direction|mood|positioning/.test(lower)) {
        return '**Creative Director Agent**\n\nThis agent analyses your design brief and generates:\n- Creative direction and mood boards\n- Colour palette recommendations\n- Font pairing suggestions\n- Brand positioning strategy\n- Competitive differentiation insights\n\nTo use it, describe your project goals and target audience, and the Creative Director will craft a strategic direction for your design work.';
      }
      if (/copy\s?writ|headline|tagline|cta|body text|caption/.test(lower)) {
        return '**Copy Writer Agent**\n\nThis agent creates persuasive, on-brand copy:\n- Headlines and subheadlines\n- Call-to-action text\n- Body copy and descriptions\n- Taglines and slogans\n- Tone-matched messaging\n\nTell me what you need copy for (e.g., "Write a headline for my product launch post") and I\'ll help generate options.';
      }
      if (/seo|search|keyword|meta|rank/.test(lower)) {
        return '**SEO Optimizer Agent**\n\nThis agent optimizes your content for search visibility:\n- Keyword strategy and research\n- Meta title and description optimization\n- Schema markup recommendations\n- Image alt text and SEO\n- Structured data suggestions\n\nShare your content or topic and I\'ll provide SEO recommendations.';
      }
      if (/accessib|wcag|contrast|screen reader|keyboard/.test(lower)) {
        return '**Accessibility Agent**\n\nThis agent audits your designs for WCAG 2.1 compliance:\n- Colour contrast analysis\n- Keyboard navigation assessment\n- Screen reader compatibility\n- Font size and readability checks\n- Remediation plans for issues found\n\nSelect a design and I\'ll run an accessibility audit on it.';
      }
      if (/analytic|performance|metric|benchmark|insight/.test(lower)) {
        return '**Analytics Agent**\n\nThis agent analyses design performance:\n- Performance scoring against benchmarks\n- Gap identification and analysis\n- Quick win recommendations\n- Action planning for improvements\n- Competitive comparison\n\nShare your design goals and I\'ll provide data-driven recommendations.';
      }
      if (/a\/?b|test|split|variation|experiment/.test(lower)) {
        return '**A/B Testing Agent**\n\nThis agent generates design variations for split testing:\n- Scientifically rigorous variation design\n- Clear hypotheses for each test\n- Sample size recommendations\n- Metric selection guidance\n- Statistical analysis framework\n\nTell me which design element you want to test and I\'ll generate variations with a testing plan.';
      }
      if (/layout|optimi|balance|spacing|grid|align/.test(lower)) {
        return '**Layout Optimizer Agent**\n\nThis agent improves your design composition:\n- Visual balance analysis\n- White space optimization\n- Grid alignment suggestions\n- Focal point enhancement\n- Spacing harmony adjustments\n\nShare your current design and I\'ll suggest layout improvements.';
      }
      if (/refin|polish|quality|review|check|final/.test(lower)) {
        return '**Design Refiner Agent**\n\nThis agent reviews your design for production readiness:\n- Pixel-perfect quality checks\n- Consistency verification\n- Polish and refinement suggestions\n- Brand compliance review\n- Production-ready validation\n\nLet me review your design before you export.';
      }
      if (/video|motion|scene|transition|animate/.test(lower)) {
        return '**Video Adapter Agent**\n\nThis agent converts static designs for video:\n- Scene breakdown and planning\n- Motion graphics suggestions\n- Transition recommendations\n- Audio pairing ideas\n- Platform-specific specs\n\nShare your design and target video platform, and I\'ll create a video adaptation plan.';
      }
      if (/blog|article|featured image|content outline/.test(lower)) {
        return '**Blog Adapter Agent**\n\nThis agent converts designs for blog content:\n- Featured image optimization\n- Content outline generation\n- Image sizing for web\n- CTA placement strategy\n- Distribution planning\n\nShare your design and I\'ll create a blog-optimized version.';
      }
      if (/social|instagram|tiktok|linkedin|facebook|twitter|hashtag|platform/.test(lower)) {
        return '**Social Adapter Agent**\n\nThis agent adapts designs for social platforms:\n- Platform-specific sizing\n- Hashtag strategy\n- Content calendar suggestions\n- Engagement optimization\n- Cross-platform consistency\n\nTell me which platform you\'re targeting and I\'ll adapt your design for maximum impact.';
      }
      return 'COREX has **12 specialized AI agents** ready to help:\n\n1. **Creative Director** — Strategy, mood boards, brand positioning\n2. **Design Generator** — Layout and visual composition\n3. **Copy Writer** — Headlines, CTAs, body copy\n4. **Layout Optimizer** — Balance, spacing, grid alignment\n5. **Design Refiner** — Quality checks, polish, brand compliance\n6. **Video Adapter** — Scene planning, motion graphics\n7. **Blog Adapter** — Featured images, content outlines\n8. **Social Adapter** — Platform sizing, hashtags, calendars\n9. **A/B Testing** — Variation design, test planning\n10. **Analytics** — Performance scoring, benchmarks\n11. **Accessibility** — WCAG compliance, contrast checks\n12. **SEO Optimizer** — Keywords, meta optimization\n\nWhich agent would you like to use? Just tell me what you need.';
    },
  },
  // Project management
  {
    keywords: ['project', 'organise', 'organize', 'manage', 'new project', 'start a project', 'folder'],
    response: (ctx) => {
      if (ctx === 'dashboard') {
        return 'To manage your projects from the dashboard:\n\n1. **Create new** — Click "Create Project" in the top right\n2. **Open existing** — Click any project card to see its designs\n3. **Search** — Use the search bar to find specific projects\n4. **Filter** — Sort by date or status (active, draft, archived)\n\nWhat would you like to do with your projects?';
      }
      return 'You can manage all your projects from the Dashboard. Each project contains multiple designs and can be organized by status (active, draft, archived).\n\nHead to the Dashboard to create a new project or manage existing ones. What are you working on?';
    },
  },
  // Design tips / inspiration
  {
    keywords: ['tip', 'advice', 'suggest', 'recommend', 'best practice', 'inspiration', 'idea', 'improve', 'better'],
    response: (_ctx, msg) => {
      const lower = msg.toLowerCase();
      if (/instagram|social/.test(lower)) {
        return 'Here are some Instagram design tips:\n\n1. **Bold, readable text** — Use large fonts that are legible on mobile\n2. **Consistent brand colours** — Stick to 2-3 colours max per post\n3. **White space** — Don\'t overcrowd; let elements breathe\n4. **Strong focal point** — Guide the viewer\'s eye to one key element\n5. **High contrast** — Make sure text stands out against backgrounds\n6. **Rule of thirds** — Place key elements along grid lines for balanced composition';
      }
      if (/thumbnail|youtube/.test(lower)) {
        return 'YouTube thumbnail best practices:\n\n1. **Faces with emotion** — Thumbnails with expressive faces get 30% more clicks\n2. **3 words max** — Keep text minimal and bold (60pt+ font)\n3. **High contrast colours** — Bright against dark, complementary colours pop\n4. **Consistent branding** — Use the same style across your channel\n5. **Curiosity gap** — Show enough to intrigue, not enough to satisfy\n6. **Test at small size** — Your thumbnail needs to work at 120x68 pixels';
      }
      return 'Here are some general design tips:\n\n1. **Hierarchy** — Make the most important element the biggest/boldest\n2. **Alignment** — Keep elements aligned to a grid for a clean look\n3. **Contrast** — Use contrasting colours for text and background\n4. **White space** — Give elements room to breathe\n5. **Consistency** — Use your brand kit for a unified look\n6. **Simplicity** — Less is more. Remove anything that doesn\'t serve a purpose.\n\nWant tips for a specific platform or design type?';
    },
  },
  // Shortcuts / tools
  {
    keywords: ['shortcut', 'keyboard', 'hotkey', 'key binding', 'tool', 'toolbar', 'how to use'],
    response: 'Here are the editor keyboard shortcuts:\n\n- **V** — Select tool\n- **H** — Hand tool (pan canvas)\n- **T** — Text tool\n- **R** — Rectangle tool\n- **E** — Ellipse tool\n- **L** — Line tool\n- **P** — Pen tool\n- **B** — Brush tool\n- **I** — Eyedropper tool\n- **Z** — Zoom tool\n- **Cmd/Ctrl + Z** — Undo\n- **Cmd/Ctrl + Shift + Z** — Redo\n- **Delete/Backspace** — Delete selected\n\nAll 17 tools are available in the left toolbar. What tool do you need help with?',
  },
  // Thank you / appreciation
  {
    keywords: ['thanks', 'thank you', 'appreciate', 'great', 'awesome', 'perfect', 'nice', 'good job', 'love it'],
    response: 'You\'re welcome! I\'m here whenever you need me. Keep building, you\'re doing great work. What else can I help with?',
  },
  // Goodbye
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'done', 'that\'s all', 'nothing else'],
    response: 'Good stuff. I\'ll be right here whenever you need me. Click the chat button anytime to pick back up. Happy designing!',
  },
];

// ---------------------------------------------------------------------------
// Smart response matching
// ---------------------------------------------------------------------------

function getSmartResponse(ctx: ChatContext | 'default', userMessage: string): string {
  const lower = userMessage.toLowerCase().trim();

  // Try to match intent patterns by keyword relevance
  let bestMatch: IntentPattern | null = null;
  let bestScore = 0;

  for (const pattern of INTENT_PATTERNS) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        // Longer keyword matches are more specific, so weight them higher
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pattern;
    }
  }

  if (bestMatch && bestScore > 0) {
    const resp = bestMatch.response;
    if (typeof resp === 'function') {
      return resp(ctx, userMessage);
    }
    return resp;
  }

  // Fallback: acknowledge what the user said and offer specific help
  const contextHints: Record<string, string> = {
    editor: 'I\'m here to help with your design. Try telling me specifically what you\'d like to do, for example:\n\n- "Add a blue rectangle"\n- "Change the font size"\n- "Give me layout tips for Instagram"\n- "Show me a list of all AI agents"\n- "How do I export my design?"\n\nThe more specific you are, the better I can help.',
    dashboard: 'I can help you manage your projects. Try asking me:\n\n- "How do I create a new project?"\n- "Show me the AI agents"\n- "Give me tips for organising my work"\n- "What templates are available?"\n\nWhat are you working on?',
    templates: 'I can help you find the right template. Try asking:\n\n- "Show me Instagram templates"\n- "I need a YouTube thumbnail"\n- "What styles are available?"\n- "Help me customise a template"\n\nWhat kind of design are you creating?',
    'brand-kit': 'I can help you manage your brand assets. Try asking:\n\n- "How do I add a colour?"\n- "Help me set up my fonts"\n- "Upload my logo"\n- "Run a brand consistency audit"\n\nWhat do you want to update?',
  };

  return contextHints[ctx] ?? 'I didn\'t quite catch that. Could you try rephrasing? Here are some things I can help with:\n\n- **Design** — "Add a text element", "Change the colour", "Resize for Instagram"\n- **AI Agents** — "Use the copywriter agent", "Run an SEO audit"\n- **Templates** — "Show me templates", "Start from a preset"\n- **Tips** — "Give me design tips", "Best practices for thumbnails"\n\nJust tell me what you need.';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}


// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function formatBotText(text: string): React.ReactNode[] {
  // Split into lines and process each
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      elements.push(<br key={`br-${lineIdx}`} />);
    }

    // Process inline bold markers **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const processed = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${lineIdx}-${partIdx}`} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    elements.push(<span key={`line-${lineIdx}`}>{processed}</span>);
  });

  return elements;
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-sm'
            : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
        }`}
      >
        {isUser ? message.text : formatBotText(message.text)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AIChatBot({ context }: AIChatBotProps) {
  const ctx = context ?? 'default';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<readonly Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const lastUserMessageRef = useRef<string>('');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Show greeting when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: generateId(),
        role: 'bot',
        text: GREETINGS[ctx] ?? GREETINGS.default,
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length, ctx]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const simulateBotReply = useCallback((userMessage: string) => {
    setIsTyping(true);
    const delay = 600 + Math.random() * 800;

    setTimeout(() => {
      const reply: Message = {
        id: generateId(),
        role: 'bot',
        text: getSmartResponse(ctx, userMessage),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, delay);
  }, [ctx]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    lastUserMessageRef.current = trimmed;
    simulateBotReply(trimmed);
  }, [input, isTyping, simulateBotReply]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const toggleVoice = useCallback(() => {
    // If already listening, stop
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? (window as unknown as Record<string, unknown>).SpeechRecognition ??
          (window as unknown as Record<string, unknown>).webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionAPI) {
      const errorMsg: Message = {
        id: generateId(),
        role: 'bot',
        text: 'Sorry, voice input isn\'t supported in this browser. Try Chrome or Edge for the best experience.',
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const recognition = new (SpeechRecognitionAPI as any)();
    recognition.lang = 'en-CA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Chat panel */}
      {isOpen && (
        <div
          className="glass animate-scale-in transition-smooth flex flex-col rounded-2xl border border-gray-200 shadow-2xl
            w-[calc(100vw-2rem)] sm:w-[400px] h-[min(500px,calc(100vh-7rem))]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">COREX AI Assistant</h3>
                <p className="text-[10px] text-gray-400 leading-none">Always ready to help</p>
              </div>
            </div>
            <button
              onClick={toggleOpen}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-smooth"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200/60 px-3 py-2.5 flex items-center gap-2">
            <button
              onClick={toggleVoice}
              className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-smooth ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
              }`}
              aria-label={isListening ? 'Stop recording' : 'Start voice input'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening...' : 'Type a message...'}
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 transition-smooth placeholder:text-gray-400"
              disabled={isListening}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white
                disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-smooth"
              aria-label="Send message"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating action button */}
      <button
        onClick={toggleOpen}
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg
          flex items-center justify-center transition-smooth hover:shadow-xl hover:scale-105
          ${!isOpen ? 'animate-pulse-glow' : ''}`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export default AIChatBot;
