// ================= GLOBALS =================
let currentBg = { color: "", image: "" };
let savedSelection = null;
let editingId = null;

// ================= APPEND NOTE CARD =================
function appendNoteCard(note) {
  let bgStyle = note.bg && note.bg.color
    ? `background-color: ${note.bg.color};`
    : "background-color: white;";

  $(".main-content").append(`
    <div class="note-card" data-id="${note.id}" style="${bgStyle}">
      ${note.title ? `<div class="note-card-title">${note.title}</div>` : ""}
      <div class="note-card-content">${note.content}</div>
      <button class="archive-note-btn" data-id="${note.id}" title="Archive">
        <i class="bi bi-archive"></i>
      </button>
      <button class="delete-note-btn" data-id="${note.id}" title="Delete">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `);
}

// ================= RENDER NOTES =================
function renderNotes() {
  let notes = JSON.parse(localStorage.getItem("notes") || "[]");
  $(".note-card").remove();
  $(".notes-section-label").remove();

  if (notes.length === 0) {
    $(".empty-image").show();
    $("#emptyMsg").text("Notes you add appear here").show();
    return;
  }

  $(".empty-image").hide();
  $("#emptyMsg").hide();

  let pinned = notes.filter((n) => n.pinned);
  let others = notes.filter((n) => !n.pinned);

  if (pinned.length > 0) {
    $(".main-content").append(`<p class="notes-section-label">PINNED</p>`);
    pinned.forEach((note) => appendNoteCard(note));
  }

  if (others.length > 0) {
    if (pinned.length > 0) {
      $(".main-content").append(`<p class="notes-section-label">OTHERS</p>`);
    }
    others.forEach((note) => appendNoteCard(note));
  }
}

// ================= RENDER BIN =================
function renderBinNotes() {
  let bin = JSON.parse(localStorage.getItem("binNotes") || "[]");
  bin = bin.filter((note) => note != null);
  localStorage.setItem("binNotes", JSON.stringify(bin));

  $(".note-card").remove();
  $(".empty-image").hide();
  $("p:not(.empty-bin)").hide();

  if (bin.length === 0) {
    $(".main-content").append(`<p class="empty-bin">No notes in Bin</p>`);
    return;
  }

  bin.forEach(function (note) {
    let bgStyle = note.bg && note.bg.color ? `background-color: ${note.bg.color};` : "";
    $(".main-content").append(`
      <div class="note-card" data-id="${note.id}" ${bgStyle ? `style="${bgStyle}"` : ""}>
        ${note.title ? `<div class="note-card-title">${note.title}</div>` : ""}
        <div class="note-card-content">${note.content}</div>
        <div class="bin-actions">
          <button class="restore-note-btn" data-id="${note.id}" title="Restore">
            <i class="bi bi-arrow-counterclockwise"></i> Restore
          </button>
          <button class="delete-forever-btn" data-id="${note.id}" title="Delete forever">
            <i class="bi bi-trash"></i> Delete forever
          </button>
        </div>
      </div>
    `);
  });
}

// ================= RENDER ARCHIVE =================
function renderArchiveNotes() {
  let archive = JSON.parse(localStorage.getItem("archiveNotes") || "[]");
  archive = archive.filter((n) => n != null);

  $(".note-card").remove();
  $(".empty-bin").remove();
  $(".notes-section-label").remove();
  $(".empty-image").hide();
  $("p").hide();

  if (archive.length === 0) {
    $(".main-content").append(`<p class="empty-bin">No archive notes</p>`);
    return;
  }

  archive.forEach(function (note) {
    let bgStyle = note.bg && note.bg.color
      ? `background-color: ${note.bg.color};`
      : `background-color: white;`;

    $(".main-content").append(`
      <div class="note-card" data-id="${note.id}" style="${bgStyle}">
        ${note.title ? `<div class="note-card-title">${note.title}</div>` : ""}
        <div class="note-card-content">${note.content}</div>
        <div class="bin-actions">
          <button class="unarchive-note-btn" data-id="${note.id}" title="Unarchive">
            <i class="bi bi-arrow-up-circle"></i> Unarchive
          </button>
          <button class="delete-archived-btn" data-id="${note.id}" title="Delete">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    `);
  });
}

// ================= FORMATTING HELPERS =================
function restoreSelection() {
  if (savedSelection) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelection);
  }
}

function applyFormat(command, value = null) {
  restoreSelection();
  document.execCommand(command, false, value);
  $("#noteInput").focus();
}

function applyBgToKeepBox() {
  $("#keepBox").css("background-color", currentBg.color || "white");
}

