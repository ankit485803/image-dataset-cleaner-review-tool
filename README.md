# Image Dataset Cleaner & Review Tool

A modern React-based application for importing, reviewing, organizing, and exporting image datasets. Designed for dataset curation workflows, annotation preparation, and image quality review.

---

## 🚀 Features

### 📥 Image Import

* Import **30–100 images** per session (enforced limit)
* Multiple import methods:
  * 📁 Local folder / file selection
  * 📦 ZIP file upload
  * 🔗 Direct image URLs (one per line)
  * 📄 CSV file with an `image_url` column
* Supported file types: `.jpg`, `.jpeg`, `.png` only
* Per-file size limit: **5 MB**
* Clear error messages for unsupported types, oversized files, or invalid batches

### 🖼️ Dataset Review

* **Gallery View** for visual inspection
* **Table View** for detailed, spreadsheet-style management
* Toggle between views anytime
* Click any image to open the **Review Panel**

### 📊 Metadata Management

Displayed for each image:

* Filename
* File Type
* File Size
* Source (local / zip / URL)
* Imported timestamp
* MD5 File Hash (after running review)
* Review Status

### 🔍 Duplicate & Similar Image Detection

* **Run Review** button computes an **MD5 hash** for every image using `spark-md5`
* **Exact Duplicates** — images with identical file hashes, grouped together
* **Similar Images** — images with similar filenames (string similarity ≥ 70%)
* Dedicated split-panel UI:
  * Upper panel → Similar images
  * Lower panel → Exact duplicates
* Batch actions per group: **Keep First**, **Reject All**
* `DUP` / `SIM` badges shown directly on gallery cards and table rows

### ✅ Review Workflow

Mark each image as:

* **Keep**
* **Reject**
* **Needs Review** *(default for unreviewed images)*

Manual review is always available — users can override automatic flags at any time.

### 🏷️ Organization Tools

* Add free-text notes per image
* Add comma-separated tags per image
* Tags render as chips in the Review Panel
* Filter images by status using the sidebar tabs (All / Keep / Rejected / Needs Review)

### 📈 Progress Tracking

Sidebar shows real-time:

* Total imported / kept / rejected / in review counts
* Duplicate and similar image counts
* Progress bar toward the minimum 30-image requirement

### 💾 Session Save / Load (IndexedDB)

* **Save Session** — persists all images (including actual image data via Blobs), statuses, tags, notes, and hashes to IndexedDB
* **Load Session** — restores the full session, including images, after a page refresh
* **New Session** — clears the current workspace to start fresh
* "Saved at HH:MM" indicator in the header

### 📤 Export Options

One-click export dropdown with three formats:

* **JSON** — full metadata + summary stats + activity log
* **CSV** — flat metadata table (filename, type, size, status, tags, notes, hash, flags, etc.)
* **Full ZIP** — complete export package containing:
  * `keep/`, `reject/`, `needs_review/` folders with the actual images sorted by status
  * `metadata.csv`
  * `metadata.json`
  * `activity_log.txt`
  * `README.txt` explaining the folder structure

### 📝 Activity Logging

Automatically tracks:

* Image imports (with count)
* Metadata/status edits per image
* Session save / load / new session events
* Included in JSON export and the ZIP's `activity_log.txt`

---

## 🛠️ Tech Stack

* React (functional components + hooks)
* JavaScript (ES6+)
* CSS3 (CSS variables, dark theme)
* **JSZip** — reading uploaded ZIPs and building export ZIPs
* **PapaParse** — CSV parsing and generation
* **spark-md5** — client-side MD5 file hashing for exact duplicate detection
* **idb-keyval** — IndexedDB wrapper for session persistence
* **file-saver** — triggering browser downloads
* Lucide React

---

## 📦 Installation

### Clone the Repository

```bash
git clone https://github.com/ankit485803/image-dataset-cleaner-review-tool.git
```

### Navigate to the Project

```bash
cd image-dataset-cleaner-review-tool
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

The application will be available at:

```text
http://localhost:3000
```

---

## 📁 Supported Formats

| Format | Supported |
| ------ | --------- |
| JPG    | ✅         |
| JPEG   | ✅         |
| PNG    | ✅         |

Max file size: **5 MB per image**
Image count per session: **30–100 images**

---

## 📋 How to Use

1. **Import images** using one of the four methods (folder, ZIP, URLs, or CSV)
2. Switch between **Gallery** and **Table** view to inspect your dataset
3. Click **🔍 Run Review** to compute file hashes and detect duplicates/similar images
4. Resolve flagged groups using batch actions or manual review
5. Click any image to open the **Review Panel** — set status, add tags/notes
6. Click **💾 Save Session** to persist your work locally
7. Click **⬇️ Export** to download JSON, CSV, or a full ZIP package

---

## 📋 Use Cases

* Dataset cleaning before machine learning training
* Removing duplicate images via hash comparison
* Manual image quality review
* Dataset annotation preparation
* Research dataset organization
* Computer vision workflow management

---

## ⚠️ Current Limitations

* **Exact duplicate detection** is hash-based (MD5) and works reliably for identical files, but does **not** detect visually similar images that differ at the byte level (e.g. re-compressed or resized copies)
* **Similar image detection** is currently based on **filename string similarity only** — not perceptual/visual similarity
* Session data is stored in the browser's IndexedDB — clearing browser storage will remove saved sessions
* Live website scraping is not implemented; image collection relies on user-provided URLs or CSV files
* AI-based captioning/tagging is not implemented (optional bonus feature)

---

## 🔮 Future Improvements (Bonus)

Planned/possible enhancements:

* Perceptual hashing (pHash) for true near-duplicate/visual similarity detection
* AI-generated captions and tags with safe API key handling
* Filters and bulk batch actions across the full gallery
* Clean "selected images only" ZIP export
* Basic automated tests / Docker setup
* Optional live public-page scraping with graceful error handling

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📂 Repository

GitHub Repository:

https://github.com/ankit485803/image-dataset-cleaner-review-tool

---