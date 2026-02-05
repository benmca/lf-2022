---
title: "Engineering notebook - Tri-Axium Writings - reading the integration schematics with a machine's help"
date: 2026-02-03
tags: ['blog']
layout: post.njk
bgImg: /img/default-bg.jpg
---
As some of you know, during the day I'm a programmer, and I've been building software since the mid 90s. I do a lot with computers in a musical context, but usually I keep my writing about programming out of this blog. I currently have a lot of art- and music-related work that has a programming aspect to it, so I'm going to journal and share what I'm learning here.

## Using Codex (and Claude Code) to assist my exploration of the Tri-Axium schematics

Over the past few years,I've been looking at Anthony Braxton's *Tri-Axium Writings* ("TAW"), thinking about how I might increase my understanding of the integration schematics. 

![TAW image](/main/img/TAW-1-EN-resources/TAW-V1-Introduction-01.jpg)

These diagrams have kind of blown my mind ever since I first opened one of these volumes up 30 years ago, and I know from conversation that they are borderline-unapproachable to everyone I talk to. I can't shake this feeling as I read though: something in the writing sympathizes with these diagrams, and I want to use all my abilities as a human to be able to meet Mr. Braxton halfway before I give up on understanding them. So, I've been talking to a couple of LLMs for the last three days, brainstorming different ways I could make these diagrams more accessible and more interactive.

