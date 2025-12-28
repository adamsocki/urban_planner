# SS4A Planning Tool MVP - 3 Month Implementation Plan

## Project Goal

Build a tool that automates 70-80% of Safe Streets for All (SS4A) plan generation. The MVP takes crash data + area definition → produces a Word/PDF document with analysis, problem identification, countermeasures, and implementation strategy—something planners can actually use as a starting point.

**Success definition:** A document that a planner/agency would review and edit (not start from scratch).

**Post-MVP vision:** Expand beyond SS4A to other planning documents (comprehensive plans, corridor studies, etc.).

---

## Why This Matters

Currently, SS4A plans cost $400k+ and take significant time to produce. ~70% of the work is mechanical:
- Crash analysis and hotspot identification
- Existing conditions assessment
- Problem statement synthesis
- Countermeasure selection (formulaic)
- Implementation planning

The goal is to compress this into an automated workflow that produces usable output, proving the concept to companies building in this space.

---

## Timeline Overview

**13 weeks, roughly 10-15 hours/week**

| Phase | Weeks | Focus | Gut Check |
|-------|-------|-------|-----------|
| Phase 0 | 1-2 | Architecture & setup | Architecture review |
| Phase 1 | 3-5 | Input layer + analysis | Analysis output works |
| Phase 2 | 6-10 | LLM synthesis + writing | Prose is readable |
| Phase 3 | 11-13 | Document assembly | Full document is usable |

---

## Phase 0: Architecture & Setup (Weeks 1-2)

**Goal:** Lock in design decisions before major building starts.

### Tasks

1. **Data Models** (0.1)
   - Define crash record structure (lat/lon, date, severity, injury type, etc.)
   - Analysis result structure (hotspots, corridors, problem areas)
   - Plan section structure (crash summary, conditions, problems, countermeasures, implementation)
   - Metadata (area geometry, timeframe, agency context)

2. **LLM Abstraction Layer** (0.2)
   - Design interface to support multiple LLM providers (Claude, OpenAI, open-source)
   - Plan for future RAG integration (vector embeddings, retrieval)
   - Plan for future fine-tuning capability
   - Decision: Start with Claude API (simple, good quality, extensible)

3. **Analysis Engine Location** (0.3)
   - Option A: Python service + Node API
   - Option B: TypeScript/Node all the way
   - Option C: Integrated into Placemark backend
   - **Decision needed:** Based on complexity of crash algorithms and existing expertise

4. **Database Schema** (0.4)
   - Placemark's Postgres for plan metadata, parameters, results
   - Plan where larger datasets live (crash history, statewide shapefiles, etc.)
   - Decision: Keep simple for MVP, extend later

5. **Tech Stack Decisions**
   - Frontend: Continue with Placemark fullstack (Next.js, `apps/fullstack/app/planner/`)
   - LLM: Claude API (with abstraction for future multi-provider)
   - Document generation: TBD (docx for Word, pdfkit or similar for PDF)
   - Analysis engine: TBD (Python vs. Node)
   - Database: Placemark Postgres primary, additional storage TBD

### Gut Check 1 (End of Week 2)

**Who:** Company contact (from interview)

**What to show:** Architecture document with data models, LLM layer design, analysis engine plan

**Questions to ask:**
- Does this approach make sense for the problem?
- Are we thinking about the data/workflow correctly?
- Any red flags or missing pieces?

**Success:** Contact confirms the architecture is sound, no fundamental misunderstandings

---

## Phase 1: Input Layer & Analysis Setup (Weeks 3-5)

**Goal:** Build UI for input, connect analysis algorithms, confirm analysis output is useful.

### Tasks

1. **GIS Area Selection** (1.1)
   - Use Placemark's existing mapping UI to let users draw/select area
   - Save area geometry (polygon) to database
   - Display selected area on map

2. **Parameter Form** (1.2)
   - Form with dropdowns/inputs:
     - Timeframe (start/end date for crash analysis)
     - Focus area (pedestrian, bicyclist, all modes, etc.)
     - Any other parameters your analysis needs
   - Form submits to backend

3. **Crash Data Input** (1.3)
   - For MVP: assume crash data is seeded in database
   - Option to upload CSV if needed
   - Filter crash data by selected area + timeframe

