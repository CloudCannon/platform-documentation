# Platform Documentation — Claude Instructions

Project-specific reference for Claude Code (and any AI tool that reads `CLAUDE.md`). The substantive content lives in companion files:

@AGENTS.md
@STYLE_GUIDE_AGENTS.md

## Reviewing a doc

When asked to review a documentation article, run the `/review-doc <path>` command. It is the required process: it forces the three-lens review (audience, consistency, writing quality), a full itemized checklist with a verdict per row, and an app fact-check that cites `file:line` for every claim the doc makes about the product. A review that does not produce that complete artifact is not a review — do not substitute an ad-hoc read-through.
