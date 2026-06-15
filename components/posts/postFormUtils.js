// ─────────────────────────────────────────────────────────
// postFormUtils.js
// Shared constants + helpers for create/edit post forms
// ─────────────────────────────────────────────────────────

export const CATEGORY_OPTIONS = [
    { value: "entrance_pass",   label: "Entrance Pass"   },
    { value: "nursing_student", label: "Nursing Student" },
    { value: "working_nurse",   label: "Working Nurse"   },
    { value: "abroad_study",    label: "Abroad Study"    },
    { value: "abroad_work",     label: "Abroad Work"     },
  ];
  
  export const POST_TYPE_OPTIONS = [
    { value: "normal",          label: "Normal"              },
    { value: "reality_check",   label: "Reality Check 🔥"    },
    { value: "hospital_diary",  label: "Hospital Diary 🏥"   },
    { value: "country_pathway", label: "Country Pathway 🌍"  },
  ];
  
  export const FLAIR_OPTIONS = [
    { value: "",                    label: "No flair"            },
    { value: "tips",                label: "Tips"                },
    { value: "tricks",              label: "Tricks"              },
    { value: "guidance",            label: "Guidance"            },
    { value: "clinical_experience", label: "Clinical Experience" },
    { value: "career_journey",      label: "Career Journey"      },
    { value: "workplace_reality",   label: "Workplace Reality"   },
    { value: "story",               label: "Story / Experience"  },
  ];
  
  /** Upload a file to /api/upload and return the URL */
  export async function uploadFile(file) {
    const form = new FormData();
    form.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => null);
    if (!data?.ok) throw new Error(data?.error || "Upload failed");
    return data.url;
  }
  
  /** Normalise field errors coming from the API into { field: string[] } */
  export function normalizeFieldErrors(errors) {
    const safe = {};
    if (!errors || typeof errors !== "object") return safe;
    for (const key in errors) {
      if (Array.isArray(errors[key]))          safe[key] = errors[key];
      else if (typeof errors[key] === "string") safe[key] = [errors[key]];
    }
    return safe;
  }
  
  /** Tailwind classes for <select> elements */
  export function selectClass(hasError = false) {
    return `w-full rounded-2xl border px-4 py-2.5 text-sm font-semibold outline-none focus:ring-4 transition ${
      hasError
        ? "border-red-400 bg-red-50 text-red-700 focus:border-red-400 focus:ring-red-500/15 dark:border-red-400/50 dark:bg-red-500/10 dark:text-red-200"
        : "border-slate-200 bg-white/80 text-slate-700 focus:border-blue-400 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
    }`;
  }