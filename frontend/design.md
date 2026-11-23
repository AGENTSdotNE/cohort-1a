# design.md: Northeast Council FOI tracker

Design guide for the frontend (React + TypeScript + Vite + shadcn/ui). Based on the GOV.UK Design System, the MoJ sortable table, and the six inspiration screenshots (DfE sent requests list, loading spinner, CMA and Family Experience empty states, GOV.UK Notify dashboard, Manage accounts table).

Flow: **Dashboard (list) → Request detail → Assign / review forms**. Users: receiving party (Information Governance team) mainly, requesting party for status only.

## 1. Principles

1. Plain and boring beats clever. Users are officers clearing a queue, not browsing.
2. Deadline first. Overdue items come first, then due soonest, then the rest.
3. Never rely on colour alone. Every status tag has text, and every action has a text label.
4. One main button per page.
5. The system flags, the human decides. Always show why an item was flagged as FOI.
6. Sentence case everywhere ("Assign owner", not "Assign Owner").

## 2. Using GOV.UK here

- Our app is a fictional council tool and is not on service.gov.uk, so do **not** use the GDS Transport font or the crown logo. GOV.UK says to use an alternative like Arial or Helvetica in that case.
- We copy the look (colours, spacing, patterns) and keep class names simple. We use shadcn/ui primitives styled with these tokens, not the `govuk-frontend` package, so no extra library.
- GOV.UK has **no official empty state or loading component**. Section 8 and 9 are custom patterns based on the screenshots and GOV.UK content rules.

## 3. `index.css` (colours and fonts)

Drop into `src/index.css`. Tailwind v4 style, with shadcn variable names mapped to GOV.UK colours.

