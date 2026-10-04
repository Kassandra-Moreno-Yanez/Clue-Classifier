// The data the page is working with: cabinets, case files, each folder's evidence, the user's own file types,
// and the signed-in account. Fully synchronized with backend API with fallback support.

// ---------- cabinets and case files ----------
// CM: every case file by title. Each has { cf, title, place, date, iso, status, upd, sum, long?, cab, backendId? }.
const CM = {};
CASES.forEach((c) => {
  c.cab = 0;
  CM[c.title] = c;
});
// CABS: the cabinets, in order. Each case file belongs to one: its cab is an index into this list.
const CABS = [{ ...FIRST_CABINET }];
let curCab = 0; // the cabinet that is open
// The folders (see cabinet.js) of the case files kept in one cabinet.
const foldersIn = (cab) => drawer.folders.filter((f) => !f.isAdd && CM[f.label] && CM[f.label].cab === cab);
// Case numbers: each new case file takes the next one.
let cfSeq = CASE_NUMBER_START;
const nextCf = () => "CF-" + String(++cfSeq).padStart(4, "0");

// ---------- folders ----------
// SS: the working state of each folder that has been opened, by case title.
const SS = {};

// A folder's state. The first time a sample/backend case is opened, its state is loaded.
function folderState(fo) {
  const c = CM[fo.label];
  if (!SS[fo.label]) {
    SS[fo.label] = {
      evidence: ((c && EVID[c.cf]) || []).map((e) => ({
        ...e,
        people: [...(e.people || [])],
        places: [...(e.places || [])],
        objects: [...(e.objects || [])],
      })),
      xrefs: ((c && XREF[c.cf]) || []).map((x) => ({ ...x })),
      comparisons: [],
      web_findings: [],
      graph: null,
      pins: {},
      sel: null,
      filter: "all",
      backendId: c ? c.backendId : null,
      isLoadingReport: false,
    };

    // If case has a backendId, fetch its report from live backend
    if (c && c.backendId) {
      loadBackendReport(fo, c.backendId);
    }
  }
  return SS[fo.label];
}

async function loadBackendReport(fo, backendId) {
  const s = SS[fo.label];
  if (!s || s.isLoadingReport) return;
  s.isLoadingReport = true;
  try {
    const report = await fetchCaseReportApi(backendId);
    if (!report) return;

    s.backendReport = report;
    s.comparisons = report.comparisons || [];
    s.web_findings = report.web_findings || [];
    s.graph = report.graph || null;

    const cards = (report.categories || []).flatMap((cat) => cat.evidence || []);
    if (cards.length > 0) {
      s.evidence = cards.map((card) => {
        const people = (card.entities || []).filter((e) => e.type === "person").map((e) => e.name);
        const places = (card.entities || []).filter((e) => e.type === "place").map((e) => e.name);
        const objects = (card.entities || []).filter((e) => e.type === "object").map((e) => e.name);

        return {
          id: `E${card.id}`,
          backendEvidenceId: card.id,
          type: card.classification || "other",
          date: card.created_at ? new Date(card.created_at).toLocaleDateString("en-GB") : "",
          title: card.filename,
          summary: card.description || "",
          notes: "",
          people,
          places,
          objects,
          src: card.file_url ? `${API_BASE}${card.file_url}` : "",
          file: {
            name: card.filename,
            kind: card.modality === "image" ? "photo" : card.modality === "video" ? "video" : card.modality === "audio" ? "audio" : "document",
            size: card.size_bytes ? `${Math.round(card.size_bytes / 1024)} KB` : "N/A",
            mime: "",
          },
          confidence: card.confidence,
          needs_review: card.needs_review,
          extracted_text: card.extracted_text,
        };
      });
    }

    if (report.links && report.links.length > 0) {
      s.xrefs = report.links.map((link) => ({
        a: link.evidence_a ? link.evidence_a.filename : "",
        b: link.evidence_b ? link.evidence_b.filename : "",
        ev: [link.evidence_a ? `E${link.evidence_a.id}` : null, link.evidence_b ? `E${link.evidence_b.id}` : null].filter(Boolean),
        relation: link.relation,
        explanation: link.explanation,
        confidence: link.confidence,
      }));
    }

    // Refresh UI views if currently open
    if (typeof cur !== "undefined" && cur === fo) {
      if (typeof renderLeft === "function") renderLeft();
      if (typeof renderRight === "function") renderRight();
    }
  } catch (err) {
    console.warn(`Could not load backend report for case ${backendId}:`, err);
  } finally {
    s.isLoadingReport = false;
  }
}