Thanks to [Frog Peak](https://frogpeak.org/fpartists/fpbraxton.html) and their gift of [e-book versions](https://www.amazon.com/dp/B0DMFDBD15) of the TAW, I now have text and images that I can look at programmatically.  As a sidenote, to date I've always found LLM's to be most useful as a sort of enhanced search, which is what I wanted to have in my back pocket when I'm reading these. This whole thing would've been a little more work with scans of the first addition of TAW, but e-book versions let me explore the text in a new way. Also - these LLMs can be a great brainstorming partner, which is what I'm doing here. 

Here's the initial coversation I had with Codex:

Me: 

*I would like to build an interactive visualizer of the diagrams from Anthony Braxton's Tri-Axium Writings.  I have a relationship with the publisher and have ebook versions of this 3 volume set of books, but there is little information on the web about them specifically. I need to train you on some of the subject matter before we can discuss requirements. I think a good way to collaborate would be to discuss and brainstorm features, and build a feature list together, then plan implementation. How does this sound to you?*

Codex:
```

That sounds like a solid plan. I’m in.

Given the material is mostly offline, the best path is:

1. You teach me the core concepts and how the diagrams work.
2. We brainstorm features and prioritize them.
3. We translate that into requirements and an implementation plan.

To start the training, can you share:

1. A brief overview of what the Tri-Axium diagrams represent and how they’re used.
2. The key diagram types (names and purposes).
3. A few concrete examples you want the visualizer to handle (describe the diagram and how it should behave).

If you can provide excerpts or summaries from the ebooks (text descriptions are fine), I’ll use those as the ground truth.
```

*I won't be able to type these in, you'll have to read parts of the first volume of the ebook set. Before we get there - do you know anything about Braxton?*

```
I need access to the ebook file to proceed and would like to know where it’s located. I'll keep responses general and based on existing knowledge without web access.

I have general background knowledge: Anthony Braxton is a composer, saxophonist, and theorist known for large‑scale systems and graphic/diagrammatic notation, including the Tri‑Axium writings. I don’t know the specific contents of your ebook set without reading it.

If you want me to learn from the first volume, I’ll need access to the file. Tell me where the ebook is located (path in the repo or elsewhere), and its format (PDF/EPUB). I can read it from disk and summarize the parts you want.
```
	
*Start by looking at the Introduction in [path to volume 1].epub  I'm not sure how to tell you page numbers, but the Introduction begins with the words “WRITINGS ONE IS THE FIRST BOOK IN A SET OF".  There is an image with text "This is then the schematic".  Making these schematics interactive is our goal - there are many in this book, this is an illustrative example.  The Introduction continues for some pages until the next section begins.  There's a table of contents that should help you understand the sections I'm referring to.  Clear enough, or do you have questions?*

A little cranking and clarification on the text, and I got:

```
I’ve read the Introduction in the EPUB.

Here’s a concise summary of what matters for the visualizer:

- The Introduction frames the project as a three‑volume system for rethinking “creative music” and broader creativity through multiple, layered contexts. It emphasizes that interpretation must align with the cultural/affinity context being discussed.
- The writings are organized to allow “maximum idea interchange,” with concepts meant to be viewed across multiple levels and contexts.
- The “TRI‑AXIUM” system is defined as a framework for gathering axiom‑level tenets from past and present to project into the future.
- The introduction introduces the integration schematics and how to read them:
	- The subject of a schematic is indicated by an arrow pointing to a term.
	- Bracketed prefixes like (R) and (C) mark “reality of” and “concept of,” etc.
	- Abbreviations and relation marks indicate how terms connect, including dotted lines and physical‑universe connection markers.

The schematic example you mentioned is present. It’s the image OEBPS/images/page020.jpg, introduced by “This is then the schematic.” It
illustrates:

- Subject: “the reality of vibrational dynamics” (because of the [R] prefix)
- Relation: this subject is viewed in relation to “postulation”
- Three contexts branching from that relation:
	1. SG (source initiation) → involving PRI‑VT‑TD (primary vibrational tendencies)
	2. RT‑ALGN (reality alignment) → involving LANG‑DY (language dynamics)
	3. AFTD (affinity tendencies) → involving INDIV‑DY (individual dynamics as related to AFI) or PROG‑CONT (progressional continuance)

If you want, I can extract that schematic image and the related paragraphs into a working note so we can start defining:

- Diagram grammar (nodes, edge types, labels)
- Abbreviation dictionary
- Interaction behaviors (hover expansions, collapse/expand, context switching)

Questions before we proceed:

1. Should I extract the schematic image (page020.jpg) and keep it in the repo for reference?
2. Do you want the next training chunk to be the “Glossary Integration” section, or more schematics from the Introduction?
3. Are we treating the abbreviations as strict symbols to map (e.g., RT‑ALGN → “reality alignment”) or should we allow interpretation variants you prefer?
```

Later, we arrived at this understanding:
	
```
I read from the schematic paragraph to the end of the Introduction, then the full “Glossary Integration” section, and the Glossary at the end of the book. Here’s the concise takeaway, focusing on what’s relevant to the visualizer.

From the schematic paragraph to the end of the Introduction

- The schematic is explicitly presented as a model for reading the system, and the reader is expected to probe the axiom dynamics to understand how terms interact.
- The example is explicitly about “the reality of vibrational dynamics” in relation to “postulation,” broken into three contexts (SG, RT‑ALGN, AFTD), each with sub‑terms.
- It states that symbols and markers attached to schematics are defined in the CODE section (so we should treat diagram symbols as a formal grammar).

Glossary Integration section

- It starts with a pointer to the end‑of‑book Glossary for definitions.
- The section itself is a compact abbreviation list: code/abbrev on one line, plain‑language expansion on the next line.
- This looks like an in‑text dictionary meant to help decode schematic labels quickly.

End‑of‑book Glossary

- Full definitions for the terms, often multi‑part.
- The glossary is alphabetical and expands many of the abbreviations into richer conceptual definitions.
- As you noted, this appears to be redundant across volumes (I’ll treat it as repeatable and avoid assuming new meanings unless told).

Immediate implications for the visualizer

- We should model three layers:
	1. Abbreviation dictionary (from Glossary Integration): CODE → short expansion
	2. Full term definitions (from end Glossary): Term → multi‑part definition
	3. Schematic grammar: arrow marks subject, bracketed prefixes mark “reality of / concept of,” and relation marks encode how nodes connect
- The example schematic supports a graph model with a subject node, relation edges, and context groupings.

If you want, I can extract the Glossary Integration list and the end Glossary into structured JSON (so the UI can hover‑expand abbreviations and provide full definitions). Just say the word and I’ll build that dataset.

Next up: do you want me to keep scanning for schematics in the next sections, or focus on formalizing the glossary data first?
```

I should stop and point out the therapy that I'd experienced at this point. These schematics are dense, and I wanted a way to quickly get to the definitions behind each of the abbreviations and schematics. The density they have is a philosophical density, because the text invites you to interpret ideas that are balancing against each other?   Maybe there's a better term here to use, but I can't get away from the fact that I visualize a Calder mobile every time I look at one of these, and I wanted to be a little more free to interpret them. Ideally these would be little 3d models I could spin and twirl around.  But one step at a time:

![TAW-V1-Introduction-01-overlay-pass8.png](/main/img/TAW-1-EN-resources/TAW-V1-Introduction-01-overlay-pass8.png)

We spent a lot of time trying to build a pipeline to recognize and draw these lines accurately, but I limited that exercise to four hours and we didn't get there. I took a break, went for a run, and came back with the realization that I only need the nodes. 

![Screenshot 2026-02-03 at 5.15.12 PM.png](/main/img/TAW-1-EN-resources/Screenshot%202026-02-03%20at%205.15.12 PM.png)

We have a pretty good initial placement of the nodes. I can hover to see an expansion of the abbreviation:

![Screenshot 2026-02-03 at 5.33.24 PM.png](/main/img/TAW-1-EN-resources/Screenshot%202026-02-03%20at%205.33.24 PM.png)

...and clicking gives me the complete glossary text (if we can find it) from the end of the book.

![Screenshot 2026-02-03 at 5.33.31 PM.png](/main/img/TAW-1-EN-resources/Screenshot%202026-02-03%20at%205.33.31 PM.png)

As a final feature, we added a way for me to clean up the initial placement of the nodes and save this.  Here's the result:

![Screenshot 2026-02-03 at 5.55.54 PM.png](/main/img/TAW-1-EN-resources/Screenshot%202026-02-03%20at%205.55.54 PM.png)


