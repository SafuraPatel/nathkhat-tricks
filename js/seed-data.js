/**
 * NathKhat - UGC NET Paper 1 & Paper 2 (Computer Science) Seed Data
 * Curated high-yield topics with authentic Desi Tricks and rich explanations.
 */

const SEED_TOPICS = [
  {
    id: "topic-p1-1",
    title: "Scales of Measurement (Nominal, Ordinal, Interval, Ratio)",
    paper: "P1",
    unit: "Unit 2: Research Aptitude",
    trick: "🎬 'NOIR' Film Dekho: N → O → I → R (Order of Power & Properties: Name, Order, Equal Interval, True Zero Absolute)",
    explanation: `
      <p>In statistics and research methodology, measurement scales categorize variables into 4 distinct levels:</p>
      <ul>
        <li><strong style="color: #6366f1;">Nominal Scale:</strong> Only for naming, classification, or categorization. <em>No order, no arithmetic operations</em>. <br><span style="background-color: #fef08a; color: #1e293b; padding: 2px 6px; border-radius: 4px;">Example:</span> Gender (M/F), Blood Group (A, B, O), Jersey Numbers.</li>
        <li><strong style="color: #3b82f6;">Ordinal Scale:</strong> Categorization <strong>+ Meaningful Rank / Order</strong>, but difference between ranks is NOT equal or quantifiable. <br><span style="background-color: #fef08a; color: #1e293b; padding: 2px 6px; border-radius: 4px;">Example:</span> Exam ranks (1st, 2nd, 3rd), Likert Scale (Agree, Neutral, Disagree).</li>
        <li><strong style="color: #06b6d4;">Interval Scale:</strong> Order <strong>+ Equal Intervals</strong> between values, but has an <u>Arbitrary / Non-Absolute Zero</u> (0 doesn't mean total absence). <br><span style="background-color: #fef08a; color: #1e293b; padding: 2px 6px; border-radius: 4px;">Example:</span> Temperature in Celsius/Fahrenheit (0°C doesn't mean no heat), IQ Score.</li>
        <li><strong style="color: #10b981;">Ratio Scale:</strong> Highest level. Order + Equal Distance <strong>+ TRUE ABSOLUTE ZERO</strong> (multiplication & division valid). <br><span style="background-color: #fef08a; color: #1e293b; padding: 2px 6px; border-radius: 4px;">Example:</span> Height, Weight, Distance, Age, Income.</li>
      </ul>
      <p style="border-left: 4px solid #f59e0b; padding-left: 10px; margin-top: 10px; color: #d97706; font-weight: 600;">
        💡 NET PYQ Tip: Ratio scale is the ONLY scale where ratios are meaningful (e.g. 20 kg is twice as heavy as 10 kg).
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
    trick: "🍕 'Pyari Didi Ne Transport Se Pizza Allot kiya' (Physical, Data Link, Network, Transport, Session, Presentation, Application) or top-down: 'All People Seem To Need Data Processing'!",
    explanation: `
      <p>The Open Systems Interconnection (OSI) reference model organizes network communication into 7 distinct abstraction layers:</p>
      <ol>
        <li><strong style="color: #8b5cf6;">Application Layer (Layer 7):</strong> Network interface for end-user apps. Protocols: <span style="background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px;">HTTP, HTTPS, FTP, SMTP, DNS</span>.</li>
        <li><strong style="color: #6366f1;">Presentation Layer (Layer 6):</strong> Translation, Encryption/Decryption, Compression. Formats: <span style="background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px;">SSL/TLS, JPEG, ASCII</span>.</li>
        <li><strong style="color: #3b82f6;">Session Layer (Layer 5):</strong> Dialogue control, session establishment, token management, checkpoints/synchronization. Protocols: <span style="background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px;">RPC, NetBIOS</span>.</li>
        <li><strong style="color: #0ea5e9;">Transport Layer (Layer 4):</strong> End-to-End communication, flow & error control, segmentation. Protocols: <span style="background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px;">TCP (Segment), UDP</span>. Devices: Gateway, L4 Switch.</li>
        <li><strong style="color: #14b8a6;">Network Layer (Layer 3):</strong> Logical addressing (IP address) & routing. PDU = <u>Packet</u>. Devices: <span style="background-color: #fef08a; color: #854d0e; font-weight: bold; padding: 2px 6px; border-radius: 4px;">Router, Layer 3 Switch</span>.</li>
        <li><strong style="color: #10b981;">Data Link Layer (Layer 2):</strong> Physical addressing (MAC), framing, node-to-node hop error/flow control. PDU = <u>Frame</u>. Devices: <span style="background-color: #fef08a; color: #854d0e; font-weight: bold; padding: 2px 6px; border-radius: 4px;">Bridge, Switch, NIC</span>.</li>
        <li><strong style="color: #f59e0b;">Physical Layer (Layer 1):</strong> Raw bit transmission over physical medium. PDU = <u>Bits</u>. Devices: <span style="background-color: #fef08a; color: #854d0e; font-weight: bold; padding: 2px 6px; border-radius: 4px;">Hub, Repeater, Cables</span>.</li>
      </ol>
      <p style="background-color: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 8px 12px; border-radius: 6px;">
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
    trick: "📱 'V-E-T-A' (Video, E-content, Test/Quiz, Assessment/Discussion Forum) - VETA se padho aur NET crack karo!",
    explanation: `
      <p><strong>SWAYAM</strong> (Study Webs of Active-Learning for Young Aspiring Minds) is India's national MOOC platform. Every course on SWAYAM is designed around 4 distinct pedagogical quadrants:</p>
      <ul>
        <li><strong style="color: #ef4444;">Quadrant 1: e-Tutorial (Video Lectures)</strong> - Audio-video lectures specially prepared by National Coordinators (NPTEL, UGC, CEC, NCERT, IGNOU, etc.).</li>
        <li><strong style="color: #3b82f6;">Quadrant 2: e-Content (Reading Material)</strong> - High quality downloadable/printable reading material, e-books, case studies, journal references.</li>
        <li><strong style="color: #10b981;">Quadrant 3: Self-Assessment (Tests & Quizzes)</strong> - Interactive quizzes, MCQs, and assignments for continuous self-evaluation.</li>
        <li><strong style="color: #f59e0b;">Quadrant 4: Discussion Forum (Doubt Clearing)</strong> - Dedicated interactive online clearinghouse for discussing doubts with course mentors and peer students.</li>
      </ul>
      <p style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 8px 12px; color: #334155;">
        🎯 <em>Note:</em> SWAYAM PRABHA has <strong>40 DTH channels</strong> (increased from 34/22) telecasting educational programs 24x7 using GSAT-15 satellite!
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
    trick: "🔒 'M - H - N - C' → 'Mohan Has No Car' (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait)",
    explanation: `
      <p>For a deadlock to arise in an operating system, all four <strong>Coffman conditions</strong> must hold simultaneously:</p>
      <ol>
        <li><strong style="color: #e11d48;">Mutual Exclusion:</strong> At least one resource must be held in a non-shareable mode (only one process can use it at a time).</li>
        <li><strong style="color: #ea580c;">Hold and Wait:</strong> A process must currently be holding at least one resource and simultaneously requesting additional resources held by other processes.</li>
        <li><strong style="color: #d97706;">No Preemption:</strong> Resources cannot be forcibly seized from a process; they can only be released voluntarily after the process finishes.</li>
        <li><strong style="color: #059669;">Circular Wait:</strong> A closed chain of processes exists {P0, P1, ..., Pn} such that P0 waits for P1, P1 waits for P2, and Pn waits for P0.</li>
      </ol>
      <p style="background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 8px 12px; border-radius: 6px;">
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
    trick: "👑 'U - C - C - R' (Type 0 to 3: Unrestricted, Context-Sensitive, Context-Free, Regular) → 'U Cute Cute Rani'!",
    explanation: `
      <p>Noam Chomsky classified formal languages into a strict 4-level hierarchy based on the generative power of their grammars:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 0.95rem;">
        <thead>
          <tr style="background-color: #1e293b; color: #f8fafc;">
            <th style="padding: 8px; border: 1px solid #334155;">Type</th>
            <th style="padding: 8px; border: 1px solid #334155;">Grammar & Language</th>
            <th style="padding: 8px; border: 1px solid #334155;">Accepting Automaton</th>
            <th style="padding: 8px; border: 1px solid #334155;">Production Form</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background-color: rgba(239, 68, 68, 0.08);">
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Type 0</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">Unrestricted / Recursively Enumerable</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;"><span style="color: #dc2626; font-weight: bold;">Turing Machine</span></td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">α → β (no restriction, |α| ≥ 1)</td>
          </tr>
          <tr style="background-color: rgba(245, 158, 11, 0.08);">
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Type 1</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">Context-Sensitive (CSL)</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;"><span style="color: #d97706; font-weight: bold;">Linear Bounded Automaton (LBA)</span></td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">α → β where |α| ≤ |β|</td>
          </tr>
          <tr style="background-color: rgba(59, 130, 246, 0.08);">
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Type 2</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">Context-Free (CFL)</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;"><span style="color: #2563eb; font-weight: bold;">Pushdown Automaton (PDA)</span></td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">A → α (Single Non-Terminal LHS)</td>
          </tr>
          <tr style="background-color: rgba(16, 185, 129, 0.08);">
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Type 3</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">Regular Language (RL)</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;"><span style="color: #059669; font-weight: bold;">Finite State Automata (DFA/NFA)</span></td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">A → aB or A → a (Right linear)</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 10px; font-weight: 600; color: #4338ca;">
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
    trick: "🎯 'F-A-A' : Fundamental (Gyan badhao), Applied (Problem suljhao), Action (Turant Classroom/Field me Sudhaar lao!)",
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
            <li><span style="background-color: #fef3c7; color: #92400e; font-weight: bold; padding: 2px 8px; border-radius: 4px;">Cycle: Plan → Act → Observe → Reflect (PAOR)</span></li>
            <li><em>Example:</em> Teacher improving classroom engagement of slow learners.</li>
          </ul>
        </li>
      </ul>
    `,
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4
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
- Subnetting shortcut: /24 = 256 IPs, /25 = 128, /26 = 64, /27 = 32, /28 = 16, /29 = 8, /30 = 4!

3. Daily Revision Routine:
- Morning 6-8 AM: Paper 1 Concepts & Desi Tricks review.
- Evening 7-10 PM: Paper 2 Core Units (TOC, OS, DBMS, Networks).
- Solve at least 25 PYQs with timer.`;
