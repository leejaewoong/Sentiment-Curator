### 1\. Response and Code Writing Language Policy

  * **All responses and explanations:** Must be in Korean.
  * **When writing code and documentation:**
      * Variable names, function names, class names: Use English naming conventions
      * Comments, README, API specifications, commit messages: Korean or English may be mixed as appropriate
      * All explanations and communication outside of code: Korean

-----

### 2\. Commit Message Guidelines

#### [Format]

```
{Emoji,Commit Type}({Modified Files}): {Summary}
```  

<!-- end list -->

```
{Detailed Description}
```

#### [Commit Process]

  * 1.  Propose commit message after completing work
  * 2.  Execute commit after user confirmation

#### [Commit Unit]

  * One logical change = One commit
  * Feature additions, bug fixes, and refactoring should be separate commits
  * Closely related small changes may be grouped into one commit

#### [Commit Types]

Select one from the list below:

  * **The Commit Type must use both the emoji and the Type name together.** (Exclude the description in parentheses)
  * ✨Feat - Add new feature
  * 🪄Enhance - Improve existing feature
  * 🐛Fix - Fix bug
  * ♻️Refactor - Refactor code (structural improvement without functionality change)
  * 💄Design - Update CSS and design-related changes
  * 💡Comment - Add or update comments
  * ✏️Docs - Write or update documentation
  * 👷Chore - Build/deployment/dependency and other miscellaneous tasks
  * 🔨Env - Change development environment settings
  * 🚚Rename - Rename files or folders
  * 🔥Remove - Remove files
  * ⏪Revert - Revert commits
  * 🧪Test - Write or update test code
  * 🎉Tada - Initial project creation

#### [Modified Files]

  * **File notation:** `parent-path/filename.ext` (only 1 level of parent path)
  * **3 or fewer files:** `path1/file1.ext, path2/file2.ext, path3/file3.ext`
  * **4 or more files:** `Many`

#### [Summary]

  * Briefly summarize changes (recommended within 50 characters)
  * Use imperative mood

#### [Detailed Description]

Organize changes by category:

  * Write category title for each group (include reason for change if necessary)
  * List file-level details as "- path/filename: summary of changes"

> **Example (Emoji Required):**
> ✨Feat(services/user.ts, utils/auth.ts): Add user authentication feature
>
> Authentication System Implementation (Introduced JWT for enhanced security)
>
>   - services/user.ts: Add password field to User model
>   - utils/auth.ts: Implement JWT-based login logic
>   - middleware/auth.ts: Add authentication middleware

-----

### 3\. Project Creation and Development Guidelines

This guideline distinguishes between the Project Creation phase and the subsequent Development phase.

#### 3.1 Project Creation Guidelines

The project initialization is defined as Phase 1, proceeding through a sequential review and approval of 3 Bundles.

##### [Project Creation Flow]

  * **📦 Bundle A — Requirements Specification**

      * Supervisor: Calls Planning Subagent
      * Planning Subagent: Writes requirements specification
      * Supervisor → User: Requests review and confirmation of Bundle A (Requirements)
      * Incorporate user feedback before proceeding to next Bundle

  * **📦 Bundle B — Tech Stack & Basic Architecture**

      * Planning Subagent: Proposes 2-3 technology stack combinations
          * User Profile: Beginner developer proficient in Python and TypeScript
          * Frameworks/Libraries: Basic knowledge of Next.js, React, and FastAPI
          * Backend: Python-based (prioritize FastAPI)
          * Frontend: React or Next.js (using TypeScript)
          * Database: Included
      * Supervisor → User: Requests tech stack selection
      * Planning Subagent: Designs basic architecture based on selected stack
      * Supervisor → User: Requests review and approval of Bundle B (Tech Stack + Basic Architecture)
      * Proceed to next Bundle after approval

  * **📦 Bundle C — Detailed Design & Feature List**

      * Planning Subagent: Designs components
      * Planning Subagent: Creates API flow diagrams
      * Planning Subagent: Generates Feature list
      * Supervisor → User: Requests final confirmation of Bundle C (Component Design + API Flow + Feature List)
      * Planning phase ends upon user's final approval

