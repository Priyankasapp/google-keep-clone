$(function () {

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

});

// ================= NOTE INPUT =================
$("#noteInput").focus(function () {
  $("#noteTitle").removeClass("hidden");
  $(".pin-icon").removeClass("hidden");
  $(".bottem-row").removeClass("hidden");
});

// ================= CLOSE BUTTON =================
$("#closeBtn").click(function () {
  let title = $("#noteTitle").val().trim();
  let content = $("#noteInput")[0].innerHTML.trim();

  if (content !== "") {
    let notes = JSON.parse(localStorage.getItem("notes") || "[]");
    notes.push({
      id: Date.now(),
      title,
      content,
      bg: { color: currentBg.color || "", image: currentBg.image || "" },
    });
    localStorage.setItem("notes", JSON.stringify(notes));
  }

  $("#noteTitle").val("");
  $("#noteInput")[0].innerHTML = "";
  $("#noteTitle, .pin-icon, .bottem-row").addClass("hidden");

  currentBg = { color: "", image: "" };
  $("#keepBox").css("background-color", "white");

  renderNotes();
});

// ================= FORMATTING =================
$("#formatBtn").click(function (e) {
  e.stopPropagation();
  $("#formatToolbar").toggleClass("hidden");
});

$(document).click(function () {
  $("#formatToolbar").addClass("hidden");
});

$("#formatToolbar").click(function (e) {
  e.stopPropagation();
});

let savedSelection = null;

$("#noteInput").on("mouseup keyup", function () {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) savedSelection = sel.getRangeAt(0);
});

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

$(".format-toolbar button").on("mousedown", function (e) {
  e.preventDefault();
  const formats = {
    bold:      () => applyFormat("bold"),
    italic:    () => applyFormat("italic"),
    underline: () => applyFormat("underline"),
    h1:        () => applyFormat("formatBlock", "<h1>"),
    h2:        () => applyFormat("formatBlock", "<h2>"),
    list:      () => applyFormat("insertUnorderedList"),
    clear:     () => applyFormat("removeFormat"),
  };
  let fn = formats[$(this).data("tag")];
  if (fn) fn();
  $("#formatToolbar").addClass("hidden");
});

// ================= RENDER NOTES =================
function renderNotes() {
  let notes = JSON.parse(localStorage.getItem("notes") || "[]");
  $(".note-card").remove();

  if (notes.length === 0) {
    $(".empty-image").show();
    $("p").text("Notes you add appear here").show();
    return;
  }

  $(".empty-image").hide();
  $("p").hide();

  notes.forEach(function (note) {
    let bgStyle = "background-color: white;";
    if (note.bg && note.bg.color) {
      bgStyle = `background-color: ${note.bg.color};`;
    }

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
  });
}

// ================= DELETE → BIN =================
$(document).on("click", ".delete-note-btn", function () {
  let id = $(this).attr("data-id");
  let notes = JSON.parse(localStorage.getItem("notes") || "[]");
  let bin   = JSON.parse(localStorage.getItem("binNotes") || "[]");

  let deleted = notes.find((n) => String(n.id) === id);
  if (deleted) {
    bin.push(deleted);
    notes = notes.filter((n) => String(n.id) !== id);
    localStorage.setItem("notes",    JSON.stringify(notes));
    localStorage.setItem("binNotes", JSON.stringify(bin));
  }
  renderNotes();
});

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

// ================= RESTORE FROM BIN =================
$(document).on("click", ".restore-note-btn", function () {
  let id    = $(this).attr("data-id");
  let bin   = JSON.parse(localStorage.getItem("binNotes") || "[]");
  let notes = JSON.parse(localStorage.getItem("notes")    || "[]");

  let restored = bin.find((n) => String(n.id) === id);
  if (restored) {
    notes.push(restored);
    bin = bin.filter((n) => String(n.id) !== id);
    localStorage.setItem("notes",    JSON.stringify(notes));
    localStorage.setItem("binNotes", JSON.stringify(bin));
  }
  renderBinNotes();
});

// ================= DELETE FOREVER =================
$(document).on("click", ".delete-forever-btn", function () {
  let id  = $(this).attr("data-id");
  let bin = JSON.parse(localStorage.getItem("binNotes") || "[]");
  bin = bin.filter((n) => String(n.id) !== id);
  localStorage.setItem("binNotes", JSON.stringify(bin));
  renderBinNotes();
});

// Run on page load
renderNotes();

// ================= PALETTE =================
let currentBg = { color: "", image: "" };

$("#paletteBtn").click(function (e) {
  e.stopPropagation();
  $("#colorPalette").toggleClass("hidden");
});

$(document).click(function (e) {
  if (!$(e.target).closest("#paletteBtn, #colorPalette").length) {
    $("#colorPalette").addClass("hidden");
  }
});

$("#colorPalette").click(function (e) {
  e.stopPropagation();
});

function applyBgToKeepBox() {
  $("#keepBox").css("background-color", currentBg.color || "white");
}

$(".color-swatch").on("click", function () {
  $(".color-swatch").removeClass("active");
  $(this).addClass("active");
  currentBg.color = $(this).data("color");
  applyBgToKeepBox();
});

// ================= ARCHIVE NOTE =================
$(document).on("click", ".archive-note-btn", function () {
  let id      = $(this).attr("data-id");
  let notes   = JSON.parse(localStorage.getItem("notes")        || "[]");
  let archive = JSON.parse(localStorage.getItem("archiveNotes") || "[]");

  let toArchive = notes.find((n) => String(n.id) === id);
  if (toArchive) {
    archive.push(toArchive);
    notes = notes.filter((n) => String(n.id) !== id);
    localStorage.setItem("notes",        JSON.stringify(notes));
    localStorage.setItem("archiveNotes", JSON.stringify(archive));
  }
  renderNotes();
});

// ================= ARCHIVE FROM INPUT BOX =================
$("#archiveBtn").click(function () {
  let title   = $("#noteTitle").val().trim();
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

  currentBg = { color: "", image: "" };
  $("#keepBox").css("background-color", "white");
});

// ================= RENDER ARCHIVE =================
function renderArchiveNotes() {
  let archive = JSON.parse(localStorage.getItem("archiveNotes") || "[]");
  archive = archive.filter((n) => n != null);

  $(".note-card").remove();
  $(".empty-bin").remove();
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

// ================= UNARCHIVE =================
$(document).on("click", ".unarchive-note-btn", function () {
  let id      = $(this).attr("data-id");
  let archive = JSON.parse(localStorage.getItem("archiveNotes") || "[]");
  let notes   = JSON.parse(localStorage.getItem("notes")        || "[]");

  let restored = archive.find((n) => String(n.id) === id);
  if (restored) {
    notes.push(restored);
    archive = archive.filter((n) => String(n.id) !== id);
    localStorage.setItem("notes",        JSON.stringify(notes));
    localStorage.setItem("archiveNotes", JSON.stringify(archive));
  }
  renderArchiveNotes();
});

// ================= DELETE FROM ARCHIVE =================
$(document).on("click", ".delete-archived-btn", function () {
  let id      = $(this).attr("data-id");
  let archive = JSON.parse(localStorage.getItem("archiveNotes") || "[]");
  archive = archive.filter((n) => String(n.id) !== id);
  localStorage.setItem("archiveNotes", JSON.stringify(archive));
  renderArchiveNotes();
});