// The id for the next piece of evidence in a folder: "E1", "E2", ... skipping any already taken.
function nextEvidenceId(s) {
  let k = s.evidence.length + 1;
  while (s.evidence.some((e) => e.id === "E" + k)) k++;
  return "E" + k;
}

// ---------- file types ----------
let CUSTOM_TYPES = [];
const TYPE_MEM = {},
  typeKey = () => "caseCabinet.types." + (account || "guest");
function loadTypes() {
  let v = TYPE_MEM[typeKey()];
  try {
    const r = localStorage.getItem(typeKey());
    if (r) v = JSON.parse(r);
  } catch (e) {
    // storage is blocked
  }
  CUSTOM_TYPES = Array.isArray(v) ? v.filter((t) => t && typeof t.id === "string" && typeof t.label === "string") : [];
}
function saveTypes() {
  TYPE_MEM[typeKey()] = CUSTOM_TYPES;
  try {
    localStorage.setItem(typeKey(), JSON.stringify(CUSTOM_TYPES));
  } catch (e) {
    // storage is blocked
  }
}
const typeLabel = (id) => {
  const c = CUSTOM_TYPES.find((t) => t.id === id);
  return c
    ? c.label
    : TYPE_LABEL[id] ||
        String(id || "other")
          .replace(/_/g, " ")
          .replace(/^./, (m) => m.toUpperCase());
};
const allTypes = (s) => {
  const t = [...FILE_TYPES, ...CUSTOM_TYPES.map((x) => x.id)];
  s.evidence.forEach((e) => {
    if (!t.includes(e.type)) t.push(e.type);
  });
  return t;
};

// ---------- the case file being created ----------
let DRAFT = { name: "", place: "", sum: "" };

// ---------- accounts & workspace initialization ----------
const ACCOUNTS = {};
let account = null,
  wsVer = 0;

function saveWorkspace() {
  if (!account) return;
  ACCOUNTS[account] = {
    cabs: CABS.map((c) => ({ ...c })),
    cur: curCab,
    seq: cfSeq,
    cases: drawer.folders.filter((f) => !f.isAdd).map((f) => ({ ...CM[f.label] })),
    ss: { ...SS },
  };
}

async function loadWorkspace(email, fresh) {
  account = email;
  const w = fresh ? null : ACCOUNTS[email];
  drawer.folders.filter((f) => !f.isAdd).forEach((f) => f.el.remove());
  drawer.folders.splice(0, drawer.folders.length, ...drawer.folders.filter((f) => f.isAdd));
  [CM, SS].forEach((o) => Object.keys(o).forEach((k) => delete o[k]));
  CABS.length = 0;
  DRAFT = { name: "", place: "", sum: "" };
  Upload.clearStaged();

  if (w) {
    CABS.push(...w.cabs.map((c) => ({ ...c })));
    curCab = w.cur;
    cfSeq = w.seq;
    Object.assign(SS, w.ss);
    [...w.cases].reverse().forEach((c) => {
      CM[c.title] = { ...c };
      drawer.addFolder(c.title);
    });
  } else {
    CABS.push({ ...FIRST_CABINET });
    curCab = 0;
    cfSeq = CASE_NUMBER_START;

    // Check if live backend has cases available
    let backendCases = [];
    try {
      const online = await checkBackendOnline();
      if (online) {
        backendCases = await fetchCasesApi();
      }
    } catch (e) {
      console.warn("Backend unavailable during workspace load:", e);
    }

    if (backendCases && backendCases.length > 0) {
      backendCases.forEach((bc) => {
        const title = bc.title;
        const cf = `CF-${String(bc.id).padStart(4, "0")}`;
        const item = {
          cf,
          title,
          place: "Active Investigation",
          date: bc.created_at ? new Date(bc.created_at).toLocaleDateString("en-GB") : "Current",
          iso: bc.created_at || "",
          status: "Active",
          upd: bc.id,
          sum: bc.description || "Live AI Clue Classifier evidence investigation.",
          long: bc.description || "Live AI Clue Classifier evidence investigation.",
          cab: 0,
          backendId: bc.id,
        };
        CM[title] = item;
        drawer.addFolder(title);
      });
    }

    // Include sample cases if not present
    CASES.forEach((c) => {
      if (!CM[c.title]) {
        CM[c.title] = { ...c, cab: 0 };
        drawer.addFolder(c.title);
      }
    });
  }
  loadTypes();
  wsVer++;
}