// ================= DOCUMENT READY =================
$(function () {

  renderNotes();

  // ================= NAVBAR =================
  $("#menuBtn").click(function () {
    $("#sidebar").toggleClass("close");
  });

  $("#refreshBtn").click(function () {
    location.reload();
  });

  $("#userBtn").click(function () {
    alert("User Profile");
  });

  $("#settingsBtn").click(function () {
    alert("Settings Opened!");
  });

  $("#listBtn").click(function () {
    $(this).toggleClass("bi-view-list bi-grid");
  });

  $("#searchInput").keyup(function () {
    let val = $(this).val().toLowerCase();
    $(".note-card").each(function () {
      let text = $(this).text().toLowerCase();
      $(this).toggle(text.includes(val));
    });
  });

  // ================= SIDEBAR =================
  $(".sidebar-item").click(function () {
    $(".sidebar-item").removeClass("active");
    $(this).addClass("active");

    let page = $(this).data("page");
    $(".note-card").remove();
    $(".empty-bin").remove();
    $(".notes-section-label").remove();

    if (page === "bin") {
      $("#keepBox").hide();
      renderBinNotes();
    } else if (page === "archive") {
      $("#keepBox").hide();
      renderArchiveNotes();
    } else if (page === "notes") {
      $("#keepBox").show();
      renderNotes();
    } else {
      $("#keepBox").hide();
      $(".empty-image").show();
      $("p").text("Notes you add appear here").show();
    }
  });

  // ================= NOTE INPUT =================
  $("#noteInput").focus(function () {
    $("#noteTitle").removeClass("hidden");
    $(".pin-icon").removeClass("hidden");
    $(".bottem-row").removeClass("hidden");
  });

  $("#noteInput").on("mouseup keyup", function () {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) savedSelection = sel.getRangeAt(0);
  });

  // ================= PIN TOGGLE =================
  $(document).on("click", ".pin-icon", function () {
    $(this).toggleClass("pinned");
  });

  // ================= CLOSE BUTTON =================
  $("#closeBtn").click(function () {
    let title = $("#noteTitle").val().trim();
    let content = $("#noteInput")[0].innerHTML.trim();
    let isPinned = $(".pin-icon").hasClass("pinned"); 

    if (content !== "") {
      let notes = JSON.parse(localStorage.getItem("notes") || "[]");
      notes.push({
        id: Date.now(),
        title,
        content,
        pinned: isPinned, 
        bg: { color: currentBg.color || "", image: currentBg.image || "" },
      });
      localStorage.setItem("notes", JSON.stringify(notes));
    }

    $("#noteTitle").val("");
    $("#noteInput")[0].innerHTML = "";
    $("#noteTitle, .pin-icon, .bottem-row").addClass("hidden");
    $(".pin-icon").removeClass("pinned"); 

    currentBg = { color: "", image: "" };
    $("#keepBox").css("background-color", "white");

    renderNotes();
  });

  // ================= FORMATTING =================
  $("#formatBtn").click(function (e) {
    e.stopPropagation();
    $("#formatToolbar").toggleClass("hidden");
  });

  $("#formatToolbar").click(function (e) {
    e.stopPropagation();
  });

  $(".format-toolbar button").on("mousedown", function (e) {
    e.preventDefault();
    const formats = {
      bold: () => applyFormat("bold"),
      italic: () => applyFormat("italic"),
      underline: () => applyFormat("underline"),
      h1: () => applyFormat("formatBlock", "<h1>"),
      h2: () => applyFormat("formatBlock", "<h2>"),
      list: () => applyFormat("insertUnorderedList"),
      clear: () => applyFormat("removeFormat"),
    };
    let fn = formats[$(this).data("tag")];
    if (fn) fn();
    $("#formatToolbar").addClass("hidden");
  });

  // ================= PALETTE =================
  $("#paletteBtn").click(function (e) {
    e.stopPropagation();
    $("#colorPalette").toggleClass("hidden");
  });

  $("#colorPalette").click(function (e) {
    e.stopPropagation();
  });

  $(".color-swatch").on("click", function () {
    $(".color-swatch").removeClass("active");
    $(this).addClass("active");
    currentBg.color = $(this).data("color");
    applyBgToKeepBox();
  });

  // ================= ARCHIVE FROM INPUT BOX =================
  $("#archiveBtn").click(function () {
    let title = $("#noteTitle").val().trim();
    let content = $("#noteInput")[0].innerHTML.trim();

    if (content !== "") {
      let archive = JSON.parse(localStorage.getItem("archiveNotes") || "[]");
      archive.push({
        id: Date.now(),
        title,
        content,
        bg: { color: currentBg.color || "", image: currentBg.image || "" },
      });
      localStorage.setItem("archiveNotes", JSON.stringify(archive));
    }

    $("#noteTitle").val("");
    $("#noteInput")[0].innerHTML = "";
    $("#noteTitle, .pin-icon, .bottem-row").addClass("hidden");
    $(".pin-icon").removeClass("pinned");

    currentBg = { color: "", image: "" };
    $("#keepBox").css("background-color", "white");
  });

  // ================= DELETE → BIN =================
  $(document).on("click", ".delete-note-btn", function () {
    let id = $(this).attr("data-id");
    let notes = JSON.parse(localStorage.getItem("notes") || "[]");
    let bin = JSON.parse(localStorage.getItem("binNotes") || "[]");

    let deleted = notes.find((n) => String(n.id) === id);
    if (deleted) {
      bin.push(deleted);
      notes = notes.filter((n) => String(n.id) !== id);
      localStorage.setItem("notes", JSON.stringify(notes));
      localStorage.setItem("binNotes", JSON.stringify(bin));
    }
    renderNotes();
  });

  // ================= RESTORE FROM BIN =================
  $(document).on("click", ".restore-note-btn", function () {
    let id = $(this).attr("data-id");
    let bin = JSON.parse(localStorage.getItem("binNotes") || "[]");
    let notes = JSON.parse(localStorage.getItem("notes") || "[]");

    let restored = bin.find((n) => String(n.id) === id);
    if (restored) {
      notes.push(restored);
      bin = bin.filter((n) => String(n.id) !== id);
      localStorage.setItem("notes", JSON.stringify(notes));
      localStorage.setItem("binNotes", JSON.stringify(bin));
    }
    renderBinNotes();
  });

  // ================= DELETE FOREVER =================
  $(document).on("click", ".delete-forever-btn", function () {
    let id = $(this).attr("data-id");
    let bin = JSON.parse(localStorage.getItem("binNotes") || "[]");
    bin = bin.filter((n) => String(n.id) !== id);
    localStorage.setItem("binNotes", JSON.stringify(bin));
    renderBinNotes();
  });

  // ================= ARCHIVE NOTE (from card) =================
  $(document).on("click", ".archive-note-btn", function () {
    let id = $(this).attr("data-id");
    let notes = JSON.parse(localStorage.getItem("notes") || "[]");
    let archive = JSON.parse(localStorage.getItem("archiveNotes") || "[]");

    let toArchive = notes.find((n) => String(n.id) === id);
    if (toArchive) {
      archive.push(toArchive);
      notes = notes.filter((n) => String(n.id) !== id);
      localStorage.setItem("notes", JSON.stringify(notes));
      localStorage.setItem("archiveNotes", JSON.stringify(archive));
    }
    renderNotes();
  });

  // ================= UNARCHIVE =================
  $(document).on("click", ".unarchive-note-btn", function () {
    let id = $(this).attr("data-id");
    let archive = JSON.parse(localStorage.getItem("archiveNotes") || "[]");
    let notes = JSON.parse(localStorage.getItem("notes") || "[]");

    let restored = archive.find((n) => String(n.id) === id);
    if (restored) {
      notes.push(restored);
      archive = archive.filter((n) => String(n.id) !== id);
      localStorage.setItem("notes", JSON.stringify(notes));
      localStorage.setItem("archiveNotes", JSON.stringify(archive));
    }
    renderArchiveNotes();
  });

  // ================= DELETE FROM ARCHIVE =================
  $(document).on("click", ".delete-archived-btn", function () {
    let id = $(this).attr("data-id");
    let archive = JSON.parse(localStorage.getItem("archiveNotes") || "[]");
    archive = archive.filter((n) => String(n.id) !== id);
    localStorage.setItem("archiveNotes", JSON.stringify(archive));
    renderArchiveNotes();
  });

  // ================= OPEN EDIT POPUP =================
  $(document).on("click", ".note-card", function (e) {
    if ($(e.target).closest("button").length) return;

    let id = $(this).attr("data-id");
    let notes = JSON.parse(localStorage.getItem("notes") || "[]");
    let note = notes.find((n) => String(n.id) === id);

    if (!note) return;

    editingId = id;
    $("#editTitle").val(note.title);
    $("#editContent").html(note.content);
    $("#editPopup").removeClass("hidden");
  });

  // ================= CLOSE EDIT POPUP =================
  $("#closeEditBtn").click(function () {
    $("#editPopup").addClass("hidden");
  });

  // ================= SAVE UPDATED NOTE =================
  $("#saveEditBtn").click(function () {
    let notes = JSON.parse(localStorage.getItem("notes") || "[]");

    notes = notes.map((note) => {
      if (String(note.id) === editingId) {
        note.title = $("#editTitle").val().trim();
        note.content = $("#editContent").html().trim();
      }
      return note;
    });

    localStorage.setItem("notes", JSON.stringify(notes));
    $("#editPopup").addClass("hidden");
    renderNotes();
  });

  // ================= CLOSE DROPDOWNS ON OUTSIDE CLICK =================
  $(document).click(function (e) {
    $("#formatToolbar").addClass("hidden");
    if (!$(e.target).closest("#paletteBtn, #colorPalette").length) {
      $("#colorPalette").addClass("hidden");
    }
  });

}); 