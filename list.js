// list.js (FINAL) - /write-entry 로 GET 해서 목록 가져오기
(() => {
  const listEl = document.getElementById("messageList");

  // ✅ 공개 시점 (KST 기준)
  const 공개시각KST = new Date("2026-01-24T00:00:00+09:00");
  function isRevealedNow() {
    return new Date() >= 공개시각KST;
  }

  const BASE = "https://umkueaqyoipzbshbzlme.functions.supabase.co";
  const LIST_URL = `${BASE}/write-entry`; // ✅ 여기만 씀 (GET)

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeEntries(data) {
    // { entries:[...] } 형태 기대. 혹시 배열로 오면 그것도 처리
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.entries)) return data.entries;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  function renderMessages(entries) {
    const revealed = isRevealedNow();

    if (!entries.length) {
      listEl.innerHTML = `<p class="gb-empty">아직 메시지가 없어요.</p>`;
      return;
    }

    listEl.innerHTML = entries
      .map((m) => {
        const nickname = escapeHtml(m.nickname ?? "익명");
        const bodyRaw = m.message ?? m.content ?? m.body ?? "";
        const body = escapeHtml(bodyRaw);

        const blurClass = revealed ? "" : "is-blurred";

        return `
          <article class="msg-card">
            <p class="msg-name">${nickname}</p>
            <p class="msg-body ${blurClass}">${body}</p>
          </article>
        `;
      })
      .join("");
  }

  async function loadMessages() {
    listEl.innerHTML = `<p class="gb-loading">메시지 불러오는 중...</p>`;

    try {
      const res = await fetch(LIST_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch {}

      if (!res.ok) {
        alert(`메시지 불러오기 실패\nstatus=${res.status}\n\n${text}`);
        listEl.innerHTML = `<p class="gb-error">메시지를 불러오지 못했습니다.</p>`;
        return;
      }

      const entries = normalizeEntries(data);
      renderMessages(entries);
    } catch (err) {
      console.error(err);
      alert(`메시지 불러오기 실패(네트워크/JS)\n\n${String(err)}`);
      listEl.innerHTML = `<p class="gb-error">메시지를 불러오지 못했습니다.</p>`;
    }
  }

  loadMessages();
})();
