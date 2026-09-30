/**
 * Backend cho thiệp cưới: Google Sheet lưu dữ liệu, Google Drive lưu ảnh.
 *
 * Cài đặt: xem apps-script/HUONG-DAN.md.
 *  1. Dán file này vào Tiện ích mở rộng → Apps Script.
 *  2. Chạy hàm setup() một lần, cấp quyền, copy SECRET trong nhật ký.
 *  3. Triển khai → Ứng dụng web (Thực thi: Tôi · Truy cập: Bất kỳ ai).
 *
 * Mọi request là POST JSON: { secret, action, payload }.
 */

const TABS = {
  content: ['key', 'value'],
  guests: ['id', 'slug', 'salutation', 'name', 'side', 'createdAt'],
  wishes: ['id', 'name', 'message', 'createdAt', 'visible'],
};
const FOLDER_NAME = 'Thiệp cưới - Ảnh & nhạc';

// ---------- Setup ----------

function setup() {
  Object.keys(TABS).forEach(sheet_);
  folder_();
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('SECRET');
  if (!secret) {
    secret = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    props.setProperty('SECRET', secret);
  }
  Logger.log('SECRET = ' + secret);
  Logger.log('Thư mục ảnh: ' + folder_().getUrl());
}

// ---------- HTTP ----------

function doGet() {
  return json_({ ok: true, service: 'wedding' });
}

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    if (!secret || req.secret !== secret) return json_({ ok: false, error: 'unauthorized' });

    const action = ACTIONS[req.action];
    if (!action) return json_({ ok: false, error: 'unknown action: ' + req.action });

    const lock = LockService.getScriptLock();
    const writes = req.action.indexOf('get') !== 0 && req.action.indexOf('list') !== 0;
    if (writes) lock.waitLock(30000);
    try {
      return json_({ ok: true, data: action(req.payload || {}) });
    } finally {
      if (writes) lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

const ACTIONS = {
  getContent: function () {
    const rows = readRows_('content');
    if (!rows.length) return null;
    const content = {};
    rows.forEach(function (r) {
      content[r.key] = JSON.parse(r.value);
    });
    return content;
  },

  saveContent: function (p) {
    const sh = sheet_('content');
    const keys = Object.keys(p.content);
    const values = keys.map(function (k) {
      return [k, JSON.stringify(p.content[k])];
    });
    clearBody_(sh);
    if (values.length) sh.getRange(2, 1, values.length, 2).setValues(values);
    return true;
  },

  listGuests: function () {
    return readRows_('guests');
  },

  saveGuests: function (p) {
    upsert_('guests', p.guests);
    return true;
  },

  deleteGuest: function (p) {
    deleteById_('guests', p.id);
    return true;
  },

  listWishes: function () {
    return readRows_('wishes').map(function (w) {
      w.visible = w.visible === true || String(w.visible).toUpperCase() === 'TRUE';
      return w;
    });
  },

  saveWish: function (p) {
    upsert_('wishes', [p.wish]);
    return true;
  },

  deleteWish: function (p) {
    deleteById_('wishes', p.id);
    return true;
  },

  // Images and background music.
  uploadFile: function (p) {
    const blob = Utilities.newBlob(Utilities.base64Decode(p.base64), p.contentType, p.filename);
    const file = folder_().createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const id = file.getId();
    const url =
      p.contentType.indexOf('image/') === 0
        ? 'https://lh3.googleusercontent.com/d/' + id
        : 'https://drive.google.com/uc?export=download&id=' + id;
    return { id: id, url: url };
  },

  deleteFile: function (p) {
    DriveApp.getFileById(p.id).setTrashed(true);
    return true;
  },
};

// ---------- Helpers ----------

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]]).setFontWeight('bold');
    sh.setFrozenRows(1);
    // Plain text, so slugs like "10-11" or ISO dates are never turned into dates.
    sh.getRange('A:F').setNumberFormat('@');
  }
  return sh;
}

function folder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function readRows_(name) {
  const sh = sheet_(name);
  const values = sh.getDataRange().getValues();
  const head = values.shift();
  return values
    .filter(function (r) {
      return r[0] !== '';
    })
    .map(function (r) {
      const o = {};
      head.forEach(function (h, i) {
        const v = r[i];
        o[h] = v instanceof Date ? v.toISOString() : v;
      });
      return o;
    });
}

function clearBody_(sh) {
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, sh.getLastColumn()).clearContent();
}

/** Insert or update rows by id, writing the whole table back in one call. */
function upsert_(name, items) {
  const head = TABS[name];
  const sh = sheet_(name);
  const values = sh.getDataRange().getValues();
  values.shift();
  const rows = values.filter(function (r) {
    return r[0] !== '';
  });
  const index = {};
  rows.forEach(function (r, i) {
    index[r[0]] = i;
  });
  items.forEach(function (item) {
    const row = head.map(function (h) {
      const v = item[h];
      return v === undefined || v === null ? '' : typeof v === 'boolean' ? String(v).toUpperCase() : v;
    });
    if (index[item.id] !== undefined) rows[index[item.id]] = row;
    else {
      index[item.id] = rows.length;
      rows.push(row);
    }
  });
  clearBody_(sh);
  if (rows.length) sh.getRange(2, 1, rows.length, head.length).setValues(rows);
}

function deleteById_(name, id) {
  const sh = sheet_(name);
  const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
  for (let i = ids.length - 1; i >= 1; i--) {
    if (ids[i][0] === id) sh.deleteRow(i + 1);
  }
}