4. **Analysis Algorithms** (1.4)
   - Wire your existing hotspot algorithms
   - Conditions analysis (pulling from what data source?)
   - Problem identification (trend analysis, spatial patterns)
   - Countermeasure selection logic (if crash type X → recommend Y)
   - Store results in database

5. **Output for next phase**
   - Analysis produces structured output: hotspots (with severity), high-injury corridors, problem clusters
   - This feeds into Phase 2 (LLM writing)

### Gut Check 2 (End of Week 5)

**Who:** Company contact

**What to show:**
- Live demo: draw area → run analysis → see results
- Real crash data processed, hotspots identified, conditions analyzed
- Raw analysis output (not prose yet, just structured data)

**Questions to ask:**
- Is this the kind of analysis you'd want in a plan?
- Are the hotspots/corridors being identified correctly?
- What's missing from the analysis?

**Success:** Contact confirms analysis is useful and directionally correct

---

## Phase 2: LLM Synthesis & Writing (Weeks 6-10)

**Goal:** Turn raw analysis into readable prose that planners can use.

### Tasks

1. **LLM Abstraction Layer** (2.1)
   - Implement Claude API integration
   - Design interface for: prompt input → LLM call → structured output
   - Plan for future: multi-provider support, streaming, RAG
   - Error handling + retry logic

2. **RAG Scaffolding** (2.2)
   - Ingest public SS4A documents (download from federal/state resources)
   - Create embeddings infrastructure (vector DB, retrieval logic)
   - For MVP: can be simple (just retrieve similar plans as context)
   - For later: enable fine-tuning on your own plans

3. **Section Generators** (2.3)
   - Build LLM calls for each major section:
     - **Crash Summary:** Analysis → prose narrative of crash patterns
     - **Conditions Assessment:** Conditions data → prose description of existing state
     - **Problem Statement:** Analysis patterns → synthesis of core problems
     - **Countermeasures:** Selected treatments → prose description + justification
     - **Implementation Strategy:** Recommended actions → phased approach
   - Each section should be 200-500 words

4. **Prompt Engineering Loop** (2.4)
   - Test prompts on real analysis results
   - Iterate on prompt structure, context, examples
   - Goal: Generate prose that reads like a real planning document
   - Success threshold: Prose is readable, captures intent, minimal errors
   - *Not perfect*, but good enough that a planner wouldn't have to start from scratch

5. **Context strategy**
   - Use retrieved SS4A examples as context for LLM
   - Or use few-shot prompting (examples embedded in prompt)
   - Or RAG-based retrieval of similar sections
   - **Test during development to see what works best**

### Gut Check 3 (End of Week 10)

**Who:** Company contact

**What to show:**
- Generated prose sections (crash summary, conditions, problems, countermeasures)
- Side-by-side with real SS4A plan section for comparison
- Show the raw analysis → generated prose (so they see the logic)

**Questions to ask:**
- Is the prose readable?
- Could you use this as a starting point?
- What's missing or wrong?
- How much editing would this typically need?

**Success:** Contact says "Yes, I could work with this" or "The structure/approach is good, but X needs work"

---

## Phase 3: Document Assembly & Export (Weeks 11-13)

**Goal:** Generate a complete, usable plan document.

### Tasks

1. **Document Generation** (3.1)
   - Choose library for Word or PDF (or both)
   - Word recommendations: `docx` (Node), good templating support
   - PDF recommendations: `pdfkit` or headless browser rendering
   - Decision: **Start with Word (easier to iterate + edit), add PDF later if needed**

2. **Document Assembly** (3.2)
   - Template structure (title page, TOC, sections, appendices)
   - Populate sections with generated prose
   - Add analysis outputs (tables, stats)
   - Formatting + styling (headings, fonts, spacing)
   - Metadata (agency name, date, prepared by, etc.)

3. **Visualizations** (3.3)
   - GIS maps embedded in document:
     - Hotspot map (crashes color-coded by severity)
     - High-injury corridor map
     - Recommended treatment locations
   - Charts/tables: crash trends, injury summary, etc.

4. **Final touches**
   - Page breaks, section breaks
   - Headers/footers with title, page numbers
   - References + appendices placeholder

### Gut Check 4 (End of Week 13)

