# -*- coding: utf-8 -*-
"""Per-page content for all Connecta secondary pages."""

def run(build, page_hero, cta, li_tick):

    # =====================================================================
    # 1. ABOUT US
    # =====================================================================
    build("about.html", "about", "About Us",
      "Connecta is a job and freelance marketplace weaving skilled African professionals across every sector into the world's work.",
      page_hero("About", "Our story",
        "African talent, woven into the world's work.",
        "Connecta began with a simple conviction: talent is everywhere on the continent, but access to good work is not. We're closing that gap — across every sector, not just tech."),
      """<section class="section">
  <div class="wrap prose">
    <p class="lead reveal">Africa has one of the youngest, fastest-growing workforces on earth. What it has lacked is a trusted bridge to the clients, projects and pay that match that ability. Connecta is that bridge.</p>
    <p class="reveal">We're a job and freelance marketplace connecting skilled professionals across the continent — developers and designers, yes, but also marketers, accountants, writers, translators, tutors, event planners, fitness coaches and trainers — with clients at home and around the world. Work is discovered by AI, teams form as squads, and every payment is protected by escrow.</p>
    <hr class="reveal"/>
    <h2 class="reveal">What we believe</h2>
    <p class="reveal">Opportunity should follow skill, not postcode. A brilliant illustrator in Kumasi or an accountant in Nairobi should reach the same clients as anyone in London or New York — and get paid safely, on time, in a way that works for them.</p>
    <h2 class="reveal">What we're building</h2>
    <p class="reveal">A single place where anyone can <b>find work</b> or <b>hire talent</b> across any field, with the trust rails — identity verification, reviews and escrow — that make cross-border work actually work.</p>
  </div>
  <div class="wrap">
    <div class="cards-3">
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg></div>
        <h3>Continent-wide</h3>
        <p>Talent from every region of Africa, working locally and internationally, remote or onsite.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6L5.7 21 8 13.8 2 9.4h7.6z"/></svg></div>
        <h3>Every sector</h3>
        <p>Eight professional fields and counting — tech, design, marketing, finance, writing, hospitality, health and education.</p>
      </article>
      <article class="mini-card reveal" data-delay="2">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
        <h3>Built on trust</h3>
        <p>Verified identities, honest reviews and escrow-protected payments on every project.</p>
      </article>
    </div>
  </div>
</section>
<section class="section founder-section">
  <div class="wrap">
    <figure class="founder-note reveal">
      <span class="eyebrow">A note from the founder</span>
      <blockquote>
        <p>When we started working on Connecta, it wasn't because we wanted to build another tech product. It was because we kept seeing the same problem repeat itself — talented people unable to find genuine work, and businesses struggling to find people they could truly trust.</p>
        <p>Too often, opportunities are lost not because of a lack of skill, but because of broken trust, poor structure, or unclear expectations.</p>
        <p class="pull">Connecta was created to change that — calmly, deliberately, and responsibly.</p>
        <p>We're building Connecta with a strong belief that meaningful digital work ecosystems are built from the ground up. That's why we chose to start locally, listen closely, and grow carefully. Every decision we make is guided by real user experiences, not assumptions or hype.</p>
        <p>This is still an early stage of our journey, and we don't claim to have everything perfect. What we do promise is honesty, continuous improvement, and a commitment to building something that genuinely works for the people who use it.</p>
        <p>If you're here as a freelancer, a business owner, or a supporter, thank you for being part of this early chapter. Your feedback, patience, and trust matter deeply to us.</p>
        <p>We're building Connecta step by step — with care.</p>
      </blockquote>
      <figcaption class="founder-sign">
        <span class="fn-av">HD</span>
        <span class="fn-meta"><b>Hassan Dankura</b><span>Founder, Connecta</span></span>
      </figcaption>
    </figure>
  </div>
</section>
""" + cta("Join a marketplace built for African talent.",
          "Whether you're hiring or looking for work, Connecta gives you the tools and the trust to get started today.") )

    # =====================================================================
    # 2. CAREERS
    # =====================================================================
    build("careers.html", "careers", "Careers",
      "Join Connecta and help build the marketplace weaving African talent into the world's work. We're hiring across Africa.",
      page_hero("Careers", "Join the team",
        "Do the best work of your life — from anywhere in Africa.",
        "We're a small, senior team building the trust rails that let African talent work with the world. If you care about craft and about people, we want to hear from you."),
      """<section class="section">
  <div class="wrap prose">
    <p class="lead reveal">Most people don't join Connecta for the job. They join for the mission: making it as normal for a Lagos developer or a Nairobi designer to work with a Berlin startup as it is for two companies in the same building.</p>
    <p class="reveal">We work fully remote across the continent, pay fairly, and build in the open. Every role below is based in Africa — most are fully remote, some are hybrid in Lagos or Nairobi.</p>
  </div>
  <div class="wrap">
    <div class="section-head center reveal" style="margin-top:3rem">
      <span class="eyebrow">Open roles</span>
      <h2>Come build the bridge.</h2>
    </div>
    <div class="job-list">
      <a class="job-row reveal" href="contact.html">
        <span class="j-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6M13 4l-2 16"/></svg></span>
        <span class="j-info"><b>Senior Full-Stack Engineer</b><span>Build the core platform — matching, escrow and real-time chat.</span></span>
        <span class="j-tags"><span>Remote · Africa</span><span>Full-time</span></span>
      </a>
      <a class="job-row reveal" href="contact.html">
        <span class="j-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7a2 2 0 000-3l-1-1-9 9zM12 19l-4 2 1-4M14 6l4 4"/></svg></span>
        <span class="j-info"><b>Product Designer</b><span>Own the design system and shape experiences across web and mobile.</span></span>
        <span class="j-tags"><span>Remote · Africa</span><span>Full-time</span></span>
      </a>
      <a class="job-row reveal" href="contact.html">
        <span class="j-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M7 15l4-5 3 3 5-7"/></svg></span>
        <span class="j-info"><b>Growth Marketer</b><span>Own acquisition across every sector — from developers to tutors.</span></span>
        <span class="j-tags"><span>Remote · Africa</span><span>Full-time</span></span>
      </a>
      <a class="job-row reveal" href="contact.html">
        <span class="j-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 10h8M8 13h5"/></svg></span>
        <span class="j-info"><b>Community Lead</b><span>Grow and serve the community — events, onboarding and support.</span></span>
        <span class="j-tags"><span>Remote · Africa</span><span>Full-time</span></span>
      </a>
      <a class="job-row reveal" href="contact.html">
        <span class="j-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg></span>
        <span class="j-info"><b>Trust &amp; Safety Specialist</b><span>Protect every project — verification, reviews and disputes.</span></span>
        <span class="j-tags"><span>Remote · Africa</span><span>Full-time</span></span>
      </a>
      <a class="job-row reveal" href="contact.html">
        <span class="j-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></span>
        <span class="j-info"><b>Partnerships Manager</b><span>Build relationships with agencies, schools and hiring partners.</span></span>
        <span class="j-tags"><span>Remote · Africa</span><span>Full-time</span></span>
      </a>
    </div>
    <p class="reveal" style="text-align:center;margin-top:2rem;color:var(--muted)">Don't see your role? <a href="contact.html" style="color:var(--jade-deep);font-weight:600">Send us your CV</a> — we're always looking for great people.</p>
  </div>
</section>
""" + cta("Ready to build with us?",
          "We hire for talent and values, not for location. If this mission moves you, we'd love to talk.",
          "Get in touch", "contact.html", "Back to home", "index.html") )

    # =====================================================================
    # 3. HELP CENTER
    # =====================================================================
    build("help.html", "help", "Help Center",
      "Help Center — answers about accounts, verification, escrow, payouts, disputes, squads and the Connecta app.",
      page_hero("Help", "Help center",
        "How can we help?",
        "Quick answers to the questions we hear most. Can't find yours? Our support team replies within one business day."),
      """<section class="section">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">Frequently asked</span>
      <h2>Everything you need to get started.</h2>
    </div>
    <div class="faq reveal">
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">How do I create an account?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        <div class="faq-a"><div class="faq-a-inner">Download the Connecta app or sign up on the web, then choose your side — client, freelancer, or both. Creating an account is free and takes under a minute.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">Is Connecta only for tech professionals?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        <div class="faq-a"><div class="faq-a-inner">Not at all. Connecta covers eight sectors — technology, design &amp; creative, marketing &amp; sales, business &amp; finance, writing &amp; translation, hospitality &amp; events, health &amp; fitness, and education &amp; training — plus anything else. If you can do great work, there's a place for you.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">How does identity verification work?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        <div class="faq-a"><div class="faq-a-inner">You'll be guided through a quick verification step that confirms your identity. Once approved, you earn a verification badge that appears on your profile and builds instant trust with clients.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">How does escrow protect my payment?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        <div class="faq-a"><div class="faq-a-inner">Clients fund milestones up front. The money is held securely and released to the freelancer only when the client approves the work. Nobody chases invoices, and nobody works unprotected.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">When and how do I get paid?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        <div class="faq-a"><div class="faq-a-inner">Payments release the moment a milestone is approved, then land in your Connecta wallet. From there you can cash out through local payout methods across Africa where available.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">What happens if a project goes wrong?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        <div class="faq-a"><div class="faq-a-inner">Every project has a clear resolution process. You can open a dispute with evidence, and our trust &amp; safety team reviews it fairly — funds stay in escrow until it's resolved.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">What are Collabo Squads?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        <div class="faq-a"><div class="faq-a-inner">A Collabo Squad is a group of freelancers who combine skills into one profile, take on briefs too big for one person, and get paid as a team with automatic, fair splits. <a href="collabo.html">Learn more</a>.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">Where can I download the app?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        <div class="faq-a"><div class="faq-a-inner">The Connecta app is available on the App Store and Google Play. <a href="download.html">Get the app</a> for direct links.</div></div>
      </div>
    </div>
    <p class="reveal" style="text-align:center;margin-top:2.6rem;color:var(--muted);font-size:1.05rem">Still stuck? <a href="contact.html" style="color:var(--jade-deep);font-weight:600">Contact our support team →</a></p>
  </div>
</section>
""" + cta("Didn't find your answer?",
          "Our real human support team replies within one business day — usually much faster.",
          "Contact support", "contact.html", "Get the app", "download.html") )

    # =====================================================================
    # 4. CONTACT US
    # =====================================================================
    build("contact.html", "contact", "Contact Us",
      "Contact Connecta — support, sales, partnerships and press. We reply within one business day.",
      page_hero("Contact", "Contact us",
        "Talk to a real person.",
        "Questions, feedback, partnerships, press — whatever you need, the Connecta team is here. We reply within one business day."),
      """<section class="section">
  <div class="wrap">
    <div class="contact-grid">
      <div class="contact-info">
        <a class="contact-row reveal" href="mailto:hello@myconnecta.ng">
          <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></span>
          <div><b>Email us</b><span>hello@myconnecta.ng</span></div>
        </a>
        <div class="contact-row reveal" data-delay="1">
          <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
          <div><b>Response time</b><span>Within one business day, usually faster</span></div>
        </div>
        <div class="contact-row reveal" data-delay="2">
          <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.2-7-11a7 7 0 1114 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.4"/></svg></span>
          <div><b>Connecta HQ</b><span>Suite 3-4, Gidan Saude, Beside First Bank, Zoo Road, Kano, Nigeria</span></div>
        </div>
        <div class="contact-row reveal" data-delay="3">
          <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></svg></span>
          <div><b>Trust &amp; safety</b><span>hello@myconnecta.ng</span></div>
        </div>
      </div>
      <div class="form-card reveal" data-delay="1">
        <form id="contactForm" action="https://formsubmit.co/ajax/hello@myconnecta.ng" method="POST">
          <!-- FormSubmit config -->
          <input type="hidden" name="_subject" value="New message from the Connecta website" />
          <input type="hidden" name="_template" value="table" />
          <input type="text" name="_honey" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true" />
          <div class="form-grid">
            <div class="field">
              <label for="cf-name">Your name</label>
              <input id="cf-name" name="name" type="text" required placeholder="Ada Obi" autocomplete="name" />
            </div>
            <div class="field">
              <label for="cf-email">Email</label>
              <input id="cf-email" name="email" type="email" required placeholder="ada@example.com" autocomplete="email" />
            </div>
            <div class="field full">
              <label for="cf-topic">Topic</label>
              <select id="cf-topic" name="topic">
                <option>I'm hiring talent</option>
                <option>I'm looking for work</option>
                <option>Payments &amp; escrow</option>
                <option>Trust &amp; safety</option>
                <option>Partnerships &amp; press</option>
                <option>Something else</option>
              </select>
            </div>
            <div class="field full">
              <label for="cf-msg">Message</label>
              <textarea id="cf-msg" name="message" required placeholder="How can we help?"></textarea>
            </div>
          </div>
          <button class="btn btn-primary btn-lg" type="submit">Send message</button>
          <p class="form-note">By sending, you agree to our <a href="privacy.html">Privacy Policy</a> and <a href="terms.html">Terms</a>. We only use your details to reply.</p>
        </form>
        <div class="form-success" id="formSuccess">
          <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="flex:none;margin-top:2px"><path d="M5 12l4 4L19 6"/></svg>
          Thanks — your message is on its way. We'll reply within one business day.
        </div>
        <div class="form-error" id="formError" role="alert">
          <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="flex:none;margin-top:2px"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>
          Something went wrong sending your message. Please email us directly at <a href="mailto:hello@myconnecta.ng">hello@myconnecta.ng</a>.
        </div>
      </div>
    </div>
  </div>
</section>
""" + cta("Prefer to talk in the app?",
          "Join Connecta and reach us right from your dashboard — the fastest way to get help.",
          "Get the app", "download.html", "Read the help center", "help.html") )

    # =====================================================================
    # 5. TRUST & SAFETY
    # =====================================================================
    build("trust.html", "trust", "Trust & Safety",
      "Trust & Safety — how Connecta keeps every project safe: verification, escrow, reviews and fair dispute resolution.",
      page_hero("For you", "Trust &amp; safety",
        "Trust is the whole point.",
        "Every system on Connecta exists to answer one question: how do strangers on opposite sides of the world work together safely? This is how."),
      """<section class="section">
  <div class="wrap prose">
    <p class="lead reveal">Connecta is built so that neither side has to trust the other blindly. Trust is engineered into the platform — with verification, escrow, reviews and a fair dispute process.</p>
  </div>
  <div class="wrap">
    <div class="cards-2">
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></div>
        <h3>Identity verification</h3>
        <p>Every profile can be verified with identity checks. Verified members earn a badge, so clients always know who they're working with.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
        <h3>Escrow protection</h3>
        <p>Funds are secured before work starts and released only on approval. No chasing invoices, no unpaid labour, no missing payments.</p>
      </article>
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6L5.7 21 8 13.8 2 9.4h7.6z"/></svg></div>
        <h3>Honest reviews</h3>
        <p>Two-way ratings after every project build a reputation that travels with you — good work gets found, and bad actors get found out.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 21h14M7 6l5-2 5 2M7 6l-2 4M17 6l2 4M12 8l-3 6M12 8l3 6"/></svg></div>
        <h3>Fair dispute resolution</h3>
        <p>If something goes wrong, either side can open a dispute. Evidence is reviewed by real people, and funds stay locked in escrow until it's resolved.</p>
      </article>
    </div>
  </div>
  <div class="wrap prose">
    <h2 class="reveal" style="margin-top:3rem">Your data, your control</h2>
    <p class="reveal">We collect only what we need to run the marketplace, we never sell your data, and you can request a copy or deletion of your information at any time.</p>
    <p class="reveal">Our full <a href="privacy.html">Privacy Policy</a> and <a href="terms.html">Terms of Service</a> are always available here on the web and in the app. For any trust &amp; safety concern, write to <b>safety@connecta.app</b> — we take every report seriously.</p>
  </div>
</section>
""" + cta("Work with confidence.",
          "Join a marketplace where trust is built in — verified people, protected payments, fair outcomes.",
          "Get the app", "download.html", "Read the help center", "help.html") )

    # =====================================================================
    # 6. AI MATCHING
    # =====================================================================
    build("ai.html", "ai", "AI Matching",
      "Connecta's AI ranks the best-fit talent and work across every sector, with transparent scores that get smarter over time.",
      page_hero("Platform", "AI matching",
        "Matchmaking, but for work.",
        "Describe the work once. Connecta's AI studies skills, ratings, availability and outcomes to rank the best matches — in every sector, with a transparent fit score."),
      """<section class="section">
  <div class="wrap prose">
    <p class="lead reveal">Forget scrolling endless profiles. Connecta's matching engine does the looking for you — and shows its reasoning.</p>
    <p class="reveal">Whether you're a client with a brief or a freelancer with a skill, the AI builds a living picture of every profile: what people can do, how well they've done it, when they're available, and what past clients say. When a new job or candidate appears, it ranks the field in seconds — and because it learns from real outcomes, every finished project makes the next match sharper. The same engine works for a fintech build, a wedding shoot, or a corporate training programme.</p>
  </div>
  <div class="wrap">
    <div class="cards-3">
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z"/></svg></div>
        <h4>Fit-ranked recommendations</h4>
        <p>Every match comes with a transparent score, not a random shuffle. You always see why someone ranks where they do.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l6-6 4 4 6-8"/><path d="M4 21h16"/></svg></div>
        <h4>Learns from outcomes</h4>
        <p>Ratings and completed work sharpen future matches over time. Good work gets found and rewarded.</p>
      </article>
      <article class="mini-card reveal" data-delay="2">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></div>
        <h4>Proposal assistance</h4>
        <p>Freelancers get help drafting proposals that speak to the brief — and clients get proposals actually worth reading.</p>
      </article>
    </div>
  </div>
</section>
""" + cta("See who you match with.",
          "Post a brief or build a profile and let Connecta's AI find your best fit in seconds.",
          "Get the app", "download.html", "How it works", "how.html") )
    # =====================================================================
    # 7. COLLABO SQUADS
    # =====================================================================
    build("collabo.html", "collabo", "Collabo Squads",
      "Collabo Squads let freelancers combine skills into one profile, win bigger briefs, and split payments fairly and automatically.",
      page_hero("Platform", "Connecta collabo",
        "Great work is rarely a solo act.",
        "Form a Collabo Squad, combine your skills into one profile, and take on the briefs that are too big for any one person — with payments split fairly, automatically."),
      """<section class="section">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">How squads work</span>
      <h2>Three steps to a stronger team.</h2>
    </div>
    <div class="cards-3">
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M15 20c0-2 2-3.4 4-3.4"/></svg></div>
        <h4>1 · Form your squad</h4>
        <p>Invite freelancers you trust, or let AI suggest complementary skills to fill the gaps in your team.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg></div>
        <h4>2 · One combined profile</h4>
        <p>Clients see a single team profile with every skill, portfolio and rating in one place — no juggling five separate pages.</p>
      </article>
      <article class="mini-card reveal" data-delay="2">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
        <h4>3 · Split payments fairly</h4>
        <p>When milestones release, the payout divides automatically by the split you agreed. No awkward maths, no chasing teammates.</p>
      </article>
    </div>
  </div>
  <div class="wrap prose">
    <h2 class="reveal" style="margin-top:3rem">Why squads win bigger briefs</h2>
    <p class="reveal">A designer, a copywriter, a marketer and an events lead can pitch a full brand launch together — something none of them could take on alone. Clients get a complete team from a single booking, and every member keeps doing the work they love.</p>
    <p class="reveal">Everything lives in a shared workspace: roles, tasks and progress tracked in one place, with Connecta AI helping to draft briefs and proposals along the way.</p>
  </div>
</section>
""" + cta("Build your squad.",
          "Team up, take on bigger work, and get paid fairly — all in one place.",
          "Get the app", "download.html", "Find work", "find.html") )

    # =====================================================================
    # 8. ESCROW & PAYMENTS
    # =====================================================================
    build("escrow.html", "escrow", "Escrow & Payments",
      "Escrow & Payments on Connecta — funds held safely and released only when work is approved, with local payouts across Africa.",
      page_hero("Platform", "Escrow &amp; payments",
        "Money held safely, released only when work is approved.",
        "Clients fund milestones up front. Freelancers see the money is secured before they start. Nobody chases invoices — funds release the moment a milestone is approved."),
      """<section class="section">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">How escrow works</span>
      <h2>Protected at every step.</h2>
    </div>
    <div class="cards-3">
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg></div>
        <h4>1 · Client funds the milestone</h4>
        <p>Money goes into secure escrow before any work begins. The freelancer can see the funds are protected and ready.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></div>
        <h4>2 · Work happens</h4>
        <p>The freelancer delivers the milestone. Messages, files and updates all stay in the project workspace.</p>
      </article>
      <article class="mini-card reveal" data-delay="2">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4L19 6"/></svg></div>
        <h4>3 · Approved &amp; released</h4>
        <p>The client approves, funds release to the wallet, and local payouts cash out across Africa where available.</p>
      </article>
    </div>
  </div>
  <div class="wrap">
    <div class="cards-3">
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
        <h4>Protected milestones</h4>
        <p>Funds sit in escrow until each deliverable is signed off. If the work isn't right, it isn't paid out.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.2-7-11a7 7 0 1114 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.4"/></svg></div>
        <h4>Local payouts</h4>
        <p>Cash out to local methods across Africa, straight from your Connecta wallet — no waiting on foreign wires.</p>
      </article>
      <article class="mini-card reveal" data-delay="2">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></svg></div>
        <h4>Fair dispute handling</h4>
        <p>If something goes wrong, a clear evidence-based resolution process steps in. Funds stay locked until it's settled.</p>
      </article>
    </div>
  </div>
</section>
""" + cta("Get paid without the worry.",
          "Fund milestones or start work knowing the money is secured from day one.",
          "Get the app", "download.html", "Trust &amp; safety", "trust.html") )
    # =====================================================================
    # 9. PLATFORM DASHBOARD
    # =====================================================================
    build("platform.html", "platform", "Platform Dashboard",
      "The whole working relationship in one app: dashboard, chat, feed, AI assistant, wallet, verification, reviews, proposals and notifications.",
      page_hero("Platform", "The platform",
        "One app for the whole working relationship.",
        "Discovery, chat, projects and payments — one connected platform, not a stack of disconnected tools. Everything below is built into Connecta from day one."),
      """<section class="section">
  <div class="wrap">
    <div class="cards-3">
      <article class="mini-card reveal"><div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg></div><h4>Live dashboard</h4><p>Active projects, proposals, deadlines, wallet and notifications — your whole working life at a glance.</p></article>
      <article class="mini-card reveal" data-delay="1"><div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><h4>Real-time chat</h4><p>Instant messaging with typing indicators, read receipts and file sharing — for people and squads.</p></article>
      <article class="mini-card reveal" data-delay="2"><div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 4z"/><path d="M8 10h8M8 13h5"/></svg></div><h4>Community feed</h4><p>Post updates, follow talent, grow your network and get discovered beyond the job board.</p></article>
      <article class="mini-card reveal"><div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2z"/><path d="M18 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></svg></div><h4>Connecta AI Assistant</h4><p>An in-app assistant that drafts briefs, sharpens proposals and answers questions in plain language.</p></article>
      <article class="mini-card reveal" data-delay="1"><div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6L5.7 21 8 13.8 2 9.4h7.6z"/></svg></div><h4>Reviews &amp; reputation</h4><p>Two-way ratings and verified work build trust that feeds straight back into matching.</p></article>
      <article class="mini-card reveal" data-delay="2"><div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg></div><h4>Verification &amp; badges</h4><p>Identity checks and trust badges so clients hire with total confidence.</p></article>
      <article class="mini-card reveal"><div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 13h6M9 17h6"/></svg></div><h4>Proposals &amp; projects</h4><p>Post jobs, submit proposals, shortlist candidates and track from brief to done.</p></article>
      <article class="mini-card reveal" data-delay="1"><div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg></div><h4>Wallet &amp; payouts</h4><p>Balance, local payouts and a reconciled record of every milestone and release.</p></article>
      <article class="mini-card reveal" data-delay="2"><div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 109 9 7 7 0 01-9-9z"/></svg></div><h4>Light &amp; dark mode</h4><p>A comfortable interface day or night — Connecta adapts to your device theme.</p></article>
    </div>
    <p class="reveal" style="text-align:center;margin-top:2.4rem;color:var(--muted)">Plus notifications that matter, offline-friendly profiles, and support for local &amp; international jobs in every sector.</p>
  </div>
</section>
""" + cta("Everything in one place.",
          "Download Connecta and run your whole working life — discovery, chat, projects and payments — from a single app.",
          "Get the app", "download.html", "See how it works", "how.html") )

    # =====================================================================
    # 10. GET THE APP
    # =====================================================================
    build("download.html", "download", "Get the App",
      "Download the Connecta app for iOS and Android — AI matching, real-time chat, wallet and escrow, in your pocket.",
      page_hero("Platform", "Get the app",
        "Take Connecta everywhere.",
        "The full marketplace in your pocket — matches, chat, wallet and escrow, wherever your work takes you."),
      """<section class="section">
  <div class="wrap">
    <div class="split">
      <div>
        <div class="section-head reveal" style="max-width:none">
          <span class="eyebrow">On iOS &amp; Android</span>
          <h2>The marketplace, in your pocket.</h2>
          <p>Find work, reply to clients, check escrow and cash out — all from your phone, with the same AI matching and security as the web.</p>
        </div>
        <ul class="app-points reveal" data-delay="1">
          <li><span class="tk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l4 4L19 6"/></svg></span> AI matching in your pocket</li>
          <li><span class="tk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l4 4L19 6"/></svg></span> Real-time chat &amp; notifications</li>
          <li><span class="tk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l4 4L19 6"/></svg></span> Wallet, escrow &amp; local payouts</li>
          <li><span class="tk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l4 4L19 6"/></svg></span> Light &amp; dark mode, built in</li>
        </ul>
        <div class="store-row reveal" data-delay="2">
          <a class="store-btn" href="#"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.7 12.9c0-2.6 2.1-3.9 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.3-.9c-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.3 2.5 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.2 3.2-2.4 1-1.5 1.4-3 1.5-3.1-.1 0-2.9-1.1-3.2-4.6zM14.2 5.3c.7-.9 1.2-2.1 1.1-3.3-1.1 0-2.4.7-3.2 1.6-.7.8-1.3 2-1.1 3.2 1.2.1 2.4-.6 3.2-1.5z"/></svg><span><small>Download on the</small><b>App Store</b></span></a>
          <a class="store-btn" href="https://play.google.com/store/apps/details?id=com.connecta.app" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3.5v17L15.5 12z"/></svg><span><small>Get it on</small><b>Google Play</b></span></a>
        </div>
        <p class="download-meta reveal" data-delay="2">Free to download · Free to join · No subscription</p>
      </div>
      <div class="split-visual reveal" data-delay="1">
        <img src="app_mockup.jpg" alt="The Connecta mobile app" style="width:100%;max-width:320px;margin-inline:auto;border-radius:var(--r-lg);box-shadow:var(--shadow-lg)" />
      </div>
    </div>
  </div>
</section>
""" + cta("Your next opportunity is one tap away.",
          "Download Connecta and start hiring or working across every sector today.",
          "Contact us", "contact.html", "How it works", "how.html") )

    # =====================================================================
    # 11. HIRE TALENT
    # =====================================================================
    build("hire.html", "hire", "Hire Talent",
      "Post a brief, get AI-matched candidates from every sector, and pay safely through escrow. Hire one person or a whole squad.",
      page_hero("For you", "For clients",
        "Find the right talent, without the guesswork.",
        "Post a brief and let Connecta bring you qualified candidates from every sector — matched by AI, protected by escrow, free to hire one person or a whole squad."),
      """<section class="section">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">How hiring works</span>
      <h2>From brief to team in three steps.</h2>
    </div>
    <div class="cards-3">
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 13h6M9 17h6"/></svg></div>
        <h4>1 · Post your brief</h4>
        <p>Describe the work — a website, a marketing campaign, a training programme, an event. The more detail, the better the matches.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg></div>
        <h4>2 · Get matched</h4>
        <p>AI ranks candidates by fit, with transparent scores. Review profiles, portfolios and reviews, then shortlist.</p>
      </article>
      <article class="mini-card reveal" data-delay="2">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></svg></div>
        <h4>3 · Hire &amp; pay safely</h4>
        <p>Fund milestones through escrow. Money releases only when you approve the work. Hire one person or a whole squad.</p>
      </article>
    </div>
  </div>
  <div class="wrap">
    <div class="cards-3">
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg></div>
        <h4>Every sector covered</h4>
        <p>Developers, designers, marketers, accountants, writers, planners, coaches and tutors — hire across all eight sectors, plus anything else.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg></div>
        <h4>Verified, reviewed talent</h4>
        <p>Identity-verified profiles with two-way reviews, so you know exactly who you're working with before you commit.</p>
      </article>
      <article class="mini-card reveal" data-delay="2">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M15 20c0-2 2-3.4 4-3.4"/></svg></div>
        <h4>Hire a whole squad</h4>
        <p>Book a full multidisciplinary Collabo Squad from a single listing — bigger briefs handled end to end.</p>
      </article>
    </div>
  </div>
</section>
""" + cta("Ready to find your next hire?",
          "Post a brief for free and get matched with talent across every sector in seconds.",
          "Get the app", "download.html", "How it works", "how.html") )

    # =====================================================================
    # 12. FIND WORK
    # =====================================================================
    build("find.html", "find", "Find Work",
      "Create a profile, get matched to projects in your sector, and get paid safely through escrow. Freelance across Africa and worldwide.",
      page_hero("For you", "For freelancers",
        "Turn your skill into income — in any sector.",
        "Create a profile, get matched to projects that fit, and get paid safely through escrow. From tech to teaching, hospitality to healthcare — Connecta works for your skill."),
      """<section class="section">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">How it works for you</span>
      <h2>Your next project starts here.</h2>
    </div>
    <div class="cards-3">
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></div>
        <h4>1 · Build your profile</h4>
        <p>Show your skills, portfolio, rates and availability. Verification unlocks a trust badge that gets you found.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg></div>
        <h4>2 · Get matched</h4>
        <p>AI matches you to projects that fit your skills and schedule, with a transparent score. Apply with AI-assisted proposals.</p>
      </article>
      <article class="mini-card reveal" data-delay="2">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
        <h4>3 · Get paid, protected</h4>
        <p>See funds secured in escrow before you start. Milestone approved? Payment releases to your wallet and local payouts.</p>
      </article>
    </div>
  </div>
  <div class="wrap">
    <div class="cards-3">
      <article class="mini-card reveal">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg></div>
        <h4>Work across all sectors</h4>
        <p>Tech, design, marketing, finance, writing, events, health, education — and anything else you're great at.</p>
      </article>
      <article class="mini-card reveal" data-delay="1">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M15 20c0-2 2-3.4 4-3.4"/></svg></div>
        <h4>Team up as a squad</h4>
        <p>Join a Collabo Squad and take on briefs too big for one person, with fair automatic splits.</p>
      </article>
      <article class="mini-card reveal" data-delay="2">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6L5.7 21 8 13.8 2 9.4h7.6z"/></svg></div>
        <h4>Grow your reputation</h4>
        <p>Two-way reviews and completed work build a reputation that makes each next match stronger.</p>
      </article>
    </div>
    <p class="reveal" style="text-align:center;margin-top:2.4rem;color:var(--muted)">Curious which fields we cover? <a href="index.html#sectors" style="color:var(--jade-deep);font-weight:600">Explore all sectors →</a></p>
  </div>
</section>
""" + cta("Ready to find your next project?",
          "Create a free profile and let clients across every sector find you.",
          "Get the app", "download.html", "How it works", "how.html") )

    # =====================================================================
    # 13. HOW IT WORKS
    # =====================================================================
    build("how.html", "how", "How it Works",
      "A step-by-step guide to hiring and freelancing on Connecta — AI matching, escrow, payouts and Collabo Squads.",
      page_hero("For you", "How it works",
        "Two sides, one simple flow.",
        "Whether you're hiring talent or working as a freelancer, Connecta keeps the process simple, safe and transparent from first message to final payout."),
      """<section class="section">
  <div class="wrap">
    <div class="cards-2">
      <article class="mini-card reveal">
        <span class="tag">For clients</span>
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5"/></svg></div>
        <h3>Hire talent</h3>
        <ul class="check-list">
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l4 4L19 6"/></svg>Post a brief describing the work</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l4 4L19 6"/></svg>Get AI-ranked candidate matches</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l4 4L19 6"/></svg>Shortlist and fund milestones via escrow</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l4 4L19 6"/></svg>Approve work — funds release to the freelancer</li>
        </ul>
        <a class="btn btn-primary" href="hire.html" style="margin-top:1.3rem">Hire talent</a>
      </article>
      <article class="mini-card dark reveal" data-delay="1">
        <span class="tag">For freelancers</span>
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></div>
        <h3>Find work</h3>
        <ul class="check-list">
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l4 4L19 6"/></svg>Create a profile with skills &amp; portfolio</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l4 4L19 6"/></svg>Get matched, or apply with AI-assisted proposals</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l4 4L19 6"/></svg>Start once escrow is funded — payment is secured</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l4 4L19 6"/></svg>Get paid on approval, cash out locally</li>
        </ul>
        <a class="btn btn-light" href="find.html" style="margin-top:1.3rem">Find work</a>
      </article>
    </div>
  </div>
  <div class="wrap prose">
    <h2 class="reveal" style="margin-top:3.2rem">The same protections, every time</h2>
    <p class="reveal">Whatever side you're on, Connecta layers the same systems underneath: <b>AI matching</b> across every sector, <b>escrow</b> so money only moves on approval, <b>verification and reviews</b> for reputation, and <b>Collabo Squads</b> when great work needs more than one person. It's the whole working relationship — one connected platform.</p>
  </div>
</section>
""" + cta("Ready to get started?",
          "Join Connecta and start hiring or working across every sector, protected by escrow.",
          "Get the app", "download.html", "Talk to us", "contact.html") )

    # =====================================================================
    # 14. PRIVACY POLICY
    # =====================================================================
    build("privacy.html", None, "Privacy Policy",
      "Connecta's Privacy Policy — what data we collect, how we use it, who we share it with, and the rights and controls you have.",
      page_hero("Privacy", "Legal",
        "Privacy Policy",
        "Your trust is the whole point of Connecta. This policy explains, in plain language, what we collect, why, and the control you keep over your information."),
      """<section class="section">
  <div class="wrap prose">
    <p class="legal-meta reveal">Last updated: 10 August 2026</p>
    <p class="lead reveal">Connecta (“Connecta,” “we,” “us”) operates a job and freelance marketplace connecting skilled professionals across Africa with clients worldwide. This Privacy Policy describes how we handle your information when you use our website, mobile apps and services (together, the “Platform”).</p>

    <h2 class="reveal">1. Information we collect</h2>
    <p class="reveal">We collect only what we need to run the marketplace:</p>
    <ul class="reveal">
      <li><b>Account &amp; profile data</b> — name, email, phone number, password, role (client or freelancer), skills, portfolio, rates and availability.</li>
      <li><b>Identity verification data</b> — information and documents used to confirm who you are and issue a verification badge. This is processed securely and only for verification and safety.</li>
      <li><b>Project &amp; transaction data</b> — briefs, proposals, messages, milestones, reviews, and records of escrow funding and payouts.</li>
      <li><b>Payment data</b> — wallet balances and payout details. Card and bank details are handled by our payment partners, not stored by us in full.</li>
      <li><b>Technical data</b> — device, app version, IP address, and basic usage analytics needed to keep the Platform secure and working.</li>
    </ul>

    <h2 class="reveal">2. How we use your information</h2>
    <ul class="reveal">
      <li>To create and manage your account and profile.</li>
      <li>To power AI matching between work and talent across every sector.</li>
      <li>To process escrow funding, releases and local payouts.</li>
      <li>To verify identity, prevent fraud and keep the marketplace safe.</li>
      <li>To enable chat, notifications, reviews and the community feed.</li>
      <li>To provide support and respond to your requests.</li>
      <li>To meet legal, tax and regulatory obligations.</li>
    </ul>

    <h2 class="reveal">3. How we share information</h2>
    <p class="reveal">We <b>never sell your personal data</b>. We share it only where necessary:</p>
    <ul class="reveal">
      <li><b>With other users</b> — the profile details, ratings and work history you choose to show, so clients and freelancers can work together.</li>
      <li><b>With service providers</b> — payment processors, identity-verification and hosting partners who process data on our behalf under strict agreements.</li>
      <li><b>For legal reasons</b> — when required by law, or to protect the rights, safety and property of our users and Connecta.</li>
    </ul>

    <h2 class="reveal">4. Your rights and controls</h2>
    <p class="reveal">You can access, correct or update your information from your account at any time. You may also request a copy of your data or ask us to delete it, subject to records we must keep for legal and financial reasons. To exercise any right, email <a href="mailto:privacy@connecta.app">privacy@connecta.app</a>.</p>

    <h2 class="reveal">5. Data security &amp; retention</h2>
    <p class="reveal">We protect your information with encryption in transit, access controls and secure infrastructure. We keep data only as long as needed to provide the Platform and meet legal obligations, then delete or anonymise it.</p>

    <h2 class="reveal">6. Cookies</h2>
    <p class="reveal">Our website uses a small number of cookies and similar technologies. See our <a href="cookies.html">Cookie Policy</a> for details and choices.</p>

    <h2 class="reveal">7. Children</h2>
    <p class="reveal">Connecta is intended for people aged 18 and over. We do not knowingly collect data from children.</p>

    <h2 class="reveal">8. Changes to this policy</h2>
    <p class="reveal">We may update this policy from time to time. We’ll post the new version here with a revised “last updated” date, and notify you of material changes.</p>

    <h2 class="reveal">9. Contact us</h2>
    <p class="reveal">Questions about privacy? Write to <a href="mailto:privacy@connecta.app">privacy@connecta.app</a> or visit our <a href="contact.html">contact page</a>.</p>
  </div>
</section>
""" + cta("Work with confidence.",
          "Join a marketplace where trust — and your privacy — are built in from day one.",
          "Get the app", "download.html", "Trust &amp; safety", "trust.html") )

    # =====================================================================
    # 15. TERMS OF SERVICE
    # =====================================================================
    build("terms.html", None, "Terms of Service",
      "Connecta's Terms of Service — the agreement that governs your use of the marketplace, including accounts, payments, escrow and conduct.",
      page_hero("Terms", "Legal",
        "Terms of Service",
        "These terms are the agreement between you and Connecta. They keep the marketplace fair, safe and predictable for everyone who uses it."),
      """<section class="section">
  <div class="wrap prose">
    <p class="legal-meta reveal">Last updated: 10 August 2026</p>
    <p class="lead reveal">Welcome to Connecta. By creating an account or using the Platform, you agree to these Terms of Service (“Terms”). Please read them carefully. If you don’t agree, please don’t use the Platform.</p>

    <h2 class="reveal">1. Who we are</h2>
    <p class="reveal">Connecta is a job and freelance marketplace that connects clients with freelancers and Collabo Squads across every sector, with AI matching and escrow-protected payments. Connecta is the platform provider; the work itself is agreed directly between clients and freelancers.</p>

    <h2 class="reveal">2. Your account</h2>
    <ul class="reveal">
      <li>You must be at least 18 and able to enter a binding contract.</li>
      <li>Provide accurate information and keep your login secure — you’re responsible for activity on your account.</li>
      <li>Complete identity verification where required to unlock certain features and badges.</li>
    </ul>

    <h2 class="reveal">3. Clients and freelancers</h2>
    <p class="reveal">Clients post briefs and fund milestones; freelancers (individually or as a squad) submit proposals and deliver work. You are responsible for the accuracy of what you post, the work you agree to, and complying with any laws that apply to you. Connecta is not a party to the contract for the work itself.</p>

    <h2 class="reveal">4. Payments and escrow</h2>
    <ul class="reveal">
      <li>Clients fund milestones into secure escrow before work begins.</li>
      <li>Funds are released to the freelancer’s wallet when the client approves the milestone.</li>
      <li>Payouts are made through supported local methods where available.</li>
      <li>Applicable fees are shown before you confirm a transaction.</li>
    </ul>

    <h2 class="reveal">5. Disputes</h2>
    <p class="reveal">If a project goes wrong, either side can open a dispute. Funds stay locked in escrow while our trust &amp; safety team reviews the evidence and works toward a fair resolution. Details are in our <a href="trust.html">Trust &amp; Safety</a> guide.</p>

    <h2 class="reveal">6. Acceptable use</h2>
    <p class="reveal">You agree not to: post false or misleading information; take payments or hiring off-platform to avoid protections and fees; harass, discriminate against or defraud other users; infringe intellectual property; or use the Platform for anything illegal. We may suspend or remove accounts that break these rules.</p>

    <h2 class="reveal">7. Intellectual property</h2>
    <p class="reveal">You keep ownership of the content you create. Rights to delivered work transfer according to what you and the other party agree. The Connecta name, logo and platform are our property and may not be copied without permission.</p>

    <h2 class="reveal">8. Disclaimers &amp; liability</h2>
    <p class="reveal">The Platform is provided “as is.” We work hard to keep it reliable and safe, but we don’t guarantee the quality, outcome or conduct of any user. To the extent permitted by law, Connecta is not liable for indirect or consequential losses arising from work arranged through the Platform.</p>

    <h2 class="reveal">9. Termination</h2>
    <p class="reveal">You can close your account at any time. We may suspend or end access if these Terms are breached. Some obligations — like fees owed and dispute outcomes — survive termination.</p>

    <h2 class="reveal">10. Changes and contact</h2>
    <p class="reveal">We may update these Terms; we’ll post changes here with a new date and notify you of material updates. Questions? Email <a href="mailto:hello@connecta.app">hello@connecta.app</a> or visit our <a href="contact.html">contact page</a>.</p>
  </div>
</section>
""" + cta("Ready when you are.",
          "Join Connecta and start hiring or working across every sector, protected by escrow.",
          "Get the app", "download.html", "Read the privacy policy", "privacy.html") )

    # =====================================================================
    # 16. COOKIE POLICY
    # =====================================================================
    build("cookies.html", None, "Cookie Policy",
      "Connecta's Cookie Policy — the cookies and similar technologies our website uses, what they do, and how to control them.",
      page_hero("Cookies", "Legal",
        "Cookie Policy",
        "A short, honest explanation of the cookies our website uses — what they’re for, and how you stay in control."),
      """<section class="section">
  <div class="wrap prose">
    <p class="legal-meta reveal">Last updated: 10 August 2026</p>
    <p class="lead reveal">Cookies are small text files a website stores on your device. We use a small number of them to keep Connecta working, secure and easy to use. We don’t use cookies to sell your data.</p>

    <h2 class="reveal">Types of cookies we use</h2>
    <ul class="reveal">
      <li><b>Essential cookies</b> — required for the site to function: signing in, keeping your session secure, and remembering basic preferences. The site can’t work properly without these.</li>
      <li><b>Preference cookies</b> — remember choices like light or dark mode so your experience stays consistent.</li>
      <li><b>Analytics cookies</b> — help us understand, in aggregate, how people use the site so we can improve it. These are optional and never used to identify you personally.</li>
    </ul>

    <h2 class="reveal">Managing cookies</h2>
    <p class="reveal">You can control or delete cookies through your browser settings, and set your browser to warn you before accepting them. Blocking essential cookies may stop parts of the site from working. Most browsers explain how to manage cookies in their help pages.</p>

    <h2 class="reveal">Third parties</h2>
    <p class="reveal">Some cookies may be set by trusted partners who provide analytics or infrastructure on our behalf. They are only permitted to use this information to provide their service to us.</p>

    <h2 class="reveal">Changes and contact</h2>
    <p class="reveal">If our use of cookies changes, we’ll update this page with a new date. For anything cookie- or privacy-related, see our <a href="privacy.html">Privacy Policy</a> or email <a href="mailto:privacy@connecta.app">privacy@connecta.app</a>.</p>
  </div>
</section>
""" + cta("Any questions?",
          "We’re happy to explain anything about how Connecta handles your data.",
          "Contact us", "contact.html", "Read the privacy policy", "privacy.html") )

    # =====================================================================
    # 17. 404 — NOT FOUND
    # =====================================================================
    build("404.html", None, "Page not found",
      "The page you’re looking for isn’t here — but the rest of Connecta is. Head back home or explore the marketplace.",
      """<main id="top">
<section class="page-hero error-hero">
  <div class="wrap">
    <span class="eyebrow reveal">Error 404</span>
    <h1 class="reveal error-code" data-delay="1">404</h1>
    <h2 class="reveal" data-delay="1">This page took the day off.</h2>
    <p class="lede reveal" data-delay="2">The link may be broken or the page may have moved — but the rest of Connecta is right here. Let’s get you back to work.</p>
    <div class="hero-actions reveal" data-delay="3">
      <a class="btn btn-primary btn-lg" href="index.html">Back to home</a>
      <a class="btn btn-light btn-lg" href="help.html">Visit the help center</a>
    </div>
  </div>
</section>
""",
      """<section class="section">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">Popular pages</span>
      <h2>Try one of these instead.</h2>
    </div>
    <div class="cards-3">
      <a class="mini-card link-card reveal" href="hire.html">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5"/></svg></div>
        <h3>Hire talent</h3>
        <p>Post a brief and get AI-matched candidates across every sector.</p>
      </a>
      <a class="mini-card link-card reveal" data-delay="1" href="find.html">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></div>
        <h3>Find work</h3>
        <p>Build a profile, get matched, and get paid safely through escrow.</p>
      </a>
      <a class="mini-card link-card reveal" data-delay="2" href="download.html">
        <div class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg></div>
        <h3>Get the app</h3>
        <p>Take the whole marketplace with you on iOS and Android.</p>
      </a>
    </div>
  </div>
</section>
""")
