/**
 * NathKhat - UGC NET Paper 1 & Paper 2 (Computer Science) Seed Data
 * Curated high-yield topics with authentic, clean, professional Desi Tricks.
 * Formatted with theme-adaptive styles that look gorgeous in both Dark & Light modes.
 */

const SEED_TOPICS = [
  {
    id: "topic-p1-1",
    title: "Scales of Measurement (Nominal, Ordinal, Interval, Ratio)",
    paper: "P1",
    unit: "Unit 2: Research Aptitude",
    trick: "🎬 'NOIR' Order: Nominal (Names/Labels) → Ordinal (Order/Rank) → Interval (Equal intervals, no absolute zero) → Ratio (True Absolute Zero)",
    explanation: `
      <p>In statistics and research methodology, measurement scales categorize variables into 4 distinct progressive levels:</p>
      <ul>
        <li><strong style="color: #6366f1;">Nominal Scale:</strong> Only for naming, classification, or categorization. <em>No order, no arithmetic operations</em>. <br><span style="background-color: rgba(245, 158, 11, 0.2); color: #d97706; padding: 2px 7px; border-radius: 4px; font-weight: 700;">Example:</span> Gender (M/F), Blood Group (A, B, O), Jersey Numbers.</li>
        <li><strong style="color: #3b82f6;">Ordinal Scale:</strong> Categorization <strong>+ Meaningful Rank / Order</strong>, but difference between ranks is NOT equal or quantifiable. <br><span style="background-color: rgba(245, 158, 11, 0.2); color: #d97706; padding: 2px 7px; border-radius: 4px; font-weight: 700;">Example:</span> Exam ranks (1st, 2nd, 3rd), Likert Scale (Agree, Neutral, Disagree).</li>
        <li><strong style="color: #06b6d4;">Interval Scale:</strong> Order <strong>+ Equal Intervals</strong> between values, but has an <u>Arbitrary / Non-Absolute Zero</u> (0 doesn't mean total absence). <br><span style="background-color: rgba(245, 158, 11, 0.2); color: #d97706; padding: 2px 7px; border-radius: 4px; font-weight: 700;">Example:</span> Temperature in Celsius/Fahrenheit (0°C doesn't mean no heat), IQ Score.</li>
        <li><strong style="color: #10b981;">Ratio Scale:</strong> Highest level. Order + Equal Distance <strong>+ TRUE ABSOLUTE ZERO</strong> (multiplication & division valid). <br><span style="background-color: rgba(245, 158, 11, 0.2); color: #d97706; padding: 2px 7px; border-radius: 4px; font-weight: 700;">Example:</span> Height, Weight, Distance, Age, Income.</li>
      </ul>
      <p style="border-left: 4px solid #f59e0b; padding-left: 12px; margin-top: 12px; font-weight: 600;">
        💡 <strong>NET PYQ Golden Tip:</strong> Ratio scale is the ONLY scale where ratios are meaningful (e.g. 20 kg is twice as heavy as 10 kg).
      </p>
    `,
    createdAt: Date.now() - 3600000 * 24 * 3,
    updatedAt: Date.now() - 3600000 * 24 * 3
  },
  {
    id: "topic-p2-1",
    title: "OSI Model 7 Layers Architecture & Devices",
    paper: "P2",
    unit: "Unit 9: Computer Networks",
    trick: "🍕 Bottom-Up: 'Please Do Not Throw Sausage Pizza Away' (Physical, Data Link, Network, Transport, Session, Presentation, Application) | Top-Down: 'All People Seem To Need Data Processing'",
    explanation: `
      <p>The Open Systems Interconnection (OSI) reference model organizes network communication into 7 distinct abstraction layers:</p>
      <ol>
        <li><strong style="color: #8b5cf6;">Application Layer (Layer 7):</strong> Network interface for end-user apps. Protocols: <span style="background-color: rgba(99, 102, 241, 0.15); color: #6366f1; padding: 2px 6px; border-radius: 4px; font-weight: 600;">HTTP, HTTPS, FTP, SMTP, DNS</span>.</li>
        <li><strong style="color: #6366f1;">Presentation Layer (Layer 6):</strong> Translation, Encryption/Decryption, Compression. Formats: <span style="background-color: rgba(99, 102, 241, 0.15); color: #6366f1; padding: 2px 6px; border-radius: 4px; font-weight: 600;">SSL/TLS, JPEG, ASCII</span>.</li>
        <li><strong style="color: #3b82f6;">Session Layer (Layer 5):</strong> Dialogue control, session establishment, token management, checkpoints/synchronization. Protocols: <span style="background-color: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 2px 6px; border-radius: 4px; font-weight: 600;">RPC, NetBIOS</span>.</li>
        <li><strong style="color: #0ea5e9;">Transport Layer (Layer 4):</strong> End-to-End communication, flow & error control, segmentation. Protocols: <span style="background-color: rgba(14, 165, 233, 0.15); color: #0ea5e9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">TCP (Segment), UDP</span>. Devices: Gateway, L4 Switch.</li>
        <li><strong style="color: #14b8a6;">Network Layer (Layer 3):</strong> Logical addressing (IP address) & routing. PDU = <u>Packet</u>. Devices: <span style="background-color: rgba(245, 158, 11, 0.2); color: #d97706; font-weight: bold; padding: 2px 6px; border-radius: 4px;">Router, Layer 3 Switch</span>.</li>
        <li><strong style="color: #10b981;">Data Link Layer (Layer 2):</strong> Physical addressing (MAC), framing, node-to-node hop error/flow control. PDU = <u>Frame</u>. Devices: <span style="background-color: rgba(245, 158, 11, 0.2); color: #d97706; font-weight: bold; padding: 2px 6px; border-radius: 4px;">Bridge, Switch, NIC</span>.</li>
        <li><strong style="color: #f59e0b;">Physical Layer (Layer 1):</strong> Raw bit transmission over physical medium. PDU = <u>Bits</u>. Devices: <span style="background-color: rgba(245, 158, 11, 0.2); color: #d97706; font-weight: bold; padding: 2px 6px; border-radius: 4px;">Hub, Repeater, Cables</span>.</li>
      </ol>
      <p style="border-left: 4px solid #10b981; padding-left: 12px; margin-top: 10px; font-weight: 600;">
        ⭐ <strong>Golden Formula:</strong> Routers work at Layer 3, Switches/Bridges at Layer 2, Hubs/Repeaters at Layer 1!
      </p>
    `,
    createdAt: Date.now() - 3600000 * 24 * 2,
    updatedAt: Date.now() - 3600000 * 24 * 2
  },
  {
    id: "topic-p1-2",
    title: "SWAYAM 4 Quadrants of E-Learning",
    paper: "P1",
    unit: "Unit 8: ICT & Higher Education",
    trick: "📱 4 Quadrants: 'V-E-T-A' (1. Video e-Tutorial, 2. e-Content Text, 3. Tests & Quizzes, 4. Assessment & Discussion Forum)",
    explanation: `
      <p><strong>SWAYAM</strong> (Study Webs of Active-Learning for Young Aspiring Minds) is India's national MOOC platform. Every course on SWAYAM is designed around 4 distinct pedagogical quadrants:</p>
      <ul>
        <li><strong style="color: #ef4444;">Quadrant 1: e-Tutorial (Video Lectures)</strong> - Audio-video lectures specially prepared by National Coordinators (NPTEL, UGC, CEC, NCERT, IGNOU, etc.).</li>
        <li><strong style="color: #3b82f6;">Quadrant 2: e-Content (Reading Material)</strong> - High quality downloadable/printable reading material, e-books, case studies, journal references.</li>
        <li><strong style="color: #10b981;">Quadrant 3: Self-Assessment (Tests & Quizzes)</strong> - Interactive quizzes, MCQs, and assignments for continuous self-evaluation.</li>
        <li><strong style="color: #f59e0b;">Quadrant 4: Discussion Forum (Doubt Clearing)</strong> - Dedicated interactive online clearinghouse for discussing doubts with course mentors and peer students.</li>
      </ul>
      <p style="border-left: 4px solid #6366f1; padding-left: 12px; margin-top: 10px; font-weight: 600;">
        🎯 <em>Note:</em> SWAYAM PRABHA has <strong>40 DTH channels</strong> (telecasting educational programs 24x7 using GSAT-15 satellite)!
      </p>
    `,
    createdAt: Date.now() - 3600000 * 24 * 1.5,
    updatedAt: Date.now() - 3600000 * 24 * 1.5
  },
  {
    id: "topic-p2-2",
    title: "Coffman Deadlock 4 Necessary Conditions",
    paper: "P2",
    unit: "Unit 7: Operating Systems",
    trick: "🔒 'M - H - N - C' (1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait)",
    explanation: `
      <p>For a deadlock to arise in an operating system, all four <strong>Coffman conditions</strong> must hold simultaneously:</p>
      <ol>
        <li><strong style="color: #e11d48;">Mutual Exclusion:</strong> At least one resource must be held in a non-shareable mode (only one process can use it at a time).</li>
        <li><strong style="color: #ea580c;">Hold and Wait:</strong> A process must currently be holding at least one resource and simultaneously requesting additional resources held by other processes.</li>
        <li><strong style="color: #d97706;">No Preemption:</strong> Resources cannot be forcibly seized from a process; they can only be released voluntarily after the process finishes.</li>
        <li><strong style="color: #059669;">Circular Wait:</strong> A closed chain of processes exists {P0, P1, ..., Pn} such that P0 waits for P1, P1 waits for P2, and Pn waits for P0.</li>
      </ol>
      <p style="border-left: 4px solid #3b82f6; padding-left: 12px; margin-top: 10px; font-weight: 600;">
        💡 <strong>Deadlock Prevention Strategy:</strong> Invalidate ANY ONE of these 4 conditions! E.g., prevent Circular Wait by ordering all resource requests linearly using integer IDs (Havender's algorithm).
      </p>
    `,
    createdAt: Date.now() - 3600000 * 24 * 1,
    updatedAt: Date.now() - 3600000 * 24 * 1
  },
  {
    id: "topic-p2-3",
    title: "Chomsky Hierarchy of Grammars & Automata",
    paper: "P2",
    unit: "Unit 8: Theory of Computation",
    trick: "👑 'U - C - C - R' (Type 0 to 3): Unrestricted → Context-Sensitive → Context-Free → Regular (Memory Hook: Universal Computers Can Reason)",
    explanation: `
      <p>Noam Chomsky classified formal languages into a strict 4-level hierarchy based on the generative power of their grammars:</p>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Grammar &amp; Language</th>
            <th>Accepting Automaton</th>
            <th>Production Form</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Type 0</strong></td>
            <td>Unrestricted / Recursively Enumerable</td>
            <td><strong style="color: #ef4444;">Turing Machine</strong></td>
            <td><code>α → β (no restriction, |α| ≥ 1)</code></td>
          </tr>
          <tr>
            <td><strong>Type 1</strong></td>
            <td>Context-Sensitive (CSL)</td>
            <td><strong style="color: #f59e0b;">Linear Bounded Automaton (LBA)</strong></td>
            <td><code>α → β where |α| ≤ |β|</code></td>
          </tr>
          <tr>
            <td><strong>Type 2</strong></td>
            <td>Context-Free (CFL)</td>
            <td><strong style="color: #3b82f6;">Pushdown Automaton (PDA)</strong></td>
            <td><code>A → α (Single Non-Terminal LHS)</code></td>
          </tr>
          <tr>
            <td><strong>Type 3</strong></td>
            <td>Regular Language (RL)</td>
            <td><strong style="color: #10b981;">Finite State Automata (DFA/NFA)</strong></td>
            <td><code>A → aB or A → a (Right linear)</code></td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 10px; font-weight: 700; color: #6366f1;">
        ⚡ Inclusion Property: Type 3 ⊂ Type 2 ⊂ Type 1 ⊂ Type 0 (Every Regular language is also Context-Free, Context-Sensitive & RE!).
      </p>
    `,
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 12
  },
  {
    id: "topic-p1-3",
    title: "Types of Research (Fundamental vs Applied vs Action)",
    paper: "P1",
    unit: "Unit 2: Research Aptitude",
    trick: "🎯 Research Types: Fundamental (Theory expansion), Applied (Practical problem solving), Action (Immediate local improvement - PAOR cycle)",
    explanation: `
      <p>Research types are categorized based on purpose, application, and scope:</p>
      <ul>
        <li><strong style="color: #6366f1;">Fundamental / Basic / Pure Research:</strong>
          <ul>
            <li>Main purpose: Addition to existing human knowledge & formulation of new theories.</li>
            <li>No immediate practical commercial application.</li>
            <li><em>Example:</em> Newton formulating gravity laws, Einstein's theory of relativity.</li>
          </ul>
        </li>
        <li><strong style="color: #0284c7;">Applied Research:</strong>
          <ul>
            <li>Main purpose: Finding a solution to an immediate real-world or societal practical problem.</li>
            <li>Applies pure research theories to solve field challenges.</li>
            <li><em>Example:</em> Finding effective marketing techniques during festive seasons.</li>
          </ul>
        </li>
        <li><strong style="color: #059669;">Action Research (Kurt Lewin):</strong>
          <ul>
            <li>Main purpose: Immediate problem-solving by practitioner (teacher, clinician) in local environment.</li>
            <li><span style="background-color: rgba(245, 158, 11, 0.2); color: #d97706; font-weight: bold; padding: 2px 8px; border-radius: 4px;">Cycle: Plan → Act → Observe → Reflect (PAOR)</span></li>
            <li><em>Example:</em> Teacher improving classroom engagement of slow learners.</li>
          </ul>
        </li>
      </ul>
    `,
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4
  }
];

