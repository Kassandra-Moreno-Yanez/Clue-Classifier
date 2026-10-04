// Backend API Integration for Clue Classifier
// Connects the frontend UI to the FastAPI server running at http://127.0.0.1:8000
// with fallback support if offline.

const API_BASE = "http://127.0.0.1:8000";
let isBackendConnected = false;

// ---------- Connection & Health ----------
async function checkBackendOnline() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: "GET", cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      isBackendConnected = data && data.status === "ok";
      return isBackendConnected;
    }
  } catch (e) {
    isBackendConnected = false;
  }
  return false;
}

// ---------- API Endpoint Calls ----------
async function fetchCasesApi() {
  const res = await fetch(`${API_BASE}/api/cases`);
  if (!res.ok) throw new Error("Failed to fetch cases");
  return await res.json();
}

async function createCaseApi(title, description = "") {
  const res = await fetch(`${API_BASE}/api/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error("Failed to create case");
  return await res.json();
}

async function fetchCaseReportApi(caseId) {
  const res = await fetch(`${API_BASE}/api/cases/${caseId}/report`);
  if (!res.ok) throw new Error(`Failed to fetch report for case ${caseId}`);
  return await res.json();
}

async function uploadEvidenceBatchApi(caseId, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await fetch(`${API_BASE}/api/cases/${caseId}/evidence/batch`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload evidence files");
  return await res.json();
}

async function runCrossReferenceApi(caseId) {
  const res = await fetch(`${API_BASE}/api/cases/${caseId}/cross-reference`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Cross-referencing failed");
  return await res.json();
}

async function runWebResearchApi(caseId) {
  const res = await fetch(`${API_BASE}/api/cases/${caseId}/search`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Web research failed");
  return await res.json();
}

// ---------- review: what type is each uploaded file? ----------
// Takes the chosen File objects. Returns a promise of [{ name, type, analysis }] in the same order.
async function reviewFiles(files, caseId = null) {
  const online = await checkBackendOnline();

  if (online && caseId) {
    try {
      const uploadRes = await uploadEvidenceBatchApi(caseId, files);
      const accepted = uploadRes.accepted || [];

      // Poll until background analysis finishes for all accepted items
      let complete = false;
      let attempts = 0;
      let latestReport = null;

      while (!complete && attempts < 30) {
        attempts++;
        await new Promise((r) => setTimeout(r, 1500));
        latestReport = await fetchCaseReportApi(caseId);
        const notAnalyzedCount = (latestReport.not_analyzed || []).length;
        if (notAnalyzedCount === 0) {
          complete = true;
        }
      }

      // Map accepted files back to review results
      return files.map((f) => {
        const matchingCard = (latestReport?.categories || [])
          .flatMap((c) => c.evidence || [])
          .find((item) => item.filename === f.name);

        if (matchingCard) {
          const people = (matchingCard.entities || [])
            .filter((e) => e.type === "person")
            .map((e) => e.name);
          const places = (matchingCard.entities || [])
            .filter((e) => e.type === "place")
            .map((e) => e.name);
          const objects = (matchingCard.entities || [])
            .filter((e) => e.type === "object")
            .map((e) => e.name);

          return {
            name: f.name,
            type: matchingCard.classification || "other",
            analysis: {
              summary: matchingCard.description || "",
              people,
              places,
              objects,
              confidence: matchingCard.confidence,
              claims: matchingCard.claims || [],
              extracted_text: matchingCard.extracted_text || "",
              file_url: matchingCard.file_url ? `${API_BASE}${matchingCard.file_url}` : "",
            },
          };
        }
        return { name: f.name, type: "other", analysis: {} };
      });
    } catch (err) {
      console.warn("Backend upload/review failed, falling back to local heuristic:", err);
    }
  }

  // Fallback offline heuristic review
  const guess = (f) => {
    const n = f.name.toLowerCase(),
      t = f.type || "";
    if (/witness|statement|interview|testimon|affidavit/.test(n)) return "witness_statement";
    if (/suspect|mugshot|profile|record|background|alias/.test(n)) return "suspect_information";
    if (/timeline|chronolog|schedule|calendar|log\b|log[_.-]/.test(n)) return "timeline_event";
    if (/map|location|address|gps|route|floor.?plan/.test(n) || /\.(kml|gpx|geojson)$/.test(n))
      return "location_information";
    if (/osint|web|screenshot|social|tweet|post|profile.?page|whois/.test(n) || /\.(html?|url|webloc|mhtml)$/.test(n))
      return "web_osint";
    if (
      /email|e-mail|letter|message|chat|sms|text|call|voicemail|correspond/.test(n) ||
      /\.(eml|msg|mbox)$/.test(n) ||
      t.startsWith("audio/")
    )
      return "communication";
    if (
      /scene|evidence|exhibit|photo|cctv|footage|forensic|img|dsc/.test(n) ||
      t.startsWith("image/") ||
      t.startsWith("video/")
    )
      return "crime_scene_evidence";
    return "other";
  };
  const wait = typeof reducedMotion === "function" && reducedMotion() ? 300 : Math.min(2200, 900 + files.length * 140);
  return new Promise((res) => setTimeout(() => res(files.map((f) => ({ name: f.name, type: guess(f) }))), wait));
}

// ---------- connections: how is everything in a case related? ----------
function connections(evidence, xrefs, backendGraph = null) {
  if (backendGraph && backendGraph.nodes && backendGraph.nodes.length) {
    const nodeMap = new Map();
    const linkMap = new Map();

    backendGraph.nodes.forEach((n) => {
      const type = n.type || "object";
      const id = n.id || `${type}:${n.label.toLowerCase()}`;
      nodeMap.set(id, {
        id,
        type,
        label: n.label || n.id,
        evidence: n.evidence_ids || n.evidence || [],
      });
    });

    (backendGraph.edges || []).forEach((e) => {
      const source = e.source;
      const target = e.target;
      const key = [source, target].sort().join("|");
      let l = linkMap.get(key);
      if (!l) {
        l = { key, source, target, evidence: e.evidence_ids || [], xrefs: [] };
        linkMap.set(key, l);
      }
      if (e.relation === "supports" || e.relation === "conflicts" || e.relation === "related") {
        l.xrefs.push({ a: source, b: target, rel: e.relation, note: e.explanation || "" });
      }
    });

    return { nodes: [...nodeMap.values()], links: [...linkMap.values()] };
  }

  // Fallback Graph Builder
  const nodes = new Map(),
    links = new Map(),
    byLabel = new Map();
  const node = (label, type, eid) => {
    const id = type + ":" + label.toLowerCase();
    let n = nodes.get(id);
    if (!n) {
      n = { id, type, label, evidence: [] };
      nodes.set(id, n);
      byLabel.set(label.toLowerCase(), n);
    }
    if (eid && !n.evidence.includes(eid)) n.evidence.push(eid);
    return n;
  };
  const link = (a, b) => {
    const k = [a.id, b.id].sort().join("|");
    let l = links.get(k);
    if (!l) {
      l = { key: k, source: a.id, target: b.id, evidence: [], xrefs: [] };
      links.set(k, l);
    }
    return l;
  };
  evidence.forEach((e) => {
    const ns = [
      ...(e.people || []).map((x) => node(x, "person", e.id)),
      ...(e.places || []).map((x) => node(x, "place", e.id)),
      ...(e.objects || []).map((x) => node(x, "object", e.id)),
    ];
    for (let i = 0; i < ns.length; i++)
      for (let j = i + 1; j < ns.length; j++) {
        if (ns[i] === ns[j]) continue;
        const l = link(ns[i], ns[j]);
        if (!l.evidence.includes(e.id)) l.evidence.push(e.id);
      }
  });
  (xrefs || []).forEach((x) => {
    const a = byLabel.get(x.a.toLowerCase()),
      b = byLabel.get(x.b.toLowerCase());
    if (a && b && (x.ev || []).every((id) => evidence.some((e) => e.id === id))) link(a, b).xrefs.push(x);
  });
  return { nodes: [...nodes.values()], links: [...links.values()] };
}