```css
@import "tailwindcss";

:root {
  /* Fonts: Arial because we are not on service.gov.uk */
  --font-sans: Arial, Helvetica, "Liberation Sans", sans-serif;

  /* Core GOV.UK colours */
  --govuk-text: #0b0c0c;
  --govuk-text-secondary: #484949;
  --govuk-brand: #1d70b8;          /* links, primary accents */
  --govuk-brand-dark: #0f385c;     /* header, hover on links */
  --govuk-link: #1a65a6;
  --govuk-link-visited: #54319f;
  --govuk-focus: #ffdd00;          /* focus background */
  --govuk-focus-text: #0b0c0c;
  --govuk-border: #cecece;
  --govuk-input-border: #0b0c0c;
  --govuk-page-bg: #f4f8fb;
  --govuk-panel-bg: #f3f3f3;
  --govuk-white: #ffffff;

  /* Button colours */
  --govuk-button: #0f7a52;         /* green primary */
  --govuk-button-hover: #0b5c3e;
  --govuk-button-secondary: #f3f3f3;
  --govuk-button-warning: #ca3535;

  /* Status tag pairs: text on background (all pass 4.5:1) */
  --tag-blue-text: #16548a;   --tag-blue-bg: #d2e2f1;     /* assigned, in progress */
  --tag-green-text: #0b5c3e;  --tag-green-bg: #cfe4dc;    /* closed, sent */
  --tag-red-text: #982828;    --tag-red-bg: #f4d7d7;      /* overdue */
  --tag-orange-text: #7a3c1c; --tag-orange-bg: #fde4d7;   /* due soon */
  --tag-yellow-text: #806f00; --tag-yellow-bg: #fff8cc;   /* needs review */
  --tag-purple-text: #3f2577; --tag-purple-bg: #ddd6ec;   /* FOI flagged */
  --tag-grey-text: #484949;   --tag-grey-bg: #f3f3f3;     /* unassigned, none */

  /* shadcn/ui variable mapping */
  --background: var(--govuk-page-bg);
  --foreground: var(--govuk-text);
  --card: var(--govuk-white);
  --card-foreground: var(--govuk-text);
  --primary: var(--govuk-button);
  --primary-foreground: #ffffff;
  --secondary: var(--govuk-button-secondary);
  --secondary-foreground: var(--govuk-text);
  --muted: var(--govuk-panel-bg);
  --muted-foreground: var(--govuk-text-secondary);
  --accent: var(--tag-blue-bg);
  --accent-foreground: var(--tag-blue-text);
  --destructive: var(--govuk-button-warning);
  --border: var(--govuk-border);
  --input: var(--govuk-input-border);
  --ring: var(--govuk-focus);
  --radius: 0;                      /* GOV.UK uses square corners */
}

@theme inline {
  --font-sans: var(--font-sans);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
}

html { font-family: var(--font-sans); color: var(--govuk-text); background: var(--background); }
body { font-size: 19px; line-height: 25px; margin: 0; }
@media (max-width: 40.0525em) { body { font-size: 16px; line-height: 20px; } }

a { color: var(--govuk-link); text-decoration: underline; text-underline-offset: 0.1em; }
a:visited { color: var(--govuk-link-visited); }
a:hover { color: var(--govuk-brand-dark); text-decoration-thickness: 3px; }

/* Focus: yellow background, black text, thick black underline. Never remove. */
:focus-visible {
  outline: 3px solid transparent;       /* shows in forced colours mode */
  background-color: var(--govuk-focus);
  color: var(--govuk-focus-text);
  box-shadow: 0 -2px var(--govuk-focus), 0 4px var(--govuk-focus-text);
  text-decoration: none;
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Contrast checks (calculated, WCAG AA needs 4.5:1 for text): white on button green 5.35, white on brand blue 5.17, body text on page background 18.3, secondary text on white 9.0, all tag pairs above 4.5 (lowest is yellow at 4.66).

> Hex values come from the GOV.UK functional colours page. Double check them against https://design-system.service.gov.uk/styles/colour/ before release, because the Feb 2026 brand refresh changed some of them.

## 4. Typography

Font: Arial. Sizes come from the GOV.UK type scale (large screens, over 640px; small screens in brackets).

| Use | Class idea | Size / line height |
| --- | --- | --- |
| Page title | `heading-xl` | 48/50 (32/35), bold |
| Section heading | `heading-l` | 36/40 (27/30), bold |
| Card or panel heading | `heading-m` | 24/30 (21/25), bold |
| Small heading, table header | `heading-s` | 19/25, bold |
| Body | `body` | 19/25 |
| Hint, secondary info, tags | `body-s` | 16/20 |

Rules: left aligned, no all caps (except inside tags), keep lines under about 75 characters, dates written as "9 December 2026".

## 5. Spacing and layout

- Spacing steps (px): 5, 10, 15, 20, 25, 30, 40, 50, 60. Use these only. On small screens use the smaller steps.
- Page container max width 960px, side margin 15px mobile and 30px tablet and up.
- Breakpoints: mobile under 641px, tablet 641px, desktop 769px.
- Page order: skip link, phase banner ("Beta", with feedback link), header and service navigation, main content, footer.
- Service navigation links: **Dashboard**, **All requests**. Current page marked with `aria-current`.
- Dashboard width is full container. Detail page uses two thirds main column and one third side column (owner and actions).

## 6. Dashboard (list view)

Inspired by the DfE "Sent requests" list and the Manage accounts table.

Top to bottom:
1. Page title "Requests" and one line of context ("12 open, 3 overdue").
2. **Stat tiles** (from the Notify dashboard): Overdue, Due soon, Unassigned, Flagged as FOI. Each tile is a link that filters the list. Big number (heading-xl) with label (body-s). Red text only on the overdue tile, and the label always says "overdue".
3. Search box plus filters (Status, Owner, Flag). Button "Apply filters" (secondary) and link "Clear filters".
4. Sortable table.
5. Pagination (20 per page) with "Showing 1 to 20 of 47 requests".

Table columns:

| Column | Notes |
| --- | --- |
| Reference | Link to detail page, e.g. FOI-2026-0142 |
| Subject | One line, truncated with full text on detail page |
| Received | "11 November 2026" |
| Due | Date plus tag (see below) |
| Owner | Name, or "Unassigned" tag |
| Status | Tag |

Sorting:
- Default sort is the deadline rule: overdue first (most overdue at the top), then soonest due, then furthest due last. Items with a missing date sit at the very top as "Deadline needs review".
- Sortable headers are buttons with `aria-sort` (MoJ sortable table pattern). Only one column sorted at a time. Table has a `<caption>` that screen readers can hear.
- Rows are not clickable as a whole, the reference link is the target.

### Tags

Text is always the status, never just a colour.

| Tag text | Colour pair | When |
| --- | --- | --- |
| Overdue | red | Due date passed |
| Due soon | orange | Within 5 working days |
| FOI | purple | Flagged as potential FOI |
| Needs review | yellow | Flag waiting for officer decision |
| Unassigned | grey | No owner |
| Deadline needs review | yellow | Date missing or unreadable |
| Assigned / In progress | blue | Owner set |
| Closed / Reassigned | green | Done or moved to another department |

Show at most two tags per row (deadline tag and status tag). Tags are 16px bold with 2px 8px padding, not clickable.

## 7. Detail page

Back link "Back to requests" at the top. Title is the reference, subtitle is the subject.

**Main column (two thirds)**
1. **Deadline panel.** Overdue or due soon uses a warning text pattern: "! Warning. This request is overdue by 3 working days." Otherwise normal text "Due 9 December 2026 (14 working days left)".
2. **Request details** as a summary list: Received, Due, Sender, Channel, Subject, Original message. Long message goes in inset text or a details block.
3. **Why this was flagged.** Plain list of the score reasons ("Mentions Freedom of Information", "Asks for recorded figures") plus the score band (high, medium, unclear). Use inset text, sparingly.
4. **Review decision.** Radios: "This is an FOI request" / "This is not an FOI request, send to another department". If the second option is picked, reveal a select "Department" (conditional reveal). Button "Confirm decision".
5. **History** (audit trail). Newest first, each entry has date and time, who, and what changed ("Priya assigned this request to Sam"). Read only.

**Side column (one third)**
- Owner: summary list row with "Change" link (visually hidden text "Change owner"). Opens the assign form.
- Status tag.
- Button group: primary action only if one makes sense (e.g. "Assign owner" when unassigned), plus secondary actions as links.

### Assign owner form
Select listing the fixed team (Priya, two officers, and "Me" first). Button "Save owner", link "Cancel". On success go back to detail with a success banner.

### Feedback
- **Success:** green notification banner at the top of the page, with a heading "Success" and one line ("Owner changed to Sam"). Focus moves to the banner.
- **Error:** error summary at the top ("There is a problem") with links to each field, plus an error message above the field in red bold text, prefixed "Error:". Border on the field goes red.
- Destructive actions (none in MVP) would use a confirm step and a warning button.

## 8. Empty states (custom pattern)

Learned from the CMA and Family Experience screenshots: say what is happening, say why, then give actions in a list. No sad illustrations.

| Situation | Heading | Body | Actions |
| --- | --- | --- | --- |
| No requests at all | "There are no requests yet" | "New items will appear here when they come in." | None, or link "Check the inbox settings" |
| Filters return nothing | "No matching results" | "There are no requests that match your search or filters." | "You can:" then list: "check your spelling", "remove a filter", "clear all filters" (link) |
| No history yet | "No actions recorded yet" | Short line | None |
| No flagged items | "Nothing flagged as FOI" | "Items flagged by the system will show here." | Link to all requests |

Layout: heading-m, body text, list, left aligned under the filters, in the same place the table would be. Announce with `role="status"` so screen readers hear the change after a search. Keep the stat tiles and filters visible so users can recover.

## 9. Loading states (custom pattern)

Inspired by the loading screenshot.

- **First load of the list or detail page:** a centred spinner with visible text "Loading requests" in body-s, inside a container with `role="status"` and `aria-live="polite"`. Spinner is a thin ring in brand blue (`--govuk-brand`) on a light grey track.
- **Under 300ms:** show nothing, avoid flicker.
- **Over 10 seconds:** replace with error text "Sorry, this is taking too long. Try again" with a link to retry.
- **Buttons:** after click, keep the label, add `aria-busy="true"` and ignore a second click (GOV.UK prevent double click). Do not use a disabled button, GOV.UK says disabled buttons have poor contrast.
- **Table refresh (sort, filter, page):** keep the old rows visible, dim slightly, spinner text announced to screen readers. Avoid skeletons with moving shimmer.
- Respect `prefers-reduced-motion`: the spinner becomes static text only.

## 10. Components: GOV.UK to shadcn/ui

| GOV.UK component | Build with |
| --- | --- |
| Button (default, secondary, warning) | shadcn `Button` with custom variants, square corners, 2px bottom shadow |
| Table + MoJ sortable | shadcn `Table` plus button headers with `aria-sort` |
| Tag | shadcn `Badge`, variants from section 3 colours |
| Summary list | `<dl>` with grid, row borders in `--border` |
| Pagination | shadcn `Pagination`, "Previous" and "Next" with page numbers |
| Notification banner | shadcn `Alert` styled with blue or green top bar |
| Warning text | Custom: bold, `!` in a black circle, 19px |
| Inset text | Custom: 10px left border in `--govuk-border`, 15px padding |
| Error summary / error message | `Alert` plus field level text |
| Select, Radios, Input | shadcn primitives, 2px black border, 40px high |
| Service navigation / Header | Custom header, dark blue `--govuk-brand-dark` |
| Phase banner | Custom: "Beta" tag plus feedback link |
| Stat tile | Custom card, `heading-xl` number |
| Empty / loading | Custom (section 8 and 9) |

## 11. Accessibility checklist

- Target WCAG 2.2 AA. Text contrast 4.5:1, UI components and borders 3:1.
- Every interactive element reachable by keyboard, visible yellow focus state.
- One `<h1>` per page, headings in order.
- Tables have captions and `scope="col"`. Sort state in `aria-sort`.
- Row links and "Change" links have hidden context ("Change owner for FOI-2026-0142").
- Status always as text, never colour alone. Overdue also uses the word "overdue".
- Form fields have visible labels, hints below labels, errors linked with `aria-describedby`.
- Dynamic updates (success, no results, loading) use `role="status"` or move focus to the banner.
- Tap targets at least 44px high on mobile. Zoom to 200% without losing content.

## 12. Responsive behaviour

- Mobile: stat tiles stack in two columns, filters collapse into a "Filter" details block, table turns into stacked cards (reference, subject, due tag, status tag), side column drops below main column.
- Tablet and up: tiles in a row of four, table in full, detail page two columns.
- Do not hide the due date or the overdue tag on any screen size.

## 13. Not in MVP scope

Dark mode, multiple languages, bulk actions, dashboards with charts, requesting party submission form, exports.

## Sources

- GOV.UK Design System: [Table](https://design-system.service.gov.uk/components/table/), [Tag](https://design-system.service.gov.uk/components/tag/), [Summary list](https://design-system.service.gov.uk/components/summary-list/), [Pagination](https://design-system.service.gov.uk/components/pagination/), [Notification banner](https://design-system.service.gov.uk/components/notification-banner/), [Warning text](https://design-system.service.gov.uk/components/warning-text/), [Inset text](https://design-system.service.gov.uk/components/inset-text/), [Error summary](https://design-system.service.gov.uk/components/error-summary/), [Button](https://design-system.service.gov.uk/components/button/), [Service navigation](https://design-system.service.gov.uk/components/service-navigation/)
- Styles: [Colour](https://design-system.service.gov.uk/styles/colour/), [Type scale](https://design-system.service.gov.uk/styles/type-scale/), [Typeface](https://design-system.service.gov.uk/styles/typeface/), [Spacing](https://design-system.service.gov.uk/styles/spacing/), [Layout](https://design-system.service.gov.uk/styles/layout/)
- [MoJ sortable table](https://design-patterns.service.justice.gov.uk/components/sortable-table/)