**Who:** Company contact (or ideally, a planner from an agency)

**What to show:**
- Full generated plan document (Word or PDF)
- Process: show the full workflow (input area → run analysis → generate document)
- Real example: a complete plan for a real area/agency

**Questions to ask:**
- Would you actually use this as a starting point?
- What's missing or needs heavy editing?
- How much time would this save?
- What would need to change for you to use it internally?

**Success:** "I could send this to an agency for preliminary review" or "This saves us 2-3 weeks of work"

---

## Success Criteria by Phase

### Phase 0 (Architecture)
- ✅ Data models defined and documented
- ✅ LLM abstraction design approved
- ✅ Analysis engine approach locked
- ✅ Database schema sketched
- ✅ Gut check 1: Architecture is sound

### Phase 1 (Analysis)
- ✅ GIS selection UI works
- ✅ Parameters form collects data
- ✅ Crash data processes correctly
- ✅ Analysis algorithms run and produce correct output
- ✅ Hotspots, corridors, problems identified
- ✅ Gut check 2: Analysis is useful

### Phase 2 (Writing)
- ✅ LLM calls work (Claude API integrated)
- ✅ Prose sections generated (5+ sections)
- ✅ Prose is readable and captures intent
- ✅ RAG scaffolding in place (can retrieve examples)
- ✅ Prompts tuned to reasonable quality
- ✅ Gut check 3: Prose is usable

### Phase 3 (Document)
- ✅ Document generation library chosen and working
- ✅ Sections assembled into full document
- ✅ Maps/visualizations embedded
- ✅ Document structure matches real SS4A plans
- ✅ Word (or PDF) export works
- ✅ Gut check 4: Full document is usable

---

## Gut Check Framework

### Before Each Gut Check

1. **Identify what you're testing:** What specific thing are we validating?
2. **Prep the demo:** Make it smooth, shows the full workflow
3. **Write 3-5 key questions** to ask

### During Gut Check

1. **Show the work:** Live demo if possible, screenshots otherwise
2. **Get specific feedback:** Not just "good" or "bad", but what's working and what's not
3. **Listen for:" I could use this," "We'd need X," "This is missing Y"
4. **Take notes:** Capture exact quotes/feedback for reflection

### After Gut Check

1. **Summarize:** 1-2 paragraph reflection on feedback
2. **Adjust plan:** Does the feedback change direction? Do we need to pivot Phase 2 or 3?
3. **Document:** Add findings to this plan

---

## Decision Points

### Tech Stack (Lock by end of Week 2)

- [ ] Analysis engine: Python service vs. Node vs. Integrated?
- [ ] Document generation: Word first? PDF? Both?
- [ ] LLM provider: Start with Claude API?
- [ ] RAG approach: Simple retrieval vs. vector DB vs. fine-tuning?

### Gut Check Partner (Lock before Week 2)

- [ ] Will reach out to company contact
- [ ] Confirm they're willing to do gut checks
- [ ] Schedule Phase 0 gut check

### Scope Decisions (Revisit weekly)

- [ ] MVP scope: What sections MUST be generated? What can wait?
- [ ] Data sources: Assume crash data is seeded? Or build upload flow?
- [ ] Map complexity: Simple maps or fancy visualizations?

---

## Post-MVP Reflection (Week 13+)

Once the MVP is done:

1. **Did it work?**
   - Is the 70-80% document actually useful?
   - Would someone pay for this?
   - Does it impress companies in the space?

2. **Expansion opportunities**
   - Other planning documents (corridor studies, comprehensive plans, etc.)?
   - Refinement: What would make this 90%+ quality?
   - Product vs. service: Sell tool or offer service?

3. **Next steps**
   - If impressive: Show to companies, explore job opportunities
   - If needs work: Identify what's missing, plan Phase 2
   - If successful: Consider building team, seeking investment, etc.

---

## Notes

- **Flexibility:** This is a plan, not a contract. Adjust based on learnings from gut checks.
- **Pace:** 10-15 hrs/week is sustainable. Don't burn out.
- **Gut checks are critical:** They're not extra work, they're the validation that determines if this is actually impressive.
- **Future expansion:** Keep "other planning documents" in mind, but focus on SS4A MVP first.
