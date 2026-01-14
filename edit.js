// edit.js (FINAL) - 여러 글 조회 후 선택해서 수정/삭제
(() => {
  const BASE = "https://umkueaqyoipzbshbzlme.functions.supabase.co";

  const ENDPOINT_LOOKUP = `${BASE}/lookup-entry`;
  const ENDPOINT_UPDATE = `${BASE}/update-entry`;
  const ENDPOINT_DELETE = `${BASE}/delete-entry`;

  const lookupForm = document.getElementById("lookupForm");
  const lookupNick = document.getElementById("lookupNick");
  const lookupPin = document.getElementById("lookupPin");
  const lookupBtn = document.getElementById("lookupBtn");

  const resultList = document.getElementById("resultList");
  const resultItems = document.getElementById("resultItems");

  const editCard = document.getElementById("editCard");
  const editNickLabel = document.getElementById("editNickLabel");
  const editMessage = document.getElementById("editMessage");
  const editStatus = document.getElementById("editStatus");
  const saveBtn = document.getElementById("saveBtn");
  const deleteBtn = document.getElementById("deleteBtn");

  let current = { id: null, pin: null, nickname: null };

  function setStatus(msg = "") {
    editStatus.textContent = msg;
  }

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatKST(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    } catch {
      return iso || "";
    }
  }

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch {}

    if (!res.ok) {
      const message = data?.error || data?.message || text || "Request failed";
      const err = new Error(message);
      err.status = res.status;
      err.raw = text;
      throw err;
    }
    return data;
  }

  function renderResultList(entries, pin) {
    resultItems.innerHTML = "";

    if (!entries.length) {
      resultItems.innerHTML = `<p class="hint">일치하는 글이 없어요.</p>`;
      resultList.hidden = false;
      editCard.hidden = true;
      return;
    }

    resultItems.innerHTML = entries.map((e) => {
      const created = formatKST(e.created_at);
      const preview = escapeHtml((e.message || "").slice(0, 120));
      const vis = escapeHtml(e.visibility || "PUBLIC");

      return `
        <article class="result-item">
          <div class="result-meta">
            <span>${created}</span>
            <span>${vis}</span>
          </div>
          <div class="result-preview">${preview}${(e.message || "").length > 120 ? "…" : ""}</div>
          <div class="result-actions">
            <button class="btn btn-primary pickBtn" data-id="${escapeHtml(e.id)}">선택</button>
          </div>
        </article>
      `;
    }).join("");

    // 선택 버튼 이벤트
    resultItems.querySelectorAll(".pickBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const entry = entries.find(x => String(x.id) === String(id));
        if (!entry) return;

        current.id = entry.id;
        current.pin = pin;
        current.nickname = entry.nickname;

        editNickLabel.textContent = entry.nickname || "익명";
        editMessage.value = entry.message || "";
        editCard.hidden = false;
        setStatus("");

        editCard.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    resultList.hidden = false;
  }

  // 조회
  lookupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nickname = lookupNick.value.trim();
    const pin = lookupPin.value.trim();

    if (!nickname || !pin) {
      alert("닉네임과 PIN을 모두 입력해주세요.");
      return;
    }

    lookupBtn.disabled = true;
    lookupBtn.textContent = "조회중...";

    try {
      const data = await postJson(ENDPOINT_LOOKUP, { nickname, pin });
      const entries = Array.isArray(data?.entries) ? data.entries : [];
      renderResultList(entries, pin);

      // 조회 후 현재 선택 초기화
      current = { id: null, pin: null, nickname: null };
      editCard.hidden = true;
    } catch (err) {
      alert(`조회 실패\nstatus=${err.status ?? "?"}\n\n${err.raw ?? String(err)}`);
    } finally {
      lookupBtn.disabled = false;
      lookupBtn.textContent = "조회";
    }
  });

  // 수정
  saveBtn.addEventListener("click", async () => {
    if (!current.id || !current.pin) {
      alert("먼저 수정할 글을 ‘선택’해주세요.");
      return;
    }

    const newMessage = editMessage.value.trim();
    if (!newMessage) {
      alert("메시지가 비어있어요.");
      return;
    }

    saveBtn.disabled = true;
    setStatus("저장 중...");

    try {
      await postJson(ENDPOINT_UPDATE, {
        id: current.id,
        pin: current.pin,
        message: newMessage,
      });

        setStatus("수정 완료!");
        setTimeout(() => {
        location.href = "list.html";
        }, 600);

    } catch (err) {
      alert(`수정 실패\nstatus=${err.status ?? "?"}\n\n${err.raw ?? String(err)}`);
      setStatus("");
    } finally {
      saveBtn.disabled = false;
    }
  });

  // 삭제
  deleteBtn.addEventListener("click", async () => {
    if (!current.id || !current.pin) {
      alert("먼저 삭제할 글을 ‘선택’해주세요.");
      return;
    }

    if (!confirm("정말 삭제할까요? 삭제하면 복구가 안 됩니다.")) return;

    deleteBtn.disabled = true;
    setStatus("삭제 중...");

    try {
      await postJson(ENDPOINT_DELETE, {
        id: current.id,
        pin: current.pin,
      });

      alert("삭제되었습니다.");
    location.href = "list.html";

    } catch (err) {
      alert(`삭제 실패\nstatus=${err.status ?? "?"}\n\n${err.raw ?? String(err)}`);
      setStatus("");
      deleteBtn.disabled = false;
    }
  });
})();
