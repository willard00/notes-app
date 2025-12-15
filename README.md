# 🚀 NexusNotes

A modern, full-stack note-taking application designed with a focus on UI/UX and smooth interactions.
This is the app link
**[🔴 View Live Demo on Render](https://notes-app-jeom.onrender.com/)**

---

## 🛠️ Tech Stack

* **Frontend:** Vue.js 3, Tailwind CSS, Vite
* **Backend:** Node.js, Express.js
* **Database:** SQLite (Embedded)


## 🤖 Development Process & AI Usage

I utilized AI tools (Gemini) to accelerate development, specifically for UI inspiration, deployment configuration, and troubleshooting platform-specific errors. 
Below are specific examples of this collaboration:

**Example 1: Designing the "Empty State" Experience**
  The Prompt: "make the page look stunning when no notes are created yet."
  
  AI Output: The AI suggested a vertically centered "Zero Hour" layout with a floating 3D icon animation and a "Zero State" call-to-action button.
  
  My Verification & Changes:
  Verification: Checked responsiveness to ensure the floating icon didn't break.
  
  Reasoning: 
  The original empty state was too plain. I realized that a user's first impression happens before they create data. 
  By implementing the AI's floating animation, I made the "empty" experience feel inviting rather than broken, encouraging the user to click "Create First Note."

**Example 2: Debugging Cross-Platform Binary Issues**

  Prompt: Debugging the "Error: invalid ELF header" crash log during deployment.
  
  AI Output: Identified that I had accidentally committed my local "node_modules" folder to GitHub. The server was trying to run Windows executables (DLLs) on a Linux environment.
  
  Modification & Verification: I implemented a standard ".gitignore" file, used git commands to remove the cached binary files from the repository, and triggered a fresh build on the server.
  
  Reasoning: I learned that dependencies must be compiled in the target environment. You cannot copy-paste "node_modules" from Windows to Linux; 
  they must be installed fresh via "npm install" on the server to ensure binary compatibility.