const SEED_NOTES = [
  {
    id: "note-seed-1",
    title: "Paper 1 - Revision Strategy & High-Yield Rules",
    tag: "Paper 1",
    content: `• 50 Questions, 100 Marks (Target: 75+ Marks)
• Master Data Interpretation (DI) and Reading Comprehension (RC) daily for guaranteed 20 marks.
• Action Research Cycle: PLAN -> ACT -> OBSERVE -> REFLECT (PAOR).
• Square of Opposition:
  * A (All) & O (Some Not) are Contradictories.
  * E (No) & I (Some) are Contradictories.
  * A & E are Contraries (Both cannot be true together, both can be false).
  * I & O are Sub-Contraries (Both cannot be false together, both can be true).`,
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 24
  },
  {
    id: "note-seed-2",
    title: "Computer Science Paper 2 - Quick Formulas & Algorithms",
    tag: "Computer Science",
    content: `• 100 Questions, 200 Marks (Target: 140+ Marks)
• Decidability Table: DFA is decidable for Emptiness, Finiteness, Equivalence, Membership!
• Time Complexities to memorize:
  * QuickSort: Best/Avg O(n log n), Worst O(n²)
  * MergeSort: Best/Avg/Worst O(n log n) always stable
  * HeapSort: Best/Avg/Worst O(n log n) not stable
  * Binary Search: O(log n)
• Subnetting shortcut: /24 = 256 IPs, /25 = 128, /26 = 64, /27 = 32, /28 = 16, /29 = 8, /30 = 4!`,
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 12
  },
  {
    id: "note-seed-3",
    title: "Daily Exam Revision Routine",
    tag: "Routine",
    content: `• Morning 6:00 - 8:00 AM: Paper 1 Concepts & Desi Tricks review.
• Evening 7:00 - 10:00 PM: Paper 2 Core Units (TOC, OS, DBMS, Networks).
• Solve at least 25 PYQs with timer and note down mistakes immediately.`,
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2
  }
];