#### 3.2 Project Development Guidelines

The development phase proceeds in iterative Task units with the collaboration of the Supervisor (main Claude Code instance) and 5 Subagents.

##### [Agent Architecture]

  * **Structure:** 1 Supervisor (Main) + 5 Subagents (defined in `.claude/agents/`)
  * **Supervisor Responsibilities:**
      * Manage overall project context and relay work results between subagents
      * Decompose Features into Task units
      * Analyze failure causes and decide retry strategy on test failures
      * **After successful test and documentation updates:** Review latest project state and propose commit messages (in Korean)
      * Request user consent for commits (all user interactions occur only through supervisor)
      * Subagent work proceeds automatically without user permission
      * Share Gherkin test scenario summaries (for reference)
  * **Subagent Invocation:**
      * Supervisor invokes subagents using the Task tool
      * Each subagent runs independently with its own context window
      * Subagents return results to Supervisor for integration

##### [Strict Sequence Rule]

To ensure the quality and stability of the development process, the following rule must be strictly adhered to:

  * Development Agent is Strictly **PROHIBITED** from writing implementation code until Test Design Agent produces the following deliverables:
      * Gherkin Test Scenarios (`*.feature`)
      * Executable Test Code (`test_*.py`, etc.)
      * **Exception:** Project initialization (scaffolding) and environment configuration file (`.env`, `config`) creation are permitted without tests.

##### [Subagent Definitions and Responsibilities]

All subagents are defined in `.claude/agents/` directory with specific tool access permissions.

  * **Planning Subagent** (`.claude/agents/planning-agent.md`)
      * **Tools:** Read, Glob, Grep, Write, Edit
      * Update requirements specification (if changed during development)
      * Modify architecture and component design

  * **Test Design Subagent** (`.claude/agents/test-design-agent.md`)
      * **Tools:** Read, Glob, Grep, Write, Edit, Bash
      * Write test scenarios in Given-When-Then (Gherkin) format
      * Write integration test code (not unit tests)
      * Identify edge cases

  * **Development Subagent** (`.claude/agents/development-agent.md`)
      * **Tools:** Read, Glob, Grep, Write, Edit, Bash
      * **[Strict Sequence Rule]:** Start implementation only after securing test scenarios and code
      * Write code to pass tests created by Test Design Subagent
      * Follow function names and variable names defined by Test Design Subagent
      * Run code quality tools (linting, type checking)

  * **Validation Subagent** (`.claude/agents/validation-agent.md`)
      * **Tools:** Read, Glob, Grep, Bash
      * Execute integration tests
      * Create test result reports
      * Categorize failure causes (test code issue / implementation code issue / unclear requirements)

  * **Documentation Subagent** (`.claude/agents/documentation-agent.md`)
      * **Tools:** Read, Glob, Grep, Write, Edit
      * Update API documentation (when API changes)
      * Update README (when major Features are completed)
      * Update architecture documentation (when structure changes)
      * Manage requirements specification checklist (check after each Task completion)

##### [Development Workflow]

For each Task, follow this sequence:

1. **Test Design Phase**
   - Supervisor invokes Test Design Subagent
   - Test Design Subagent creates Gherkin scenarios and test code
   - Returns test files to Supervisor

2. **Development Phase**
   - Supervisor invokes Development Subagent
   - Development Subagent implements code to pass tests
   - Returns implementation to Supervisor

3. **Validation Phase**
   - Supervisor invokes Validation Subagent
   - Validation Subagent runs tests and generates report
   - If tests fail: Supervisor analyzes and decides retry strategy
   - If tests pass: Proceed to next phase

4. **Documentation Phase** (if needed)
   - Supervisor invokes Documentation Subagent
   - Documentation Subagent updates relevant documentation
   - Returns updated docs to Supervisor

5. **Commit Phase**
   - Supervisor reviews all changes (code + tests + docs)
   - Supervisor proposes commit message following Section 2 guidelines
   - Supervisor requests user confirmation
   - Execute commit after user approval