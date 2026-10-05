# 📚 NathKhat — UGC NET Paper 1 & Paper 2 (Computer Science) Revision Hub

> **Smart Study, High-Yield Desi Tricks & Fast Exam Revision**  
> Tailored for UGC NET / JRF aspirants preparing for **Paper 1 (General Paper on Teaching & Research Aptitude)** and **Paper 2 (Computer Science & Applications)**.

---

## ✨ Key Features

1. **📑 Dynamic Topic Index (Section 1)**:
   - Live table of contents on the sidebar.
   - **Automatic Top Order**: Newly added topics immediately appear at the **very top of the Index**.
   - **Smooth Jump**: Clicking any index entry smoothly scrolls and pulses the exact topic card on screen.
   - Quick index search to filter topics in milliseconds.

2. **💡 Topics & Desi Tricks Vault (Section 2)**:
   - Dedicated visual cards with two distinct focus containers:
     - **Desi Tricks Box**: Styled in warm golden glassmorphism with 💡 icon, punchy mnemonics, and a **1-click Copy Trick** button.
     - **Explanation Box**: Rich-text formatted body preserving font colors, bold, underline, lists, tables, and images.
   - **Word-like WYSIWYG Editor**:
     - Bold, Italic, Underline, Strikethrough
     - Text Font Color Picker & Background Highlight Color Picker
     - Headings (H2, H3), Paragraph
     - Bulleted (`•`) & Numbered (`1.`) lists
     - **Image Support**: Insert local image files or directly paste screenshots from clipboard (`Ctrl+V`).

3. **📝 General Notepad (Section 3)**:
   - Dedicated scratchpad for general revision points, formulas, and daily targets.
   - Real-time auto-saving with word and character counters.
   - 1-click TXT export.

4. **📁 Google Drive Style Files & Study Resources Vault (Section 4)**:
   - Authentic Google Drive layout with left navigation sidebar, iconic `+ New` button with the 4-color Google plus icon, pill search bar, and offline status indicator.
   - **Horizontal Folders Section**: Rounded folder cards (`📁 [Folder Name]`) with 1-click folder navigation.
   - **Interactive File Vault**: Google Drive Grid Cards and List Table with colored icons (Red PDF, Purple Image, Blue Doc, Green Sheet, Cyan Link).
   - **In-App Resource Previewer**: Instant preview of PDFs, images, docs/notes, and links directly in-app without downloading, with floating `‹` / `›` prev/next navigation buttons and keyboard arrow shortcuts.
   - **Slide-Out Details Drawer (`ⓘ`)**: Displays file preview thumbnail, properties table (Type, Size, Location, Owner, Modified), revision notes, and actions.
   - **Right-Click Google Drive Context Menu**: Preview, Download, Edit, Star, File Info, and Move to Trash.
   - **Zero-Error Valid Binary Downloads**: Syntactically valid Adobe PDF 1.4 binary stream files that open smoothly in Acrobat, Chrome, Edge, and mobile viewers.
   - **Persistent IndexedDB Storage**: Supports large multi-megabyte files without localStorage quota limits.

5. **🗑️ Safe Recycle Bin (Section 5)**:
   - Deleted topics are moved safely to the Recycle Bin.
   - **1-Click Restore**: Restores the item directly back to active topics and places it at the **top of the Index**.
   - Permanent deletion and empty bin options.

6. **🔍 Global Live Search with Keyword Highlighting**:
   - Searches across Topic Titles, Desi Tricks, Explanations, Units, and Study Resources.
   - Dynamically highlights matching keywords in radiant amber (`<mark class="search-highlight">`).

7. **🎨 Dual Themes**:
   - Modern Dark Mode (default, easy on the eyes for night study) and Light Mode.
   - Preserves theme choice in `localStorage`.

8. **💾 Data Portability & Cloud Sync**:
   - Offline-first: saved in browser `localStorage` and `IndexedDB`.
   - Export and Import complete data backups (topics, notes, resources, recycle bin) in portable `.json` format.

---

## 🚀 Live Continuous Deployment (GitHub + Netlify)

Whenever changes are made to this repository:
1. Commit the changes:
   ```bash
   git add .
   git commit -m "Update revision tricks and topics"
   ```
2. Push to GitHub:
   ```bash
   git push origin main
   ```
3. **Netlify automatically detects the push and deploys the updated live site in seconds!**

---

## 🛠️ Local Development

To run locally using Python's built-in web server:
```bash
python -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your web browser.