const SEED_NOTEPAD = `📝 UGC NET Revision Strategy & Important Formulas:

1. Paper 1 Strategy:
- 50 Questions, 100 Marks (Target: 75+ Marks).
- Master Data Interpretation (DI) and Reading Comprehension (RC) daily for guaranteed 20 marks.
- Remember: Action Research Cycle is PLAN -> ACT -> OBSERVE -> REFLECT (PAOR).
- Square of Opposition:
  * A (All) & O (Some Not) are Contradictories.
  * E (No) & I (Some) are Contradictories.
  * A & E are Contraries (Both cannot be true together, both can be false).
  * I & O are Sub-Contraries (Both cannot be false together, both can be true).

2. Paper 2 Computer Science Strategy:
- 100 Questions, 200 Marks (Target: 140+ Marks).
- Decidability Table: DFA is decidable for Emptiness, Finiteness, Equivalence, Membership!
- Time Complexities to memorize:
  * QuickSort: Best/Avg O(n log n), Worst O(n²)
  * MergeSort: Best/Avg/Worst O(n log n) always stable
  * HeapSort: Best/Avg/Worst O(n log n) not stable
  * Binary Search: O(log n)
- Subnetting shortcut: /24 = 256 IPs, /25 = 128, /26 = 64, /27 = 32, /28 = 16, /29 = 8, /30 = 4!

3. Daily Revision Routine:
- Morning 6-8 AM: Paper 1 Concepts & Desi Tricks review.
- Evening 7-10 PM: Paper 2 Core Units (TOC, OS, DBMS, Networks).
- Solve at least 25 PYQs with timer.`;
