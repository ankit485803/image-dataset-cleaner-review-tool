# Image Dataset Cleaner & Review Tool

A modern React-based application for importing, reviewing, organizing, and exporting image datasets. Designed for dataset curation workflows, annotation preparation, and image quality review.

---

## 🚀 Features

### 📥 Image Import

* Import **30–100 images** at once
* Supports:

  * `.jpg`
  * `.jpeg`
  * `.png`

### 🖼️ Dataset Review

* Gallery View for visual inspection
* Table View for detailed management
* Quick image preview

### 📊 Metadata Management

Display and manage:

* Filename
* File Type
* File Size
* Review Status

### ✅ Review Workflow

Mark images as:

* **Keep**
* **Reject**
* **Needs Review**

### 🏷️ Organization Tools

* Add custom notes
* Add tags for categorization
* Filter and manage dataset entries efficiently

### 🔍 Duplicate & Similar Image Detection

* DUP (Duplicate) image identification
* SIM (Similar) image detection
* Helps reduce dataset redundancy

### 📈 Progress Tracking

* Real-time statistics
* Review progress monitoring
* Status distribution overview

### 📤 Export Options

Export dataset metadata in:

* CSV format
* JSON format

### 📝 Activity Logging

Track:

* Image imports
* Metadata updates
* Review actions
* Export operations

---

## 🛠️ Tech Stack

* React
* JavaScript (ES6+)
* CSS3
* JSZip
* PapaParse
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

---

## 📋 Use Cases

* Dataset cleaning before machine learning training
* Removing duplicate images
* Manual image quality review
* Dataset annotation preparation
* Research dataset organization
* Computer vision workflow management

---

## ⚠️ Current Limitations

Current duplicate detection relies on:

* Filename matching
* Similarity rules

It does not yet perform pixel-level or hash-based image comparison.

---

## 🔮 Future Improvements

Planned enhancements include:

* File hash-based duplicate detection
* Database persistence
* AI-assisted image tagging
* Advanced similarity detection
* Bulk review operations


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

